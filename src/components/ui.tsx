import React, { useEffect, useRef, useState } from "react";
import { formatPercent, formatPrice } from "../helper/format";

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const trendColor = (value: number | null | undefined) =>
  value == null ? "text-slate-400" : value >= 0 ? "text-emerald-400" : "text-rose-400";

export const ChangeBadge: React.FC<{ value: number | null | undefined; className?: string }> = ({
  value,
  className,
}) => {
  const up = (value ?? 0) >= 0;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        value == null
          ? "bg-slate-800 text-slate-400"
          : up
          ? "bg-emerald-400/10 text-emerald-400"
          : "bg-rose-400/10 text-rose-400",
        className
      )}
    >
      {value != null && (
        <svg viewBox="0 0 10 10" className={cx("h-2 w-2", !up && "rotate-180")} aria-hidden="true">
          <path d="M5 1.5 9 8.5H1z" fill="currentColor" />
        </svg>
      )}
      {formatPercent(value)}
    </span>
  );
};

// Price that briefly highlights green/red when it changes.
export const FlashPrice: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value === prev.current) return;
    setFlash(value > prev.current ? "up" : "down");
    prev.current = value;
    const t = window.setTimeout(() => setFlash(null), 1200);
    return () => window.clearTimeout(t);
  }, [value]);

  return (
    <span
      className={cx(
        "-mx-1 rounded-md px-1 tabular-nums",
        flash === "up" && "motion-safe:animate-flash-up",
        flash === "down" && "motion-safe:animate-flash-down",
        className
      )}
    >
      {formatPrice(value)}
    </span>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cx("animate-pulse rounded-lg bg-slate-800/70", className)} />
);

export const Panel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => (
  <section
    className={cx(
      "rounded-2xl border border-white/[0.06] bg-slate-900/60 shadow-soft backdrop-blur-sm",
      className
    )}
  >
    {children}
  </section>
);

export const Sparkline: React.FC<{ values: number[]; positive: boolean; className?: string }> = ({
  values,
  positive,
  className,
}) => {
  if (values.length < 2) return <div className={className} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 28 - ((v - min) / span) * 26;
      return `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke={positive ? "#34d399" : "#fb7185"}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
