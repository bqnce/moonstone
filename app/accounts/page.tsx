"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCurrencyRates } from "@/lib/currency";

// Imports from separate files
import { AccountsData, ManualAsset } from "./types";
import { RATES, formatCategoryTitle } from "./utils";
import NetLiquidityCard from "./_components/NetLiquidityCard";
import AssetCard from "./_components/AssetCard";
import EditBalanceModal from "./_components/EditBalanceModal";

export default function AccountsPage() {
  // --- Data State ---
  const { rates, loading: ratesLoading } = useCurrencyRates();
  const [data, setData] = useState<AccountsData | null>(null);
  const [loadingData, setLoadingData] = useState(true); // Átneveztem loading -> loadingData
  const [error, setError] = useState("");

  // --- UI State ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Edit State
  const [editingAsset, setEditingAsset] = useState<{
    id: string;
    asset: ManualAsset;
  } | null>(null);

  const [newBalance, setNewBalance] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const res = await fetch("/api/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Click Outside Logic ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest(".dropdown-trigger")) return;
      setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleEditClick = (mongoId: string, asset: ManualAsset) => {
    setEditingAsset({ id: mongoId, asset });
    setNewBalance(asset.balance.toString());
    setActiveDropdown(null);
  };

  const handleSaveBalance = async () => {
    if (!editingAsset) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/accounts/update-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: editingAsset.id,
          newBalance: parseFloat(newBalance),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update");
      }

      await fetchData();
      setEditingAsset(null);
    } catch (error) {
      console.error("Error updating balance:", error);
      alert("Failed to update balance. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingData || ratesLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
        Error loading accounts: {error}
      </div>
    );
  }

  // Group assets
  const groupedAssets =
    data?.manualAssets.reduce((acc, asset) => {
      const key = asset.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(asset);
      return acc;
    }, {} as Record<string, ManualAsset[]>) || {};

  // Calculate Totals
  const totalValueUsd =
    data?.manualAssets.reduce((acc, curr) => {
      let usdVal = curr.balance;
      if (curr.currency === "HUF") usdVal = curr.balance * rates.HUF_TO_USD;
      else if (curr.currency === "EUR")
        usdVal = curr.balance * rates.EUR_TO_USD;
      return acc + usdVal;
    }, 0) || 0;

  const totalValueHuf = totalValueUsd * rates.USD_TO_HUF;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Accounts
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage your manual assets, cash, and bank accounts
          </p>
        </div>
      </div>
      {/* --- Net Liquidity Card --- */}
      <NetLiquidityCard
        totalValueUsd={totalValueUsd}
        totalValueHuf={totalValueHuf}
        accountCount={data?.manualAssets.length || 0}
        updatedAt={data?.updatedAt}
      />
      {/* --- Categories Grid --- */}
      <div className="space-y-8">
        {Object.entries(groupedAssets).map(([category, assets]) => (
          <div key={category} className="space-y-4">
            {/* ... Category Header ... */}
            <h2 className="text-lg font-semibold text-zinc-300 capitalize flex items-center gap-2 border-b border-zinc-800 pb-2">
              {formatCategoryTitle(category)}
              <span className="text-xs font-normal text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                {assets.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset, index) => {
                const uniqueId = `${category}-${index}`;
                return (
                  <AssetCard
                    key={uniqueId}
                    uniqueId={uniqueId}
                    asset={asset}
                    isActiveDropdown={activeDropdown === uniqueId}
                    onToggleDropdown={setActiveDropdown} // Ha nem működik, ellenőrizd a prop nevét a komponensben
                    onEditClick={(id, asset) => {
                      setEditingAsset({ id, asset });
                      setNewBalance(asset.balance.toString());
                      setActiveDropdown(null);
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* --- Edit Balance Modal --- */}
      {editingAsset && (
        <EditBalanceModal
          asset={editingAsset.asset}
          newBalance={newBalance}
          setNewBalance={setNewBalance}
          onClose={() => setEditingAsset(null)}
          onSave={async () => {
            /* save logic */
          }} // Itt hívd meg a handleSaveBalance-t
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
