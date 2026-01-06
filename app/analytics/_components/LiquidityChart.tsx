"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import ChartTooltip from "./ChartTooltip";
import { DailyStat } from "../types";

export default function LiquidityChart({ data }: { data: DailyStat[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Portfolio Growth
        </h2>
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Cumulative</span>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLiquidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="_id" 
              stroke="#71717a" 
              tickFormatter={(str) => format(new Date(str), "MMM d")} 
              tick={{fontSize: 12}}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#71717a" 
              tick={{fontSize: 12}} 
              tickFormatter={(val) => val >= 1000 ? `$${val/1000}k` : `$${val}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area 
              type="monotone" 
              dataKey="cumulativeLiquidity" 
              name="Net Liquidity"
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorLiquidity)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}