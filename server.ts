import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import dns from "dns";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";
import { extractLinkMetadata, debugLinkMetadata } from "./src/services/metadataService";

dotenv.config();

const dnsLookup = promisify(dns.lookup);

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")
);

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

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

// Private IP ranges validation for SSRF Protection
function isPrivateIp(ip: string): boolean {
  // Check IPv4 format
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts.some((p) => p < 0 || p > 255)) return true;

    // Loopback (127.0.0.0/8)
    if (parts[0] === 127) return true;

    // RFC 1918 Private Ranges:
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;

    // Link-local (169.254.0.0/16)
    if (parts[0] === 169 && parts[1] === 254) return true;

    // Multicast (224.0.0.0/4)
    if (parts[0] >= 224 && parts[0] <= 239) return true;

    // Broadcast (255.255.255.255)
    if (parts[0] === 255) return true;

    // Unspecified (0.0.0.0)
    if (parts[0] === 0) return true;

    return false;
  }

  // Check IPv6 format
  if (ip.includes(":")) {
    const normalized = ip.toLowerCase();
    // Loopback (::1)
    if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
    // Unspecified (::)
    if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;
    // Link-local (fe80::/10)
    if (normalized.startsWith("fe80")) return true;
    // Unique local (fc00::/7)
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

    return false;
  }

  return true; // Block anything that doesn't parse cleanly as standard IP
}

// Full server-side URL validation (blocks SSRF, non-http/https, and private ranges)
async function validateUrl(urlStr: string): Promise<boolean> {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname;

    // Block common local hostnames instantly
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local")
    ) {
      return false;
    }

    // Resolve DNS safely
    try {
      const { address } = await dnsLookup(hostname);
      if (isPrivateIp(address)) {
        return false;
      }
    } catch (dnsErr) {
      // Failed to resolve -> not a valid public target
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

// Slug validation checks
function validateSlug(slug: string): { isValid: boolean; error?: string } {
  const normalized = slug.trim().toLowerCase();

  if (normalized.length < 3 || normalized.length > 32) {
    return { isValid: false, error: "Slug must be between 3 and 32 characters." };
  }

  // Allow lowercase alphanumeric and hyphen only
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return {
      isValid: false,
      error: "Slug must contain only lowercase letters, numbers, and hyphens.",
    };
  }

  // Reject consecutive or leading/trailing hyphens for aesthetic consistency
  if (normalized.startsWith("-") || normalized.endsWith("-") || normalized.includes("--")) {
    return {
      isValid: false,
      error: "Slug cannot start/end with hyphens or have multiple hyphens in a row.",
    };
  }

  // Reserved platform routes
  const reserved = [
    "api",
    "auth",
    "login",
    "signup",
    "dashboard",
    "settings",
    "utilities",
    "admin",
    "s",
    "static",
    "assets",
    "public",
    "dist",
  ];
  if (reserved.includes(normalized)) {
    return { isValid: false, error: "This slug is reserved for platform use." };
  }

  // Basic abusive terms filter
  const prohibited = [
    "phishing",
    "scam",
    "spam",
    "malware",
    "virus",
    "hack",
    "admin",
    "root",
    "support",
    "billing",
    "help",
    "security",
  ];
  if (prohibited.includes(normalized)) {
    return { isValid: false, error: "This slug contains prohibited terms." };
  }

  return { isValid: true };
}

