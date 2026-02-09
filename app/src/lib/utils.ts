import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Generate a prefixed API key for projects
 * Format: pk_live_<32 random hex characters>
 */
export function generateApiKey(): string {
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `pk_live_${randomPart}`;
}

/**
 * Format a number with abbreviations (1K, 1M, etc.)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format milliseconds to human-readable duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Get time period boundaries for analytics queries
 */
export function getTimePeriod(period: string): { start: Date; end: Date; bucketMinutes: number } {
  const end = new Date();
  let start: Date;
  let bucketMinutes: number;

  switch (period) {
    case '1h':
      start = new Date(end.getTime() - 60 * 60 * 1000);
      bucketMinutes = 5;
      break;
    case '6h':
      start = new Date(end.getTime() - 6 * 60 * 60 * 1000);
      bucketMinutes = 15;
      break;
    case '24h':
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      bucketMinutes = 60;
      break;
    case '7d':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      bucketMinutes = 360;
      break;
    case '30d':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      bucketMinutes = 1440;
      break;
    default:
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      bucketMinutes = 60;
  }

  return { start, end, bucketMinutes };
}

/**
 * Rate limiter using in-memory store
 * For production, replace with Redis-based implementation
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  return {
    allowed: entry.count <= maxRequests,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Generate a new UUID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Sanitize a string for safe display
 */
export function sanitize(input: string): string {
  return input.replace(/[<>&"']/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return entities[char] || char;
  });
}
