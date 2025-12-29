"use client";

import { useEffect, useState } from "react";
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Wallet,
  RefreshCcw,
  Loader2,
  Filter,
  CalendarDays,
} from "lucide-react";

interface EventItem {
  _id: string;
  timestamp: string;
  source: string;
  delta: number;
  balanceAfter: number;
  currency: string;
  category: string;
  subcategory?: string;
  metadata?: {
    month?: string;
  };
}

// --- Config ---
const getSourceConfig = (source: string) => {
  // ... (másold át a korábbi kódból)
  switch (source) {
    case "SALARY":
      return {
        icon: <Briefcase className="w-3.5 h-3.5" />,
        label: "Salary",
        style: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      };
    case "MANUAL":
      return {
        icon: <Wallet className="w-3.5 h-3.5" />,
        label: "Manual",
        style: "bg-zinc-800 text-zinc-400 border-zinc-700",
      };
    case "ONCHAIN":
      return {
        icon: <RefreshCcw className="w-3.5 h-3.5" />,
        label: "On-Chain",
        style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    default:
      return {
        icon: <History className="w-3.5 h-3.5" />,
        label: source,
        style: "bg-zinc-800 text-zinc-400 border-zinc-700",
      };
  }
};

const FILTER_OPTIONS = [
  { label: "All Events", value: null },
  { label: "Salary", value: "SALARY" },
  { label: "Manual", value: "MANUAL" },
  { label: "On-Chain", value: "ONCHAIN" },
];

const formatMonth = (yyyyMm: string) => {
  if (!yyyyMm) return "";
  const [year, month] = yyyyMm.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function HistoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATE
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const query = selectedSource
      ? `?limit=50&source=${selectedSource}`
      : `?limit=50`;

    fetch(`/api/events${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setEvents(data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedSource]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <History className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              History Log
            </h1>
          </div>
          <p className="text-zinc-400 ml-1">
            Audit trail of all balance changes and transactions
          </p>
        </div>

        {/* --- FILTER CONTROLS --- */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 shadow-sm">
          <div className="px-3 text-zinc-500">
            <Filter className="w-4 h-4" />
          </div>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setSelectedSource(opt.value)}
              className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          selectedSource === opt.value
                            ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                        }
                    `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Table Container --- */}
      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
        {loading ? (
          <div className="h-[400px] flex flex-col justify-center items-center text-zinc-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-sm font-medium">Loading transactions...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="h-[400px] flex flex-col justify-center items-center text-zinc-500 gap-3">
            <History className="w-12 h-12 opacity-20" />
            <p>No transactions found.</p>
          </div>
        ) : (
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

                  // Van-e mentett hónap adat?
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
                      {/* 2. Source Badge & Metadata */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.style}`}
                          >
                            {config.icon}
                            {config.label}
                          </span>

                          {/* HA A SÉMA JÓ, EZ MOST MÁR MEGJELENIK: */}
                          {event.metadata?.month && (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 font-mono pl-1">
                              <CalendarDays className="w-3 h-3 text-zinc-600" />
                              {formatMonth(event.metadata.month)}
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
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex justify-between items-center text-xs text-zinc-500 px-2">
        <span>
          {selectedSource
            ? `Filtering by ${selectedSource}`
            : "Showing all events"}
        </span>
        <span>Showing up to 50 results</span>
      </div>
    </div>
  );
}
