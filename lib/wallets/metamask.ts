// src/lib/wallets/metamask.ts
import { ethers } from "ethers";

export interface TokenData {
  symbol: string;
  name: string;
  amount: number;
  priceUsd: number;
  usdValue: number;
}

export async function getEthBalanceWithUsd(
  walletAddress: string
): Promise<TokenData> {
  try {
    const alchemyRpc = process.env.NEXT_PUBLIC_ALCHEMY_ETH_RPC;

    if (!alchemyRpc) {
      throw new Error("Alchemy RPC URL is not defined");
    }

    const provider = new ethers.JsonRpcProvider(alchemyRpc);

    // 🔹 ETH balance
    const balanceWei = await provider.getBalance(walletAddress);
    const ethAmount = Number(ethers.formatEther(balanceWei));

    // 🔹 ETH price USD – CoinGecko fallback
    let priceUsd = 0;
    let usdValue = 0;

    try {
      // CoinGecko
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
      );
      const priceData = await priceRes.json();
      priceUsd = priceData.ethereum?.usd ?? 0;

      usdValue = Math.ceil(ethAmount * priceUsd);

      console.log("🟦 ETH:", {
        symbol: "ETH",
        amount: ethAmount,
        priceUsd,
        usdValue,
      });
    } catch (priceError) {
      console.warn("ETH price fetch failed, balance still valid");
    }

    // ✅ Return TokenData object
    return {
      symbol: "ETH",
      name: "Ethereum",
      amount: ethAmount,
      priceUsd,
      usdValue,
    };
  } catch (error) {
    console.error("Failed to fetch ETH balance via Alchemy:", error);
    return {
      symbol: "ETH",
      name: "Ethereum",
      amount: 0,
      priceUsd: 0,
      usdValue: 0,
    };
  }
}
