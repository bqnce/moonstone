"use client";

import { useState, useEffect } from "react";

// Fallback értékek, ha az API nem elérhető (biztonsági tartalék)
const DEFAULT_RATES = {
  USD_TO_HUF: 380,
  EUR_TO_USD: 1.05,
  HUF_TO_USD: 0.0026, // 1 / 380
};

export function useCurrencyRates() {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Frankfurter API: Ingyenes, EKB árfolyamok
        // Lekérjük az USD bázist HUF és EUR célra
        // Megjegyzés: A Frankfurter ingyenes verziója nem mindig ad USD bázist közvetlenül,
        // ezért trükkösebb lehet, de a "https://api.frankfurter.app/latest?from=USD" működik.
        const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=HUF,EUR");
        
        if (!res.ok) throw new Error("Rate fetch failed");
        
        const data = await res.json();
        
        // Adatok feldolgozása
        const usdToHuf = data.rates.HUF;
        const usdToEur = data.rates.EUR;
        
        // Számított árfolyamok
        const eurToUsd = 1 / usdToEur;
        const hufToUsd = 1 / usdToHuf;

        setRates({
          USD_TO_HUF: usdToHuf,
          EUR_TO_USD: eurToUsd,
          HUF_TO_USD: hufToUsd,
        });
      } catch (error) {
        console.error("Failed to fetch dynamic currency rates, using fallback.", error);
        // Hiba esetén marad a DEFAULT_RATES
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return { rates, loading };
}