import {
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  PublicKey,
} from "@solana/web3.js";

export function getPhantomProvider() {
  if (typeof window === "undefined") return null;

  const provider = (window as any).solana;

  if (provider?.isPhantom) {
    return provider;
  }

  return null;
}

export function connectSolanaChain() {
  return new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
  });
}

export async function connectPhantomWallet() {
  const provider = getPhantomProvider();
  if (!provider) {
    alert("Phantom Wallet nincs telepítve");
    return null;
  }

  // Manual connection - don't use onlyIfTrusted, let user approve
  const response = await provider.connect();
  return response.publicKey.toString();
}

export interface TokenData {
  symbol: string;
  name: string;
  amount: number;
  priceUsd: number;
  usdValue: number;
}

export async function getSolBalance(
  connection: Connection,
  walletAddress: string
): Promise<TokenData> {
  try {
    const publicKey = new PublicKey(walletAddress);

    const balanceInLamports = await connection.getBalance(
      publicKey,
      "confirmed"
    );

    const solAmount = balanceInLamports / LAMPORTS_PER_SOL;

    // 🔹 SOL ár Heliusból
    const heliusRpc = process.env.NEXT_PUBLIC_SOLANA_RPC;

    let priceUsd = 0;
    let usdValue = 0;

    if (!heliusRpc) {
      console.warn("Helius RPC URL is not defined");
      // Return with 0 price if RPC is not available
      return {
        symbol: "SOL",
        name: "Solana",
        amount: solAmount,
        priceUsd: 0,
        usdValue: 0,
      };
    }

    try {
      const response = await fetch(heliusRpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "helius-sol-price",
          method: "getAsset",
          params: {
            id: "So11111111111111111111111111111111111111112",
          },
        }),
      });

      const data = await response.json();

      priceUsd =
        data.result?.token_info?.price_info?.price_per_token ?? 0;

      usdValue = Math.ceil(solAmount * priceUsd);

      console.log("🟣 SOL:", {
        symbol: "SOL",
        amount: solAmount,
        priceUsd,
        usdValue,
      });
    } catch (priceError) {
      console.warn("SOL price fetch failed, balance still valid");
    }

    // ✅ Return TokenData object
    return {
      symbol: "SOL",
      name: "Solana",
      amount: solAmount,
      priceUsd,
      usdValue,
    };
  } catch (error) {
    console.error("Failed to fetch SOL balance:", error);
    // Return empty TokenData on error
    return {
      symbol: "SOL",
      name: "Solana",
      amount: 0,
      priceUsd: 0,
      usdValue: 0,
    };
  }
}

export async function autoConnectPhantom() {
  const provider = getPhantomProvider();
  if (!provider) return null;

  // Check if user manually disconnected
  if (
    typeof window !== "undefined" &&
    sessionStorage.getItem("phantom_manual_disconnect") === "true"
  ) {
    return null;
  }

  try {
    const resp = await provider.connect({
      onlyIfTrusted: true,
    });

    return resp.publicKey.toString();
  } catch {
    return null;
  }
}

export async function disconnectPhantom() {
  const provider = getPhantomProvider();
  if (!provider) return;

  try {
    await provider.disconnect();
    // Mark that user manually disconnected
    if (typeof window !== "undefined") {
      sessionStorage.setItem("phantom_manual_disconnect", "true");
    }
  } catch (err) {
    console.error("Error disconnecting Phantom:", err);
  }
}

export async function parseAndLogHeliusTokens(
  heliusResponse: any
): Promise<TokenData[]> {
  try {
    const items = heliusResponse.result.items;

    if (!items || items.length === 0) {
      console.log("No SPL tokens found");
      return [];
    }

    // 1️⃣ csak fungible tokenek
    const tokens = items.filter(
      (item: any) => item.interface === "FungibleToken"
    );

    const tokenData: TokenData[] = [];

    for (const token of tokens) {
      const symbol = token.content?.metadata?.symbol ?? "UNKNOWN";
      const name = token.content?.metadata?.name ?? symbol;

      const rawBalance = token.token_info.balance;
      const decimals = token.token_info.decimals;
      const amount = rawBalance / Math.pow(10, decimals);

      // 2️⃣ USD ár HELIUSBÓL
      let priceUsd = 0;

      // 🟢 stablecoin fast-path
      if (symbol === "USDC" || symbol === "USDT") {
        priceUsd = 1;
      } else {
        priceUsd =
          token.token_info?.price_info?.price_per_token ?? 0;
      }

      const usdValue = Math.round(amount * priceUsd);

      console.log("🪙 Token:", {
        name,
        symbol,
        amount,
        priceUsd,
        usdValue,
      });

      tokenData.push({
        symbol,
        name,
        amount,
        priceUsd,
        usdValue,
      });
    }

    return tokenData;
  } catch (error) {
    console.error("Error parsing Helius tokens:", error);
    return [];
  }
}


export async function fetchSolanaAssetsHelius(
  walletAddress: string
): Promise<TokenData[]> {
  try {
    const heliusRpc = process.env.NEXT_PUBLIC_SOLANA_RPC;

    if (!heliusRpc) {
      throw new Error("Helius RPC URL is not defined");
    }

    const publicKey = new PublicKey(walletAddress);

    const response = await fetch(heliusRpc, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "helius-assets",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: publicKey.toBase58(),
          page: 1,
          limit: 1000,
          displayOptions: {
            showFungible: true,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Helius error: ${response.status}`);
    }

    const data = await response.json();

    console.log("🔥 Helius raw assets response:", data);

    // ✅ Return token data
    return await parseAndLogHeliusTokens(data);

  } catch (error) {
    console.error("❌ Error fetching Solana assets via Helius:", error);
    return [];
  }
}
