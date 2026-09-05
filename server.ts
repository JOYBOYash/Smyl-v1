import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

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
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
