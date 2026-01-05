import React from "react";
import {
  Calendar,
  Check,
  Loader2,
  Wallet,
  ArrowRight,
  ChevronDown,
  ArrowLeftRight,
} from "lucide-react";
import { ManualAsset } from "../types";

interface SalaryFormProps {
  isHistorical: boolean;
  setIsHistorical: (val: boolean) => void;
  accounts: ManualAsset[];
  loadingAccounts: boolean;
  selectedAccountId: string;
  setSelectedAccountId: (val: string) => void;
  month: string;
  setMonth: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  convertedPreview: string | null;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  success: boolean;
  error: string;
}

export default function SalaryForm({
  isHistorical,
  setIsHistorical,
  accounts,
  loadingAccounts,
  selectedAccountId,
  setSelectedAccountId,
  month,
  setMonth,
  amount,
  setAmount,
  convertedPreview,
  onSubmit,
  isSubmitting,
  success,
  error,
}: SalaryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* --- HISTORICAL TOGGLE --- */}
      <div
        onClick={() => setIsHistorical(!isHistorical)}
        className={`
            cursor-pointer flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
            ${
              isHistorical
                ? "bg-indigo-500/10 border-indigo-500/30"
                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
            }
        `}
      >
        <div
          className={`
            w-6 h-6 rounded-md flex items-center justify-center border transition-colors
            ${
              isHistorical
                ? "bg-indigo-500 border-indigo-500"
                : "border-zinc-600 bg-transparent"
            }
        `}
        >
          {isHistorical && <Check className="w-4 h-4 text-white" />}
        </div>
        <div>
          <h3
            className={`text-sm font-bold ${
              isHistorical ? "text-indigo-400" : "text-zinc-300"
            }`}
          >
            Historical Record
          </h3>
          <p className="text-xs text-zinc-500">
            Log past income without updating current balance
          </p>
        </div>
      </div>

      {/* 1. Account Selector (Only if NOT historical) */}
      {!isHistorical && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
            Destination Account
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
              <Wallet className="w-5 h-5" />
            </div>

            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              disabled={loadingAccounts}
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-lg rounded-xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="" disabled>
                Select account...
              </option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.label} ({acc.currency})
                </option>
              ))}
            </select>

            <div className="absolute right-4 top-4 text-zinc-600 pointer-events-none">
              {loadingAccounts ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Month Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
          Reference Period
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-lg rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all [color-scheme:dark]"
          />
        </div>
      </div>

      {/* 3. Amount Input (HUF) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
          Income Amount (HUF)
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
            <span className="font-bold text-sm">Ft</span>
          </div>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-2xl font-bold font-mono rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-700"
          />
        </div>

        {/* Conversion Preview */}
        {convertedPreview && (
          <div className="flex items-center gap-2 text-sm text-zinc-400 pl-1 animate-in fade-in slide-in-from-top-1">
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
            <span>Will be registered as:</span>
            <span className="text-emerald-400 font-bold font-mono">
              ≈ {convertedPreview} EUR
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          isSubmitting || (!isHistorical && !selectedAccountId) || !amount
        }
        className={`
            w-full relative group overflow-hidden rounded-xl py-4 font-bold text-lg transition-all duration-300
            ${
              success
                ? "bg-emerald-500 text-white cursor-default"
                : "bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            }
        `}
      >
        <div className="relative z-10 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : success ? (
            <>
              <Check className="w-6 h-6" />
              Registered Successfully
            </>
          ) : (
            <>
              {isHistorical ? "Log Record" : "Register Income"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </div>
      </button>
    </form>
  );
}