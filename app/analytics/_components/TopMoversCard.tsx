import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { TopEvent } from "../types";

interface TopMoversCardProps {
  title: string;
  events: TopEvent[];
  type: "gain" | "loss";
}

export default function TopMoversCard({ title, events, type }: TopMoversCardProps) {
  const isGain = type === "gain";
  const Icon = isGain ? ArrowUpRight : ArrowDownRight;
  
  // Színek konfigurálása a típustól függően
  const iconBg = isGain ? "bg-emerald-500/10" : "bg-rose-500/10";
  const iconHoverBg = isGain ? "group-hover:bg-emerald-500/20" : "group-hover:bg-rose-500/20";
  const iconColor = isGain ? "text-emerald-400" : "text-rose-400";
  const textColor = isGain ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">{title}</h3>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event._id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor} ${iconHoverBg} transition-colors`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">{event.category}</p>
                <p className="text-xs text-zinc-500">
                  {format(new Date(event.timestamp), "MMM d, yyyy")} • {event.source}
                </p>
              </div>
            </div>
            <span className={`${textColor} font-bold font-mono`}>
              {isGain ? "+" : "-"}{Math.abs(event.delta).toLocaleString()} HUF
            </span>
          </div>
        ))}
        {events.length === 0 && <p className="text-zinc-600 text-sm italic">No events recorded.</p>}
      </div>
    </div>
  );
}