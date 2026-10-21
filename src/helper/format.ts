import { RangeKey } from "../config";

// Intl formatters are expensive to create, so build each one once.
const priceFormatters = new Map<number, Intl.NumberFormat>();
const priceFormatter = (digits: number) => {
  let f = priceFormatters.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    priceFormatters.set(digits, f);
  }
  return f;
};

const compactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

// Enough decimals to be meaningful: $67,123.45 / $1.23 / $0.1534 / $0.000012
const digitsFor = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1) return 2;
  if (abs >= 0.01) return 4;
  return 6;
};

export const formatPrice = (value: number | null | undefined): string =>
  isNum(value) ? priceFormatter(digitsFor(value)).format(value) : "—";

export const formatCompactUsd = (value: number | null | undefined): string =>
  isNum(value) ? compactFormatter.format(value) : "—";

export const formatAxisPrice = (value: number): string =>
  Math.abs(value) >= 10000 ? compactFormatter.format(value) : formatPrice(value);

export const formatPercent = (value: number | null | undefined): string =>
  isNum(value) ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}%` : "—";

export const formatAxisTime = (ts: number, range: RangeKey): string =>
  range === "7D"
    ? new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" })
    : new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const formatDateTime = (ts: number): string =>
  new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatRelative = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};
