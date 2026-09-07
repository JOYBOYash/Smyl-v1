import dns from "dns";
import { promisify } from "util";
import http from "http";
import https from "https";

const dnsLookup = promisify(dns.lookup);

// URL character and length constraints
const MAX_URL_LENGTH = 2048;

/**
 * Checks if a string is a valid IPv4 address
 */
export function isIPv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && String(num) === part;
  });
}

/**
 * Normalizes an IPv6 address representation
 */
export function normalizeIPv6(ip: string): string {
  return ip.toLowerCase().trim();
}

/**
 * Parse IPv4-mapped IPv6 address (e.g. ::ffff:192.168.1.1)
 */
export function getMappedIPv4(ip: string): string | null {
  const normalized = normalizeIPv6(ip);
  if (normalized.startsWith("::ffff:") && normalized.includes(".")) {
    const ipv4Part = ip.substring(ip.lastIndexOf(":") + 1);
    if (isIPv4(ipv4Part)) {
      return ipv4Part;
    }
  }
  return null;
}

/**
 * Comprehensive classification of safe vs unsafe/private IP addresses
 */
export function isPrivateIp(ip: string): boolean {
  const normalized = ip.trim();

  // Handle IPv4-mapped IPv6 addresses first
  const mappedIPv4 = getMappedIPv4(normalized);
  if (mappedIPv4) {
    return isPrivateIp(mappedIPv4);
  }

  // IPv4 validation and check
  if (isIPv4(normalized)) {
    const parts = normalized.split(".").map(Number);
    const [p0, p1, p2, p3] = parts;

    // Loopback: 127.0.0.0/8
    if (p0 === 127) return true;

    // RFC 1918 Private Ranges:
    // 10.0.0.0/8
    if (p0 === 10) return true;
    // 172.16.0.0/12
    if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
    // 192.168.0.0/16
    if (p0 === 192 && p1 === 168) return true;

    // Link-local: 169.254.0.0/16
    if (p0 === 169 && p1 === 254) return true;

    // Unspecified: 0.0.0.0
    if (p0 === 0) return true;

    // Shared Address Space: 100.64.0.0/10
    if (p0 === 100 && p1 >= 64 && p1 <= 127) return true;

    // Multicast: 224.0.0.0/4
    if (p0 >= 224 && p0 <= 239) return true;

    // Broadcast: 255.255.255.255
    if (p0 === 255 && p1 === 255 && p2 === 255 && p3 === 255) return true;

    // Documentation/Benchmarking/Reserved ranges
    if (p0 === 192 && p1 === 0 && p2 === 2) return true; // TEST-NET-1
    if (p0 === 198 && p1 === 51 && p2 === 100) return true; // TEST-NET-2
    if (p0 === 203 && p1 === 0 && p2 === 113) return true; // TEST-NET-3
    if (p0 >= 240) return true; // Class E / Reserved

    return false;
  }

  // IPv6 validation and check
  if (normalized.includes(":")) {
    const cleanIPv6 = normalizeIPv6(normalized).replace(/^\[|\]$/g, "");

    // Loopback: ::1
    if (cleanIPv6 === "::1" || cleanIPv6 === "0:0:0:0:0:0:0:1") return true;

    // Unspecified: ::
    if (cleanIPv6 === "::" || cleanIPv6 === "0:0:0:0:0:0:0:0") return true;

    // Link-local: fe80::/10
    if (cleanIPv6.startsWith("fe80:") || /^fe[89ab]:/i.test(cleanIPv6)) return true;

    // Unique local: fc00::/7 (fc00:: to fdff::)
    if (cleanIPv6.startsWith("fc") || cleanIPv6.startsWith("fd") || /^f[cd]/i.test(cleanIPv6)) return true;

    // Multicast: ff00::/8
    if (cleanIPv6.startsWith("ff")) return true;

    // IPv4-compatible IPv6 (deprecated): ::/96 (excluding loopback)
    if (cleanIPv6.startsWith("::") && !cleanIPv6.includes(".") && cleanIPv6 !== "::1" && cleanIPv6 !== "::") {
      const parts = cleanIPv6.split(":");
      if (parts.length <= 8 && parts.every(p => p === "" || p === "0")) return true;
    }

    return false;
  }

  return true; // Reject anything that isn't cleanly classified as IPv4 or IPv6
}

