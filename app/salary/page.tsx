"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  DollarSign,
  Calendar,
  Check,
  Loader2,
  Wallet,
  ArrowRight,
  ChevronDown,
  ArrowLeftRight,
  History // Új ikon
} from "lucide-react";

interface ManualAsset {
  _id: string;
  label: string;
  currency: string;
  category: string;
}

const HUF_TO_EUR_RATE = 400; 

export default function SalaryPage() {
  const [accounts, setAccounts] = useState<ManualAsset[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Form State
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState(""); 
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // ÚJ STATE: Múltbeli adat-e?
  const [isHistorical, setIsHistorical] = useState(false);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.manualAssets || []);
        }
      } catch (err) {
        console.error("Failed to load accounts", err);
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const selectedAccount = accounts.find(acc => acc._id === selectedAccountId);
  // Ha historical, akkor nincs account, tehát nincs konverzió sem (marad HUF)
  const isEurAccount = !isHistorical && selectedAccount?.currency === "EUR";
  
  const convertedPreview = isEurAccount && amount 
    ? (parseFloat(amount) / HUF_TO_EUR_RATE).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDÁCIÓ: Ha NEM historical, kötelező az account. Ha historical, nem kell.
    if (!amount) return;
    if (!isHistorical && !selectedAccountId) return;

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      let finalAmount = parseFloat(amount);
      
      if (isEurAccount) {
        finalAmount = finalAmount / HUF_TO_EUR_RATE;
      }

      const res = await fetch("/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: isHistorical ? null : selectedAccountId, // Ha historical, null-t küldünk
          amount: finalAmount,
          date: month,
          isHistorical: isHistorical // Jelezzük a backendnek
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to register salary.");
      }

      setSuccess(true);
      setAmount(""); 
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-2xl mb-4 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-900/20">
          <Briefcase className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Salary Injection
        </h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Securely register your monthly income.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-1 shadow-2xl">
        <div className="bg-zinc-950/50 rounded-[22px] p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- ÚJ: HISTORICAL TOGGLE --- */}
            <div 
                onClick={() => setIsHistorical(!isHistorical)}
                className={`
                    cursor-pointer flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                    ${isHistorical 
                        ? "bg-indigo-500/10 border-indigo-500/30" 
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }
                `}
            >
                <div className={`
                    w-6 h-6 rounded-md flex items-center justify-center border transition-colors
                    ${isHistorical ? "bg-indigo-500 border-indigo-500" : "border-zinc-600 bg-transparent"}
                `}>
                    {isHistorical && <Check className="w-4 h-4 text-white" />}
                </div>
                <div>
                    <h3 className={`text-sm font-bold ${isHistorical ? "text-indigo-400" : "text-zinc-300"}`}>Historical Record</h3>
                    <p className="text-xs text-zinc-500">Log past income without updating current balance</p>
                </div>
            </div>


            {/* 1. Account Selector (CSAK HA NEM HISTORICAL) */}
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
                    <option value="" disabled>Select account...</option>
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
                   <span className="text-emerald-400 font-bold font-mono">≈ {convertedPreview} EUR</span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (!isHistorical && !selectedAccountId) || !amount}
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
        </div>
      </div>
    </div>
  );
}