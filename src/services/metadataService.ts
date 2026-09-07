import { parse as parseHtml } from "node-html-parser";
import {
  validateAndNormalizeUrl,
  secureHttpAgent,
  secureHttpsAgent,
  isPrivateIp
} from "../server/security/urlSecurity";

export interface LinkMetadata {
  url: string;
  finalUrl: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
  canonicalUrl: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  twitter: {
    card: string | null;
    title: string | null;
    description: string | null;
    image: string | null;
  };
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
    type: string | null;
    url: string | null;
  };
}

export interface DebugMetadataResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  contentType: string | null;
  timingMs: number;
  https: boolean;
  redirects: string[];
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
    type: string | null;
    url: string | null;
  };
  twitter: {
    card: string | null;
    title: string | null;
    description: string | null;
    image: string | null;
  };
  standard: {
    title: string | null;
    description: string | null;
    favicon: string | null;
  };
  canonical: {
    url: string | null;
    matches: boolean;
  };
  images: Array<{
    url: string;
    status: "Good" | "Missing" | "Warning" | "Unavailable";
    contentType: string | null;
    reachable: boolean;
  }>;
  diagnostics: Array<{
    code: string;
    severity: "Good" | "Warning" | "Missing" | "Unavailable";
    message: string;
  }>;
}

// Simple in-memory cache to prevent redundant fetches
// Use a short-lived TTL of 5 minutes (300,000 ms)
interface CacheEntry {
  data: LinkMetadata;
  expiresAt: number;
}
const metadataCache = new Map<string, CacheEntry>();

interface DebugCacheEntry {
  data: DebugMetadataResult;
  expiresAt: number;
}
const debugCache = new Map<string, DebugCacheEntry>();

export const clearMetadataCache = () => {
  metadataCache.clear();
  debugCache.clear();
};

/**
 * Backward compatibility wrapper for isPrivateIp
 */
export function isPrivateIpAddress(ip: string): boolean {
  return isPrivateIp(ip);
}

/**
 * Backward compatibility wrapper for URL validation
 */
export async function isSafeDestinationUrl(urlStr: string): Promise<boolean> {
  const result = await validateAndNormalizeUrl(urlStr);
  return result.isValid;
}

// Normalize relative URLs with support for absolute fallbacks
function normalizeUrl(relativeUrl: string | null | undefined, baseUrl: string): string | null {
  if (!relativeUrl || typeof relativeUrl !== "string") return null;
  try {
    const resolved = new URL(relativeUrl.trim(), baseUrl).toString();
    if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
      return resolved;
    }
  } catch {
    // Ignore invalid resolution
  }
  return null;
}

