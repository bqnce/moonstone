"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck } from "lucide-react"; // Csak ami kell
import { useSDK } from "@metamask/sdk-react";
import { 
  fetchEthereumAssets, 
  TokenData as MetaMaskTokenData 
} from "@/lib/wallets/metamask";
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
  const [metamaskTokens, setMetamaskTokens] = useState<MetaMaskTokenData[]>([]);
  const { sdk, connected, connecting, account } = useSDK();

  // --- Phantom State ---
  const [phantomInstalled, setPhantomInstalled] = useState<boolean>(false);
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [phantomConnecting, setPhantomConnecting] = useState<boolean>(false);
  
  const [solBalanceData, setSolBalanceData] = useState<TokenData | null>(null);
  const [phantomTokensList, setPhantomTokensList] = useState<TokenData[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  // --- MetaMask Logic ---
  const fetchMetamaskBalance = useCallback(async () => {
    if (account) {
      try {
        const assets = await fetchEthereumAssets(account);
        setMetamaskTokens(assets);
      } catch (err) {
        console.error("Error fetching MetaMask balance:", err);
        setMetamaskTokens([]);
      }
    } else {
      setMetamaskTokens([]);
    }
  }, [account]);

  useEffect(() => { fetchMetamaskBalance(); }, [fetchMetamaskBalance]);

  const connectMetamask = async () => {
    try { await sdk?.connect(); } catch (err) { console.warn(`No accounts found`, err); }
  };

  const disconnectMetamask = () => {
    if (sdk) { sdk.terminate(); setMetamaskTokens([]); }
  };

  // --- Phantom Logic ---
  const syncPhantomBalance = useCallback(async () => {
    if (phantomAddress) {
      try {
        const connection = connectSolanaChain();
        const solData = await getSolBalance(connection, phantomAddress);
        setSolBalanceData(solData);
        const allTokens = await fetchSolanaAssetsHelius(phantomAddress);
        setPhantomTokensList(allTokens);
      } catch (err) { console.error("Error syncing SOL balance:", err); }
    } else {
      setSolBalanceData(null);
      setPhantomTokensList([]);
    }
  }, [phantomAddress]);

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
        } catch (err) { console.debug("Phantom auto-connect failed:", err); }
      };
      tryAutoConnect();
    }
  }, [isMounted, syncPhantomBalance]);

  useEffect(() => {
    if (phantomAddress) {
      syncPhantomBalance();
      const interval = setInterval(syncPhantomBalance, 30 * 60 * 1000); 
      return () => clearInterval(interval);
    }
  }, [phantomAddress, syncPhantomBalance]);

  const connectPhantom = async () => {
    try {
      setPhantomConnecting(true);
      if (typeof window !== "undefined") sessionStorage.removeItem("phantom_manual_disconnect");
      const walletAddress = await connectPhantomWallet();
      if (walletAddress) {
        setPhantomAddress(walletAddress);
        await syncPhantomBalance();
        await fetchSolanaAssetsHelius(walletAddress);
      }
    } catch (err) { console.error("Error connecting Phantom:", err); } finally { setPhantomConnecting(false); }
  };

  const disconnectPhantomWallet = async () => {
    try {
      await disconnectPhantom();
      setPhantomAddress(null);
      setSolBalanceData(null);
      setPhantomTokensList([]);
    } catch (err) {
      console.error("Error disconnecting Phantom:", err);
      setPhantomAddress(null);
      setSolBalanceData(null);
      setPhantomTokensList([]);
    }
  };

  // --- Data Preparation ---
  const sortedMetamaskTokens = [...metamaskTokens].sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
  const metamaskTotalUsdValue = sortedMetamaskTokens.reduce((total, token) => total + (token.usdValue || 0), 0);
  const metamaskUsdBalance = !account || (account && sortedMetamaskTokens.length === 0)
    ? null
    : `$${metamaskTotalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const phantomTokens: TokenData[] = [];
  if (solBalanceData) phantomTokens.push(solBalanceData);
  phantomTokens.push(...phantomTokensList);
  phantomTokens.sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
  const totalUsdValue = phantomTokens.reduce((total, token) => total + (token.usdValue || 0), 0);
  const phantomUsdBalance = !phantomAddress || (phantomAddress && phantomTokens.length === 0)
    ? null
    : `$${totalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

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
      tokens: sortedMetamaskTokens.length > 0 ? sortedMetamaskTokens : undefined,
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

  if (!isMounted) return <LoadingState />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Crypto Wallets</h1>
          <p className="text-zinc-400">Connect your Web3 wallets to track assets.</p>
        </div>
      </div>

      {/* Grid View (Always renders) */}
      <WalletsGrid wallets={wallets} />

      {/* Footer Info (Csak akkor mutatjuk, ha van valami disconnectelve, hogy ne legyen zavaró) */}
      {(!connected || !phantomAddress) && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-zinc-500 text-xs bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/50">
            <ShieldCheck className="w-3 h-3" />
            <span>Your private keys never leave your device. Read-only access.</span>
          </div>
        </div>
      )}
    </div>
  );
}