"use client";

import React from "react";
import { WalletCard } from "@/app/wallets/_components/walletCard";
import ConnectWalletCard from "@/app/wallets/_components/ConnectWalletCard"; // <--- Import
import { TokenData } from "@/lib/wallets/phantom";
import { TokenData as MetaMaskTokenData } from "@/lib/wallets/metamask";
import metamaskIcon from "@/images/metamask.png";
import phantomIcon from "@/images/phantom.png";

// Közös Token típus definíció (ha nincs külön fájlban)
type TokenDataUnion = TokenData | MetaMaskTokenData;

interface WalletConfig {
  id: number;
  name: string;
  chain: "Ethereum" | "Solana";
  theme: "orange" | "purple";
  isConnected: boolean;
  connecting: boolean;
  isInstalled?: boolean;
  address: string | null | undefined;
  balance: string | null;
  currency: string;
  explorerUrl: (addr: string) => string;
  tokens?: TokenDataUnion[];
  onConnect: () => void;
  onDisconnect: () => void;
}

interface WalletsGridProps {
  wallets: WalletConfig[];
}

export default function WalletsGrid({ wallets }: WalletsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {wallets.map((wallet) => {
        
        // ITT A LÉNYEG: Ha nincs csatlakoztatva, a "Szép" kártyát mutatjuk
        if (!wallet.isConnected) {
          return (
            <ConnectWalletCard
              key={wallet.id}
              name={wallet.name}
              theme={wallet.theme}
              isConnecting={wallet.connecting}
              onConnect={wallet.onConnect}
              // Ikonok és Leírások dinamikusan
              iconSrc={wallet.name === "MetaMask" ? metamaskIcon.src : phantomIcon.src}
              description={
                wallet.name === "MetaMask"
                  ? "The most popular wallet for Ethereum. Connect to track your ETH and tokens automatically."
                  : "The friendly wallet for Solana. Connect to view your SOL balance and SPL tokens securely."
              }
            />
          );
        }

        // Ha csatlakoztatva van, marad a részletes nézet
        return (
          <WalletCard
            key={wallet.id}
            name={wallet.name}
            chain={wallet.chain}
            theme={wallet.theme}
            isConnected={wallet.isConnected}
            connecting={wallet.connecting}
            isInstalled={wallet.isInstalled}
            address={wallet.address}
            balance={wallet.balance}
            currency={wallet.currency}
            explorerUrl={wallet.explorerUrl}
            tokens={wallet.tokens}
            onConnect={wallet.onConnect}
            onDisconnect={wallet.onDisconnect}
          />
        );
      })}
    </div>
  );
}