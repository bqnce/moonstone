"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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
  
  // MetaMask State
  const [metamaskTokenData, setMetamaskTokenData] = useState<{
    eth: MetaMaskTokenData | null;
  }>({
    eth: null,
  });
  const { sdk, connected, connecting, account } = useSDK();

  // Phantom State
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

  const disconnectMetamaskHandler = () => {
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
      setTokenData({ sol: null, pengu: null, usdc: null });
    } catch (err) {
      console.error("Error disconnecting Phantom:", err);
      setPhantomAddress(null);
      setTokenData({ sol: null, pengu: null, usdc: null });
    }
  };

  // Calculate values
  const metamaskTokens: MetaMaskTokenData[] = [];
  if (metamaskTokenData.eth) metamaskTokens.push(metamaskTokenData.eth);

  const metamaskTotalUsd = metamaskTokens.reduce((total, token) => {
    return total + (token.usdValue || 0);
  }, 0);

  const phantomTokens: TokenData[] = [];
  if (tokenData.sol) phantomTokens.push(tokenData.sol);
  if (tokenData.pengu) phantomTokens.push(tokenData.pengu);
  if (tokenData.usdc) phantomTokens.push(tokenData.usdc);

  const phantomTotalUsd = phantomTokens.reduce((total, token) => {
    return total + (token.usdValue || 0);
  }, 0);

  const allTokens = [...metamaskTokens, ...phantomTokens];
  const totalPortfolioValue = metamaskTotalUsd + phantomTotalUsd;

  return (
    <WalletContext.Provider
      value={{
        // MetaMask
        metamaskConnected: connected,
        metamaskConnecting: connecting,
        metamaskAccount: account || null,
        metamaskTokens,
        metamaskTotalUsd,
        connectMetamask,
        disconnectMetamask: disconnectMetamaskHandler,
        
        // Phantom
        phantomInstalled,
        phantomConnected: !!phantomAddress,
        phantomConnecting,
        phantomAddress,
        phantomTokens,
        phantomTotalUsd,
        connectPhantom: connectPhantomHandler,
        disconnectPhantomWallet: disconnectPhantomWalletHandler,
        
        // Combined
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

