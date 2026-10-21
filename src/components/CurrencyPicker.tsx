import React, { useMemo } from "react";
import { CURRENCIES, POPULAR_CURRENCIES } from "../config";
import { cx } from "./ui";

interface Props {
  value: string;
  onChange: (currency: string) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const currencyName = (() => {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "currency" });
    return (code: string) => names.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return (code: string) => code.toUpperCase();
  }
})();

// Compact code button on top of a native <select>, so phones get their own picker UI.
const CurrencyPicker: React.FC<Props> = ({ value, onChange, loading, error, onRetry }) => {
  const others = useMemo(
    () =>
      CURRENCIES.filter((c) => !POPULAR_CURRENCIES.includes(c)).sort((a, b) =>
        currencyName(a).localeCompare(currencyName(b))
      ),
    []
  );

  return (
    <div className="flex items-center gap-1.5">
      {error && (
        <button
          type="button"
          onClick={onRetry}
          title={`${error} Showing USD. Tap to retry.`}
          aria-label="Exchange rates unavailable, retry"
          className="grid h-9 w-9 place-items-center rounded-full text-amber-300 hover:bg-slate-800"
        >
          !
        </button>
      )}
      <label
        className={cx(
          "relative flex h-9 items-center gap-1 rounded-full border border-white/10 bg-slate-900 pl-3 pr-2.5",
          "text-xs font-semibold text-slate-200 transition hover:bg-slate-800",
          "focus-within:ring-2 focus-within:ring-indigo-400"
        )}
        title="Display currency"
      >
        <span className={cx(loading && "animate-pulse")}>{value.toUpperCase()}</span>
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-slate-400" fill="currentColor" aria-hidden="true">
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
        </svg>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Display currency"
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        >
          <optgroup label="Popular">
            {POPULAR_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()} · {currencyName(c)}
              </option>
            ))}
          </optgroup>
          <optgroup label="All currencies">
            {others.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()} · {currencyName(c)}
              </option>
            ))}
          </optgroup>
        </select>
      </label>
    </div>
  );
};

export default React.memo(CurrencyPicker);
