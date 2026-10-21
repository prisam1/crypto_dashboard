import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_RANGES, RANGE_KEYS, RangeKey } from "../config";
import { ChartDataPoint, CryptoData, PricePoint } from "../types/types";
import { formatAxisPrice, formatAxisTime, formatDateTime, formatPrice, formatRelative } from "../helper/format";
import { useMediaQuery, useNow } from "../hooks/useBrowser";
import { useCurrency } from "../hooks/useCurrency";
import { ChangeBadge, cx, FlashPrice, Panel, Skeleton } from "./ui";

interface Props {
  coin?: CryptoData;
  points: PricePoint[];
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  loading: boolean;
  refreshing: boolean;
  error?: string | null;
  updatedAt: number;
  onRetry: () => void;
}

// Recharts clones this element with the tooltip props; currency is passed in explicitly.
const TooltipContent = ({
  active,
  payload,
  currency,
}: Partial<TooltipContentProps<number, string>> & { currency: string }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as ChartDataPoint;
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2 shadow-xl">
      <div className="text-xs text-slate-400">{formatDateTime(p.timestamp)}</div>
      <div className="font-semibold tabular-nums text-slate-50">{formatPrice(p.price, currency)}</div>
    </div>
  );
};

const RangeTabs: React.FC<{ value: RangeKey; onChange: (r: RangeKey) => void }> = ({ value, onChange }) => (
  <div role="tablist" aria-label="Chart range" className="inline-flex rounded-xl bg-slate-800/70 p-1">
    {RANGE_KEYS.map((key) => (
      <button
        key={key}
        type="button"
        role="tab"
        aria-selected={value === key}
        onClick={() => onChange(key)}
        className={cx(
          "min-w-[3rem] rounded-lg px-3 py-1.5 text-xs font-semibold transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
          value === key ? "bg-slate-950 text-white shadow" : "text-slate-400 hover:text-slate-200"
        )}
      >
        {CHART_RANGES[key].label}
      </button>
    ))}
  </div>
);

const ChartStatus: React.FC<{ updatedAt: number; refreshing: boolean; error?: string | null }> = ({
  updatedAt,
  refreshing,
  error,
}) => {
  const now = useNow(15000);
  if (error) {
    return (
      <span className="text-amber-400/90">
        {error} Showing saved chart{updatedAt ? ` from ${formatRelative(now - updatedAt)}` : ""}.
      </span>
    );
  }
  if (refreshing) return <span>Updating chart history…</span>;
  return <span>History saved {formatRelative(now - updatedAt)} · newest prices added live</span>;
};

const PriceChart: React.FC<Props> = ({
  coin,
  points,
  range,
  onRangeChange,
  loading,
  refreshing,
  error,
  updatedAt,
  onRetry,
}) => {
  const wide = useMediaQuery("(min-width: 640px)");
  const currency = useCurrency();

  const data = useMemo<ChartDataPoint[]>(
    () => points.map(([timestamp, price]) => ({ timestamp, price })),
    [points]
  );

  const { change, domain } = useMemo(() => {
    if (points.length < 2) return { change: null, domain: ["auto", "auto"] as const };
    let min = Infinity;
    let max = -Infinity;
    for (const [, p] of points) {
      if (p < min) min = p;
      if (p > max) max = p;
    }
    const pad = (max - min) * 0.08 || max * 0.01;
    const first = points[0][1];
    const last = points[points.length - 1][1];
    return {
      change: first ? ((last - first) / first) * 100 : null,
      domain: [min - pad, max + pad] as [number, number],
    };
  }, [points]);

  const up = (change ?? 0) >= 0;
  const color = up ? "#34d399" : "#fb7185";
  const hasData = data.length > 1;

  return (
    <Panel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {coin ? (
            <img src={coin.image} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full bg-slate-800" />
          ) : (
            <Skeleton className="h-11 w-11 rounded-full" />
          )}
          <div className="min-w-0">
            <div className="truncate text-sm text-slate-400">
              {coin ? `${coin.name} · ${coin.symbol.toUpperCase()}` : <Skeleton className="h-4 w-28" />}
            </div>
            <div className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {coin ? <FlashPrice value={coin.current_price} /> : <Skeleton className="mt-1 h-8 w-40" />}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <ChangeBadge value={change} />
              <span>past {CHART_RANGES[range].label}</span>
            </div>
          </div>
        </div>
        <RangeTabs value={range} onChange={onRangeChange} />
      </div>

      <div className="mt-5 h-64 sm:h-80 lg:h-[22rem]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 256 }}>
            <AreaChart data={data} margin={{ top: 8, right: wide ? 0 : 4, left: wide ? 0 : 4, bottom: 0 }}>
              <defs>
                <linearGradient id="price-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.08)" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(t: number) => formatAxisTime(t, range)}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={wide ? 56 : 40}
                tickMargin={8}
              />
              <YAxis
                orientation="right"
                domain={domain as [number, number]}
                hide={!wide}
                width={76}
                tickCount={5}
                tickFormatter={(v: number) => formatAxisPrice(v, currency)}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<TooltipContent currency={currency} />}
                cursor={{ stroke: "#475569", strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                fill="url(#price-area)"
                dot={false}
                activeDot={{ r: 4, stroke: "#0f172a", strokeWidth: 2, fill: color }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : loading ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 text-center">
            <p className="max-w-xs text-sm text-slate-400">{error ?? "No chart data yet."}</p>
            <button
              type="button"
              onClick={onRetry}
              disabled={refreshing}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-50"
            >
              {refreshing ? "Retrying…" : "Try again"}
            </button>
          </div>
        )}
      </div>

      {hasData && (
        <p className="mt-3 text-xs text-slate-500">
          <ChartStatus updatedAt={updatedAt} refreshing={refreshing} error={error} />
        </p>
      )}
    </Panel>
  );
};

export default PriceChart;
