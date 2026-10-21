import React from "react";
import { formatRelative } from "../helper/format";
import { useNow, useOnlineStatus } from "../hooks/useBrowser";
import { cx } from "./ui";

interface Props {
  lastUpdated: number;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
}

// Own component so the "12s ago" ticker only re-renders this, not the whole dashboard.
const StatusBar: React.FC<Props> = ({ lastUpdated, refreshing, error, onRefresh }) => {
  const online = useOnlineStatus();
  const now = useNow(5000);
  const age = lastUpdated ? formatRelative(now - lastUpdated) : null;

  const state = !online ? "offline" : error ? "error" : refreshing ? "refreshing" : "live";
  const label = {
    offline: "Offline · saved data",
    error: age ? `Delayed · ${age}` : "Can't reach API",
    refreshing: "Updating…",
    live: age ? `Live · ${age}` : "Connecting…",
  }[state];

  return (
    <div className="flex items-center gap-2">
      <div
        title={error ?? undefined}
        className={cx(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
          state === "live" && "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
          state === "refreshing" && "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
          (state === "error" || state === "offline") && "border-amber-400/20 bg-amber-400/10 text-amber-300"
        )}
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2 w-2">
          {state === "live" && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing || !online}
        aria-label="Refresh prices"
        title="Refresh prices"
        className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
      >
        <svg
          viewBox="0 0 24 24"
          className={cx("h-4 w-4", refreshing && "animate-spin")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
      </button>
    </div>
  );
};

export default StatusBar;
