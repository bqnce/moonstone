"use client";

import { useState, useEffect } from "react";

export type Currency = "USD" | "HUF";

// Fix árfolyam (ezt később API-ból is frissítheted)
const HUF_RATE = 400;

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  // 1. Betöltés indításkor a localStorage-ból
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("moonstone_currency") as Currency;
      if (saved === "USD" || saved === "HUF") {
        setCurrencyState(saved);
      }
    }
  }, []);

  // 2. Szinkronizáció: Figyeljük, ha valahol máshol változik a beállítás
  useEffect(() => {
    const handleCurrencyChange = () => {
      const saved = localStorage.getItem("moonstone_currency") as Currency;
      if (saved) setCurrencyState(saved);
    };

    // Egyedi event figyelése ("storage" event csak más tabokon működne alapból)
    window.addEventListener("currency-update", handleCurrencyChange);
    return () => window.removeEventListener("currency-update", handleCurrencyChange);
  }, []);

  // 3. Beállítás módosítása (Ezt hívhatod majd a Settings oldalról)
  const setCurrency = (newCurrency: Currency) => {
    localStorage.setItem("moonstone_currency", newCurrency);
    setCurrencyState(newCurrency);
    // Jelzünk a többi komponensnek, hogy frissüljenek
    window.dispatchEvent(new Event("currency-update"));
  };

  // 4. Formázó függvény
  const formatMoney = (amountInUsd: number | undefined | null) => {
    // Biztonsági ellenőrzés
    if (amountInUsd === undefined || amountInUsd === null || isNaN(amountInUsd)) {
      return { main: "---", secondary: null };
    }

    const value = Number(amountInUsd);

    // Formázók
    const usdIntl = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const hufIntl = new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // Logika
    if (currency === "HUF") {
      // Csak Forint
      return {
        main: hufIntl.format(value * HUF_RATE),
        secondary: null
      };
    } else {
      // Dollár + (Forint)
      return {
        main: usdIntl.format(value),
        secondary: `(≈ ${hufIntl.format(value * HUF_RATE)})`
      };
    }
  };

  return { currency, setCurrency, formatMoney };
}