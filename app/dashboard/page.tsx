"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/app/wallets/contexts/WalletContext";
import { useCurrencyRates } from "@/lib/currency";
import { ManualAsset } from "./types";
import { getTokenIcon } from "./utils";
import NetLiquidityCard from "./_components/NetLiquidityCard";
import TokenList from "./_components/TokenList";

export default function DashboardPage() {

  const { rates, loading: ratesLoading } = useCurrencyRates();
  // 1. Get Crypto Data from Wallet Context
  const { allTokens, totalPortfolioValue: cryptoTotalUsd } = useWallet();

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
            if (curr.currency === "HUF")
              usdVal = curr.balance * rates.HUF_TO_USD;
            else if (curr.currency === "EUR")
              usdVal = curr.balance * rates.EUR_TO_USD;
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
const grandTotalHuf = grandTotalUsd * (rates?.USD_TO_HUF || 380);

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
          <p className="text-zinc-400">
            Overview of your entire financial portfolio
          </p>
        </div>
      </div>

      {/* Net Liquidity Card */}
      <NetLiquidityCard
        grandTotalUsd={grandTotalUsd}
        grandTotalHuf={grandTotalHuf}
        cryptoTotalUsd={cryptoTotalUsd}
        manualTotalUsd={manualTotalUsd}
        manualAccountCount={manualAccountCount}
        loadingManual={loadingManual || ratesLoading}
      />

      {/* Tokens Section */}
      <TokenList tokens={tokens} />
    </div>
  );
}