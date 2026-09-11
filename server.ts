import express from "express";
import crypto from "crypto";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import dns from "dns";
import { promisify } from "util";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { extractLinkMetadata, debugLinkMetadata } from "./src/services/metadataService";
import {
  validateAndNormalizeUrl,
  validateUrlStructure,
  isPrivateIp,
  secureHttpAgent,
  secureHttpsAgent
} from "./src/server/security/urlSecurity";

dotenv.config();

const dnsLookup = promisify(dns.lookup);

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")
);

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

// Server-only administrative client (Bypasses RLS for safe server operations)
const adminClient = isSupabaseConfigured && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : supabase;

// Database Availability Guard Middleware (Blocks requests with 503 if database is unconfigured)
function dbAvailabilityGuard(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!isSupabaseConfigured) {
    return res.status(503).json({
      error: "Database Service Unavailable. The required Supabase backend environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing or misconfigured."
    });
  }
  next();
}

// Helper to authenticate user and create a request-scoped Supabase client
async function getAuthenticatedUserContext(req: any): Promise<{ userId: string | null; client: SupabaseClient }> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Unable to resolve user authentication context.");
  }
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token) {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
      try {
        const { data: { user }, error } = await client.auth.getUser();
        if (!error && user) {
          return { userId: user.id, client };
        }
      } catch (err) {
        // Ignore
      }
    }
  }
  return { userId: null, client: supabase };
}

// Backward-compatible helper
async function getAuthenticatedUser(req: any): Promise<string | null> {
  const { userId } = await getAuthenticatedUserContext(req);
  return userId;
}

// Canonical Quotas mapping
interface Quotas {
  qr_codes: number;
  short_links: number;
  og_inspections: number;
  screenshots: number;
  link_hubs: number;
  saved_cards: number;
}

const PLAN_QUOTAS: Record<string, Quotas> = {
  free: {
    qr_codes: 25,
    short_links: 5,
    og_inspections: 10,
    screenshots: 3,
    link_hubs: 1,
    saved_cards: 10,
  },
  creator: {
    qr_codes: 250,
    short_links: 50,
    og_inspections: 100,
    screenshots: 25,
    link_hubs: 5,
    saved_cards: 100,
  },
  pro: {
    qr_codes: 1000,
    short_links: 500,
    og_inspections: 500,
    screenshots: 100,
    link_hubs: 20,
    saved_cards: 500,
  },
  lifetime: {
    qr_codes: Infinity,
    short_links: Infinity,
    og_inspections: Infinity,
    screenshots: Infinity,
    link_hubs: Infinity,
    saved_cards: Infinity,
  },
};

// Deterministic usage period based on current UTC year-month
function getCurrentUsagePeriod(): string {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Check and conditionally increment monthly utility usage or active database counts
async function checkAndIncrementQuota(
  userId: string,
  resource: keyof Quotas,
  increment: boolean = false
): Promise<{ allowed: boolean; current: number; limit: number; error?: string }> {
  // 1. Fetch user plan
  let plan = "free";
  try {
    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();
    if (!error && profile?.plan) {
      plan = profile.plan.toLowerCase();
    }
  } catch (err) {
    console.error("Error reading user plan for quota check:", err);
  }

  if (!PLAN_QUOTAS[plan]) {
    plan = "free";
  }

  const limit = PLAN_QUOTAS[plan][resource];

  // If the resource limit is Infinity, we are unlimited!
  if (limit === Infinity) {
    // We still count current usage if increment is requested
    let current = 0;
    if (resource === "link_hubs") {
      const { count } = await adminClient
        .from("link_hubs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      current = count || 0;
    } else if (resource === "saved_cards") {
      const { count } = await adminClient
        .from("saved_cards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      current = count || 0;
    } else {
      const period = getCurrentUsagePeriod();
      const key = `usage:${userId}:${resource}:${period}`;
      const { data } = await adminClient
        .from("rate_limits")
        .select("count")
        .eq("key", key)
        .maybeSingle();
      current = data?.count || 0;
      if (increment) {
        await incrementUserUsage(userId, resource, period);
        current += 1;
      }
    }
    return { allowed: true, current, limit };
  }

  // 2. Count current usage based on resource type
  let current = 0;
  if (resource === "link_hubs") {
    const { count } = await adminClient
      .from("link_hubs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    current = count || 0;

    if (increment && current >= limit) {
      return { 
        allowed: false, 
        current, 
        limit, 
        error: `${plan.toUpperCase()} plan limit reached: you can only have up to ${limit} active Link Hubs. Upgrade your plan to create more!` 
      };
    }
  } else if (resource === "saved_cards") {
    const { count } = await adminClient
      .from("saved_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    current = count || 0;

    if (increment && current >= limit) {
      return { 
        allowed: false, 
        current, 
        limit, 
        error: `${plan.toUpperCase()} plan limit reached: you can only save up to ${limit} cards. Upgrade your plan to save more!` 
      };
    }
  } else {
    // Monthly utility usage
    const period = getCurrentUsagePeriod();
    const key = `usage:${userId}:${resource}:${period}`;
    const { data } = await adminClient
      .from("rate_limits")
      .select("count")
      .eq("key", key)
      .maybeSingle();
    current = data?.count || 0;

    if (increment) {
      if (current >= limit) {
        return { 
          allowed: false, 
          current, 
          limit, 
          error: `${plan.toUpperCase()} plan limit reached: you can only generate/create up to ${limit} ${resource.replace('_', ' ')} per month. Upgrade your plan for higher limits!` 
        };
      }
      // Atomically increment
      await incrementUserUsage(userId, resource, period);
      current += 1;
    } else {
      if (current >= limit) {
        return { allowed: false, current, limit };
      }
    }
  }

  return { allowed: true, current, limit };
}

async function incrementUserUsage(userId: string, resource: string, period: string): Promise<void> {
  const key = `usage:${userId}:${resource}:${period}`;
  const { data, error } = await adminClient
    .from("rate_limits")
    .select("*")
    .eq("key", key)
    .maybeSingle();
  
  const resetTime = Date.now() + 35 * 24 * 60 * 60 * 1000; // default 35 days in future
  if (error) {
    console.error("Error fetching usage counter:", error);
  }
  if (!data) {
    await adminClient
      .from("rate_limits")
      .insert({ key, count: 1, reset_time: resetTime });
  } else {
    await adminClient
      .from("rate_limits")
      .update({ count: data.count + 1 })
      .eq("key", key);
  }
}

const memoryRateLimits = new Map<string, { count: number; resetTime: number }>();
const activeConcurrency = new Map<string, number>();
const MAX_CONCURRENT_PER_IP = 8; // Concurrency limit to prevent socket/resource exhaustion and abusive parallel spam

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" ? forwarded : req.socket.remoteAddress || "anonymous")
    .split(",")[0]
    .trim();
  return ip;
}

// Concurrency Limiter Middleware
function concurrencyLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip = getClientIp(req);
  const currentActive = activeConcurrency.get(ip) || 0;
  
  if (currentActive >= MAX_CONCURRENT_PER_IP) {
    return res.status(429).json({
      error: "Too many concurrent requests in progress. Please wait for your other operations to complete."
    });
  }
  
  // Register active request
  activeConcurrency.set(ip, currentActive + 1);
  
  let finished = false;
  const decrement = () => {
    if (!finished) {
      finished = true;
      const count = activeConcurrency.get(ip) || 0;
      if (count <= 1) {
        activeConcurrency.delete(ip);
      } else {
        activeConcurrency.set(ip, count - 1);
      }
    }
  };
  
  res.on("finish", decrement);
  res.on("close", decrement);
  
  next();
}

// Stateless database-backed rate limiting helper
async function dbRateLimiter(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSecs: number }> {
  const now = Date.now();
  const resetTime = now + windowMs;
  
  const getMemoryLimitFallback = () => {
    const record = memoryRateLimits.get(key);
    if (!record || now > record.resetTime) {
      memoryRateLimits.set(key, { count: 1, resetTime });
      return { allowed: true, retryAfterSecs: 0 };
    }
    
    if (record.count >= maxRequests) {
      const retryAfterSecs = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      return { allowed: false, retryAfterSecs };
    }
    
    record.count += 1;
    return { allowed: true, retryAfterSecs: 0 };
  };

  if (!isSupabaseConfigured) {
    return getMemoryLimitFallback();
  }
  
  try {
    const { data, error } = await adminClient
      .from("rate_limits")
      .select("*")
      .eq("key", key)
      .maybeSingle();
      
    if (error) {
      console.error("Rate limit check db error, falling back to memory:", error);
      return getMemoryLimitFallback();
    }
    
    if (!data) {
      await adminClient
        .from("rate_limits")
        .insert({ key, count: 1, reset_time: resetTime });
      return { allowed: true, retryAfterSecs: 0 };
    }
    
    if (now > Number(data.reset_time)) {
      await adminClient
        .from("rate_limits")
        .update({ count: 1, reset_time: resetTime })
        .eq("key", key);
      return { allowed: true, retryAfterSecs: 0 };
    }
    
    if (data.count >= maxRequests) {
      const retryAfterSecs = Math.max(1, Math.ceil((Number(data.reset_time) - now) / 1000));
      return { allowed: false, retryAfterSecs };
    }
    
    await adminClient
      .from("rate_limits")
      .update({ count: data.count + 1 })
      .eq("key", key);
      
    return { allowed: true, retryAfterSecs: 0 };
  } catch (err) {
    console.error("Rate limit database exception, falling back to memory:", err);
    return getMemoryLimitFallback();
  }
}

// Rate Limiter Middlewares
async function apiRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip = getClientIp(req);
  const key = `rate:api:${ip}`;
  const limit = await dbRateLimiter(key, 60, 60 * 1000); // 60 requests per minute
  
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Too many requests. Please try again in ${limit.retryAfterSecs} seconds.`
    });
  }
  next();
}

async function shortenRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip = getClientIp(req);
  const key = `rate:shorten:${ip}`;
  const limit = await dbRateLimiter(key, 10, 60 * 1000); // 10 per minute
  
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Too many shorten requests. Please try again in ${limit.retryAfterSecs} seconds.`
    });
  }
  next();
}

