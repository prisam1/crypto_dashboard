import { createContext, useCallback, useContext } from "react";
import { FX_REFRESH_MS } from "../config";
import { load } from "../services/cache";
import { getExchangeRates, isExchangeRates } from "../services/cryptoService";
import { usePolling } from "./usePolling";
import { useResource } from "./useResource";

const FX_KEY = "fx:rates";

// Currency every price on screen is formatted in. Only switches away from "usd" once a
// rate is available, so numbers and currency symbol always match.
export const CurrencyContext = createContext("usd");
export const useCurrency = () => useContext(CurrencyContext);

// USD → `currency` rate. Rates are fetched only when a non-USD currency is selected,
// saved like everything else, and refreshed every FX_REFRESH_MS while visible.
export const useExchangeRate = (currency: string) => {
  const needed = currency !== "usd";
  const fx = useResource(FX_KEY, isExchangeRates);

  const fetchRates = useCallback(
    (force: boolean) =>
      load(FX_KEY, {
        fetcher: getExchangeRates,
        validate: isExchangeRates,
        isFresh: ({ fetchedAt }) => !force && Date.now() - fetchedAt < FX_REFRESH_MS,
      }),
    []
  );

  usePolling(
    async () => {
      const r = await fetchRates(false);
      return r.fetchedAt + FX_REFRESH_MS - Date.now();
    },
    FX_KEY,
    needed
  );

  const retry = useCallback(() => {
    fetchRates(true).catch(() => {
      // error is already stored on the resource and shown in the UI
    });
  }, [fetchRates]);

  const target = fx.data?.[currency];
  const rate = needed && fx.data && target ? target / fx.data.usd : null;

  return {
    // what's actually displayed: falls back to USD until the rate has loaded
    currency: needed && rate ? currency : "usd",
    rate: rate ?? 1,
    loading: needed && !rate && !fx.error,
    error: needed && !rate ? fx.error : null,
    retry,
  };
};
