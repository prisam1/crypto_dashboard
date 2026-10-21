import { useCallback, useMemo } from "react";
import { CHART_RANGES, MAX_TICK_GAP_MS, PRICE_REFRESH_MS, RangeKey } from "../config";
import { getResource, load } from "../services/cache";
import { getCoinMarketChart, isPricePoints, ticksKey } from "../services/cryptoService";
import { mergeSeries, tailIsContinuous } from "../helper/series";
import { usePolling } from "./usePolling";
import { useResource } from "./useResource";

// Chart for the selected coin.
// History comes from /market_chart (cached per coin + days, saved across reloads).
// The newest part comes from live ticks recorded by the markets poll, so the chart keeps
// moving without extra calls. /market_chart is only called again when the saved history
// is missing, too old, or the live tail has gaps (e.g. the tab was in the background).
export const useCryptoChart = (coinId: string, range: RangeKey) => {
  const { days, windowMs, staleAfterMs, maxAgeMs } = CHART_RANGES[range];
  // 6H and 24H share this key → one call serves both
  const key = `chart:${coinId}:${days}`;

  const chart = useResource(key, isPricePoints);
  const ticks = useResource(ticksKey(coinId), isPricePoints);

  const fetchChart = useCallback(
    (force: boolean) =>
      load(key, {
        validate: isPricePoints,
        fetcher: () => getCoinMarketChart(coinId, days),
        isFresh: ({ data, fetchedAt }) => {
          if (force) return false;
          const now = Date.now();
          const age = now - fetchedAt;
          if (age < staleAfterMs) return true;
          if (age >= maxAgeMs || !data.length) return false;
          const liveTicks = getResource(ticksKey(coinId), isPricePoints).data;
          return tailIsContinuous(data[data.length - 1][0], liveTicks, now, MAX_TICK_GAP_MS);
        },
      }),
    [key, coinId, days, staleAfterMs, maxAgeMs]
  );

  // Re-checks freshness once per price cycle; this is a cache lookup, not an API call.
  usePolling(async () => {
    await fetchChart(false);
    return PRICE_REFRESH_MS;
  }, key);

  const retry = useCallback(() => {
    fetchChart(true).catch(() => {
      // error is already stored on the resource and shown in the UI
    });
  }, [fetchChart]);

  const points = useMemo(
    () => mergeSeries(chart.data, ticks.data, windowMs),
    [chart.data, ticks.data, windowMs]
  );

  return {
    points,
    chartLoading: chart.data === null && !chart.error,
    chartRefreshing: chart.fetching,
    chartError: chart.error,
    chartUpdatedAt: chart.fetchedAt,
    retry,
  };
};
