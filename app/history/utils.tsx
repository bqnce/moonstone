import React from "react";
import { Briefcase, Wallet, RefreshCcw, History } from "lucide-react";

export const getSourceConfig = (source: string) => {
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

export const formatMonth = (yyyyMm: string) => {
  if (!yyyyMm) return "";
  const [year, month] = yyyyMm.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export const FILTER_OPTIONS = [
  { label: "All Events", value: null },
  { label: "Salary", value: "SALARY" },
  { label: "Manual", value: "MANUAL" },
  { label: "On-Chain", value: "ONCHAIN" },
];