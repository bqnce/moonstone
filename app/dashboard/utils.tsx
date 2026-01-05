export const RATES = {
    EUR_TO_USD: 1.05,
    HUF_TO_USD: 0.0026,
    USD_TO_HUF: 382,
  };
  
  export function getTokenIcon(symbol: string): string {
    switch (symbol) {
      case "SOL": return "🟣";
      case "ETH": return "🔷";
      case "PENGU": return "🐧";
      case "USDC": return "💵";
      default: return "🪙";
    }
  }
  
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