// Fetch and extract structured page metadata
export async function extractLinkMetadata(targetUrl: string): Promise<LinkMetadata> {
  // 1. Initial Validation (SSRF protection)
  const initialValidation = await validateAndNormalizeUrl(targetUrl);
  if (!initialValidation.isValid) {
    throw new Error("Access to the specified URL is forbidden or invalid.");
  }

  // 2. Cache check
  const now = Date.now();
  const cached = metadataCache.get(targetUrl);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  let currentUrl = targetUrl;
  let redirectCount = 0;
  const maxRedirects = 5;
  let responseText = "";
  let finalUrl = targetUrl;

  // 3. Manual Redirect and IP Verification Loop (Anti-SSRF redirects)
  while (redirectCount <= maxRedirects) {
    const isCurrentSafe = await validateAndNormalizeUrl(currentUrl);
    if (!isCurrentSafe.isValid) {
      throw new Error("Access forbidden: target redirect leads to a private or unsafe network.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds strict timeout

    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; SmylLinkPreviewGenerator/1.0; +https://ais-pre-fhrypyy5a5uqhtxsyveiov-832675621924.asia-east1.run.app)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
        },
        redirect: "manual",
        agent: currentUrl.startsWith("https:") ? secureHttpsAgent : secureHttpAgent,
        signal: controller.signal,
      } as any);

      clearTimeout(timeoutId);

      // Handle Redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error("Redirected with missing location header.");
        }
        currentUrl = new URL(location, currentUrl).toString();
        redirectCount++;
        if (redirectCount > maxRedirects) {
          throw new Error("Too many redirects encountered.");
        }
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP fetch failed with status: ${response.status}`);
      }

      // Verify content type
      const contentType = response.headers.get("content-type") || "";
      const isHtml =
        contentType.includes("text/html") ||
        contentType.includes("application/xhtml+xml") ||
        contentType.includes("application/xml");

      if (!isHtml) {
        throw new Error(`Unsupported content type "${contentType}". Only HTML websites are allowed.`);
      }

      // Verify Content Length
      const contentLengthHeader = response.headers.get("content-length");
      if (contentLengthHeader) {
        const bytes = parseInt(contentLengthHeader, 10);
        if (!isNaN(bytes) && bytes > 1.5 * 1024 * 1024) {
          throw new Error("Response body is too large (limit is 1.5MB).");
        }
      }

      // Read response chunk-by-chunk to enforce absolute constraints
      let totalBytes = 0;
      const maxSizeLimit = 1.5 * 1024 * 1024;
      const decoder = new TextDecoder("utf-8");

      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytes += value.length;
            if (totalBytes > maxSizeLimit) {
              const sliceNeeded = maxSizeLimit - (totalBytes - value.length);
              if (sliceNeeded > 0) {
                responseText += decoder.decode(value.slice(0, sliceNeeded), { stream: true });
              }
              reader.cancel();
              break;
            }
            responseText += decoder.decode(value, { stream: true });
          }
        }
      } else {
        responseText = await response.text();
      }

      finalUrl = currentUrl;
      break;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Request timed out (server took longer than 4s to respond).");
      }
      throw err;
    }
  }

  // 4. Safe Parsing
  const root = parseHtml(responseText);

  const getMetaProperty = (property: string): string | null => {
    const element = root.querySelector(`meta[property="${property}"]`);
    return element ? element.getAttribute("content") || null : null;
  };

  const getMetaName = (name: string): string | null => {
    const element = root.querySelector(`meta[name="${name}"]`);
    return element ? element.getAttribute("content") || null : null;
  };

  const pageTitle = root.querySelector("title")?.text?.trim() || null;
  const pageDescription = getMetaName("description") || getMetaProperty("og:description") || null;
  const canonicalUrlRaw = root.querySelector('link[rel="canonical"]')?.getAttribute("href") || null;

  const ogTitle = getMetaProperty("og:title") || null;
  const ogDescription = getMetaProperty("og:description") || null;
  const ogImageRaw = getMetaProperty("og:image") || null;
  const ogSiteName = getMetaProperty("og:site_name") || null;
  const ogType = getMetaProperty("og:type") || null;
  const ogUrl = getMetaProperty("og:url") || null;

  const twitterCard = getMetaName("twitter:card") || null;
  const twitterTitle = getMetaName("twitter:title") || null;
  const twitterDescription = getMetaName("twitter:description") || null;
  const twitterImageRaw = getMetaName("twitter:image") || null;

  let faviconRaw =
    root.querySelector('link[rel="icon"]')?.getAttribute("href") ||
    root.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
    root.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ||
    null;

  const finalTitle = ogTitle || twitterTitle || pageTitle || "Untitled Website";
  const finalDescription = ogDescription || twitterDescription || pageDescription || "No preview description available.";
  const finalSiteName = ogSiteName || null;
  const finalCanonical = normalizeUrl(canonicalUrlRaw || ogUrl, finalUrl);
  const finalImage = normalizeUrl(ogImageRaw || twitterImageRaw, finalUrl);
  const finalFavicon = normalizeUrl(faviconRaw || "/favicon.ico", finalUrl);

  // Validate images using the hardened checkImageUrl to prevent SSRF or private IP leakage
  let verifiedImageUrl: string | null = finalImage;
  if (finalImage) {
    const checked = await checkImageUrl(finalImage);
    if (checked && (checked.status === "Warning" || !checked.reachable)) {
      verifiedImageUrl = null;
    }
  }

  let verifiedFaviconUrl: string | null = finalFavicon;
  if (finalFavicon) {
    const checked = await checkImageUrl(finalFavicon);
    if (checked && (checked.status === "Warning" || !checked.reachable)) {
      verifiedFaviconUrl = null;
    }
  }

  const result: LinkMetadata = {
    url: targetUrl,
    finalUrl,
    title: finalTitle,
    description: finalDescription,
    siteName: finalSiteName,
    canonicalUrl: finalCanonical,
    imageUrl: verifiedImageUrl,
    faviconUrl: verifiedFaviconUrl,
    twitter: {
      card: twitterCard,
      title: twitterTitle || finalTitle,
      description: twitterDescription || finalDescription,
      image: verifiedImageUrl,
    },
    openGraph: {
      title: ogTitle || finalTitle,
      description: ogDescription || finalDescription,
      image: verifiedImageUrl,
      siteName: ogSiteName || finalSiteName,
      type: ogType,
      url: ogUrl ? normalizeUrl(ogUrl, finalUrl) : finalCanonical,
    },
  };

  metadataCache.set(targetUrl, {
    data: result,
    expiresAt: Date.now() + 300000,
  });

  return result;
}

/**
 * Hardened checkImageUrl with manual redirect tracking, SSRF checks, timeout, limit, and content type validation
 */
export async function checkImageUrl(imageUrl: string | null): Promise<{ url: string; status: "Good" | "Missing" | "Warning" | "Unavailable"; contentType: string | null; reachable: boolean } | null> {
  if (!imageUrl) return null;

  let currentUrl = imageUrl;
  let redirectCount = 0;
  const maxRedirects = 5;
  const timeoutMs = 3000;
  const maxImageSize = 5 * 1024 * 1024; // 5MB max image response

  while (redirectCount <= maxRedirects) {
    const validation = await validateAndNormalizeUrl(currentUrl);
    if (!validation.isValid) {
      return { url: imageUrl, status: "Warning", contentType: null, reachable: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SmylImageChecker/1.0)",
          "Accept": "image/*,*/*",
        },
        redirect: "manual",
        agent: currentUrl.startsWith("https:") ? secureHttpsAgent : secureHttpAgent,
        signal: controller.signal,
      } as any);

      clearTimeout(timeoutId);

      // Handle Redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          return { url: imageUrl, status: "Warning", contentType: null, reachable: false };
        }
        currentUrl = new URL(location, currentUrl).toString();
        redirectCount++;
        continue;
      }

      if (!response.ok) {
        return { url: imageUrl, status: "Warning", contentType: null, reachable: false };
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType && !contentType.toLowerCase().startsWith("image/")) {
        return { url: imageUrl, status: "Warning", contentType, reachable: false };
      }

      const contentLengthHeader = response.headers.get("content-length");
      if (contentLengthHeader) {
        const size = parseInt(contentLengthHeader, 10);
        if (!isNaN(size) && size > maxImageSize) {
          return { url: imageUrl, status: "Warning", contentType, reachable: false };
        }
      }

      // Stream read with cancellation limit
      let totalBytes = 0;
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytes += value.length;
            if (totalBytes > maxImageSize) {
              reader.cancel();
              return { url: imageUrl, status: "Warning", contentType, reachable: false };
            }
          }
        }
      }

      return {
        url: currentUrl,
        status: "Good",
        contentType,
        reachable: true,
      };
    } catch {
      clearTimeout(timeoutId);
      return { url: imageUrl, status: "Warning", contentType: null, reachable: false };
    }
  }

  return { url: imageUrl, status: "Warning", contentType: null, reachable: false };
}

// Full diagnostic Open Graph metadata evaluator
export async function debugLinkMetadata(targetUrl: string): Promise<DebugMetadataResult> {
  const initialValidation = await validateAndNormalizeUrl(targetUrl);
  if (!initialValidation.isValid) {
    throw new Error("Access to the specified URL is forbidden or invalid.");
  }

  const now = Date.now();
  const cached = debugCache.get(targetUrl);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const startTime = Date.now();
  let currentUrl = targetUrl;
  let redirectCount = 0;
  const maxRedirects = 5;
  const redirectsList: string[] = [];
  let responseText = "";
  let finalUrl = targetUrl;
  let statusCode = 200;
  let contentTypeHeader: string | null = null;

  while (redirectCount <= maxRedirects) {
    const isCurrentSafe = await validateAndNormalizeUrl(currentUrl);
    if (!isCurrentSafe.isValid) {
      throw new Error("Access forbidden: target redirect leads to a private or unsafe network.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; SmylOGDebugger/1.0; +https://ais-pre-fhrypyy5a5uqhtxsyveiov-832675621924.asia-east1.run.app)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
        },
        redirect: "manual",
        agent: currentUrl.startsWith("https:") ? secureHttpsAgent : secureHttpAgent,
        signal: controller.signal,
      } as any);

      clearTimeout(timeoutId);
      statusCode = response.status;
      contentTypeHeader = response.headers.get("content-type");

      // Redirections Trace
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error("Redirected with missing location header.");
        }
        redirectsList.push(currentUrl);
        currentUrl = new URL(location, currentUrl).toString();
        redirectCount++;
        if (redirectCount > maxRedirects) {
          throw new Error("Too many redirects encountered.");
        }
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP fetch failed with status: ${response.status}`);
      }

      const ct = contentTypeHeader || "";
      const isHtml = ct.includes("text/html") || ct.includes("application/xhtml+xml") || ct.includes("application/xml");
      if (!isHtml) {
        throw new Error(`Unsupported content type "${ct}". Only HTML websites are allowed.`);
      }

      const contentLengthHeader = response.headers.get("content-length");
      if (contentLengthHeader) {
        const bytes = parseInt(contentLengthHeader, 10);
        if (!isNaN(bytes) && bytes > 1.5 * 1024 * 1024) {
          throw new Error("Response body is too large (limit is 1.5MB).");
        }
      }

      let totalBytes = 0;
      const maxSizeLimit = 1.5 * 1024 * 1024;
      const decoder = new TextDecoder("utf-8");

      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytes += value.length;
            if (totalBytes > maxSizeLimit) {
              const sliceNeeded = maxSizeLimit - (totalBytes - value.length);
              if (sliceNeeded > 0) {
                responseText += decoder.decode(value.slice(0, sliceNeeded), { stream: true });
              }
              reader.cancel();
              break;
            }
            responseText += decoder.decode(value, { stream: true });
          }
        }
      } else {
        responseText = await response.text();
      }

      finalUrl = currentUrl;
      break;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Request timed out (server took longer than 4s to respond).");
      }
      throw err;
    }
  }

  const timingMs = Date.now() - startTime;
  const isHttps = finalUrl.toLowerCase().startsWith("https://");

  const root = parseHtml(responseText);

  const getMetaProperty = (property: string): string | null => {
    const element = root.querySelector(`meta[property="${property}"]`);
    return element ? element.getAttribute("content") || null : null;
  };

  const getMetaName = (name: string): string | null => {
    const element = root.querySelector(`meta[name="${name}"]`);
    return element ? element.getAttribute("content") || null : null;
  };

  const standardTitle = root.querySelector("title")?.text?.trim() || null;
  const standardDescription = getMetaName("description") || null;
  const canonicalUrlRaw = root.querySelector('link[rel="canonical"]')?.getAttribute("href") || null;

  const ogTitle = getMetaProperty("og:title");
  const ogDescription = getMetaProperty("og:description");
  const ogImageRaw = getMetaProperty("og:image");
  const ogSiteName = getMetaProperty("og:site_name");
  const ogType = getMetaProperty("og:type");
  const ogUrlRaw = getMetaProperty("og:url");

  const twitterCard = getMetaName("twitter:card");
  const twitterTitle = getMetaName("twitter:title");
  const twitterDescription = getMetaName("twitter:description");
  const twitterImageRaw = getMetaName("twitter:image");

  let faviconRaw =
    root.querySelector('link[rel="icon"]')?.getAttribute("href") ||
    root.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
    root.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ||
    null;

  const normalizedCanonical = normalizeUrl(canonicalUrlRaw || ogUrlRaw, finalUrl);
  const normalizedOgImage = normalizeUrl(ogImageRaw, finalUrl);
  const normalizedTwitterImage = normalizeUrl(twitterImageRaw, finalUrl);
  const normalizedFavicon = normalizeUrl(faviconRaw || "/favicon.ico", finalUrl);

  const checkedImagesList: Array<{
    url: string;
    status: "Good" | "Missing" | "Warning" | "Unavailable";
    contentType: string | null;
    reachable: boolean;
  }> = [];

  if (normalizedOgImage) {
    const ogImgStatus = await checkImageUrl(normalizedOgImage);
    if (ogImgStatus) checkedImagesList.push(ogImgStatus);
  }
  if (normalizedTwitterImage && normalizedTwitterImage !== normalizedOgImage) {
    const twImgStatus = await checkImageUrl(normalizedTwitterImage);
    if (twImgStatus) checkedImagesList.push(twImgStatus);
  }

  const diagnostics: Array<{
    code: string;
    severity: "Good" | "Warning" | "Missing" | "Unavailable";
    message: string;
  }> = [];

  if (isHttps) {
    diagnostics.push({
      code: "HTTPS_CHECK",
      severity: "Good",
      message: "The website uses a secure HTTPS connection.",
    });
  } else {
    diagnostics.push({
      code: "HTTPS_CHECK",
      severity: "Warning",
      message: "The website does not use a secure HTTPS protocol. Shared connections are not encrypted.",
    });
  }

  if (redirectsList.length > 0) {
    diagnostics.push({
      code: "REDIRECT_DETECTED",
      severity: "Warning",
      message: `Redirect detected: Server redirected ${redirectsList.length} time(s) to reach ${finalUrl}.`,
    });
  }

  if (standardTitle) {
    diagnostics.push({
      code: "HTML_TITLE",
      severity: "Good",
      message: `Found HTML <title> tag: "${standardTitle}"`,
    });
  } else {
    diagnostics.push({
      code: "HTML_TITLE",
      severity: "Missing",
      message: "HTML <title> tag is missing. Browsers will show URL as tab name.",
    });
  }

  if (standardDescription) {
    diagnostics.push({
      code: "HTML_DESCRIPTION",
      severity: "Good",
      message: "Standard <meta name=\"description\"> tag is present.",
    });
  } else {
    diagnostics.push({
      code: "HTML_DESCRIPTION",
      severity: "Missing",
      message: "Standard description tag is missing. Search engines might fall back to arbitrary page snippet.",
    });
  }

  if (ogTitle) {
    diagnostics.push({
      code: "OG_TITLE",
      severity: "Good",
      message: `Open Graph title "og:title" is present: "${ogTitle}"`,
    });
  } else {
    diagnostics.push({
      code: "OG_TITLE",
      severity: "Missing",
      message: "Open Graph og:title is missing. Platforms will fall back to HTML <title>.",
    });
  }

  if (ogDescription) {
    diagnostics.push({
      code: "OG_DESCRIPTION",
      severity: "Good",
      message: "Open Graph og:description is present.",
    });
  } else {
    diagnostics.push({
      code: "OG_DESCRIPTION",
      severity: "Missing",
      message: "Open Graph og:description is missing. Social shares will fall back to standard description.",
    });
  }

  if (ogImageRaw) {
    const verifiedImg = checkedImagesList.find(img => img.url === normalizedOgImage);
    if (verifiedImg && verifiedImg.reachable) {
      diagnostics.push({
        code: "OG_IMAGE",
        severity: "Good",
        message: `Open Graph og:image is present and reachable: "${normalizedOgImage}"`,
      });
    } else {
      diagnostics.push({
        code: "OG_IMAGE",
        severity: "Warning",
        message: `Open Graph og:image is present but returned an unreachable status or was blocked: "${normalizedOgImage}"`,
      });
    }
  } else {
    diagnostics.push({
      code: "OG_IMAGE",
      severity: "Missing",
      message: "Open Graph og:image is missing. Shared posts will render without large preview banners.",
    });
  }

  if (twitterCard) {
    diagnostics.push({
      code: "TWITTER_CARD",
      severity: "Good",
      message: `Twitter card layout configuration present: "${twitterCard}"`,
    });
  } else {
    diagnostics.push({
      code: "TWITTER_CARD",
      severity: "Missing",
      message: "Twitter twitter:card is missing. X/Twitter will default to standard summary layout.",
    });
  }

  if (!twitterImageRaw && ogImageRaw) {
    diagnostics.push({
      code: "TWITTER_IMAGE",
      severity: "Missing",
      message: "twitter:image tag is missing. X/Twitter shares will fall back to og:image.",
    });
  }

  if (normalizedCanonical) {
    const finalClean = finalUrl.replace(/\/$/, "");
    const canonicalClean = normalizedCanonical.replace(/\/$/, "");

    if (finalClean === canonicalClean) {
      diagnostics.push({
        code: "CANONICAL_CHECK",
        severity: "Good",
        message: "Canonical URL is configured and exactly matches the target page address.",
      });
    } else {
      diagnostics.push({
        code: "CANONICAL_CHECK",
        severity: "Warning",
        message: `Canonical link differs from reached URL. Canonical is "${normalizedCanonical}", while reached page is "${finalUrl}".`,
      });
    }
  } else {
    diagnostics.push({
      code: "CANONICAL_CHECK",
      severity: "Missing",
      message: "Canonical link element is missing. Duplicate URLs could fragment SEO search authority.",
    });
  }

  const result: DebugMetadataResult = {
    url: targetUrl,
    finalUrl,
    statusCode,
    contentType: contentTypeHeader,
    timingMs,
    https: isHttps,
    redirects: redirectsList,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: normalizedOgImage,
      siteName: ogSiteName,
      type: ogType,
      url: ogUrlRaw ? normalizeUrl(ogUrlRaw, finalUrl) : null,
    },
    twitter: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      image: normalizedTwitterImage,
    },
    standard: {
      title: standardTitle,
      description: standardDescription,
      favicon: normalizedFavicon,
    },
    canonical: {
      url: normalizedCanonical,
      matches: normalizedCanonical ? (normalizedCanonical.replace(/\/$/, "") === finalUrl.replace(/\/$/, "")) : false,
    },
    images: checkedImagesList,
    diagnostics,
  };

  debugCache.set(targetUrl, {
    data: result,
    expiresAt: Date.now() + 300000,
  });

  return result;
}