// Generates a clean random slug
function generateRandomSlug(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// In-memory rate limiting map for shorten endpoint (10 requests per minute per IP)
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function shortenRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip = (
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    "anonymous"
  )
    .split(",")[0]
    .trim();
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;

  const limit = rateLimits.get(ip);
  if (!limit) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (limit.count >= maxRequests) {
    return res.status(429).json({
      error: "Too many shorten requests. Please try again in 1 minute.",
    });
  }

  limit.count++;
  next();
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

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Shortener GET Redirect Route: Resolves formatted slugs and redirects users
  app.get("/s/:slug", async (req, res) => {
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

      if (!isSupabaseConfigured) {
        const link = shortLinksFallback.get(cleanSlug);
        if (!link) {
          return res.status(404).send("Short link not found or has been removed (unconfigured Supabase).");
        }
        link.click_count++;
        return res.redirect(301, link.destination_url);
      }

      // Fetch the link record
      let link: any = null;
      let dbError: any = null;

      try {
        const { data, error } = await supabase
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
        if (isTableMissingError(dbError)) {
          console.warn(`Table 'short_links' is missing. Falling back to in-memory store for slug: ${cleanSlug}`);
          link = shortLinksFallback.get(cleanSlug) || null;
        } else {
          console.error("Database check error during redirection lookup:", dbError);
          return res.status(500).send("Database check error during redirection.");
        }
      }

      if (!link) {
        link = shortLinksFallback.get(cleanSlug) || null;
      }

      if (!link) {
        return res.status(404).send("Short link not found or has been removed.");
      }

      // Check scheme safety
      const dest = link.destination_url;
      if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
        return res.status(400).send("Invalid redirection destination scheme.");
      }

      // Increment click count (either in-memory or database)
      if (shortLinksFallback.has(cleanSlug)) {
        const item = shortLinksFallback.get(cleanSlug)!;
        item.click_count++;
      } else {
        // Fire-and-forget: safely increment the click count
        const currentClicks = typeof link.click_count === "string" ? parseInt(link.click_count, 10) : Number(link.click_count || 0);
        supabase
          .from("short_links")
          .update({ click_count: currentClicks + 1 })
          .eq("id", link.id)
          .then(({ error: updateErr }) => {
            if (updateErr) console.error("Failed to update click count:", updateErr);
          });
      }

      // Clear, absolute 301 Redirect
      res.redirect(301, dest);
    } catch (err) {
      console.error("Redirection server error:", err);
      res.status(500).send("Internal server error handling redirect.");
    }
  });

  // Shortener POST Creation Route
  app.post("/api/utilities/shorten", shortenRateLimiter, async (req, res) => {
    try {
      const { url, slug } = req.body;
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return res.status(400).json({ error: "A valid long URL is required." });
      }

      const cleanUrl = url.trim();

      // Check security boundaries of target URL
      const isSafe = await validateUrl(cleanUrl);
      if (!isSafe) {
        return res.status(400).json({
          error: "Invalid URL destination. It must be a valid public HTTP/HTTPS address.",
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

      // Optionally authenticate user via client Authorization header
      let userId: string | null = null;
      if (isSupabaseConfigured) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          try {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
              userId = user.id;
            }
          } catch (authErr) {
            // Fallback to anonymous creation if token is expired/invalid
          }
        }
      }

      // Perform a lookup to guarantee uniqueness of the custom slug
      let existing: any = null;
      let checkErr: any = null;
      let useFallback = !isSupabaseConfigured;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
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
          if (isTableMissingError(checkErr)) {
            console.warn(`Table 'short_links' is missing. Verifying slug availability in-memory for: ${finalSlug}`);
            useFallback = true;
            existing = shortLinksFallback.get(finalSlug) ? { id: "fallback" } : null;
          } else {
            console.error("Database check error during creation lookup:", checkErr);
            return res.status(500).json({ error: "Failed to verify slug availability." });
          }
        }
      } else {
        existing = shortLinksFallback.get(finalSlug) ? { id: "fallback" } : null;
      }

      if (existing) {
        if (slug) {
          return res.status(409).json({ error: "This custom slug is already taken." });
        } else {
          // Regenerate one more time for extremely rare random collision
          finalSlug = generateRandomSlug(7);
          if (useFallback && shortLinksFallback.has(finalSlug)) {
            finalSlug = generateRandomSlug(8);
          }
        }
      }

      let createdLink: any = null;
      if (useFallback) {
        createdLink = {
          id: Math.random().toString(36).substring(2, 15),
          slug: finalSlug,
          destination_url: cleanUrl,
          user_id: userId,
          click_count: 0,
          created_at: new Date().toISOString(),
        };
        shortLinksFallback.set(finalSlug, createdLink);
      } else {
        try {
          const { data, error: insertErr } = await supabase
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
            if (isTableMissingError(insertErr)) {
              console.warn(`Table 'short_links' is missing during insert. Falling back to in-memory store for slug: ${finalSlug}`);
              createdLink = {
                id: Math.random().toString(36).substring(2, 15),
                slug: finalSlug,
                destination_url: cleanUrl,
                user_id: userId,
                click_count: 0,
                created_at: new Date().toISOString(),
              };
              shortLinksFallback.set(finalSlug, createdLink);
            } else {
              console.error("Database insertion error:", insertErr);
              return res.status(500).json({ error: "Failed to register shortened URL." });
            }
          } else {
            createdLink = data;
          }
        } catch (err) {
          console.error("Database insertion crash:", err);
          return res.status(500).json({ error: "Failed to register shortened URL." });
        }
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
  app.post("/api/utilities/link-preview", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return res.status(400).json({ error: "URL parameter is required." });
      }

      const trimmedUrl = url.trim();
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
  app.post("/api/utilities/og-debug", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return res.status(400).json({ error: "URL parameter is required." });
      }

      const trimmedUrl = url.trim();
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

  // Webpage Screenshot Generator endpoint with strict SSRF protection and bounding
  app.post("/api/utilities/screenshot", async (req, res) => {
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

      // Validate IP address
      function isPrivateOrInternalIp(ip: string): boolean {
        if (/^(127\.|10\.|192\.168\.)/.test(ip)) return true;
        if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
        if (/^169\.254\./.test(ip)) return true;
        if (ip === "0.0.0.0" || ip === "255.255.255.255") return true;

        const ipv6Lower = ip.toLowerCase();
        if (
          ipv6Lower === "::1" ||
          ipv6Lower.startsWith("fe80:") ||
          ipv6Lower.startsWith("fc00:") ||
          ipv6Lower.startsWith("fd00:") ||
          ipv6Lower.startsWith("::ffff:127.") ||
          ipv6Lower.startsWith("::ffff:10.") ||
          ipv6Lower.startsWith("::ffff:192.168.")
        ) return true;
        if (ipv6Lower.startsWith("::ffff:172.")) {
          const parts = ipv6Lower.split(".");
          if (parts.length >= 2) {
            const secondPart = parseInt(parts[1], 10);
            if (secondPart >= 16 && secondPart <= 31) return true;
          }
        }
        return false;
      }

      if (isPrivateOrInternalIp(resolvedIp)) {
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

          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
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
        
        // If the primary attempt failed or timed out, automatically fallback to a safe 'load' configuration.
        // This avoids hang-ups on long polling or trackers while still waiting 1.5s for basic JS rendering.
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

      // Max size check: e.g. 8MB
      if (buffer.length > 8 * 1024 * 1024) {
        return res.status(400).json({ error: "The captured screenshot exceeds the maximum allowed file size of 8MB." });
      }

      const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
      let returnedImage = base64Image;

      // 3. Optional persistent storage upload if authenticated
      const userId = await getAuthenticatedUser(req);
      if (userId && userId !== "anonymous-local-user" && isSupabaseConfigured) {
        try {
          const uuid = Math.random().toString(36).substring(2, 15) + "-" + Math.random().toString(36).substring(2, 15);
          const storagePath = `screenshots/${userId}/${uuid}.png`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("user-assets")
            .upload(storagePath, buffer, {
              contentType: "image/png",
              upsert: true,
            });

          if (!uploadError && uploadData) {
            // Retrieve signed URL for private access
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from("user-assets")
              .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days expiry

            if (!signedUrlError && signedUrlData) {
              returnedImage = signedUrlData.signedUrl;

              // Save to user_assets metadata table
              await supabase.from("user_assets").insert({
                user_id: userId,
                storage_path: storagePath,
                type: "screenshot",
                mime_type: "image/png",
                size: buffer.length,
              });
            }
          }
        } catch (storageErr) {
          console.error("Storage upload error (falling back to base64):", storageErr);
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
    }
  });

  // Parse post API using Gemini
  app.post("/api/parse-post", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Post content or URL is required." });
      }

      const trimmedContent = content.trim();
      let scrapedMetadata = "";

      // If it's a standalone URL, attempt to scrape OpenGraph title and description
      const isSingleUrl = /^https?:\/\/[^\s]+$/i.test(trimmedContent);
      if (isSingleUrl) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const pageRes = await fetch(trimmedContent, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (pageRes.ok) {
            const html = await pageRes.text();
            const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || html.match(/<title[^>]*>([^<]*)<\/title>/i);
            const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
            const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i);

            const title = ogTitleMatch ? ogTitleMatch[1] : "";
            const desc = ogDescMatch ? ogDescMatch[1] : "";
            const site = ogSiteMatch ? ogSiteMatch[1] : "";

            if (title || desc) {
              scrapedMetadata = `\nScraped Webpage Metadata:\nSite: ${site}\nTitle: ${title}\nDescription: ${desc}\n`;
            }
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
   - METRICS CALCULATION: If explicit engagement metrics (likes, reactions, reposts, comments, views) or timestamps are present in the text, extract their exact values (e.g., convert "3.8k" to 3800). If no engagement counts are provided, calculate realistic, authentic, proportional social engagement metrics based on the platform and post quality.

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
                description: "Realistic engagement counts if none are specified. Make them feel authentic.",
                properties: {
                  likes: { type: Type.INTEGER, description: "Number of likes/reactions." },
                  comments: { type: Type.INTEGER, description: "Number of comments." },
                  reposts: { type: Type.INTEGER, description: "Number of reposts/shares." },
                  views: { type: Type.INTEGER, description: "Number of views (only relevant for X posts; default to null or a realistic high number if platform is X)." }
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

  // Helper to authenticate
  async function getAuthenticatedUser(req: any): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return "anonymous-local-user";
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          return user.id;
        }
      } catch (err) {
        // ignore
      }
    }
    return null;
  }

  const fallbackLinkHubs = new Map<string, any>(); // Key: id, or slug
  const fallbackLinkHubItems = new Map<string, any[]>(); // Key: hub_id

  // 1. GET User Link Hubs
  app.get("/api/hubs", async (req, res) => {
    try {
      const userId = await getAuthenticatedUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      let hubs: any[] = [];
      let dbError: any = null;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
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
      }

      // If database is not configured or table missing, return from memory fallback
      if (!isSupabaseConfigured || (dbError && isTableMissingError(dbError))) {
        hubs = Array.from(fallbackLinkHubs.values()).filter(h => h.user_id === userId);
      } else if (dbError) {
        console.error("Database error fetching hubs:", dbError);
        return res.status(500).json({ error: "Failed to load link hubs from database." });
      }

      // Fetch items for each hub
      const enrichedHubs = [];
      for (const hub of hubs) {
        let items: any[] = [];
        let itemsError: any = null;

        if (isSupabaseConfigured && !isTableMissingError(dbError)) {
          try {
            const { data, error } = await supabase
              .from("link_hub_items")
              .select("*")
              .eq("hub_id", hub.id)
              .order("position", { ascending: true });
            if (error) itemsError = error;
            else items = data || [];
          } catch (err) {
            itemsError = err;
          }
        }

        if (!isSupabaseConfigured || (itemsError && isTableMissingError(itemsError)) || (dbError && isTableMissingError(dbError))) {
          items = fallbackLinkHubItems.get(hub.id) || [];
          items.sort((a, b) => a.position - b.position);
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
  app.post("/api/hubs/save", async (req, res) => {
    try {
      const userId = await getAuthenticatedUser(req);
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

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
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
      }

      // Memory check fallback
      if (!isSupabaseConfigured || (checkError && isTableMissingError(checkError))) {
        const memHub = Array.from(fallbackLinkHubs.values()).find(h => h.slug === slug);
        if (memHub) {
          if (memHub.user_id !== userId) {
            isSlugTaken = true;
          }
          existingHubId = memHub.id;
        }
      }

      if (isSlugTaken) {
        return res.status(400).json({ error: `The custom URL alias "smyl.link/h/${slug}" is already taken by another profile.` });
      }

      let finalHubId = hub.id || existingHubId || Math.random().toString(36).substring(2, 15);
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
      let useFallback = !isSupabaseConfigured;

      if (isSupabaseConfigured) {
        try {
          // Check ownership if update
          if (hub.id) {
            const { data: ownershipCheck, error: ownerError } = await supabase
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
          const { data, error } = await supabase
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
      }

      if (!isSupabaseConfigured || (writeError && isTableMissingError(writeError))) {
        useFallback = true;
        const oldHub = fallbackLinkHubs.get(finalHubId);
        savedHub = {
          ...hubData,
          created_at: oldHub ? oldHub.created_at : new Date().toISOString()
        };
        fallbackLinkHubs.set(finalHubId, savedHub);
      } else if (writeError) {
        console.error("Database save error:", writeError);
        return res.status(500).json({ error: "Failed to save Link Hub to database." });
      }

      // Upsert Items
      const savedItems: any[] = [];
      const itemIdsToKeep = new Set<string>();

      if (useFallback) {
        const fallbacks: any[] = [];
        validatedItems.forEach((item, index) => {
          const itemId = item.id || Math.random().toString(36).substring(2, 15);
          itemIdsToKeep.add(itemId);
          const oldItem = (fallbackLinkHubItems.get(finalHubId) || []).find(i => i.id === itemId);
          const newItem = {
            id: itemId,
            hub_id: finalHubId,
            title: String(item.title).trim(),
            description: String(item.description || "").trim(),
            destination_url: String(item.destination_url).trim(),
            image_path: item.image_path || null,
            position: index,
            is_enabled: item.is_enabled !== false,
            click_count: oldItem ? oldItem.click_count : 0,
            created_at: oldItem ? oldItem.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          fallbacks.push(newItem);
          savedItems.push(newItem);
        });
        fallbackLinkHubItems.set(finalHubId, fallbacks);
      } else {
        // Find existing IDs to delete from db if not in payload
        validatedItems.forEach(item => {
          if (item.id) itemIdsToKeep.add(item.id);
        });

        // Delete removed items
        if (itemIdsToKeep.size > 0) {
          await supabase
            .from("link_hub_items")
            .delete()
            .eq("hub_id", finalHubId)
            .not("id", "in", `(${Array.from(itemIdsToKeep).join(",")})`);
        } else {
          await supabase
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

          const { data: savedItem, error: itemErr } = await supabase
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
  app.get("/api/hubs/public/:slug", async (req, res) => {
    try {
      const slug = String(req.params.slug).trim().toLowerCase();
      
      let hub: any = null;
      let dbError: any = null;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("link_hubs")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          hub = data;
          dbError = error;
        } catch (err) {
          dbError = err;
        }
      }

      if (!isSupabaseConfigured || (dbError && isTableMissingError(dbError))) {
        hub = Array.from(fallbackLinkHubs.values()).find(h => h.slug === slug) || null;
      }

      if (!hub) {
        return res.status(404).json({ error: "Link Hub profile not found." });
      }

      // Check draft state -> if not published, the active user MUST be the owner to view it
      if (!hub.is_published) {
        const userId = await getAuthenticatedUser(req);
        if (hub.user_id !== userId) {
          return res.status(403).json({ error: "This Link Hub is currently offline (draft mode)." });
        }
      }

      // Fetch items
      let items: any[] = [];
      let itemsError: any = null;

      if (isSupabaseConfigured && (!dbError || !isTableMissingError(dbError))) {
        try {
          const { data, error } = await supabase
            .from("link_hub_items")
            .select("*")
            .eq("hub_id", hub.id)
            .order("position", { ascending: true });
          
          items = data || [];
          itemsError = error;
        } catch (err) {
          itemsError = err;
        }
      }

      if (!isSupabaseConfigured || (itemsError && isTableMissingError(itemsError)) || (dbError && isTableMissingError(dbError))) {
        items = fallbackLinkHubItems.get(hub.id) || [];
        items.sort((a, b) => a.position - b.position);
      }

      // Filter enabled links for public view
      const activeItems = items.filter(i => i.is_enabled);

      res.json({
        ...hub,
        items: activeItems
      });
    } catch (err: any) {
      console.error("GET /api/hubs/public error:", err);
      res.status(500).json({ error: err.message || "Failed to load public Link Hub." });
    }
  });

  // 4. GET Redirect / Tracking endpoint
  app.get("/api/hubs/redirect/:itemId", async (req, res) => {
    try {
      const itemId = req.params.itemId;

      let item: any = null;
      let dbError: any = null;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("link_hub_items")
            .select("*")
            .eq("id", itemId)
            .maybeSingle();
          item = data;
          dbError = error;
        } catch (err) {
          dbError = err;
        }
      }

      if (!isSupabaseConfigured || (dbError && isTableMissingError(dbError))) {
        // Look in all fallback hub arrays
        for (const list of fallbackLinkHubItems.values()) {
          const found = list.find(i => i.id === itemId);
          if (found) {
            item = found;
            break;
          }
        }
      }

      if (!item) {
        return res.status(404).send("Link item not found or has been removed.");
      }

      if (!validateDestinationUrl(item.destination_url)) {
        return res.status(400).send("The stored destination URL is insecure or invalid.");
      }

      // Safe Server Redirect with click count increment
      if (isSupabaseConfigured && (!dbError || !isTableMissingError(dbError))) {
        supabase
          .from("link_hub_items")
          .update({ click_count: Number(item.click_count || 0) + 1 })
          .eq("id", item.id)
          .then(({ error: clickErr }) => {
            if (clickErr) console.error("Failed to update link click count:", clickErr);
          });
      } else {
        item.click_count = Number(item.click_count || 0) + 1;
      }

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
