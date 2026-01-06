"use client";

import React from "react";
import { Landmark, Loader2 } from "lucide-react";
import { useCurrency } from "@/app/hooks/useCurrency";

interface NetLiquidityCardProps {
  grandTotalUsd: number;      // A hívó oldal ezt adja át
  loadingManual?: boolean;    // Opcionális loading state
}

export default function NetLiquidityCard({ 
  grandTotalUsd, 
  loadingManual 
}: NetLiquidityCardProps) {
  
  // 1. Bekötjük a Settings/Currency logikát
  const { formatMoney } = useCurrency();
  const displayed = formatMoney(grandTotalUsd);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
      
      {/* Háttér effekt */}
      <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-zinc-400 mb-1">
          <Landmark className="w-4 h-4" />
          <span className="text-sm font-medium">Net Liquidity</span>
        </div>

        <div className="flex flex-col">
          {/* FŐ ÉRTÉK (USD vagy HUF a beállítástól függően) */}
          <div className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            {displayed.main}
            
            {/* Töltés indikátor */}
            {loadingManual && (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
            )}
          </div>

          {/* MÁSODLAGOS ÉRTÉK (Csak akkor látszik, ha USD mód van beállítva) */}
          {displayed.secondary && (
            <div className="text-lg font-medium text-zinc-500 mt-1">
              {displayed.secondary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}