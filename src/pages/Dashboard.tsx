import { useCallback, useMemo } from "react";
import CryptoCard from "../components/CryptoCard";
import PriceChart from "../components/PriceChart";
import CoinStats from "../components/CoinStats";
import StatusBar from "../components/StatusBar";
import CurrencyPicker from "../components/CurrencyPicker";
import { Panel, Skeleton } from "../components/ui";
import { CryptoData } from "../types/types";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { useCryptoChart } from "../hooks/useCryptoChart";
import { usePersistentState } from "../hooks/useBrowser";
import { CurrencyContext, useExchangeRate } from "../hooks/useCurrency";
import { convertCoin, convertPoints } from "../helper/series";
import { COINS, CoinId, isCoinId, isCurrency, isRangeKey, PRICE_REFRESH_MS, RangeKey } from "../config";

const Dashboard: React.FC = () => {
  // remembered across reloads
  const [selectedCoin, setSelectedCoin] = usePersistentState<CoinId>("coin", "bitcoin", isCoinId);
  const [range, setRange] = usePersistentState<RangeKey>("range", "6H", isRangeKey);
  const [currency, setCurrency] = usePersistentState<string>("currency", "usd", isCurrency);

  // Data is always fetched in USD; other currencies are converted here (0 extra calls per switch)
  const fx = useExchangeRate(currency);

  // Cards (BTC, ETH, DOGE) hook – one call for all coins
  const { cryptoData, loading, refreshing, error, lastUpdated, refresh } = useCryptoPrices(COINS);

  // Chart (only selected) hook
  const chart = useCryptoChart(selectedCoin, range);

  const coinsById = useMemo(
    () =>
      new Map<string, CryptoData>(
        cryptoData.map((c) => [c.id, fx.rate === 1 ? c : convertCoin(c, fx.rate)])
      ),
    [cryptoData, fx.rate]
  );
  const chartPoints = useMemo(() => convertPoints(chart.points, fx.rate), [chart.points, fx.rate]);
  const selectedInfo = coinsById.get(selectedCoin);

  // stable so memoized cards don't re-render when only the chart changes
  const selectCoin = useCallback(
    (id: string) => {
      if (isCoinId(id)) setSelectedCoin(id);
    },
    [setSelectedCoin]
  );

  return (
    <CurrencyContext.Provider value={fx.currency}>
      <div className="min-h-screen pb-[env(safe-area-inset-bottom)]">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 17l6-6 4 4 8-8" />
                  <path d="M15 7h6v6" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="sr-only truncate text-base font-semibold text-white min-[440px]:not-sr-only sm:text-lg">
                  Crypto Dashboard
                </h1>
                <p className="hidden text-xs text-slate-400 sm:block">Live market prices</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <CurrencyPicker
                value={currency}
                onChange={setCurrency}
                loading={fx.loading}
                error={fx.error}
                onRetry={fx.retry}
              />
              <StatusBar lastUpdated={lastUpdated} refreshing={refreshing} error={error} onRefresh={refresh} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-content space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-8">
          {/* Cards */}
          <nav aria-label="Select coin" className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
            {COINS.map((id) => {
              const coin = coinsById.get(id);
              if (coin) {
                return (
                  <CryptoCard key={id} data={coin} active={selectedCoin === id} onSelect={selectCoin} />
                );
              }
              return loading ? (
                <Skeleton key={id} className="h-[62px] rounded-2xl sm:h-[178px]" />
              ) : null;
            })}
          </nav>

          {!loading && cryptoData.length === 0 && (
            <Panel className="flex flex-col items-center gap-3 p-6 text-center">
              <p className="text-sm text-slate-300">{error ?? "No price data available."}</p>
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
              >
                {refreshing ? "Retrying…" : "Try again"}
              </button>
            </Panel>
          )}

          {/* Chart + stats */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <PriceChart
                coin={selectedInfo}
                points={chartPoints}
                range={range}
                onRangeChange={setRange}
                loading={chart.chartLoading}
                refreshing={chart.chartRefreshing}
                error={chart.chartError}
                updatedAt={chart.chartUpdatedAt}
                onRetry={chart.retry}
              />
            </div>
            <CoinStats coin={selectedInfo} />
          </div>
        </main>

        <footer className="mx-auto max-w-content px-4 pb-8 pt-2 text-center text-xs text-slate-500 sm:px-6">
          Data provided by{" "}
          <a href="https://www.coingecko.com/" target="_blank" rel="noreferrer" className="text-slate-400 underline-offset-2 hover:underline">
            CoinGecko
          </a>
          . Prices refresh every {Math.round(PRICE_REFRESH_MS / 1000)}s
        </footer>
      </div>
    </CurrencyContext.Provider>
  );
};

export default Dashboard;
