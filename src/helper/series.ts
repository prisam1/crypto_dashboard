import { CryptoData, PricePoint } from "../types/types";

// Chart history + live ticks newer than it, trimmed to the visible window.
// Inputs are sorted by timestamp ascending.
export const mergeSeries = (
  base: PricePoint[] | null,
  ticks: PricePoint[] | null,
  windowMs: number
): PricePoint[] => {
  if (!base?.length) return [];
  const lastTs = base[base.length - 1][0];
  const tail = ticks ? ticks.filter(([ts]) => ts > lastTs) : [];
  const series = tail.length ? base.concat(tail) : base;
  const cutoff = series[series.length - 1][0] - windowMs;
  return series.filter(([ts]) => ts >= cutoff);
};

// True when live ticks cover the time since the chart was fetched with no big gaps,
// meaning the cached chart is still accurate and refetching would be wasted.
export const tailIsContinuous = (
  lastChartTs: number,
  ticks: PricePoint[] | null,
  now: number,
  maxGapMs: number
): boolean => {
  let prev = lastChartTs;
  for (const [ts] of ticks ?? []) {
    if (ts <= lastChartTs) continue;
    if (ts - prev > maxGapMs) return false;
    prev = ts;
  }
  return now - prev <= maxGapMs;
};

// USD → display currency. Percentages and the sparkline shape don't change with currency.
export const convertCoin = (coin: CryptoData, rate: number): CryptoData => {
  const scale = (v: number | null) => (v == null ? v : v * rate);
  return {
    ...coin,
    current_price: coin.current_price * rate,
    market_cap: scale(coin.market_cap),
    total_volume: scale(coin.total_volume),
    high_24h: scale(coin.high_24h),
    low_24h: scale(coin.low_24h),
  };
};

export const convertPoints = (points: PricePoint[], rate: number): PricePoint[] =>
  rate === 1 ? points : points.map(([ts, price]) => [ts, price * rate]);

// Last 24 hourly points of CoinGecko's 7d sparkline → a 24h trend line for the cards.
export const last24h = (sparkline: number[] | undefined | null): number[] =>
  Array.isArray(sparkline) ? sparkline.filter((n) => Number.isFinite(n)).slice(-24) : [];
