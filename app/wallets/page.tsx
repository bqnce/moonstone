"use client";

import { useState, useEffect, useCallback } from "react";
import { useSDK } from "@metamask/sdk-react";
import { getEthBalanceWithUsd, TokenData as MetaMaskTokenData } from "@/lib/wallets/metamask";
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

import LoadingState from "./_components/LoadingState";
import WalletsHeader from "./_components/WalletsHeader";
import WalletsGrid from "./_components/WalletsGrid";

export default function WalletsPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  // --- MetaMask State ---
  const [metamaskTokenData, setMetamaskTokenData] = useState<{
    eth: MetaMaskTokenData | null;
  }>({
    eth: null,
  });
  const { sdk, connected, connecting, account } = useSDK();

  // --- Phantom State ---
  const [phantomInstalled, setPhantomInstalled] = useState<boolean>(false);
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
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
      setMetamaskTokenData({ eth: null });
    }
  };

  // --- Phantom Logic ---

  const syncPhantomBalance = useCallback(async () => {
    if (phantomAddress) {
      try {
        const connection = connectSolanaChain();
        const solData = await getSolBalance(connection, phantomAddress);
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
      setTokenData({ sol: null, pengu: null, usdc: null });
    } catch (err) {
      console.error("Error disconnecting Phantom:", err);
      setPhantomAddress(null);
      setTokenData({ sol: null, pengu: null, usdc: null });
    }
  };

  // --- Data Preparation for UI ---

  // MetaMask Tokens & Value
  const metamaskTokens: MetaMaskTokenData[] = [];
  if (metamaskTokenData.eth) metamaskTokens.push(metamaskTokenData.eth);

  const metamaskTotalUsdValue = metamaskTokens.reduce((total, token) => {
    return total + (token.usdValue || 0);
  }, 0);

  const metamaskUsdBalance = !account || (account && metamaskTokens.length === 0)
    ? null
    : `$${metamaskTotalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  // Phantom Tokens & Value
  const phantomTokens: TokenData[] = [];
  if (tokenData.sol) phantomTokens.push(tokenData.sol);
  if (tokenData.pengu) phantomTokens.push(tokenData.pengu);
  if (tokenData.usdc) phantomTokens.push(tokenData.usdc);

  const totalUsdValue = phantomTokens.reduce((total, token) => {
    return total + (token.usdValue || 0);
  }, 0);

  const phantomUsdBalance = !phantomAddress || (phantomAddress && phantomTokens.length === 0)
    ? null
    : `$${totalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  // Wallet Configuration
  const wallets = [
    {
      id: 1,
      name: "MetaMask",
      chain: "Ethereum" as const,
      theme: "orange" as const,
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
      chain: "Solana" as const,
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
    return <LoadingState />;
  }

  return (
    <div className="p-8 space-y-6">
      <WalletsHeader />
      <WalletsGrid wallets={wallets} />
    </div>
  );
}