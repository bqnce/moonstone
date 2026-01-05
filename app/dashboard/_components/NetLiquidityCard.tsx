import React from "react";
import { Landmark, Loader2, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency, formatHuf } from "../utils";

interface NetLiquidityCardProps {
  grandTotalUsd: number;
  grandTotalHuf: number;
  cryptoTotalUsd: number;
  manualTotalUsd: number;
  manualAccountCount: number;
  loadingManual: boolean;
}

export default function NetLiquidityCard({
  grandTotalUsd,
  grandTotalHuf,
  cryptoTotalUsd,
  manualTotalUsd,
  manualAccountCount,
  loadingManual,
}: NetLiquidityCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-zinc-400 mb-1">
          <Landmark className="w-4 h-4" />
          <span className="text-sm font-medium">Net Liquidity</span>
        </div>

        {/* Grand Total USD */}
        <div className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
          {formatCurrency(grandTotalUsd, "USD")}
          {loadingManual && (
            <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
          )}
        </div>

        {/* Grand Total HUF */}
        <div className="text-lg font-medium text-zinc-500 mt-1 flex items-baseline gap-2">
          <span>≈ {formatHuf(grandTotalHuf)}</span>
        </div>

        {/* Footer Breakdown */}
        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-4 text-sm">
          {/* Crypto Portion */}
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>
              Crypto:{" "}
              <span className="font-semibold text-emerald-300">
                {formatCurrency(cryptoTotalUsd, "USD")}
              </span>
            </span>
          </div>

          <div className="w-px h-4 bg-zinc-800 hidden md:block"></div>

          {/* Manual Portion */}
          <div className="flex items-center gap-2 text-blue-400">
            <Wallet className="w-4 h-4" />
            <span>
              Manual ({manualAccountCount}):{" "}
              <span className="font-semibold text-blue-300">
                {formatCurrency(manualTotalUsd, "USD")}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}