/**
 * Validates a URL for length, scheme, credentials, and local hostnames.
 * Does NOT resolve DNS.
 */
export function validateUrlStructure(urlStr: string): { isValid: boolean; error?: string; parsedUrl?: URL } {
  if (!urlStr || typeof urlStr !== "string") {
    return { isValid: false, error: "URL must be a non-empty string." };
  }

  const trimmed = urlStr.trim();
  if (trimmed.length > MAX_URL_LENGTH) {
    return { isValid: false, error: `URL exceeds maximum allowed length of ${MAX_URL_LENGTH} characters.` };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    return { isValid: false, error: "Invalid URL format." };
  }

  // Strict http/https parsing
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isValid: false, error: "Only HTTP and HTTPS protocols are allowed." };
  }

  // Credentials rejection
  if (parsed.username || parsed.password) {
    return { isValid: false, error: "URLs containing embedded credentials are strictly rejected." };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // Block private tlds and local/internal hosts instantly
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    hostname.endsWith(".home") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".example") ||
    hostname.endsWith(".invalid") ||
    hostname.endsWith(".localhost")
  ) {
    return { isValid: false, error: "Access to local or private network domains is strictly forbidden." };
  }

  return { isValid: true, parsedUrl: parsed };
}

/**
 * Checks a hostname's DNS addresses to ensure none resolve to private or loopback ranges
 */
export async function isSafeDnsResolution(hostname: string): Promise<boolean> {
  try {
    // Resolve all IPs to be extremely safe (not just the first one)
    const addresses = await dnsResolveAll(hostname);
    if (addresses.length === 0) {
      return false;
    }
    return addresses.every(ip => !isPrivateIp(ip));
  } catch (err) {
    return false;
  }
}

/**
 * Helper to resolve all IPv4 and IPv6 addresses for a hostname
 */
async function dnsResolveAll(hostname: string): Promise<string[]> {
  const ips: string[] = [];
  try {
    const lookupAll = promisify(dns.lookup);
    const results = await lookupAll(hostname, { all: true });
    if (Array.isArray(results)) {
      results.forEach(res => ips.push(res.address));
    }
  } catch {
    // Fallback to explicit lookup if all: true isn't supported or fails
    try {
      const lookupSingle = promisify(dns.lookup);
      const res = await lookupSingle(hostname);
      ips.push(res.address);
    } catch {
      // ignore
    }
  }
  return ips;
}

/**
 * Custom secure DNS agents to enforce DNS Rebinding resistance during fetches
 */
export const secureHttpAgent = new http.Agent({
  keepAlive: false,
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, options, (err, address: any, family) => {
      if (err) return callback(err, address, family);
      const ip = typeof address === "string" ? address : "";
      if (ip && isPrivateIp(ip)) {
        return callback(new Error("SSRF Access Blocked: Hostname resolved to private/forbidden IP address"), "", 0);
      }
      callback(null, address, family);
    });
  }
});

export const secureHttpsAgent = new https.Agent({
  keepAlive: false,
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, options, (err, address: any, family) => {
      if (err) return callback(err, address, family);
      const ip = typeof address === "string" ? address : "";
      if (ip && isPrivateIp(ip)) {
        return callback(new Error("SSRF Access Blocked: Hostname resolved to private/forbidden IP address"), "", 0);
      }
      callback(null, address, family);
    });
  }
});

/**
 * Full public URL validation checker (Structure + DNS)
 */
export async function validateAndNormalizeUrl(urlStr: string): Promise<{ isValid: boolean; error?: string; normalizedUrl?: string }> {
  const struct = validateUrlStructure(urlStr);
  if (!struct.isValid || !struct.parsedUrl) {
    return { isValid: false, error: struct.error };
  }

  const parsed = struct.parsedUrl;
  const isSafeDns = await isSafeDnsResolution(parsed.hostname);
  if (!isSafeDns) {
    return { isValid: false, error: "Access to private or local IP ranges is strictly forbidden." };
  }

  return { isValid: true, normalizedUrl: parsed.toString() };
}
