import React from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  CalendarDays,
  History,
  Loader2,
} from "lucide-react";
import { EventItem } from "../types";
import { getSourceConfig, formatMonth } from "../utils";

interface HistoryTableProps {
  events: EventItem[];
  loading: boolean;
}

export default function HistoryTable({ events, loading }: HistoryTableProps) {
  if (loading) {
    return (
      <div className="h-[400px] flex flex-col justify-center items-center text-zinc-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="text-sm font-medium">Loading transactions...</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="h-[400px] flex flex-col justify-center items-center text-zinc-500 gap-3">
        <History className="w-12 h-12 opacity-20" />
        <p>No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-zinc-950/50 border-b border-zinc-800/50 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            <th className="px-6 py-4">Date & Time</th>
            <th className="px-6 py-4">Source</th>
            <th className="px-6 py-4">Category / Account</th>
            <th className="px-6 py-4 text-right">Change (Delta)</th>
            <th className="px-6 py-4 text-right">Balance After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50 text-sm">
          {events.map((event) => {
            const config = getSourceConfig(event.source);
            const isPositive = event.delta > 0;
            const dateObj = new Date(event.timestamp);
            const salaryMonth = event.metadata?.month;

            return (
              <tr
                key={event._id}
                className="group hover:bg-zinc-800/30 transition-colors duration-150"
              >
                {/* 1. Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-zinc-300 font-medium">
                      {dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-zinc-600 text-xs font-mono mt-0.5">
                      {dateObj.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </td>

                {/* 2. Source Badge & Metadata */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.style}`}
                    >
                      {config.icon}
                      {config.label}
                    </span>

                    {salaryMonth && (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono pl-1">
                        <CalendarDays className="w-3 h-3 text-zinc-600" />
                        {formatMonth(salaryMonth)}
                      </span>
                    )}
                  </div>
                </td>

                {/* 3. Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-zinc-300 capitalize">
                      {event.category}
                    </span>
                    {event.subcategory && (
                      <span className="text-zinc-500 text-xs capitalize">
                        {event.subcategory}
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. Delta */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div
                    className={`inline-flex items-center font-mono font-bold text-base ${
                      isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 mr-1" />
                    )}
                    {isPositive ? "+" : ""}
                    {event.delta.toLocaleString()}
                    <span className="ml-1 text-xs opacity-70 font-sans">
                      {event.currency}
                    </span>
                  </div>
                </td>

                {/* 5. Balance */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-zinc-500 font-mono tabular-nums group-hover:text-zinc-300 transition-colors">
                    {event.balanceAfter.toLocaleString()} {event.currency}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}