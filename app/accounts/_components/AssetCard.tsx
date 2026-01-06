"use client";

import React, { useState } from "react";
import { MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { ManualAsset } from "../types";
import { getCategoryIcon } from "../utils";

interface AssetCardProps {
  asset: ManualAsset;
  uniqueId: string;
  isActiveDropdown: boolean;
  onToggleDropdown: (id: string | null) => void;
  onEditClick: (id: string, asset: ManualAsset) => void;
}

export default function AssetCard({
  asset,
  uniqueId,
  isActiveDropdown,
  onToggleDropdown,
  onEditClick,
}: AssetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // --- TÖRLÉS LOGIKA ---
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/accounts?id=${asset._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Successfully deleted", {
        position: "bottom-center",
        style: {
          background: "#18181b",
          color: "#ef4444",
          border: "1px solid #27272a",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fff",
        }
      });

      window.location.reload(); 

    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
      setIsDeleting(false);
    }
  };

  return (
    <div className="group bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 rounded-xl p-5 flex flex-col justify-between relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 group-hover:border-zinc-700 transition-colors">
          {getCategoryIcon(asset.category, asset.subCategory || asset.subcategory)}
        </div>

        {/* --- Dropdown Area --- */}
        <div className="relative dropdown-trigger">
          <button
            onClick={() => onToggleDropdown(isActiveDropdown ? null : uniqueId)}
            className={`transition-colors cursor-pointer relative z-10 ${
              isActiveDropdown
                ? "text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown Menu és Backdrop */}
          {isActiveDropdown && (
            <>
              {/* 1. LÁTHATATLAN BACKDROP (Függöny) 
                  Ez fedi le az egész képernyőt (fixed inset-0).
                  Ha erre kattintasz, bezárja a menüt.
                  z-40: hogy a kártyák felett legyen, de a menü alatt.
              */}
              <div 
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => onToggleDropdown(null)}
              />

              {/* 2. A MENÜ 
                  z-50: hogy a backdrop felett legyen, így a menü gombjai kattinthatók maradnak.
              */}
              <div className="absolute right-0 top-8 w-40 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1">
                  <button
                    onClick={() => onEditClick(asset._id, asset)}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" /> Edit Balance
                  </button>
                  
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )} 
                    Delete
                  </button>
                </div>
              </div>
            </>
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
}