"use client";

import type { QuoteResult } from "./types";

interface Props {
  quote: QuoteResult;
  isLoading?: boolean;
}

export function QuoteCard({ quote, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="h-10 w-48 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/10" />
      </div>
    );
  }

  const marginColor =
    quote.marginPct >= 25
      ? "text-emerald-400"
      : quote.marginPct >= 15
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-orange-500/5 p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
            Your Quote
          </p>
          <p className="mt-1 text-4xl font-bold text-white">
            KES {quote.sellRate.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40">Gross margin</p>
          <p className={`text-lg font-bold ${marginColor}`}>
            {quote.marginPct}%
          </p>
        </div>
      </div>

      {quote.breakdown.length > 0 && (
        <ul className="space-y-1">
          {quote.breakdown.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-white/10 pt-4 flex items-center justify-between text-sm">
        <span className="text-white/40">Partner cost (COGS)</span>
        <span className="text-white/60 font-medium">
          KES {quote.buyRate.toLocaleString()}
        </span>
      </div>

      <div className="rounded-xl bg-amber-400/10 border border-amber-400/20 p-3 text-xs text-amber-200/80">
        💳 A 30% security deposit of{" "}
        <strong>KES {Math.ceil(quote.sellRate * 0.3).toLocaleString()}</strong>{" "}
        will be held and released upon return.
      </div>
    </div>
  );
}
