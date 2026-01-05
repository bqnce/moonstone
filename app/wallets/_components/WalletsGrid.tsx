import React from "react";
import { WalletCard } from "@/app/wallets/_components/walletCard";
import { TokenData } from "@/lib/wallets/metamask"; // Vagy a közös típus definíció helye

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
  tokens?: TokenData[];
  onConnect: () => void;
  onDisconnect: () => void;
}

interface WalletsGridProps {
  wallets: WalletConfig[];
}

export default function WalletsGrid({ wallets }: WalletsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {wallets.map((wallet) => (
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
      ))}
    </div>
  );
}