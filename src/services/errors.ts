import { RETRY_BASE_MS, RETRY_MAX_MS } from "../config";

// Thrown without touching the network while we're cooling down after a 429.
export class RateLimitError extends Error {
  constructor(public retryAfterMs: number) {
    super("Rate limit reached");
    this.name = "RateLimitError";
  }
}

// Duck-typed so this file doesn't need axios (keeps it testable under Jest).
const statusOf = (err: unknown): number | undefined =>
  (err as { response?: { status?: number } })?.response?.status;

export const describeError = (err: unknown): string => {
  if (err instanceof RateLimitError) return "API rate limit reached. Retrying shortly.";
  if (typeof navigator !== "undefined" && !navigator.onLine) return "You're offline.";
  const status = statusOf(err);
  if (status === 429) return "API rate limit reached. Retrying shortly.";
  if (status) return `Price API error (${status}).`;
  // CoinGecko's 429 responses lack CORS headers, so a rate limit often looks like this.
  return "Couldn't reach the price API.";
};

// Delay before retrying after `failures` consecutive failures.
export const retryDelayMs = (err: unknown, failures: number): number => {
  if (err instanceof RateLimitError) return Math.max(err.retryAfterMs, RETRY_BASE_MS);
  const backoff = RETRY_BASE_MS * 2 ** Math.max(0, failures - 1);
  return Math.min(backoff, RETRY_MAX_MS);
};