async function utilitiesRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip = getClientIp(req);
  const key = `rate:utils:${ip}`;
  const limit = await dbRateLimiter(key, 15, 60 * 1000); // 15 per minute for utilities
  
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Too many utility requests. Please try again in ${limit.retryAfterSecs} seconds.`
    });
  }
  next();
}

async function authRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip = getClientIp(req);
  const key = `rate:auth:${ip}`;
  const limit = await dbRateLimiter(key, 30, 60 * 1000); // 30 requests per minute for write/db-saving actions
  
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Too many secure operation requests. Please try again in ${limit.retryAfterSecs} seconds.`
    });
  }
  next();
}

// In-memory fallback for short links if the database table is missing or unconfigured
const shortLinksFallback = new Map<string, {
  id: string;
  slug: string;
  destination_url: string;
  user_id: string | null;
  click_count: number;
  created_at: string;
}>();

function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || "");
  const msg = String(error.message || "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "PGRST301" ||
    code === "PGRST204" ||
    code === "42P01" ||
    msg.includes("schema cache") ||
    msg.includes("could not find the table") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

// Backward compatible helper routing to hardened security
async function validateUrl(urlStr: string): Promise<boolean> {
  const result = await validateAndNormalizeUrl(urlStr);
  return result !== null;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT);

  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  // Apply Concurrency Limiter globally to all API routes
  app.use("/api", concurrencyLimiter);

  // Health check API
  app.get("/api/health", apiRateLimiter, (req, res) => {
    res.json({ status: "ok" });
  });

  // Shortener GET Redirect Route: Resolves formatted slugs and redirects users
  app.get("/s/:slug", dbAvailabilityGuard, concurrencyLimiter, apiRateLimiter, async (req, res) => {
    try {
      const { slug } = req.params;
      if (!slug || typeof slug !== "string") {
        return res.status(400).send("Invalid slug format.");
      }

      const cleanSlug = slug.trim().toLowerCase();
      // Ensure the slug is simple alphanumeric or hyphen
      if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
        return res.status(400).send("Malformed short URL slug.");
      }

      // Fetch the link record using adminClient for reliable routing resolution
      let link: any = null;
      let dbError: any = null;

      try {
        const { data, error } = await adminClient
          .from("short_links")
          .select("*")
          .eq("slug", cleanSlug)
          .maybeSingle();
        link = data;
        dbError = error;
      } catch (err) {
        dbError = err;
      }

      if (dbError) {
        console.error("Database check error during redirection lookup:", dbError);
        return res.status(500).send("Database check error during redirection.");
      }

      if (!link) {
        return res.status(404).send("Short link not found or has been removed.");
      }

      // Check scheme safety
      const dest = link.destination_url;
      if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
        return res.status(400).send("Invalid redirection destination scheme.");
      }

      // Fire-and-forget atomic concurrency-safe click count update via Postgres RPC
      adminClient
        .rpc("increment_click_count", { link_id: link.id })
        .then(({ error: rpcErr }) => {
          if (rpcErr) {
            console.error("Failed to update click count via RPC, attempting fallback update:", rpcErr);
            const currentClicks = typeof link.click_count === "string" ? parseInt(link.click_count, 10) : Number(link.click_count || 0);
            adminClient
              .from("short_links")
              .update({ click_count: currentClicks + 1 })
              .eq("id", link.id)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error("Failed to update click count via standard fallback:", updateErr);
              });
          }
        });

      // Clear, absolute 301 Redirect
      res.redirect(301, dest);
    } catch (err) {
      console.error("Redirection server error:", err);
      res.status(500).send("Internal server error handling redirect.");
    }
  });

  function validateSlug(slugStr: string): { isValid: boolean; error?: string } {
    const normalized = slugStr.trim().toLowerCase();
    if (normalized.length < 3 || normalized.length > 30) {
      return { isValid: false, error: "Slug must be between 3 and 30 characters." };
    }
    if (!/^[a-z0-9-]+$/.test(normalized)) {
      return { isValid: false, error: "Slug can only contain lowercase letters, numbers, and hyphens." };
    }
    return { isValid: true };
  }

  function generateRandomSlug(length: number): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Shortener POST Creation Route
  app.post("/api/utilities/shorten", dbAvailabilityGuard, shortenRateLimiter, async (req, res) => {
    try {
      const { url, slug } = req.body;
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return res.status(400).json({ error: "A valid long URL is required." });
      }

      const cleanUrl = url.trim();
      if (cleanUrl.length > 2048) {
        return res.status(400).json({ error: "Destination URL exceeds maximum length of 2048 characters." });
      }

      // Check security boundaries of target URL
      const isSafe = await validateUrl(cleanUrl);
      if (!isSafe) {
        return res.status(400).json({
          error: "Invalid URL destination. It must be a valid public HTTP/HTTPS address and cannot contain credentials.",
        });
      }

      let finalSlug = "";
      if (slug && typeof slug === "string" && slug.trim().length > 0) {
        const slugValidation = validateSlug(slug);
        if (!slugValidation.isValid) {
          return res.status(400).json({ error: slugValidation.error });
        }
        finalSlug = slug.trim().toLowerCase();
      } else {
        finalSlug = generateRandomSlug(6);
      }

      if (finalSlug.length > 32) {
        return res.status(400).json({ error: "Slug exceeds maximum length of 32 characters." });
      }

      // Authenticate user via request-scoped helper
      const { userId, client: requestClient } = await getAuthenticatedUserContext(req);

      // Server-Enforced Pricing Entitlement: Enforce short links quota server-side
      if (userId) {
        const quotaCheck = await checkAndIncrementQuota(userId, "short_links", true);
        if (!quotaCheck.allowed) {
          return res.status(403).json({
            error: quotaCheck.error || "Short links limit reached. Upgrade your plan for higher limits!",
            limitHit: true
          });
        }
      }

      // Perform a lookup to guarantee uniqueness of the custom slug
      let existing: any = null;
      let checkErr: any = null;

      try {
        const { data, error } = await requestClient
          .from("short_links")
          .select("id")
          .eq("slug", finalSlug)
          .maybeSingle();
        existing = data;
        checkErr = error;
      } catch (err) {
        checkErr = err;
      }

      if (checkErr) {
        console.error("Database check error during creation lookup:", checkErr);
        return res.status(500).json({ 
          error: "Failed to verify slug availability.",
          message: checkErr.message || String(checkErr),
          code: checkErr.code,
          details: checkErr.details
        });
      }

      if (existing) {
        if (slug) {
          return res.status(409).json({ error: "This custom slug is already taken." });
        } else {
          // Regenerate one more time for extremely rare random collision
          finalSlug = generateRandomSlug(7);
        }
      }

      let createdLink: any = null;
      try {
        const { data, error: insertErr } = await requestClient
          .from("short_links")
          .insert({
            slug: finalSlug,
            destination_url: cleanUrl,
            user_id: userId,
            click_count: 0,
          })
          .select()
          .single();

        if (insertErr) {
          console.error("Database insertion error:", insertErr);
          return res.status(500).json({ 
            error: "Failed to register shortened URL.",
            message: insertErr.message,
            code: insertErr.code,
            details: insertErr.details
          });
        } else {
          createdLink = data;
        }
      } catch (err: any) {
        console.error("Database insertion crash:", err);
        return res.status(500).json({ 
          error: "Failed to register shortened URL.",
          message: err.message || String(err)
        });
      }

      // Construct short URL using host of current request
      const host = req.get("host") || "smyl.link";
      const proto = req.protocol || "https";
      const shortUrl = `${proto}://${host}/${finalSlug}`;

      res.json({
        shortUrl,
        slug: finalSlug,
        destinationUrl: cleanUrl,
        clickCount: 0,
        createdAt: createdLink.created_at,
      });
    } catch (err: any) {
      console.error("Shortener endpoint crash:", err);
      res.status(500).json({ error: "Internal server error creating shortened URL." });
    }
  });

  // Link Preview Generator endpoint
  app.post("/api/utilities/link-preview", utilitiesRateLimiter, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return res.status(400).json({ error: "URL parameter is required." });
      }

      const trimmedUrl = url.trim();
      if (trimmedUrl.length > 2048) {
        return res.status(400).json({ error: "URL exceeds maximum length of 2048 characters." });
      }

      const metadata = await extractLinkMetadata(trimmedUrl);
      res.json(metadata);
    } catch (err: any) {
      console.error("Link Preview endpoint crash:", err);
      // Determine if validation error (e.g., SSRF or bad URL) vs server crash
      const isValidationError = 
        err.message?.includes("forbidden") || 
        err.message?.includes("invalid") ||
        err.message?.includes("Unsupported content type") ||
        err.message?.includes("too large") ||
        err.message?.includes("timed out") ||
        err.message?.includes("Too many redirects") ||
        err.message?.includes("HTTP fetch failed");

      res.status(isValidationError ? 400 : 500).json({ 
        error: err.message || "Failed to generate link preview." 
      });
    }
  });

  // Get a comprehensive summary of all quotas and current usages for the active user
  app.get("/api/utilities/usage-summary", apiRateLimiter, async (req, res) => {
    try {
      const { userId } = await getAuthenticatedUserContext(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      let plan = "free";
      try {
        const { data: profile, error } = await adminClient
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .maybeSingle();
        if (!error && profile?.plan) {
          plan = profile.plan.toLowerCase();
        }
      } catch (err) {
        console.error("Error reading user plan for usage summary:", err);
      }

      if (!PLAN_QUOTAS[plan]) {
        plan = "free";
      }

      const quotas = PLAN_QUOTAS[plan];
      const period = getCurrentUsagePeriod();

      // Retrieve current usages
      const qr_codes_res = await checkAndIncrementQuota(userId, "qr_codes", false);
      const short_links_res = await checkAndIncrementQuota(userId, "short_links", false);
      const og_inspections_res = await checkAndIncrementQuota(userId, "og_inspections", false);
      const screenshots_res = await checkAndIncrementQuota(userId, "screenshots", false);
      const link_hubs_res = await checkAndIncrementQuota(userId, "link_hubs", false);
      const saved_cards_res = await checkAndIncrementQuota(userId, "saved_cards", false);

      res.json({
        plan,
        usagePeriod: period,
        limits: {
          qr_codes: quotas.qr_codes,
          short_links: quotas.short_links,
          og_inspections: quotas.og_inspections,
          screenshots: quotas.screenshots,
          link_hubs: quotas.link_hubs,
          saved_cards: quotas.saved_cards,
        },
        usage: {
          qr_codes: qr_codes_res.current,
          short_links: short_links_res.current,
          og_inspections: og_inspections_res.current,
          screenshots: screenshots_res.current,
          link_hubs: link_hubs_res.current,
          saved_cards: saved_cards_res.current,
        }
      });
    } catch (err: any) {
      console.error("Error generating usage summary:", err);
      res.status(500).json({ error: err.message || "Failed to generate usage summary." });
    }
  });

  // Open Graph Debugger API endpoint
  app.post("/api/utilities/og-debug", utilitiesRateLimiter, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return res.status(400).json({ error: "URL parameter is required." });
      }

      const trimmedUrl = url.trim();
      if (trimmedUrl.length > 2048) {
        return res.status(400).json({ error: "URL exceeds maximum length of 2048 characters." });
      }

      const { userId } = await getAuthenticatedUserContext(req);
      if (userId) {
        const quotaCheck = await checkAndIncrementQuota(userId, "og_inspections", true);
        if (!quotaCheck.allowed) {
          return res.status(403).json({
            error: quotaCheck.error || "OG inspection quota exceeded. Upgrade your plan for higher limits!",
            limitHit: true
          });
        }
      }

      const diagnosticsData = await debugLinkMetadata(trimmedUrl);
      res.json(diagnosticsData);
    } catch (err: any) {
      console.error("OG Debugger endpoint crash:", err);
      const isValidationError = 
        err.message?.includes("forbidden") || 
        err.message?.includes("invalid") ||
        err.message?.includes("Unsupported content type") ||
        err.message?.includes("too large") ||
        err.message?.includes("timed out") ||
        err.message?.includes("Too many redirects") ||
        err.message?.includes("HTTP fetch failed");

      res.status(isValidationError ? 400 : 500).json({ 
        error: err.message || "Failed to inspect website metadata." 
      });
    }
  });

  let activeCapturesCount = 0;
  const MAX_CONCURRENT_CAPTURES = 3;

  // Webpage Screenshot Generator endpoint with strict SSRF protection and bounding
  app.post("/api/utilities/screenshot", utilitiesRateLimiter, async (req, res) => {
    if (activeCapturesCount >= MAX_CONCURRENT_CAPTURES) {
      return res.status(503).json({
        error: "The server is currently busy processing other screenshot requests. Please try again shortly."
      });
    }

    const { userId } = await getAuthenticatedUserContext(req);
    if (userId) {
      const quotaCheck = await checkAndIncrementQuota(userId, "screenshots", true);
      if (!quotaCheck.allowed) {
        return res.status(403).json({
          error: quotaCheck.error || "Screenshot quota exceeded. Upgrade your plan for higher limits!",
          limitHit: true
        });
      }
    }

    activeCapturesCount++;

    try {
      const { 
        url, 
        viewport = "desktop", 
        fullPage = false, 
        waitForTimeout = 3000, 
        waitUntil = "networkidle2" 
      } = req.body;

      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return res.status(400).json({ error: "URL parameter is required." });
      }

      if (viewport !== "desktop" && viewport !== "mobile") {
        return res.status(400).json({ error: "Viewport must be 'desktop' or 'mobile'." });
      }

      let parsedWaitForTimeout = parseInt(waitForTimeout, 10);
      if (isNaN(parsedWaitForTimeout) || parsedWaitForTimeout < 0 || parsedWaitForTimeout > 10000) {
        parsedWaitForTimeout = 3000;
      }

      const validWaitUntil = ["load", "domcontentloaded", "networkidle0", "networkidle2", "auto"];
      const parsedWaitUntil = validWaitUntil.includes(waitUntil) ? waitUntil : "networkidle2";

      const trimmedUrl = url.trim();

      // 1. URL Security and SSRF validation
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(trimmedUrl);
      } catch (err) {
        return res.status(400).json({ error: "Invalid URL format." });
      }

      const protocol = parsedUrl.protocol.toLowerCase();
      if (protocol !== "http:" && protocol !== "https:") {
        return res.status(400).json({ error: "Only HTTP and HTTPS protocols are allowed." });
      }

      const hostname = parsedUrl.hostname.toLowerCase();

      // Strict check for simple hostname blocks
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]" ||
        hostname.endsWith(".local") ||
        hostname.endsWith(".internal") ||
        hostname.endsWith(".lan")
      ) {
        return res.status(400).json({ error: "Access to private or local addresses is strictly forbidden." });
      }

      // DNS lookup to fetch resolved IP to prevent DNS Rebinding / bypasses
      let resolvedIp: string;
      try {
        const lookupResult = await dnsLookup(parsedUrl.hostname);
        resolvedIp = lookupResult.address;
      } catch (dnsErr) {
        return res.status(400).json({ error: `Failed to resolve host: ${parsedUrl.hostname}` });
      }

      if (isPrivateIp(resolvedIp)) {
        return res.status(400).json({ error: "Access to private or internal IP addresses is strictly forbidden." });
      }

      // 2. Screenshot generation via Microlink with robust automatic fallback retry
      let buffer: Buffer;
      let usedFallback = false;

      async function attemptCapture(waitUntilParam: string, waitForTimeoutParam: number, timeoutMs: number): Promise<Buffer> {
        const queryUrl = `https://api.microlink.io?url=${encodeURIComponent(trimmedUrl)}&screenshot=true&embed=screenshot.url` +
          (viewport === "mobile" ? "&viewport.isMobile=true&viewport.width=375&viewport.height=812" : "&viewport.width=1280&viewport.height=800") +
          (fullPage ? "&screenshot.fullPage=true" : "") +
          `&waitUntil=${waitUntilParam}` +
          `&waitForTimeout=${waitForTimeoutParam}`;

        const controller = new AbortController();
        const localTimeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(queryUrl, { signal: controller.signal });
          clearTimeout(localTimeoutId);

          if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              try {
                const errJson = await response.json();
                throw new Error(errJson.message || errJson.error || `External engine code ${response.status}`);
              } catch (_) {
                throw new Error(`External screenshot engine returned status code ${response.status}`);
              }
            }
            throw new Error(`External screenshot engine returned status code ${response.status}`);
          }

          // Chunk-by-chunk stream download with strict 5MB limit
          const reader = response.body;
          if (!reader) {
            throw new Error("Unable to read screenshot response stream");
          }

          const chunks: Buffer[] = [];
          let totalBytes = 0;
          const maxScreenshotBytes = 5 * 1024 * 1024; // 5MB safe limit

          for await (const chunk of reader as any) {
            totalBytes += chunk.length;
            if (totalBytes > maxScreenshotBytes) {
              controller.abort();
              throw new Error("Screenshot exceeds safe size threshold of 5MB");
            }
            chunks.push(Buffer.from(chunk));
          }

          return Buffer.concat(chunks);
        } catch (err) {
          clearTimeout(localTimeoutId);
          throw err;
        }
      }

      try {
        // Try the primary user-specified combination with a 14s budget
        buffer = await attemptCapture(parsedWaitUntil, parsedWaitForTimeout, 14000);
      } catch (firstErr: any) {
        console.warn("First capture attempt failed or timed out. Retrying with ultra-robust safe settings...", firstErr);
        
        try {
          usedFallback = true;
          buffer = await attemptCapture("load", 1500, 10000); // 10s budget for fallback
        } catch (secondErr: any) {
          console.error("Fallback capture attempt also failed:", secondErr);
          
          const errMsg = secondErr.message || "Unreachable page or capture engine failed.";
          if (secondErr.name === "AbortError" || errMsg.includes("timed out") || errMsg.includes("timeout")) {
            return res.status(408).json({ 
              error: "Webpage screenshot capture timed out. The target site might be loading extremely slowly or blocking automated browsers." 
            });
          }
          return res.status(502).json({ error: `Capture failed: ${errMsg}` });
        }
      }

      const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
      let returnedImage = base64Image;

      // 3. Request-scoped authenticated storage upload if user is signed in
      const { userId, client: requestClient } = await getAuthenticatedUserContext(req);
      if (userId && userId !== "anonymous-local-user") {
        const uuid = Math.random().toString(36).substring(2, 15) + "-" + Math.random().toString(36).substring(2, 15);
        const storagePath = `screenshots/${userId}/${uuid}.png`;

        const { data: uploadData, error: uploadError } = await requestClient.storage
          .from("user-assets")
          .upload(storagePath, buffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          console.error("Storage upload failed:", uploadError);
          return res.status(403).json({ error: `Storage upload failed: ${uploadError.message}` });
        }

        if (uploadData) {
          // Retrieve signed URL for private access
          const { data: signedUrlData, error: signedUrlError } = await requestClient.storage
            .from("user-assets")
            .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days expiry

          if (signedUrlError) {
            return res.status(403).json({ error: `Failed to create secure access URL: ${signedUrlError.message}` });
          }

          if (signedUrlData) {
            returnedImage = signedUrlData.signedUrl;

            // Save to user_assets metadata table
            const { error: metaError } = await requestClient.from("user_assets").insert({
              user_id: userId,
              storage_path: storagePath,
              type: "screenshot",
              mime_type: "image/png",
              size: buffer.length,
            });

            if (metaError) {
              console.error("Asset metadata insert failed:", metaError);
            }
          }
        }
      }

      // Return standardized metadata response
      return res.json({
        image: returnedImage,
        normalizedUrl: trimmedUrl,
        viewport,
        fullPage,
        createdAt: new Date().toISOString(),
        metadata: {
          sizeBytes: buffer.length,
          dimensions: viewport === "mobile" ? "375x812" : "1280x800",
        },
      });
    } catch (err: any) {
      console.error("Screenshot route crashed:", err);
      return res.status(500).json({ error: err.message || "An unexpected error occurred during screenshotting." });
    } finally {
      activeCapturesCount--;
    }
  });

  // ==========================================
  // DODO PAYMENTS & BILLING SYSTEM ENDPOINTS
  // ==========================================

  function verifyDodoWebhook(req: any, rawBody: string, webhookSecret: string): boolean {
    const webhookId = req.headers["webhook-id"] as string;
    const webhookTimestamp = req.headers["webhook-timestamp"] as string;
    const webhookSignature = req.headers["webhook-signature"] as string;

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      return false;
    }

    // Construct message: id.timestamp.body
    const message = `${webhookId}.${webhookTimestamp}.${rawBody}`;

    // Compute HMAC SHA256 signature
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(message);
    const computedSignature = hmac.digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(computedSignature, "hex"),
        Buffer.from(webhookSignature, "hex")
      );
    } catch (err) {
      return false;
    }
  }

  // Create Dodo Payments checkout session
  app.post("/api/billing/checkout", apiRateLimiter, async (req: any, res) => {
    try {
      const { plan } = req.body;
      if (!plan || !["creator", "pro", "lifetime"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan selected. Choose 'creator', 'pro', or 'lifetime'." });
      }

      // 1. Get authenticated user
      const { userId } = await getAuthenticatedUserContext(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required to initiate billing checkout." });
      }

      // Fetch user profile info
      const { data: profile } = await adminClient
        .from("profiles")
        .select("display_name, username")
        .eq("id", userId)
        .maybeSingle();

      // Retrieve user auth email
      const { data: { user } } = await adminClient.auth.admin.getUserById(userId);
      const email = user?.email || "";
      const name = profile?.display_name || profile?.username || "Smyl User";

      // 2. Select product ID
      let productId = "";
      if (plan === "creator") {
        productId = process.env.DODO_CREATOR_PRODUCT_ID || "pdp_creator_placeholder";
      } else if (plan === "pro") {
        productId = process.env.DODO_PRO_PRODUCT_ID || "pdp_pro_placeholder";
      } else if (plan === "lifetime") {
        productId = process.env.DODO_LIFETIME_PRODUCT_ID || "pdp_lifetime_placeholder";
      }

      // 3. Make request to Dodo Payments API
      const apiKey = process.env.DODO_API_KEY || "test_dodo_api_key_placeholder";
      const isLive = process.env.NODE_ENV === "production" && !apiKey.startsWith("test_");
      const dodoBaseUrl = isLive ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

      const origin = req.headers.origin || `http://localhost:3000`;
      const returnUrl = `${origin}/billing/callback?session_id={checkout_id}`;

      const response = await fetch(`${dodoBaseUrl}/v1/checkouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          product_cart: [
            {
              product_id: productId,
              quantity: 1
            }
          ],
          customer: {
            email: email,
            name: name
          },
          metadata: {
            userId: userId,
            plan: plan
          },
          return_url: returnUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dodo Payments checkout creation API failed:", errorText);
        return res.status(response.status).json({ error: `Dodo Payments error: ${errorText}` });
      }

      const checkoutSession = await response.json();
      return res.json({
        checkout_url: checkoutSession.checkout_url,
        checkout_id: checkoutSession.checkout_id
      });
    } catch (err: any) {
      console.error("Checkout creation endpoint crashed:", err);
      return res.status(500).json({ error: err.message || "Failed to create checkout session." });
    }
  });

  // Create secure Dodo Payments customer portal session
  app.post("/api/billing/portal", apiRateLimiter, async (req: any, res) => {
    try {
      const { userId } = await getAuthenticatedUserContext(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required to open billing portal." });
      }

      const { data: profile } = await adminClient
        .from("profiles")
        .select("customer_id")
        .eq("id", userId)
        .maybeSingle();

      const customerId = profile?.customer_id;
      if (!customerId) {
        return res.status(400).json({ error: "No active billing customer found. Upgrade to a paid plan first." });
      }

      const apiKey = process.env.DODO_API_KEY || "test_dodo_api_key_placeholder";
      const isLive = process.env.NODE_ENV === "production" && !apiKey.startsWith("test_");
      const dodoBaseUrl = isLive ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

      const response = await fetch(`${dodoBaseUrl}/v1/customers/${customerId}/customer-portal-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dodo Payments customer portal creation failed:", errorText);
        return res.status(response.status).json({ error: `Dodo Payments portal session error: ${errorText}` });
      }

      const portalSession = await response.json();
      return res.json({ portal_url: portalSession.portal_url });
    } catch (err: any) {
      console.error("Portal creation endpoint crashed:", err);
      return res.status(500).json({ error: err.message || "Failed to create billing portal session." });
    }
  });

  // Fetch session details to instantly activate user plan (prevent delay in webhook delivery)
  app.get("/api/billing/session-info/:sessionId", apiRateLimiter, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const apiKey = process.env.DODO_API_KEY || "test_dodo_api_key_placeholder";
      const isLive = process.env.NODE_ENV === "production" && !apiKey.startsWith("test_");
      const dodoBaseUrl = isLive ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

      const response = await fetch(`${dodoBaseUrl}/v1/checkouts/${sessionId}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to retrieve checkout session details from Dodo Payments.`);
      }

      const checkout = await response.json();
      
      const status = checkout.status || "pending";
      const userId = checkout.metadata?.userId || checkout.customer?.metadata?.userId;
      const plan = checkout.metadata?.plan || "free";
      const customerId = checkout.customer?.customer_id || checkout.customer_id;
      const subscriptionId = checkout.subscription_id;

      if (userId && (status === "succeeded" || status === "completed" || checkout.payment_status === "paid")) {
        await adminClient
          .from("profiles")
          .update({
            plan: plan,
            customer_id: customerId || null,
            subscription_id: subscriptionId || null,
            subscription_status: "active"
          })
          .eq("id", userId);
        
        console.log(`Instant success UX activation: initialized ${plan} for user ${userId} via checkouts verification`);
      }

      return res.json(checkout);
    } catch (err: any) {
      console.error("Callback session details lookup error:", err);
      return res.status(500).json({ error: err.message || "Failed to retrieve session information." });
    }
  });

  // Webhook webhook handler
  app.post("/api/billing/webhooks", async (req: any, res) => {
    try {
      const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
      const rawBody = req.rawBody || "";

      if (webhookSecret) {
        const isValid = verifyDodoWebhook(req, rawBody, webhookSecret);
        if (!isValid) {
          console.error("Dodo Payments webhook signature validation failed.");
          return res.status(401).json({ error: "Invalid webhook signature." });
        }
      } else {
        console.warn("Dodo Payments webhook secret not set. Verification skipped.");
      }

      const event = req.body;
      const eventType = event.type;
      const data = event.data;

      console.log(`Webhook processing: Received event ${eventType}`, JSON.stringify(event));

      if (eventType && (eventType.startsWith("subscription.") || eventType === "order.completed" || eventType === "checkout.completed")) {
        const subscriptionId = data.id || data.subscription_id || null;
        const customerId = data.customer_id || data.customer?.id || null;
        const status = data.status || "completed";
        
        let userId = data.metadata?.userId || data.customer?.metadata?.userId;

        if (!userId && customerId) {
          const { data: profile } = await adminClient
            .from("profiles")
            .select("id")
            .eq("customer_id", customerId)
            .maybeSingle();
          userId = profile?.id;
        }

        if (userId) {
          let plan = data.metadata?.plan || "free";
          
          if (!data.metadata?.plan && data.product_cart?.[0]?.product_id) {
            const prodId = data.product_cart[0].product_id;
            if (prodId === process.env.DODO_CREATOR_PRODUCT_ID) {
              plan = "creator";
            } else if (prodId === process.env.DODO_PRO_PRODUCT_ID) {
              plan = "pro";
            } else if (prodId === process.env.DODO_LIFETIME_PRODUCT_ID) {
              plan = "lifetime";
            }
          }

          const isSubscriptionActive = ["active", "renewed", "completed", "paid"].includes(status);
          const finalPlan = isSubscriptionActive ? plan : "free";

          const { error: updateErr } = await adminClient
            .from("profiles")
            .update({
              plan: finalPlan,
              customer_id: customerId || null,
              subscription_id: subscriptionId || null,
              subscription_status: status,
              plan_expires_at: data.expires_at || null
            })
            .eq("id", userId);

          if (updateErr) {
            console.error(`Failed to update subscription details for user ${userId}:`, updateErr);
            return res.status(500).json({ error: "Profile subscription sync failed." });
          }

          console.log(`Successfully synced subscription status for user ${userId}: plan is ${finalPlan}`);
        } else {
          console.warn("No linked user context found for subscription webhook event.");
        }
      }

      return res.json({ received: true });
    } catch (err: any) {
      console.error("Dodo webhook handler error:", err);
      return res.status(500).json({ error: err.message || "Failed to handle webhook." });
    }
  });

  // ==========================================
  // LINK HUB ENDPOINTS (WITH FALLBACK ENGINE)
  // ==========================================

  const RESERVED_SLUGS = new Set([
    "landing", "customize", "history", "shortener", "qr", "preview", 
    "ogdebug", "utm", "api", "auth", "admin", "settings", "h", "s", 
    "public", "save", "redirect", "click", "assets", "static", "help", "hubs"
  ]);

  function validateHubSlug(slug: string): { isValid: boolean; error?: string } {
    const normalized = slug.trim().toLowerCase();
    if (normalized.length < 3 || normalized.length > 30) {
      return { isValid: false, error: "Slug must be between 3 and 30 characters." };
    }
    if (!/^[a-z0-9-]+$/.test(normalized)) {
      return { isValid: false, error: "Slug can only contain lowercase letters, numbers, and hyphens." };
    }
    if (RESERVED_SLUGS.has(normalized)) {
      return { isValid: false, error: "This slug is a reserved system route and cannot be used." };
    }
    return { isValid: true };
  }

  function validateDestinationUrl(urlStr: string): boolean {
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (err) {
      return false;
    }
  }

  // 1. GET User Link Hubs
  app.get("/api/hubs", dbAvailabilityGuard, apiRateLimiter, async (req, res) => {
    try {
      const { userId, client: requestClient } = await getAuthenticatedUserContext(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      let hubs: any[] = [];
      let dbError: any = null;

      try {
        const { data, error } = await requestClient
          .from("link_hubs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        if (error) {
          dbError = error;
        } else {
          hubs = data || [];
        }
      } catch (err) {
        dbError = err;
      }

      if (dbError) {
        console.error("Database error fetching hubs:", dbError);
        return res.status(500).json({ 
          error: "Failed to load link hubs from database.",
          message: dbError.message || String(dbError),
          code: dbError.code,
          details: dbError.details
        });
      }

      // Fetch items for each hub
      const enrichedHubs = [];
      for (const hub of hubs) {
        let items: any[] = [];
        let itemsError: any = null;

        try {
          const { data, error } = await requestClient
            .from("link_hub_items")
            .select("*")
            .eq("hub_id", hub.id)
            .order("position", { ascending: true });
          if (error) itemsError = error;
          else items = data || [];
        } catch (err) {
          itemsError = err;
        }

        if (itemsError) {
          console.error("Database error fetching hub items:", itemsError);
          return res.status(500).json({ 
            error: "Failed to load link hub items.",
            message: itemsError.message || String(itemsError),
            code: itemsError.code,
            details: itemsError.details
          });
        }

        enrichedHubs.push({
          ...hub,
          items
        });
      }

      res.json(enrichedHubs);
    } catch (err: any) {
      console.error("GET /api/hubs error:", err);
      res.status(500).json({ error: err.message || "Failed to load link hubs." });
    }
  });

  // 2. POST Save/Upsert Link Hub and Items
  app.post("/api/hubs/save", authRateLimiter, async (req, res) => {
    try {
      const { userId, client: requestClient } = await getAuthenticatedUserContext(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      const { hub, items } = req.body;
      if (!hub || typeof hub !== "object") {
        return res.status(400).json({ error: "Invalid hub structure." });
      }

      const slug = String(hub.slug || "").trim().toLowerCase();
      const slugVal = validateHubSlug(slug);
      if (!slugVal.isValid) {
        return res.status(400).json({ error: slugVal.error });
      }

      // Validate destination URLs
      const validatedItems = Array.isArray(items) ? items : [];
      for (const item of validatedItems) {
        if (!item.title || String(item.title).trim() === "") {
          return res.status(400).json({ error: "Every link item must have a title." });
        }
        if (!validateDestinationUrl(item.destination_url)) {
          return res.status(400).json({ error: `Invalid protocol or format in destination URL for link: "${item.title}". Only http:// or https:// is allowed.` });
        }
      }

      // Check if slug is taken by another hub (not owned by current user)
      let isSlugTaken = false;
      let existingHubId: string | null = null;
      let checkError: any = null;

      try {
        const { data, error } = await requestClient
          .from("link_hubs")
          .select("id, user_id")
          .eq("slug", slug)
          .maybeSingle();
        if (error) {
          checkError = error;
        } else if (data) {
          if (data.user_id !== userId) {
            isSlugTaken = true;
          }
          existingHubId = data.id;
        }
      } catch (err) {
        checkError = err;
      }

      if (checkError) {
        console.error("Database check error during hub save:", checkError);
        return res.status(500).json({ 
          error: "Failed to verify slug availability.",
          message: checkError.message || String(checkError),
          code: checkError.code,
          details: checkError.details
        });
      }

      if (isSlugTaken) {
        return res.status(400).json({ error: `The custom URL alias "smyl.link/h/${slug}" is already taken by another profile.` });
      }

      // Enforce Link Hubs limit on creation
      const isUpdate = Boolean(hub.id || (existingHubId && !isSlugTaken));
      if (!isUpdate) {
        const quotaCheck = await checkAndIncrementQuota(userId, "link_hubs", false);
        if (!quotaCheck.allowed) {
          return res.status(403).json({
            error: quotaCheck.error || "Link Hubs quota exceeded. Upgrade your plan for higher limits!",
            limitHit: true
          });
        }
      }

      let finalHubId = hub.id || existingHubId || gen_random_uuid_local();
      const hubData = {
        id: finalHubId,
        user_id: userId,
        slug,
        display_name: String(hub.display_name || "").trim() || slug,
        bio: String(hub.bio || "").trim(),
        avatar_path: hub.avatar_path || null,
        theme_config: hub.theme_config || {
          theme: "light",
          background: "bg-[#F8FAFC]",
          button_style: "rounded-xl border border-[#E1E5E9] bg-white text-[#17191C]"
        },
        is_published: Boolean(hub.is_published),
        updated_at: new Date().toISOString()
      };

      let savedHub: any = null;
      let writeError: any = null;
      const savedItems: any[] = [];

      try {
        // Check ownership if update
        if (hub.id) {
          const { data: ownershipCheck, error: ownerError } = await requestClient
            .from("link_hubs")
            .select("user_id")
            .eq("id", hub.id)
            .maybeSingle();
          
          if (ownerError) throw ownerError;
          if (ownershipCheck && ownershipCheck.user_id !== userId) {
            return res.status(403).json({ error: "Access denied. You do not own this Link Hub." });
          }
        }

        // Upsert Hub
        const { data, error } = await requestClient
          .from("link_hubs")
          .upsert({
            ...hubData,
            created_at: hub.created_at || new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          writeError = error;
        } else {
          savedHub = data;
        }
      } catch (err) {
        writeError = err;
      }

      if (writeError) {
        console.error("Database save error:", writeError);
        return res.status(500).json({ 
          error: "Failed to save Link Hub to database.",
          message: writeError.message || String(writeError),
          code: writeError.code,
          details: writeError.details
        });
      }

      // Upsert Items
      const itemIdsToKeep = new Set<string>();

      // Find existing IDs to delete from db if not in payload
      validatedItems.forEach(item => {
        if (item.id) itemIdsToKeep.add(item.id);
      });

      // Delete removed items
      if (itemIdsToKeep.size > 0) {
        await requestClient
          .from("link_hub_items")
          .delete()
          .eq("hub_id", finalHubId)
          .not("id", "in", `(${Array.from(itemIdsToKeep).join(",")})`);
      } else {
        await requestClient
          .from("link_hub_items")
          .delete()
          .eq("hub_id", finalHubId);
      }

      // Upsert new ones
      for (let i = 0; i < validatedItems.length; i++) {
        const item = validatedItems[i];
        const itemId = item.id || gen_random_uuid_local();
        const itemPayload = {
          id: itemId,
          hub_id: finalHubId,
          title: String(item.title).trim(),
          description: String(item.description || "").trim(),
          destination_url: String(item.destination_url).trim(),
          image_path: item.image_path || null,
          position: i,
          is_enabled: item.is_enabled !== false,
          click_count: item.click_count || 0,
          updated_at: new Date().toISOString()
        };

        const { data: savedItem, error: itemErr } = await requestClient
          .from("link_hub_items")
          .upsert({
            ...itemPayload,
            created_at: item.created_at || new Date().toISOString()
          })
          .select()
          .single();

        if (itemErr) {
          console.error("Failed to upsert link hub item:", itemErr);
        } else {
          savedItems.push(savedItem);
        }
      }

      res.json({
        ...savedHub,
        items: savedItems
      });
    } catch (err: any) {
      console.error("POST /api/hubs/save error:", err);
      res.status(500).json({ error: err.message || "Failed to sync Link Hub state." });
    }
  });

  function gen_random_uuid_local() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 3. GET Public Link Hub by Slug
  app.get("/api/hubs/public/:slug", dbAvailabilityGuard, apiRateLimiter, async (req, res) => {
    try {
      const slug = String(req.params.slug).trim().toLowerCase();
      
      let hub: any = null;
      let dbError: any = null;

      try {
        const { data, error } = await adminClient
          .from("link_hubs")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        hub = data;
        dbError = error;
      } catch (err) {
        dbError = err;
      }

      if (dbError) {
        console.error("Database check error during public hub lookup:", dbError);
        return res.status(500).json({ 
          error: "Failed to fetch link hub details.",
          message: dbError.message || String(dbError),
          code: dbError.code,
          details: dbError.details
        });
      }

      if (!hub) {
        return res.status(404).json({ error: "Link Hub profile not found." });
      }

      // Check draft state -> if not published, the active user MUST be the owner to view it
      if (!hub.is_published) {
        const { userId } = await getAuthenticatedUserContext(req);
        if (hub.user_id !== userId) {
          return res.status(403).json({ error: "This Link Hub is currently offline (draft mode)." });
        }
      }

      // Fetch items
      let items: any[] = [];
      let itemsError: any = null;

      try {
        const { data, error } = await adminClient
          .from("link_hub_items")
          .select("*")
          .eq("hub_id", hub.id)
          .order("position", { ascending: true });
        
        items = data || [];
        itemsError = error;
      } catch (err) {
        itemsError = err;
      }

      if (itemsError) {
        console.error("Database check error during public hub items fetch:", itemsError);
        return res.status(500).json({ 
          error: "Failed to fetch link hub items.",
          message: itemsError.message || String(itemsError),
          code: itemsError.code,
          details: itemsError.details
        });
      }

      // Filter enabled links for public view
      const activeItems = items.filter(i => i.is_enabled);

      // Standardize display-only fields for safety (Blocker 7)
      const displayHub = {
        id: hub.id,
        slug: hub.slug,
        display_name: hub.display_name,
        bio: hub.bio || "",
        avatar_path: hub.avatar_path || null,
        theme_config: hub.theme_config || {},
        is_published: hub.is_published,
        items: activeItems.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          destination_url: item.destination_url,
          image_path: item.image_path || null,
          position: item.position,
        }))
      };

      res.json(displayHub);
    } catch (err: any) {
      console.error("GET /api/hubs/public error:", err);
      res.status(500).json({ error: err.message || "Failed to load public Link Hub." });
    }
  });

  // 4. GET Redirect / Tracking endpoint
  app.get("/api/hubs/redirect/:itemId", dbAvailabilityGuard, apiRateLimiter, async (req, res) => {
    try {
      const itemId = req.params.itemId;

      let item: any = null;
      let dbError: any = null;

      try {
        const { data, error } = await adminClient
          .from("link_hub_items")
          .select("*")
          .eq("id", itemId)
          .maybeSingle();
        item = data;
        dbError = error;
      } catch (err) {
        dbError = err;
      }

      if (dbError) {
        console.error("Database query error during hub item redirection:", dbError);
        return res.status(500).send("Database redirection query failed.");
      }

      if (!item) {
        return res.status(404).send("Link item not found or has been removed.");
      }

      const isSafe = await validateUrl(item.destination_url);
      if (!isSafe) {
        return res.status(400).send("The stored destination URL is insecure or invalid.");
      }

      // Safe Server Redirect with atomic click count increment via Postgres RPC
      adminClient
        .rpc("increment_hub_item_click_count", { item_id: item.id })
        .then(({ error: clickErr }) => {
          if (clickErr) {
            console.error("Failed to update link click count via RPC, doing fallback update:", clickErr);
            adminClient
              .from("link_hub_items")
              .update({ click_count: Number(item.click_count || 0) + 1 })
              .eq("id", item.id)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error("Failed to update click count via standard fallback:", updateErr);
              });
          }
        });

      // Redirect safely to destination URL (HTTP/HTTPS guaranteed)
      res.redirect(302, item.destination_url);
    } catch (err: any) {
      console.error("GET /api/hubs/redirect error:", err);
      res.status(500).send("Failed to follow tracked redirection link.");
    }
  });

  // Reserved paths that should not be captured as short link slugs
  const reservedSlugs = new Set([
    "api",
    "tools",
    "history",
    "for",
    "blog",
    "privacy",
    "terms",
    "how-it-works",
    "examples",
    "help",
    "faq",
    "customize",
    "link-shortener",
    "qr-generator",
    "link-preview",
    "og-debugger",
    "utm-builder",
    "hubs",
    "screenshot-generator",
    "assets",
    "favicon.ico",
    "s",
    "h"
  ]);

  // Root level redirect route: Resolves single slugs like smyl.link/linkedin and redirects
  app.get("/:slug", dbAvailabilityGuard, concurrencyLimiter, apiRateLimiter, async (req, res, next) => {
    try {
      const { slug } = req.params;
      if (!slug || typeof slug !== "string") {
        return next();
      }

      const cleanSlug = slug.trim().toLowerCase();

      // Skip reserved frontend paths
      if (reservedSlugs.has(cleanSlug)) {
        return next();
      }

      // Check if it matches valid slug format (alphanumeric, simple hyphen, length 3-30)
      if (cleanSlug.length < 3 || cleanSlug.length > 30 || !/^[a-z0-9-]+$/.test(cleanSlug)) {
        return next();
      }

      // Query database
      let link: any = null;
      let dbError: any = null;

      try {
        const { data, error } = await adminClient
          .from("short_links")
          .select("*")
          .eq("slug", cleanSlug)
          .maybeSingle();
        link = data;
        dbError = error;
      } catch (err) {
        dbError = err;
      }

      if (dbError) {
        console.error("Database check error during root redirection lookup:", dbError);
        return next();
      }

      if (!link) {
        // Fall through to index.html/SPA so the client router handles friendly 404s
        return next();
      }

      // Check scheme safety
      const dest = link.destination_url;
      if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
        return res.status(400).send("Invalid redirection destination scheme.");
      }

      // Record count and redirect
      adminClient
        .rpc("increment_click_count", { link_id: link.id })
        .then(({ error: rpcErr }) => {
          if (rpcErr) {
            console.error("Failed to update click count via RPC, attempting fallback update:", rpcErr);
            const currentClicks = typeof link.click_count === "string" ? parseInt(link.click_count, 10) : Number(link.click_count || 0);
            adminClient
              .from("short_links")
              .update({ click_count: currentClicks + 1 })
              .eq("id", link.id)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error("Failed to update click count via standard fallback:", updateErr);
              });
          }
        });

      res.redirect(301, dest);
    } catch (err) {
      console.error("Root redirection handler crash:", err);
      next();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
