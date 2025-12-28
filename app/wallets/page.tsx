// src/app/wallets/WalletsPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSDK } from "@metamask/sdk-react";
import { Loader2, WalletCards } from "lucide-react";
import { WalletCard } from "@/components/walletCard"; // Az új komponens importálása
import { getEthBalanceWithUsd, TokenData as MetaMaskTokenData } from "@/lib/wallets/metamask"; // Az új logika importálása
import {
  getPhantomProvider,
  connectSolanaChain,
  connectPhantomWallet,
  getSolBalance,
  autoConnectPhantom,
  disconnectPhantom,
  fetchSolanaAssetsHelius,
  TokenData,
} from "@/lib/wallets/phantom";

export default function WalletsPage() {
  const [isMounted, setIsMounted] = useState(false);
  // --- MetaMask State ---
  const [balanceMM, setBalanceMM] = useState<string | null>(null);
  const [metamaskTokenData, setMetamaskTokenData] = useState<{
    eth: MetaMaskTokenData | null;
  }>({
    eth: null,
  });
  const { sdk, connected, connecting, account, chainId, provider } = useSDK();

  // --- Phantom State ---
  const [phantomInstalled, setPhantomInstalled] = useState<boolean>(false);
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<string | null>(null);
  const [phantomConnecting, setPhantomConnecting] = useState<boolean>(false);
  const [tokenData, setTokenData] = useState<{
    sol: TokenData | null;
    pengu: TokenData | null;
    usdc: TokenData | null;
  }>({
    sol: null,
    pengu: null,
    usdc: null,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- MetaMask Logic ---

  const fetchMetamaskBalance = useCallback(async () => {
    if (account) {
      try {
        const ethData = await getEthBalanceWithUsd(account);
        setMetamaskTokenData({ eth: ethData });
      } catch (err) {
        console.error("Error fetching MetaMask balance:", err);
        setMetamaskTokenData({ eth: null });
      }
    } else {
      setMetamaskTokenData({ eth: null });
    }
  }, [account]);

  useEffect(() => {
    fetchMetamaskBalance();
  }, [fetchMetamaskBalance]);

  const connectMetamask = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn(`No accounts found`, err);
    }
  };

  const disconnectMetamask = () => {
    if (sdk) {
      sdk.terminate();
      setBalanceMM(null);
      setMetamaskTokenData({ eth: null });
    }
  };

  // --- Phantom Logic ---

  const syncPhantomBalance = useCallback(async () => {
    if (phantomAddress) {
      try {
        const connection = connectSolanaChain();
        const solData = await getSolBalance(connection, phantomAddress);
        // Balance konvertálása stringgé a WalletCard-hoz
        setSolBalance(solData.amount.toFixed(4));
        setTokenData((prev) => ({ ...prev, sol: solData }));

        // Fetch all tokens and filter for PENGU and USDC
        const allTokens = await fetchSolanaAssetsHelius(phantomAddress);
        const penguToken = allTokens.find((t) => t.symbol === "PENGU");
        const usdcToken = allTokens.find((t) => t.symbol === "USDC");

        setTokenData((prev) => ({
          ...prev,
          pengu: penguToken || null,
          usdc: usdcToken || null,
        }));
      } catch (err) {
        console.error("Error syncing SOL balance:", err);
      }
    } else {
      setSolBalance(null);
      setTokenData({ sol: null, pengu: null, usdc: null });
    }
  }, [phantomAddress]);

  // Phantom Auto-Connect Effect
  useEffect(() => {
    if (isMounted) {
      setPhantomInstalled(!!getPhantomProvider());
      const tryAutoConnect = async () => {
        try {
          const publicKey = await autoConnectPhantom();
          if (publicKey) {
            setPhantomAddress(publicKey);
            await syncPhantomBalance();
          }
        } catch (err) {
          console.debug("Phantom auto-connect failed:", err);
        }
      };
      tryAutoConnect();
    }
  }, [isMounted, syncPhantomBalance]);

  // Phantom Periodic Sync Effect
  useEffect(() => {
    if (phantomAddress) {
      syncPhantomBalance();
      const interval = setInterval(syncPhantomBalance, 30 * 60 * 1000); // Sync every 30 minutes
      return () => clearInterval(interval);
    }
  }, [phantomAddress, syncPhantomBalance]);

  const connectPhantom = async () => {
    try {
      setPhantomConnecting(true);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("phantom_manual_disconnect");
      }
      const walletAddress = await connectPhantomWallet();

      if (walletAddress) {
        setPhantomAddress(walletAddress);
        // Balance sync azonnal csatlakozás után
        await syncPhantomBalance();
        await fetchSolanaAssetsHelius(walletAddress);
      }
    } catch (err) {
      console.error("Error connecting Phantom:", err);
    } finally {
      setPhantomConnecting(false);
    }
  };

  const disconnectPhantomWallet = async () => {
    try {
      await disconnectPhantom();
      setPhantomAddress(null);
      setSolBalance(null);
      setTokenData({ sol: null, pengu: null, usdc: null });
    } catch (err) {
      console.error("Error disconnecting Phantom:", err);
      // Állapot törlése még akkor is, ha a disconnect hiba
      setPhantomAddress(null);
      setSolBalance(null);
      setTokenData({ sol: null, pengu: null, usdc: null });
    }
  };

  // Convert MetaMask tokenData object to array for WalletCard
  const metamaskTokens: MetaMaskTokenData[] = [];
  if (metamaskTokenData.eth) metamaskTokens.push(metamaskTokenData.eth);

  // Calculate total USD value from all MetaMask tokens
  const metamaskTotalUsdValue = metamaskTokens.reduce((total, token) => {
    return total + (token.usdValue || 0);
  }, 0);

  // Format total USD balance for MetaMask
  const metamaskUsdBalance = !account || (account && metamaskTokens.length === 0)
    ? null // No account or still loading tokens
    : `$${metamaskTotalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  // Convert tokenData object to array for WalletCard
  const phantomTokens: TokenData[] = [];
  if (tokenData.sol) phantomTokens.push(tokenData.sol);
  if (tokenData.pengu) phantomTokens.push(tokenData.pengu);
  if (tokenData.usdc) phantomTokens.push(tokenData.usdc);

  // Calculate total USD value from all tokens
  const totalUsdValue = phantomTokens.reduce((total, token) => {
    return total + (token.usdValue || 0);
  }, 0);

  // Format total USD balance
  // Show null if: no address OR address exists but tokens haven't loaded yet
  const phantomUsdBalance = !phantomAddress || (phantomAddress && phantomTokens.length === 0)
    ? null // No address or still loading tokens
    : `$${totalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  // A kártyák definíciója a WalletCard komponenshez
  const wallets = [
    {
      id: 1,
      name: "MetaMask",
      chain: "Ethereum",
      theme: "orange" as const, // 'as const' a type safety érdekében
      isConnected: connected,
      connecting: connecting,
      address: account,
      balance: metamaskUsdBalance,
      currency: "USD",
      explorerUrl: (addr: string) => `https://etherscan.io/address/${addr}`,
      tokens: metamaskTokens.length > 0 ? metamaskTokens : undefined,
      onConnect: connectMetamask,
      onDisconnect: disconnectMetamask,
    },
    {
      id: 2,
      name: "Phantom",
      chain: "Solana",
      theme: "purple" as const,
      isConnected: !!phantomAddress,
      connecting: phantomConnecting,
      isInstalled: phantomInstalled,
      address: phantomAddress,
      balance: phantomUsdBalance,
      currency: "USD",
      explorerUrl: (addr: string) => `https://solscan.io/address/${addr}`,
      tokens: phantomTokens.length > 0 ? phantomTokens : undefined,
      onConnect: connectPhantom,
      onDisconnect: disconnectPhantomWallet,
    },
  ];

  if (!isMounted) {
    return (
      <div className="p-8 space-y-6 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xl text-muted-foreground">Loading Wallets...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallets</h1>
        <p className="text-muted-foreground">
          Connect and manage your crypto wallets for Ethereum and Solana
        </p>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            name={wallet.name}
            chain={wallet.chain as "Ethereum" | "Solana"}
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
    </div>
  );
}
