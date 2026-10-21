import React from "react";
import { CryptoData } from "../types/types";
import { formatCompactPrice, formatPrice } from "../helper/format";
import { useCurrency } from "../hooks/useCurrency";
import { ChangeBadge, Panel, Skeleton } from "./ui";

// All of this comes from the markets response we already have — no extra API calls.

const Stat: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <div className="rounded-xl bg-slate-800/40 px-3 py-2.5">
    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 truncate text-sm font-semibold tabular-nums text-slate-100">{children}</div>
  </div>
);

const DayRange: React.FC<{ coin: CryptoData }> = ({ coin }) => {
  const currency = useCurrency();
  const { low_24h: low, high_24h: high, current_price: price } = coin;
  if (low == null || high == null) return null;
  const pct = high > low ? Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100)) : 50;
  return (
    <div>
      <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-slate-500">
        <span>24h low</span>
        <span>24h high</span>
      </div>
      <div className="relative mt-2 h-1.5 rounded-full bg-gradient-to-r from-rose-400/60 via-slate-600 to-emerald-400/60">
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-white shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm font-semibold tabular-nums text-slate-200">
        <span>{formatPrice(low, currency)}</span>
        <span>{formatPrice(high, currency)}</span>
      </div>
    </div>
  );
};

const CoinStats: React.FC<{ coin?: CryptoData }> = ({ coin }) => {
  const currency = useCurrency();
  return (
    <Panel className="p-4 sm:p-6">
      <h2 className="text-sm font-semibold text-slate-200">Market stats</h2>
      {coin ? (
        <div className="mt-4 space-y-5">
          <DayRange coin={coin} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            <Stat label="Market cap">{formatCompactPrice(coin.market_cap, currency)}</Stat>
            <Stat label="Volume 24h">{formatCompactPrice(coin.total_volume, currency)}</Stat>
            <Stat label="Rank">{coin.market_cap_rank ? `#${coin.market_cap_rank}` : "—"}</Stat>
            <Stat label="1h change">
              <ChangeBadge value={coin.price_change_percentage_1h_in_currency} className="-ml-1.5" />
            </Stat>
            <Stat label="24h change">
              <ChangeBadge value={coin.price_change_percentage_24h} className="-ml-1.5" />
            </Stat>
            <Stat label="7d change">
              <ChangeBadge value={coin.price_change_percentage_7d_in_currency} className="-ml-1.5" />
            </Stat>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <Skeleton className="h-12" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
};

export default React.memo(CoinStats);
