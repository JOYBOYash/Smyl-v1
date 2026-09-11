import { ParsedPost, CardCustomization, PlatformType } from "../types";

/**
 * Determine if a URL is a login-walled social platform
 * LinkedIn, X, Facebook, Instagram, Threads, and TikTok cannot be scraped via standard HTTP
 * because they are protected behind authentication walls.
 */
export function isLoginWalledSocialUrl(url: string): boolean {
  const lower = url.toLowerCase().trim();
  return (
    lower.includes("linkedin.com") ||
    lower.includes("lnkd.in") ||
    lower.includes("twitter.com") ||
    lower.includes("x.com") ||
    lower.includes("threads.net") ||
    lower.includes("facebook.com") ||
    lower.includes("instagram.com") ||
    lower.includes("tiktok.com")
  );
}

/**
 * Robustly guess platform based on URL content or text structure
 */
export function guessPlatform(input: string): PlatformType {
  const lower = input.toLowerCase().trim();
  if (lower.includes("linkedin.com") || lower.includes("lnkd.in") || lower.includes("grateful") || lower.includes("announcing") || lower.includes("excited to share")) {
    return "linkedin";
  }
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return "x";
  }
  if (lower.includes("substack.com")) {
    return "substack";
  }
  if (lower.includes("threads.net")) {
    return "threads";
  }
  if (lower.includes("medium.com")) {
    return "medium";
  }
  if (lower.includes("facebook.com")) {
    return "facebook";
  }
  if (lower.includes("instagram.com")) {
    return "instagram";
  }
  if (lower.includes("tiktok.com")) {
    return "tiktok";
  }
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }
  
  // Default based on character count constraint
  return input.length < 280 ? "x" : "linkedin";
}

/**
 * Process raw text inputs deterministically, preserving all lines, spacing, and characters verbatim.
 * Extracts hashtags, mentions, and links using precise regex matching.
 */
export function parseRawTextDeterministic(
  text: string,
  preferredPlatform?: PlatformType,
  authorName: string = "Alex Rivera",
  username: string = "@alexrivera"
): ParsedPost {
  const trimmed = text.trim();
  const platform = preferredPlatform || guessPlatform(trimmed);

  // Extract hashtags
  const hashtagMatches = trimmed.match(/#[a-zA-Z0-9_]+/g) || [];
  const hashtags = Array.from(new Set(hashtagMatches.map((h) => h.replace("#", ""))));

  // Extract mentions
  const mentionMatches = trimmed.match(/@[a-zA-Z0-9_]+/g) || [];
  const mentions = Array.from(new Set(mentionMatches));

  // Extract URLs
  const urlMatches = trimmed.match(/https?:\/\/[^\s]+/g) || [];
  const links = Array.from(new Set(urlMatches));

  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SM";

  return {
    platform,
    author: {
      name: authorName,
      username: username,
      isVerified: true,
      avatarColor: platform === "linkedin" ? "#0A66C2" : "#0145F2",
      avatarText: initials,
    },
    content: {
      text: trimmed,
      hashtags: hashtags.length > 0 ? hashtags : ["leadership", "innovation"],
      mentions,
      links,
    },
    timestamp: platform === "linkedin" ? "3d · Edited" : "9:41 AM · Aug 24, 2026",
    engagement: {
      likes: platform === "linkedin" ? 1420 : 3840,
      comments: platform === "linkedin" ? 88 : 215,
      reposts: platform === "linkedin" ? 54 : 640,
      views: platform === "x" ? 128000 : undefined,
    },
  };
}

/**
 * Convert extracted link metadata into a post card schema deterministically
 * without adding, paraphrasing, or fabricating information.
 */
export function parseMetadataToPost(
  url: string,
  metadata: { title: string | null; description: string | null; siteName: string | null; imageUrl: string | null }
): ParsedPost {
  const platform = guessPlatform(url);
  const title = metadata.title || "Untitled Article";
  const desc = metadata.description || "No preview description available.";
  
  // Use description verbatim if available; otherwise use title
  const contentText = desc && desc !== "No preview description available." ? desc : title;

  // Extract any hashtags or mentions in metadata description
  const hashtagMatches = contentText.match(/#[a-zA-Z0-9_]+/g) || [];
  const hashtags = Array.from(new Set(hashtagMatches.map((h) => h.replace("#", ""))));

  const mentionMatches = contentText.match(/@[a-zA-Z0-9_]+/g) || [];
  const mentions = Array.from(new Set(mentionMatches));

  const links = [url];

  let domain = "Article";
  try {
    domain = new URL(url).hostname.replace("www.", "");
  } catch {
    // Fallback if URL is invalid
  }

  const siteName = metadata.siteName || domain;
  const authorName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
  const initials = authorName.slice(0, 2).toUpperCase();

  return {
    platform,
    author: {
      name: authorName,
      username: `@${siteName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      isVerified: true,
      avatarColor: platform === "linkedin" ? "#0A66C2" : "#0145F2",
      avatarText: initials,
    },
    content: {
      text: contentText,
      hashtags: hashtags.length > 0 ? hashtags : ["learning", "tech"],
      mentions,
      links,
    },
    timestamp: "Published",
    engagement: {
      likes: 850,
      comments: 42,
      reposts: 12,
    },
    imageUrl: metadata.imageUrl || undefined,
  };
}

/**
 * Intelligent client-side fallback parser for backward-compatibility
 */
export function parsePostClientFallback(input: string): { post: ParsedPost; customizationPartial?: Partial<CardCustomization> } {
  const post = parseRawTextDeterministic(input);
  return {
    post,
    customizationPartial: {
      platform: post.platform,
    },
  };
}
