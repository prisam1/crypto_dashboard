import { useCallback, useEffect, useRef, useState } from "react"; 
import { getCoinMarketChart } from "../services/cryptoService";
import { formatPrices } from "../helper/format";

// type for chart points (used by Recharts or Chart.js)
export type ChartDataPoint = { date: string; price: number };

// cache structure → avoids re-fetching the same coin repeatedly
type ChartCacheEntry = { data: ChartDataPoint[]; timestamp: number };
const chartCache: Record<string, ChartCacheEntry> = {};

export const useCryptoChart = (coinId: string) => {
 

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);

  // keep track of last timestamp we already have (avoid duplicates)
  const lastTimestampRef = useRef<number | null>(null);

  // fetch chart data
  const fetchChartData = useCallback(
    async (initial = false) => {
      if (!coinId) return; // no coin selected → do nothing
      const now = Date.now();

      // use cache if available and fresh (<30s old)
      if (
        initial &&
        chartCache[coinId] &&
        now - chartCache[coinId].timestamp < 30000
      ) {
        setChartData(chartCache[coinId].data);
        // set the last timestamp for incremental updates
        lastTimestampRef.current = chartCache[coinId].data.at(-1)
          ? new Date(chartCache[coinId].data.at(-1)!.date).getTime()
          : null;
        setChartLoading(false);
        return;
      }

      try { 
        const prices = await getCoinMarketChart(coinId, 0.25);
        const formattedData = formatPrices(prices as [number, number][]);

        if (initial) {
          // First load → replace everything
          chartCache[coinId] = { data: formattedData, timestamp: now };
          setChartData(formattedData);
          lastTimestampRef.current = prices.at(-1)?.[0] ?? null;
        } else {
          // Incremental update → only add new points
          const lastKnown = lastTimestampRef.current;
          const newPoints = (prices as [number, number][]).filter(
            ([ts]) => ts > (lastKnown ?? 0)
          );

          if (newPoints.length) {

            const newFormatted = formatPrices(newPoints);

            // append new points + keep only last 100 for performance
            setChartData((prev) => [...prev, ...newFormatted].slice(-100));
            // update last timestamp so next fetch knows where to continue
            lastTimestampRef.current = newPoints.at(-1)?.[0] ?? lastKnown;
          }
        }

        setChartError(null); // clear error if successful
      } catch {
        setChartError("Failed to fetch chart data.");
      } finally {
        setChartLoading(false);
      }
    },
    [coinId] // re-run only if coinId changes
  );

  useEffect(() => {
    setChartLoading(true);
    fetchChartData(true); // initial load

    // fixed 30s interval, keeps chart updating without drift
    const intervalId = setInterval(() => fetchChartData(false), 30000);
    return () => clearInterval(intervalId); // cleanup
  }, [coinId, fetchChartData]);

  return { chartData, chartLoading, chartError };
};
