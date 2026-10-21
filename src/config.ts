// Central place for every knob that affects how many API calls we make.

export const COINS = ["bitcoin", "ethereum", "dogecoin"] as const;
export type CoinId = (typeof COINS)[number];

export const isCoinId = (v: unknown): v is CoinId =>
  typeof v === "string" && (COINS as readonly string[]).includes(v);

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// CRA only inlines env vars that are accessed literally, so read it here once.
const envRefresh = Number(process.env.REACT_APP_PRICE_REFRESH_MS);

// How often card prices refresh. CoinGecko's public API only updates /coins/markets
// about once a minute, so polling faster mostly pays for identical data.
export const PRICE_REFRESH_MS =
  Number.isFinite(envRefresh) && envRefresh >= 15 * SECOND ? envRefresh : MINUTE;

// A manual "refresh" click never hits the API if data is younger than this.
export const MIN_MANUAL_REFRESH_MS = 15 * SECOND;

// Live price ticks (taken from the markets poll) are appended to the charts for free.
// A gap bigger than this means the tail is unreliable and the chart should be refetched.
export const MAX_TICK_GAP_MS = Math.max(5 * MINUTE, 3 * PRICE_REFRESH_MS);
export const TICK_RETENTION_MS = 24 * HOUR;
export const MAX_TICKS_PER_COIN = 720;

export type RangeKey = "6H" | "24H" | "7D";

export interface ChartRange {
  label: string;
  // `days` sent to /market_chart. 6H and 24H share the same days=1 response (one call).
  days: number;
  windowMs: number;
  // Refetch after this long if the live-tick tail has gaps (e.g. tab was hidden).
  staleAfterMs: number;
  // Refetch after this long no matter what, to correct any drift.
  maxAgeMs: number;
}

export const CHART_RANGES: Record<RangeKey, ChartRange> = {
  "6H": { label: "6H", days: 1, windowMs: 6 * HOUR, staleAfterMs: 10 * MINUTE, maxAgeMs: HOUR },
  "24H": { label: "24H", days: 1, windowMs: 24 * HOUR, staleAfterMs: 10 * MINUTE, maxAgeMs: HOUR },
  "7D": { label: "7D", days: 7, windowMs: 7 * 24 * HOUR, staleAfterMs: HOUR, maxAgeMs: 6 * HOUR },
};

export const RANGE_KEYS = Object.keys(CHART_RANGES) as RangeKey[];

export const isRangeKey = (v: unknown): v is RangeKey =>
  typeof v === "string" && v in CHART_RANGES;

// Failed requests back off exponentially between these bounds.
export const RETRY_BASE_MS = 30 * SECOND;
export const RETRY_MAX_MS = 10 * MINUTE;
export const RATE_LIMIT_COOLDOWN_MS = MINUTE;
