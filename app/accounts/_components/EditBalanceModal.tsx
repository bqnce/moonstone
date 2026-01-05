import React from "react";
import { Loader2, Check, X } from "lucide-react";
import { ManualAsset } from "../types";

interface EditBalanceModalProps {
  asset: ManualAsset;
  newBalance: string;
  setNewBalance: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function EditBalanceModal({
  asset,
  newBalance,
  setNewBalance,
  onClose,
  onSave,
  isSaving,
}: EditBalanceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Update Balance</h3>
        <p className="text-zinc-400 text-sm mb-6">
          Enter the new balance for{" "}
          <span className="text-emerald-400 font-medium">{asset.label}</span>
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Amount ({asset.currency})
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
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
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
  );
}