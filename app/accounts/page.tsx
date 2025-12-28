"use client";

import React, { useEffect, useState } from "react";
import {
  Wallet,
  CreditCard,
  Landmark,
  PiggyBank,
  Banknote,
  Loader2,
  TrendingUp,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

// --- Types ---
interface ManualAsset {
  category: string;
  subCategory?: string;
  subcategory?: string; // Handling DB inconsistency
  balance: number;
  currency: string;
  label: string;
}

interface AccountsData {
  _id: string;
  userId: string;
  manualAssets: ManualAsset[];
  updatedAt?: string; // Add this field
  lastUpdated?: string; // Keep for fallback}
}

// --- Constants ---
const RATES = {
  EUR_TO_USD: 1.05,
  HUF_TO_USD: 0.0026,
  USD_TO_HUF: 382,
};

// --- Helpers ---
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

const formatLastUpdated = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Returns format like: "Dec 28, 1:20 PM"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

const getCategoryIcon = (category: string = "", subCategory: string = "") => {
  const lowerCat = (category || "").toLowerCase();
  const lowerSub = (subCategory || "").toLowerCase();

  if (lowerCat === "cash")
    return <Banknote className="w-6 h-6 text-emerald-400" />;
  if (lowerSub.includes("savings"))
    return <PiggyBank className="w-6 h-6 text-purple-400" />;
  if (lowerCat === "creditcard" || lowerCat === "bank")
    return <CreditCard className="w-6 h-6 text-blue-400" />;

  return <Wallet className="w-6 h-6 text-zinc-400" />;
};

const formatCategoryTitle = (cat: string) => {
  if (cat === "creditCard") return "Bank Accounts & Cards";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

export default function AccountsPage() {
  // --- Data State ---
  const [data, setData] = useState<AccountsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- UI State ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // Uses unique ID `${category}-${index}`
  const [editingAsset, setEditingAsset] = useState<{
    id: string;
    asset: ManualAsset;
  } | null>(null);
  const [newBalance, setNewBalance] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/accounts");
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Click Outside to Close Dropdowns ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest(".dropdown-trigger")) return;
      setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleEditClick = (uniqueId: string, asset: ManualAsset) => {
    setEditingAsset({ id: uniqueId, asset });
    setNewBalance(asset.balance.toString());
    setActiveDropdown(null);
  };

  const handleSaveBalance = async () => {
    if (!editingAsset) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editingAsset.asset.label,
          newBalance: parseFloat(newBalance),
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      // Update Local State immediately
      if (data) {
        const updatedAssets = data.manualAssets.map((asset) => {
          if (asset.label === editingAsset.asset.label) {
            return { ...asset, balance: parseFloat(newBalance) };
          }
          return asset;
        });

        setData({
          ...data,
          manualAssets: updatedAssets,
          updatedAt: new Date().toISOString(), // <--- Update the timestamp locally!
        });
      }

      setEditingAsset(null);
    } catch (error) {
      console.error("Error updating balance:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
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
      if (curr.currency === "HUF") usdVal = curr.balance * RATES.HUF_TO_USD;
      else if (curr.currency === "EUR")
        usdVal = curr.balance * RATES.EUR_TO_USD;
      return acc + usdVal;
    }, 0) || 0;

  const totalValueHuf = totalValueUsd * RATES.USD_TO_HUF;

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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Landmark className="w-4 h-4" />
            <span className="text-sm font-medium">Net Liquidity</span>
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">
            {formatCurrency(totalValueUsd, "USD")}
          </div>
          <div className="text-lg font-medium text-zinc-500 mt-1 flex items-baseline gap-2">
            <span>≈ {formatHuf(totalValueHuf)}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-end">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>Total across {data?.manualAssets.length} accounts</span>
            </div>

            {/* Last Updated Display */}
            <div className="text-xs text-zinc-500 font-medium">
              Updated:{" "}
              <span className="text-zinc-400">
                {formatLastUpdated(data?.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Categories Grid --- */}
      <div className="space-y-8">
        {Object.entries(groupedAssets).map(([category, assets]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-300 capitalize flex items-center gap-2 border-b border-zinc-800 pb-2">
              {formatCategoryTitle(category)}
              <span className="text-xs font-normal text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                {assets.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset, index) => {
                const uniqueId = `${category}-${index}`; // Create unique ID for dropdown logic

                return (
                  <div
                    key={uniqueId}
                    className="group bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 rounded-xl p-5 flex flex-col justify-between relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                        {getCategoryIcon(
                          asset.category,
                          asset.subCategory || asset.subcategory
                        )}
                      </div>

                      {/* --- Dropdown Area --- */}
                      <div className="relative dropdown-trigger">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === uniqueId ? null : uniqueId
                            )
                          }
                          className={`transition-colors cursor-pointer ${
                            activeDropdown === uniqueId
                              ? "text-white"
                              : "text-zinc-500 hover:text-white"
                          }`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === uniqueId && (
                          <div className="absolute right-0 top-8 w-40 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditClick(uniqueId, asset)}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" /> Edit Balance
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 cursor-pointer">
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-zinc-400 text-sm font-medium mb-1">
                        {asset.label}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white tracking-tight">
                          {asset.balance.toLocaleString("en-US")}
                        </span>
                        <span className="text-sm font-bold text-emerald-500">
                          {asset.currency}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-500">
                      <span className="uppercase tracking-wider font-semibold opacity-50">
                        {asset.subCategory || asset.subcategory}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* --- Edit Balance Modal --- */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setEditingAsset(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              Update Balance
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Enter the new balance for{" "}
              <span className="text-emerald-400 font-medium">
                {editingAsset.asset.label}
              </span>
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Amount ({editingAsset.asset.currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xl font-mono"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBalance}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
