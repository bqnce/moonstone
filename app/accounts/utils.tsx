import React from "react";
import {
  Wallet,
  CreditCard,
  PiggyBank,
  Banknote,
} from "lucide-react";

export const RATES = {
  EUR_TO_USD: 1.05,
  HUF_TO_USD: 0.0026,
  USD_TO_HUF: 382,
};

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatHuf = (amount: number) => {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatLastUpdated = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

export const formatCategoryTitle = (cat: string) => {
  if (cat === "creditCard") return "Bank Accounts & Cards";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

export const getCategoryIcon = (category: string = "", subCategory: string = "") => {
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