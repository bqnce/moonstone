import React from "react";
import { format } from "date-fns";

export default function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl text-sm z-50">
        <p className="text-zinc-400 mb-1">{format(new Date(label), "MMM d, yyyy")}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-zinc-300">
              {entry.name}: <span className="font-mono font-bold text-white">${Math.abs(entry.value).toLocaleString()}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}