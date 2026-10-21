// [timestamp in ms, price in USD]. Same shape CoinGecko returns, so it's cheap to store.
export type PricePoint = [number, number];

// Everything /coins/markets returns in the single call we already make.
// CoinGecko sends null for some fields on occasion, so those are nullable.
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number | null;
  market_cap_rank: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  last_updated?: string | null;
  sparkline_in_7d?: { price: number[] } | null;
}

export interface ChartDataPoint {
  timestamp: number;
  price: number;
}
