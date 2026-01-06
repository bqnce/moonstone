"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown } from "lucide-react";
import { format } from "date-fns";
import ChartTooltip from "./ChartTooltip";
import { DailyStat } from "../types";

export default function VolumeChart({ data }: { data: DailyStat[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-blue-400" />
          Inflow vs Outflow
        </h2>
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Daily Volume</span>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="_id" 
              stroke="#71717a" 
              tickFormatter={(str) => format(new Date(str), "MMM d")} 
              tick={{fontSize: 12}}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip cursor={{fill: '#27272a'}} content={<ChartTooltip />} />
            <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}