import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import dns from "dns";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";

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
        return res.status(503).send("Database service not configured.");
      }

      // Fetch the link record
      const { data: link, error } = await supabase
        .from("short_links")
        .select("*")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (error || !link) {
        return res.status(404).send("Short link not found or has been removed.");
      }

      // Check scheme safety
      const dest = link.destination_url;
      if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
        return res.status(400).send("Invalid redirection destination scheme.");
      }

      // Fire-and-forget: safely increment the click count
      const currentClicks = typeof link.click_count === "string" ? parseInt(link.click_count, 10) : Number(link.click_count || 0);
      supabase
        .from("short_links")
        .update({ click_count: currentClicks + 1 })
        .eq("id", link.id)
        .then(({ error: updateErr }) => {
          if (updateErr) console.error("Failed to update click count:", updateErr);
        });

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

      if (!isSupabaseConfigured) {
        return res.status(503).json({ error: "Database service not configured." });
      }

      // Optionally authenticate user via client Authorization header
      let userId: string | null = null;
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

      // Perform a lookup to guarantee uniqueness of the custom slug
      const { data: existing, error: checkErr } = await supabase
        .from("short_links")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (checkErr) {
        console.error("Database check error:", checkErr);
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

      // Insert record
      const { data: createdLink, error: insertErr } = await supabase
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
