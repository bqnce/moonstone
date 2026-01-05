// src/app/wallets/contexts/WalletContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSDK } from "@metamask/sdk-react";
import {
  fetchEthereumAssets,
  TokenData as MetaMaskTokenData,
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

interface WalletContextType {
  // MetaMask
  metamaskConnected: boolean;
  metamaskConnecting: boolean;
  metamaskAccount: string | null;
  metamaskTokens: MetaMaskTokenData[];
  metamaskTotalUsd: number;
  connectMetamask: () => Promise<void>;
  disconnectMetamask: () => void;

  // Phantom
  phantomInstalled: boolean;
  phantomConnected: boolean;
  phantomConnecting: boolean;
  phantomAddress: string | null;
  phantomTokens: TokenData[];
  phantomTotalUsd: number;
  connectPhantom: () => Promise<void>;
  disconnectPhantomWallet: () => Promise<void>;

  // Combined
  allTokens: (TokenData | MetaMaskTokenData)[];
  totalPortfolioValue: number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  // --- MetaMask State ---
  const [metamaskTokensList, setMetamaskTokensList] = useState<MetaMaskTokenData[]>([]);
  const { sdk, connected, connecting, account } = useSDK();

  // --- Phantom State ---
  const [phantomInstalled, setPhantomInstalled] = useState<boolean>(false);
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [phantomConnecting, setPhantomConnecting] = useState<boolean>(false);
  const [solBalanceData, setSolBalanceData] = useState<TokenData | null>(null);
  const [phantomTokensList, setPhantomTokensList] = useState<TokenData[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- MetaMask Logic ---
  const fetchMetamaskBalance = useCallback(async () => {
    if (account) {
      try {
        const assets = await fetchEthereumAssets(account);
        setMetamaskTokensList(assets);
      } catch (err) {
        console.error("Error fetching MetaMask assets:", err);
        setMetamaskTokensList([]);
      }
    } else {
      setMetamaskTokensList([]);
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

  const disconnectMetamaskHandler = () => {
    if (sdk) {
      sdk.terminate();
      setMetamaskTokensList([]);
    }
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
      } catch (err) {
        console.error("Error syncing SOL balance:", err);
      }
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
        } catch (err) {
          console.debug("Phantom auto-connect failed:", err);
        }
      };
      tryAutoConnect();
    }
  }, [isMounted, syncPhantomBalance]);

  useEffect(() => {
    if (phantomAddress) {
      syncPhantomBalance();
      const interval = setInterval(syncPhantomBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [phantomAddress, syncPhantomBalance]);

  const connectPhantomHandler = async () => {
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

  const disconnectPhantomWalletHandler = async () => {
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

  // --- Calculate Values & Sorting ---

  // 1. MetaMask Data
  const metamaskTokens = [...metamaskTokensList].sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));

  // 🟢 KEREKÍTÉS: Total USD kerekítése 2 tizedesre
  const rawMetamaskTotal = metamaskTokens.reduce((total, token) => total + (token.usdValue || 0), 0);
  const metamaskTotalUsd = Number(rawMetamaskTotal.toFixed(2));

  // 2. Phantom Data
  const phantomTokens: TokenData[] = [];
  if (solBalanceData) phantomTokens.push(solBalanceData);
  phantomTokens.push(...phantomTokensList);
  
  phantomTokens.sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));

  // 🟢 KEREKÍTÉS: Phantom Total kerekítése
  const rawPhantomTotal = phantomTokens.reduce((total, token) => total + (token.usdValue || 0), 0);
  const phantomTotalUsd = Number(rawPhantomTotal.toFixed(2));

  // 3. Global Totals
  const allTokens = [...metamaskTokens, ...phantomTokens].sort(
    (a, b) => (b.usdValue || 0) - (a.usdValue || 0)
  );

  // 🟢 KEREKÍTÉS: A végső érték kerekítése
  const totalPortfolioValue = Number((metamaskTotalUsd + phantomTotalUsd).toFixed(2));

  return (
    <WalletContext.Provider
      value={{
        metamaskConnected: connected,
        metamaskConnecting: connecting,
        metamaskAccount: account || null,
        metamaskTokens,
        metamaskTotalUsd,
        connectMetamask,
        disconnectMetamask: disconnectMetamaskHandler,

        phantomInstalled,
        phantomConnected: !!phantomAddress,
        phantomConnecting,
        phantomAddress,
        phantomTokens,
        phantomTotalUsd,
        connectPhantom: connectPhantomHandler,
        disconnectPhantomWallet: disconnectPhantomWalletHandler,

        allTokens,
        totalPortfolioValue,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}