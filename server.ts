import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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

// Database Availability Guard Middleware (Returns 503 instead of silent fallbacks in production)
function dbAvailabilityGuard(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!isSupabaseConfigured) {
    return res.status(503).json({
      error: "Database Service Unavailable. The persistent backend store is currently offline or unconfigured."
    });
  }
  next();
}

// Helper to authenticate user and create a request-scoped Supabase client
async function getAuthenticatedUserContext(req: any): Promise<{ userId: string | null; client: SupabaseClient }> {
  if (!isSupabaseConfigured) {
    return { userId: "anonymous-local-user", client: supabase };
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
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. API calls will fail.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

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
        return res.status(500).json({ error: "Failed to verify slug availability." });
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
          return res.status(500).json({ error: "Failed to register shortened URL." });
        } else {
          createdLink = data;
        }
      } catch (err) {
        console.error("Database insertion crash:", err);
        return res.status(500).json({ error: "Failed to register shortened URL." });
      }

      // Construct short URL using host of current request
      const host = req.get("host") || "smyl.link";
      const proto = req.protocol || "https";
      const shortUrl = `${proto}://${host}/s/${finalSlug}`;

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
  app.post("/api/utilities/link-preview", dbAvailabilityGuard, utilitiesRateLimiter, async (req, res) => {
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

  // Open Graph Debugger API endpoint
  app.post("/api/utilities/og-debug", dbAvailabilityGuard, utilitiesRateLimiter, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return res.status(400).json({ error: "URL parameter is required." });
      }

      const trimmedUrl = url.trim();
      if (trimmedUrl.length > 2048) {
        return res.status(400).json({ error: "URL exceeds maximum length of 2048 characters." });
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
  app.post("/api/utilities/screenshot", dbAvailabilityGuard, utilitiesRateLimiter, async (req, res) => {
    if (activeCapturesCount >= MAX_CONCURRENT_CAPTURES) {
      return res.status(503).json({
        error: "The server is currently busy processing other screenshot requests. Please try again shortly."
      });
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

  // Parse post API using Gemini
  app.post("/api/parse-post", dbAvailabilityGuard, utilitiesRateLimiter, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Post content or URL is required." });
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length > 5000) {
        return res.status(400).json({ error: "Post content exceeds maximum length of 5000 characters." });
      }

      let scrapedMetadata = "";

      // If it's a standalone URL, attempt to scrape OpenGraph title and description via hardened service
      const isSingleUrl = /^https?:\/\/[^\s]+$/i.test(trimmedContent);
      if (isSingleUrl) {
        try {
          const meta = await extractLinkMetadata(trimmedContent);
          if (meta && (meta.title || meta.description)) {
            const site = meta.siteName || "";
            const title = meta.title || "";
            const desc = meta.description || "";
            scrapedMetadata = `\nScraped Webpage Metadata:\nSite: ${site}\nTitle: ${title}\nDescription: ${desc}\n`;
          }
        } catch (scrapeErr) {
          // Graceful fallback if scraping fails
        }
      }

      const prompt = `You are an expert social media post parser. Analyze the following pasted content, draft, or URL and extract all details to render an authentic social media card for X (formerly Twitter) or LinkedIn.

CRITICAL INSTRUCTIONS:
1. PRESERVE USER TEXT VERBATIM: If the user provides actual post text, paragraphs, announcements, thoughts, or draft messages (even if it contains links, URLs, hashtags, or emojis), YOU MUST PUT THE USER'S EXACT PROVIDED TEXT into 'content.text'. DO NOT REPLACE OR PARAPHRASE IT. DO NOT GENERATE RANDOM FICTIONAL TEXT.
2. If the user provided ONLY a single URL (and no other text):
   - Use the scraped metadata provided below if available to extract the true title and description.
   - Extract the platform from the URL (x.com or twitter.com -> 'x'; linkedin.com or lnkd.in -> 'linkedin').
3. Platform Determination:
   - If the input contains x.com/twitter.com or short punchy tweets, set platform to 'x'.
   - If the input contains linkedin.com/lnkd.in, or mentions career, milestones, teams, gratitude, launches, leadership, or professional announcements, set platform to 'linkedin'.
4. Author & Engagement Calculation:
   - If author details (name, handle/title) are found or inferable from the text, use them.
   - METRICS CALCULATION: If explicit engagement metrics (likes, reactions, reposts, comments, views) or timestamps are present in the text, extract their exact values (e.g., convert "3.8k" to 3800). If no engagement counts are explicitly provided, set likes, comments, reposts, and views to exactly 0. DO NOT hallucinate, fabricate, or guess fake engagement metrics.

User Input:
"""
${trimmedContent}
"""
${scrapedMetadata}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              platform: {
                type: Type.STRING,
                description: "The platform of the post, either 'x' or 'linkedin'.",
              },
              author: {
                type: Type.OBJECT,
                description: "The author information.",
                properties: {
                  name: { type: Type.STRING, description: "Full name of the author. Default to a realistic name if not found." },
                  username: { type: Type.STRING, description: "For X: handle starting with @ (e.g., @jack). For LinkedIn: job title or professional headline (e.g., 'Senior Software Engineer at Google')." },
                  isVerified: { type: Type.BOOLEAN, description: "Whether the author is verified (blue badge)." },
                  avatarColor: { type: Type.STRING, description: "A beautiful Hex color code (e.g. #0145F2) that represents the avatar background if we generate an initial." },
                  avatarText: { type: Type.STRING, description: "1-2 uppercase characters representing the author's initials." }
                },
                required: ["name", "username", "isVerified", "avatarColor", "avatarText"]
              },
              content: {
                type: Type.OBJECT,
                description: "The post contents.",
                properties: {
                  text: { type: Type.STRING, description: "The core text of the post. Preserve newlines, spacing, emojis, and formatting. Strip out raw platform metadata like '1d ago' or 'Likes: 100'." },
                  hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Any hashtags extracted from the post (e.g. ['TypeScript', 'AI'])."
                  },
                  mentions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Any handles or profiles mentioned (e.g. ['@google', '@ElonMusk'])."
                  },
                  links: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Any URLs/links present inside the post text."
                  }
                },
                required: ["text", "hashtags", "mentions", "links"]
              },
              timestamp: { type: Type.STRING, description: "The post timestamp or relative time. e.g., '10:30 AM · Aug 24, 2026' or '2h ago'." },
              engagement: {
                type: Type.OBJECT,
                description: "Engagement metrics which default to exactly 0 if not explicitly defined.",
                properties: {
                  likes: { type: Type.INTEGER, description: "Number of likes/reactions. Defaults to 0." },
                  comments: { type: Type.INTEGER, description: "Number of comments. Defaults to 0." },
                  reposts: { type: Type.INTEGER, description: "Number of reposts/shares. Defaults to 0." },
                  views: { type: Type.INTEGER, description: "Number of views (default to 0)." }
                },
                required: ["likes", "comments", "reposts"]
              }
            },
            required: ["platform", "author", "content", "timestamp", "engagement"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini.");
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Gemini Parsing Error:", error);
      res.status(500).json({ error: error.message || "Failed to parse post content." });
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
        return res.status(500).json({ error: "Failed to load link hubs from database." });
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
          return res.status(500).json({ error: "Failed to load link hub items." });
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
        return res.status(500).json({ error: "Failed to verify slug availability." });
      }

      if (isSlugTaken) {
        return res.status(400).json({ error: `The custom URL alias "smyl.link/h/${slug}" is already taken by another profile.` });
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
        return res.status(500).json({ error: "Failed to save Link Hub to database." });
      }

      // Upsert Items
      const savedItems: any[] = [];
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
        return res.status(500).json({ error: "Failed to fetch link hub details." });
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
        return res.status(500).json({ error: "Failed to fetch link hub items." });
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
