"use client";

import React, { useEffect, useState } from "react";
import { ManualAsset } from "./types";
import { HUF_TO_EUR_RATE, calculateEurPreview } from "./utils";
import SalaryHeader from "./_components/SalaryHeader";
import SalaryForm from "./_components/SalaryForm";

export default function SalaryPage() {
  // --- Data State ---
  const [accounts, setAccounts] = useState<ManualAsset[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // --- Form State ---
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isHistorical, setIsHistorical] = useState(false);

  // --- UI State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch Accounts
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

  // 2. Logic Helpers
  const selectedAccount = accounts.find((acc) => acc._id === selectedAccountId);
  
  // EUR calculation logic
  const isEurAccount = !isHistorical && selectedAccount?.currency === "EUR";
  const convertedPreview = calculateEurPreview(amount, isEurAccount);

  // 3. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          accountId: isHistorical ? null : selectedAccountId,
          amount: finalAmount,
          date: month,
          isHistorical: isHistorical,
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
      
      <SalaryHeader />

      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-1 shadow-2xl">
        <div className="bg-zinc-950/50 rounded-[22px] p-6 md:p-8 space-y-6">
          
          <SalaryForm
            isHistorical={isHistorical}
            setIsHistorical={setIsHistorical}
            accounts={accounts}
            loadingAccounts={loadingAccounts}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            month={month}
            setMonth={setMonth}
            amount={amount}
            setAmount={setAmount}
            convertedPreview={convertedPreview}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            success={success}
            error={error}
          />
          
        </div>
      </div>
    </div>
  );
}