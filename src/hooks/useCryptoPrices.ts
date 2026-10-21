import { useCallback } from "react";
import { MIN_MANUAL_REFRESH_MS, PRICE_REFRESH_MS } from "../config";
import { load } from "../services/cache";
import { getMarkets, isMarketList, recordTicks } from "../services/cryptoService";
import { CryptoData } from "../types/types";
import { usePolling } from "./usePolling";
import { useResource } from "./useResource";

const EMPTY: CryptoData[] = [];

export const useCryptoPrices = (ids: readonly string[]) => {
  // key from the ids' contents, so a new array with the same coins doesn't refetch
  const key = `markets:${ids.join(",")}`;
  const resource = useResource(key, isMarketList);

  const fetchPrices = useCallback(
    (maxAge: number) =>
      load(key, {
        validate: isMarketList,
        isFresh: (cached) => Date.now() - cached.fetchedAt < maxAge,
        fetcher: async () => {
          const data = await getMarkets(key.slice("markets:".length).split(","));
          if (isMarketList(data)) recordTicks(data); // feeds the live chart tail for free
          return data;
        },
      }),
    [key]
  );

  // Fetches only when the saved data is older than PRICE_REFRESH_MS (it may come from
  // a previous visit or another tab), then waits exactly until it goes stale again.
  usePolling(async () => {
    const r = await fetchPrices(PRICE_REFRESH_MS);
    return r.fetchedAt + PRICE_REFRESH_MS - Date.now();
  }, key);

  // Manual refresh: free if data is younger than MIN_MANUAL_REFRESH_MS.
  const refresh = useCallback(() => {
    fetchPrices(MIN_MANUAL_REFRESH_MS).catch(() => {
      // error is already stored on the resource and shown in the UI
    });
  }, [fetchPrices]);

  return {
    cryptoData: resource.data ?? EMPTY,
    loading: resource.data === null && !resource.error,
    refreshing: resource.fetching,
    error: resource.error,
    lastUpdated: resource.fetchedAt,
    refresh,
  };
};
