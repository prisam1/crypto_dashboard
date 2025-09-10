import { useEffect, useState } from "react";
import { CryptoData } from "../types/types"; 
import { getMarkets } from "../services/cryptoService";

export const useCryptoPrices = (ids: string[]) => {
  // store crypto prices (BTC, ETH, etc.)
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  // loading state for first fetch
  const [loading, setLoading] = useState(true);
  // error handling
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true; // prevents updating state after component unmounts

    // function to fetch coin prices
    const fetchCardData = async () => {
      try {
 
        const data = await getMarkets(ids);

        // only update if component is still mounted
        if (mounted) {
          setCryptoData(data); // update coin prices
          setError(null);               // clear error
        }
      } catch {
        if (mounted) setError("Failed to fetch crypto data."); // error if API fails
      } finally {
        if (mounted) setLoading(false); // stop loading after first fetch
      }
    };

    fetchCardData(); // fetch immediately on mount
    const intervalId = setInterval(fetchCardData, 30000); // refresh every 30s

    // cleanup → clear interval + prevent state update after unmount
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [ids]); // refetch if coin list changes (BTC → BTC+ETH+DOGE)

  return { cryptoData, loading, error };
};
