import React from "react";
import { Filter } from "lucide-react";
import { FILTER_OPTIONS } from "../utils";

interface HistoryFiltersProps {
  selectedSource: string | null;
  onSelectSource: (source: string | null) => void;
}

export default function HistoryFilters({
  selectedSource,
  onSelectSource,
}: HistoryFiltersProps) {
  return (
    <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 shadow-sm">
      <div className="px-3 text-zinc-500">
        <Filter className="w-4 h-4" />
      </div>
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onSelectSource(opt.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
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
  );
}