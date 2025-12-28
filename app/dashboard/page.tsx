"use client";

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  Landmark, 
  Loader2 
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

// --- Constants (Shared with Accounts Page) ---
const RATES = {
  EUR_TO_USD: 1.05,
  HUF_TO_USD: 0.0026,
  USD_TO_HUF: 382,
};

// --- Helper Functions ---
function getTokenIcon(symbol: string): string {
  switch (symbol) {
    case "SOL": return "🟣";
    case "ETH": return "🔷";
    case "PENGU": return "🐧";
    case "USDC": return "💵";
    default: return "🪙";
  }
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatHuf = (amount: number) => {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- Types (Simplified for Dashboard use) ---
interface ManualAsset {
  balance: number;
  currency: string;
}

export default function DashboardPage() {
  // 1. Get Crypto Data from Wallet Context
  const {
    allTokens,
    totalPortfolioValue: cryptoTotalUsd, // Rename for clarity
  } = useWallet();

  // 2. State for Manual Accounts
  const [manualTotalUsd, setManualTotalUsd] = useState(0);
  const [manualAccountCount, setManualAccountCount] = useState(0);
  const [loadingManual, setLoadingManual] = useState(true);

  // 3. Fetch Manual Data
  useEffect(() => {
    const fetchManualAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        if (res.ok) {
          const data = await res.json();
          const assets: ManualAsset[] = data.manualAssets || [];
          
          setManualAccountCount(assets.length);

          // Calculate Manual Total in USD
          const totalUsd = assets.reduce((acc, curr) => {
            let usdVal = curr.balance;
            if (curr.currency === "HUF") usdVal = curr.balance * RATES.HUF_TO_USD;
            else if (curr.currency === "EUR") usdVal = curr.balance * RATES.EUR_TO_USD;
            return acc + usdVal;
          }, 0);

          setManualTotalUsd(totalUsd);
        }
      } catch (error) {
        console.error("Failed to fetch manual accounts", error);
      } finally {
        setLoadingManual(false);
      }
    };

    fetchManualAccounts();
  }, []);

  // 4. Calculate Grand Totals (Crypto + Manual)
  const grandTotalUsd = cryptoTotalUsd + manualTotalUsd;
  const grandTotalHuf = grandTotalUsd * RATES.USD_TO_HUF;

  // Format tokens for display list
  const tokens = allTokens.map((token, index) => ({
    id: index + 1,
    name: token.name,
    symbol: token.symbol,
    amount: token.amount,
    value: token.usdValue,
    price: token.priceUsd,
    change24h: 0, 
    icon: getTokenIcon(token.symbol),
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-zinc-400">Overview of your entire financial portfolio</p>
        </div>
      </div>

      {/* --- Unified Net Liquidity Card (Updated Design) --- */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Landmark className="w-4 h-4" />
            <span className="text-sm font-medium">Net Liquidity</span>
          </div>

          {/* Grand Total USD */}
          <div className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            {formatCurrency(grandTotalUsd, "USD")}
            {loadingManual && <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />}
          </div>

          {/* Grand Total HUF */}
          <div className="text-lg font-medium text-zinc-500 mt-1 flex items-baseline gap-2">
            <span>≈ {formatHuf(grandTotalHuf)}</span>
          </div>

          {/* Footer Breakdown */}
          <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-4 text-sm">
            
            {/* Crypto Portion */}
            <div className="flex items-center gap-2 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>
                Crypto: <span className="font-semibold text-emerald-300">{formatCurrency(cryptoTotalUsd, "USD")}</span>
              </span>
            </div>

            <div className="w-px h-4 bg-zinc-800 hidden md:block"></div>

            {/* Manual Portion */}
            <div className="flex items-center gap-2 text-blue-400">
              <Wallet className="w-4 h-4" />
              <span>
                Manual ({manualAccountCount}): <span className="font-semibold text-blue-300">{formatCurrency(manualTotalUsd, "USD")}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tokens Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-white">Your Tokens</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {tokens.length} token{tokens.length !== 1 ? "s" : ""} in your connected wallets
          </p>
        </div>

        <div className="divide-y divide-zinc-800">
          {tokens.length === 0 ? (
            <div className="p-12 text-center">
              <Coins className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">
                No tokens found. Connect your wallets to see your portfolio.
              </p>
            </div>
          ) : (
            tokens.map((token) => (
              <div
                key={token.id}
                className="p-6 hover:bg-zinc-800/50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Token Icon */}
                    <div className="h-12 w-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl">
                      {token.icon}
                    </div>

                    {/* Token Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-white">{token.name}</h3>
                        <span className="text-sm text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">
                          {token.symbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span>
                          {token.amount.toLocaleString("en-US", {
                            maximumFractionDigits: 4,
                          })}{" "}
                          {token.symbol}
                        </span>
                        <span className="text-zinc-600">@ ${token.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-white mb-1">
                      ${token.value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}