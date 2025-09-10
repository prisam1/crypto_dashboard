import { ChartDataPoint } from "../types/types";

// helper function → formats raw CoinGecko prices into chart data
export const formatPrices = (prices: [number, number][]): ChartDataPoint[] =>
  prices.map(([ts, price]) => ({
    date: new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price,
  }));