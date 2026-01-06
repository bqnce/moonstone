"use client";

import Image from "next/image"; // <--- Importáltuk az Image-t
import { Copy, ExternalLink, LogOut, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { TokenData } from "@/lib/wallets/phantom";
import { TokenData as MetaMaskTokenData } from "@/lib/wallets/metamask";
import phantomIcon from "@/images/phantom.png";
import metamaskIcon from "@/images/metamask.png";

type TokenDataUnion = TokenData | MetaMaskTokenData;

interface WalletCardProps {
  name: string;
  chain: "Ethereum" | "Solana";
  theme: "orange" | "purple";
  isConnected: boolean;
  connecting: boolean;
  isInstalled?: boolean;
  address: string | null | undefined;
  balance: string | null;
  currency: string;
  explorerUrl: (address: string) => string;
  tokens?: TokenDataUnion[];
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

  // ITT A VÁLTOZÁS: Emojik helyett kép útvonalak
  // Győződj meg róla, hogy a fájlnevek pontosak a public/images mappában!
  const logoSrc = isMetamask ? metamaskIcon.src : phantomIcon.src;

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
    toast.success("Address copied to clipboard", {
      duration: 3000,
      position: "bottom-center",
      style: {
        background: "#18181b",
        color: "#fff",
        border: "1px solid #27272a",
        padding: "12px 16px",
        borderRadius: "12px",
        fontSize: "0.875rem",
        fontWeight: "500",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      },
      iconTheme: {
        primary: "#10b981",
        secondary: "#fff",
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-lg transition-all duration-200 hover:shadow-xl hover:border-zinc-700">
      {/* Háttér homály (Blur) */}
      <div
        className={cn(
          "absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-50 pointer-events-none",
          themeClasses.blur
        )}
      />

      <div className="relative z-10">
        {/* Wallet Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Logo Container - Most már KÉPET tartalmaz */}
            <div
              className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden shrink-0",
                themeClasses.bgGradient
              )}
            >
              <Image
                src={logoSrc}
                alt={name}
                width={32}
                height={32}
                className="object-contain select-none"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {chain}
                </span>
                {isConnected && (
                  <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1">
                  Total Balance
                </p>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {balance ? (
                    `${balance}`
                  ) : (
                    <span className="text-zinc-600">Loading...</span>
                  )}
                </h3>
              </div>

              {/* Tokens Section */}
              {tokens && tokens.length > 0 && (
                <div className="pt-4 border-t border-zinc-800/50">
                  <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">
                    Assets
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
              <div className="pt-4 border-t border-zinc-800/50">
                <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">
                  Wallet Address
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-zinc-300 truncate">
                    {address}
                  </code>
                  <button
                    onClick={() => handleCopy(address)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700"
                    title="Copy address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={explorerUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700"
                    title="View on explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={onDisconnect}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer mt-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            // Connect Button (Ez ritkán látszik itt, mert a Grid kezeli, de fallbacknek jó)
            <div className="space-y-4">{/* ... Connect logic ... */}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Token Item Helper Component
function TokenItem({
  token,
  theme,
}: {
  token: TokenDataUnion;
  theme: "orange" | "purple";
}) {
  // Itt is lecserélheted az ikonokat képekre, ha szeretnéd,
  // de a tokeneknél az emojik vagy URL-es képek (API-ból) általában jobbak.
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
    // ... szín logika marad a régi ...
    return "bg-zinc-900 border-zinc-800 hover:border-zinc-700";
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 transition-all duration-200 hover:bg-zinc-800 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl group-hover:scale-110 transition-transform">
            {getTokenIcon(token.symbol)}
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{token.symbol}</p>
            <p className="text-xs text-zinc-500">
              {token.amount.toLocaleString(undefined, {
                maximumFractionDigits: 4,
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white">
            ${token.usdValue.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500">
            $
            {token.priceUsd.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
