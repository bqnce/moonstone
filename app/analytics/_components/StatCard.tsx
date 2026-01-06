import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  type?: "neutral" | "success" | "danger";
}

export default function StatCard({ 
  label, 
  value, 
  subValue, 
  type = "neutral" 
}: StatCardProps) {
  const colors = {
    neutral: "text-zinc-100",
    success: "text-emerald-400",
    danger: "text-rose-400"
  };
  const bgColors = {
    neutral: "bg-zinc-800/50",
    success: "bg-emerald-500/10",
    danger: "bg-rose-500/10"
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-16 ${bgColors[type]} rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none group-hover:opacity-100 transition-opacity opacity-50`}></div>
      <div>
        <p className="text-zinc-400 text-sm font-medium mb-1">{label}</p>
        <h3 className={`text-2xl font-bold ${colors[type]}`}>{value}</h3>
      </div>
      {subValue && <p className="text-xs text-zinc-500 mt-2">{subValue}</p>}
    </div>
  );
}