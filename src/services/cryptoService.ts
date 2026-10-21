import { CryptoData, PricePoint } from "../types/types";
import { MAX_TICKS_PER_COIN, TICK_RETENTION_MS } from "../config";
import { getResource, setData } from "./cache";
import api from "./api";

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export const isMarketList = (value: unknown): value is CryptoData[] =>
  Array.isArray(value) &&
  value.every(
    (c) => c && typeof c.id === "string" && typeof c.name === "string" && isNum(c.current_price)
  );

export const isPricePoints = (value: unknown): value is PricePoint[] =>
  Array.isArray(value) && value.every((p) => Array.isArray(p) && isNum(p[0]) && isNum(p[1]));

// Fetch coin prices data for all coins in ONE call.
// The 1h/7d changes and 7d sparkline come back in the same response at no extra cost.
export const getMarkets = async (coinIds: readonly string[]): Promise<CryptoData[]> => {
  const response = await api.get(`coins/markets`, {
    params: {
      vs_currency: "usd", // always in USD
      ids: coinIds.join(","), // e.g. "bitcoin,ethereum,dogecoin"
      price_change_percentage: "1h,24h,7d",
      sparkline: true,
    },
  });

  return response.data;
};

// Fetch chart data for a specific coin.
// days=1 → 5-minute points (serves both 6H and 24H), days=7 → hourly points.
export async function getCoinMarketChart(coinId: string, days: number): Promise<PricePoint[]> {
  const res = await api.get(`coins/${coinId}/market_chart`, {
    params: { vs_currency: "usd", days },
  });

  const prices: unknown[] = Array.isArray(res.data?.prices) ? res.data.prices : [];
  // drop any malformed points instead of failing the whole chart
  return prices
    .filter((p): p is PricePoint => Array.isArray(p) && isNum(p[0]) && isNum(p[1]))
    .sort((a, b) => a[0] - b[0]);
}

export const ticksKey = (coinId: string) => `ticks:${coinId}`;

// Every markets poll gives us a fresh price per coin. Keeping them as "ticks" lets the
// charts stay live without calling /market_chart again.
export const recordTicks = (coins: CryptoData[], now = Date.now()) => {
  const cutoff = now - TICK_RETENTION_MS;
  for (const coin of coins) {
    if (!isNum(coin.current_price)) continue;
    const parsed = coin.last_updated ? Date.parse(coin.last_updated) : NaN;
    const ts = isNum(parsed) ? Math.min(parsed, now) : now;

    const key = ticksKey(coin.id);
    const prev = getResource(key, isPricePoints).data ?? [];
    const last = prev[prev.length - 1];
    if (last && last[0] >= ts) continue; // price hasn't moved on CoinGecko's side yet

    const next = prev.filter(([t]) => t >= cutoff);
    next.push([ts, coin.current_price]);
    setData(key, isPricePoints, next.slice(-MAX_TICKS_PER_COIN), now);
  }
};
