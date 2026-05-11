/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses a sliding window per IP address.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  /** Max requests allowed per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/**
 * Returns true if the request should be blocked (rate limit exceeded).
 */
export function isRateLimited(ip: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > options.windowMs) {
    // New window
    store.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= options.limit) {
    return true;
  }

  entry.count += 1;
  return false;
}

/**
 * Extract the client IP from a Next.js Request object.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
