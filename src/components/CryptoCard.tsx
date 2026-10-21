import React, { useMemo } from "react";
import { CryptoData } from "../types/types";
import { last24h } from "../helper/series";
import { ChangeBadge, cx, FlashPrice, Sparkline } from "./ui";

interface Props {
  data: CryptoData;
  active?: boolean;
  onSelect: (id: string) => void;
}

// Row on phones, card on larger screens.
const CryptoCard: React.FC<Props> = ({ data, active, onSelect }) => {
  const { id, name, symbol, current_price, price_change_percentage_24h, image } = data;
  const spark = useMemo(() => last24h(data.sparkline_in_7d?.price), [data.sparkline_in_7d]);
  const positive = (price_change_percentage_24h ?? 0) >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={cx(
        "group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
        "sm:flex-col sm:items-stretch sm:gap-4 sm:p-5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
        active
          ? "border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(129,140,248,0.25)]"
          : "border-white/[0.06] bg-slate-900/60 hover:border-white/15 hover:bg-slate-800/60"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
        <img
          src={image}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className="h-9 w-9 shrink-0 rounded-full bg-slate-800 sm:h-10 sm:w-10"
        />
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-100">{name}</div>
          <div className="text-xs uppercase tracking-wide text-slate-400">{symbol}</div>
        </div>
      </div>

      <Sparkline
        values={spark}
        positive={positive}
        className="h-8 w-14 shrink-0 min-[400px]:w-20 sm:order-last sm:h-12 sm:w-full"
      />

      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-2">
        <FlashPrice
          value={current_price}
          className="text-[15px] font-semibold text-slate-50 sm:text-2xl"
        />
        <ChangeBadge value={price_change_percentage_24h} />
      </div>
    </button>
  );
};

export default React.memo(CryptoCard);
