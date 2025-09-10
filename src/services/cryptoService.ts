import { CryptoData } from "../types/types";
import api from "./api";

 
// Fetch coin prices data for all coin
export const getMarkets = async (coinId: string[]): Promise<CryptoData[]> => {
  const response = await api.get(`coins/markets`, {
    params: {
      vs_currency: "usd",        // always in USD
      ids: coinId.join(","),        // e.g. "bitcoin,ethereum,dogecoin"
      price_change_percentage: "24h"
    },
  });

  return response.data 
};

// Fetch chart data for a specific coin
export async function getCoinMarketChart(
    coinId: string,
    days = 0.25, 
  ): Promise<number[][]> {
    const res = await api.get(`/coins/${coinId}/market_chart`, {
      params: { 
        vs_currency: "usd", 
        days: days, // last 6 hours only
         }, 
    }); 
    
    return res.data.prices as number[][];
  }