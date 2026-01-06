"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, Save, ChevronDown, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ["BANK", "CASH", "INVESTMENT", "REAL_ESTATE", "OTHER"];
const CURRENCIES = ["HUF", "USD", "EUR"];

// --- CUSTOM DROPDOWN KOMPONENS ---
interface CustomSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-xs text-zinc-400 font-medium ml-1 cursor-default">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm transition-all outline-none cursor-pointer ${
          isOpen ? "ring-2 ring-emerald-500/20 border-emerald-500" : "hover:border-zinc-700"
        }`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                  value === opt 
                    ? "bg-emerald-500/10 text-emerald-400 font-medium" 
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {opt}
                {value === opt && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- FŐ MODAL ---
export default function AddAssetModal({ isOpen, onClose, onSuccess }: AddAssetModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    balance: "",
    currency: "HUF",
    category: "BANK",
    subCategory: ""
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create asset");

      toast.success("Account created successfully!");
      setFormData({ label: "", balance: "", currency: "HUF", category: "BANK", subCategory: "" });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white cursor-default">Add New Account</h2>
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect 
              label="Category" 
              value={formData.category} 
              options={CATEGORIES} 
              onChange={(val) => setFormData({...formData, category: val})} 
            />
            <CustomSelect 
              label="Currency" 
              value={formData.currency} 
              options={CURRENCIES} 
              onChange={(val) => setFormData({...formData, currency: val})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium ml-1 cursor-default">Account Name</label>
            <input 
              type="text" 
              placeholder="e.g. Main Savings"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium ml-1 cursor-default">Subcategory (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. OTP, Revolut"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={formData.subCategory}
              onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium ml-1 cursor-default">Current Balance</label>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0"
                required
                // ITT VAN A VÁLTOZÁS: [appearance:textfield] és a webkit classok
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={formData.balance}
                onChange={(e) => setFormData({...formData, balance: e.target.value})}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium pointer-events-none select-none">
                {formData.currency}
              </span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Create Asset</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}