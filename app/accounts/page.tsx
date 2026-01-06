"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Layers, Wallet, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { ManualAsset } from "./types";
import AssetCard from "./_components/AssetCard";
import NetLiquidityCard from "./_components/NetLiquidityCard";
import EditBalanceModal from "./_components/EditBalanceModal";
import AddAssetModal from "./_components/AddAssetModal";
// Feltételezem, hogy van egy useWallet hookod, ha nincs, a lenti Wallet kártya csak design elem lesz
// import { useWallet } from "@/app/wallets/contexts/WalletContext"; 

const CATEGORY_ORDER = ["BANK", "CASH", "INVESTMENT", "REAL_ESTATE", "OTHER"];

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ manualAssets: ManualAsset[] } | null>(null);
  const [totals, setTotals] = useState({ usd: 0 });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ManualAsset | null>(null);
  
  // Dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      
      if (res.ok) {
        setData(json);
        const total = (json.manualAssets || []).reduce((acc: number, curr: any) => {
          return acc + (curr.currency === "HUF" ? curr.balance / 400 : curr.balance);
        }, 0);
        setTotals({ usd: total });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedAssets = useMemo(() => {
    if (!data?.manualAssets) return {};
    const groups = data.manualAssets.reduce((acc, asset) => {
      const category = asset.category || "OTHER";
      if (!acc[category]) acc[category] = [];
      acc[category].push(asset);
      return acc;
    }, {} as Record<string, ManualAsset[]>);
    return groups;
  }, [data]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedAssets).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }, [groupedAssets]);

  const handleEditClick = (id: string, asset: ManualAsset) => {
    setEditingAsset(asset);
    setActiveDropdownId(null);
  };

  const hasAnyData = data?.manualAssets && data.manualAssets.length > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header - Csak akkor mutatjuk a gombot, ha már van adat. Ha nincs, lentebb lesz a nagy gomb. */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Accounts & Assets</h1>
          <p className="text-zinc-400">Manage your portfolio.</p>
        </div>
        
        {hasAnyData && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col gap-4">
           {/* Skeleton Loading helyett egyszerű szöveg most */}
           <div className="text-zinc-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading assets...
           </div>
        </div>
      ) : (
        <>
          {/* --- EMPTY STATE / ONBOARDING --- */}
          {!hasAnyData ? (
             <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Option 1: Manual Account */}
                <div 
                  onClick={() => setIsAddModalOpen(true)}
                  className="group cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-8 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-24 bg-emerald-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-all" />
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-emerald-500">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Add Manual Account</h3>
                    <p className="text-zinc-400 text-sm mb-6">
                      Track your bank accounts, cash, real estate, or any other asset manually.
                    </p>
                    <div className="flex items-center text-emerald-400 text-sm font-medium">
                      Create Asset <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Option 2: Connect Wallet (Ideiglenes link a Wallets oldalra) */}
                <a href="/wallets" className="block">
                  <div className="h-full group cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-24 bg-blue-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-all" />
                    
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-blue-500">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Connect Web3 Wallet</h3>
                      <p className="text-zinc-400 text-sm mb-6">
                        Connect MetaMask or Phantom to automatically track your crypto assets.
                      </p>
                      <div className="flex items-center text-blue-400 text-sm font-medium">
                        Go to Wallets <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </a>

             </div>
          ) : (
            // --- DATA DISPLAY ---
            <>
              <NetLiquidityCard 
                grandTotalUsd={totals.usd} 
                loadingManual={loading} 
              />
              
              <div className="space-y-10 mt-8">
                {sortedCategories.map((category) => (
                  <div key={category} className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Layers className="w-4 h-4 text-emerald-500" />
                      <h2 className="text-lg font-bold text-zinc-300 tracking-wider">
                        {category}
                      </h2>
                      <span className="text-xs text-zinc-600 font-mono bg-zinc-900 px-2 py-0.5 rounded-full">
                        {groupedAssets[category].length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedAssets[category].map((asset) => (
                        <AssetCard 
                          key={asset._id}
                          asset={asset}
                          uniqueId={asset._id}
                          isActiveDropdown={activeDropdownId === asset._id}
                          onToggleDropdown={setActiveDropdownId}
                          onEditClick={handleEditClick}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Modals */}
      <AddAssetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData} 
      />

      {editingAsset && (
        <EditBalanceModal
          isOpen={true}
          onClose={() => setEditingAsset(null)}
          asset={editingAsset}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

// Kis segédkomponens a betöltéshez (ha nincs importálva máshonnan)
function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}