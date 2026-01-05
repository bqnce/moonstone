// src/components/WalletCard.tsx
"use client";

import { Copy, ExternalLink, LogOut, Plug, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { TokenData } from "@/lib/wallets/phantom";
import { TokenData as MetaMaskTokenData } from "@/lib/wallets/metamask";

// Shared token data type (both are identical)
type TokenDataUnion = TokenData | MetaMaskTokenData;

// Definíció a WalletCard prop-okhoz a type safety érdekében
interface WalletCardProps {
  name: string;
  chain: "Ethereum" | "Solana";
  theme: "orange" | "purple";
  // Állapotok
  isConnected: boolean;
  connecting: boolean;
  isInstalled?: boolean; // Csak Phantomnál használt
  // Adatok
  address: string | null | undefined;
  balance: string | null; // pl. "0.1234"
  currency: string; // pl. "ETH" vagy "SOL"
  explorerUrl: (address: string) => string; // Link generálása
  // Tokens
  tokens?: TokenDataUnion[]; // Array of tokens to display
  // Eseménykezelők
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletCard({
  name,
  chain,
  theme,
  isConnected,
  connecting,
  isInstalled = true,
  address,
  balance,
  currency,
  explorerUrl,
  tokens,
  onConnect,
  onDisconnect,
}: WalletCardProps) {
  const isMetamask = theme === "orange";
  const logo = isMetamask ? "🦊" : "👻";
  const themeClasses = isMetamask
    ? {
        bgGradient: "bg-gradient-to-br from-orange-500 to-orange-600",
        blur: "bg-orange-500/20",
        button:
          "bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20",
      }
    : {
        bgGradient: "bg-gradient-to-br from-purple-500 to-purple-600",
        blur: "bg-purple-500/20",
        button:
          "bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20",
      };

      const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        
        // Custom "Moonstone" stílusú toast
        toast.success("Address copied to clipboard", {
          duration: 3000,
          position: "bottom-center",
          
          // A megjelenés testreszabása (Dark Mode)
          style: {
            background: "#18181b", // zinc-950
            color: "#fff",
            border: "1px solid #27272a", // zinc-800
            padding: "12px 16px",
            borderRadius: "12px",
            fontSize: "0.875rem",
            fontWeight: "500",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
          
          // Az ikon színe (Emerald zöld, hogy passzoljon az Online státuszhoz)
          iconTheme: {
            primary: "#10b981", // emerald-500
            secondary: "#fff",
          },
        });
      };

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-lg transition-all duration-200 hover:shadow-xl"
    >
      {/* Decorative colorful element */}
      <div
        className={cn(
          "absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl",
          themeClasses.blur
        )}
      />
      
      <div className="relative z-10">
        {/* Wallet Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div
              className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg text-white",
                themeClasses.bgGradient
              )}
            >
              {logo}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-1">{name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  {chain}
                </span>
                {isConnected && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Wallet className="h-3 w-3" />
                    <span>Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Wallet State Section --- */}
        <div className="space-y-4">
          {isConnected && address ? (
            <div className="space-y-4">
              {/* Balance */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Balance
                </p>
                <h3 className="text-3xl font-bold">
                  {balance ? `${balance} ${currency}` : "Loading..."}
                </h3>
              </div>

              {/* Tokens Section */}
              {tokens && tokens.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    Tokens
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {tokens.map((token) => (
                      <TokenItem
                        key={token.symbol}
                        token={token}
                        theme={theme}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Wallet Address
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-lg truncate">
                    {address}
                  </code>
                  <button
                    onClick={() => handleCopy(address)}
                    className="p-2 rounded-lg transition-colors duration-150 hover:bg-accent cursor-pointer"
                    title="Copy address"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <a
                    href={explorerUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors duration-150 hover:bg-accent"
                    title="View on explorer"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={onDisconnect}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            // Connect Button / Install Warning
            <div className="space-y-4">
              {!isInstalled && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    {name} wallet is not installed. Please install the extension.
                  </p>
                </div>
              )}
              <button
                onClick={onConnect}
                disabled={!isInstalled || connecting}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isInstalled && !connecting && "cursor-pointer",
                  themeClasses.button
                )}
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Plug className="h-5 w-5" />
                    <span>Connect {name}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Token Item Component
function TokenItem({
  token,
  theme,
}: {
  token: TokenDataUnion;
  theme: "orange" | "purple";
}) {
  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "SOL":
        return "🟣";
      case "PENGU":
        return "🐧";
      case "USDC":
        return "💵";
      case "ETH":
        return "🔷";
      default:
        return "🪙";
    }
  };

  const getTokenColor = (symbol: string) => {
    switch (symbol) {
      case "SOL":
        return "from-purple-500/10 to-purple-600/10 border-purple-500/20";
      case "PENGU":
        return "from-yellow-500/10 to-orange-500/10 border-yellow-500/20";
      case "USDC":
        return "from-blue-500/10 to-cyan-500/10 border-blue-500/20";
      case "ETH":
        return "from-blue-500/10 to-indigo-500/10 border-blue-500/20";
      default:
        return theme === "orange"
          ? "from-orange-500/10 to-orange-600/10 border-orange-500/20"
          : "from-purple-500/10 to-purple-600/10 border-purple-500/20";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-gradient-to-br p-3 transition-all duration-200 hover:scale-[1.02]",
        getTokenColor(token.symbol)
      )}
    >
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getTokenIcon(token.symbol)}</span>
          <div>
            <p className="text-sm font-semibold">{token.symbol}</p>
            <p className="text-xs text-muted-foreground">
              {token.amount.toLocaleString(undefined, {
                maximumFractionDigits: 4,
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">
            ${token.usdValue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            ${token.priceUsd.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}