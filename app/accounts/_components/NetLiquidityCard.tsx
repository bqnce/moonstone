import React from "react";
import { Landmark, TrendingUp } from "lucide-react";
import { formatCurrency, formatHuf, formatLastUpdated } from "../utils";

interface NetLiquidityCardProps {
  totalValueUsd: number;
  totalValueHuf: number;
  accountCount: number;
  updatedAt?: string;
}

export default function NetLiquidityCard({
  totalValueUsd,
  totalValueHuf,
  accountCount,
  updatedAt,
}: NetLiquidityCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-zinc-400 mb-1">
          <Landmark className="w-4 h-4" />
          <span className="text-sm font-medium">Net Liquidity</span>
        </div>
        <div className="text-4xl font-bold text-white tracking-tight">
          {formatCurrency(totalValueUsd, "USD")}
        </div>
        <div className="text-lg font-medium text-zinc-500 mt-1 flex items-baseline gap-2">
          <span>≈ {formatHuf(totalValueHuf)}</span>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-end">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>Total across {accountCount} accounts</span>
          </div>

          <div className="text-xs text-zinc-500 font-medium">
            Updated:{" "}
            <span className="text-zinc-400">
              {formatLastUpdated(updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}