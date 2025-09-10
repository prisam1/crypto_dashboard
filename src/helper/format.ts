// /**
//  * Helper utilities to convert CoinGecko response -> ChartDataPoint
//  * and to extract only new points / clamp to last 6 hours.
//  *
//  * All helpers are small and typed so you won't see "any".
//  */

import { ChartDataPoint } from "../types/types";

// import { ChartDataPoint } from "../types/types";

// /** internal typed point with timestamp */
// type PointWithTs = { timestamp: number; date: string; price: number };

// /**
//  * Convert CoinGecko `prices` (number[][]) to typed points with timestamp.
//  */
// export function pricesToPointsWithTs(prices: number[][]): PointWithTs[] {
//   return prices.map((p) => {
//     const ts = Number(p[0]);
//     return {
//       timestamp: ts,
//       date: new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//       price: Number(p[1]),
//     };
//   });
// }

// /**
//  * Clamp points to last 6 hours exactly (strict filtering by timestamp).
//  */
// export function clampToLast6Hours(points: PointWithTs[], now = Date.now()): PointWithTs[] {
//   const sixHoursAgo = now - 6 * 60 * 60 * 1000;
//   return points.filter((pt) => pt.timestamp >= sixHoursAgo);
// }

// /**
//  * Convert PointWithTs[] to ChartDataPoint[] (drops timestamp).
//  */
// export function toChartDataPoints(points: PointWithTs[]): ChartDataPoint[] {
//   return points.map(({ date, price }) => ({ date, price }));
// }

// /**
//  * Given the last known timestamp (ms) and a new `prices` array from API,
//  * return only NEW ChartDataPoint entries (timestamp > lastKnownTs).
//  * If lastKnownTs is null => returns full clamped dataset.
//  */
// export function newPointsFromPrices(
//   lastKnownTs: number | null,
//   prices: number[][]
// ): { points: ChartDataPoint[]; lastTimestamp: number | null } {
//   const pts = pricesToPointsWithTs(prices);
//   // API usually returns ascending timestamps. We'll find points > lastKnownTs
//   const newPts = lastKnownTs ? pts.filter((p) => p.timestamp > lastKnownTs) : pts;
//   const lastTs = newPts.length ? newPts[newPts.length - 1].timestamp : lastKnownTs;
//   return { points: toChartDataPoints(newPts), lastTimestamp: lastTs ?? null };
// }

// helper function → formats raw CoinGecko prices into chart data
export const formatPrices = (prices: [number, number][]): ChartDataPoint[] =>
  prices.map(([ts, price]) => ({
    date: new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price,
  }));