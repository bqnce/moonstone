// src/lib/wallets/metamask.ts
import { ethers } from "ethers";

export interface TokenData {
  symbol: string;
  name: string;
  amount: number;
  priceUsd: number;
  usdValue: number;
  contractAddress?: string;
  decimals?: number;
}

/**
 * Lekéri az ETH egyenleget ÉS az összes ERC-20 tokent az Alchemy Enhanced API segítségével.
 */
export async function fetchEthereumAssets(
  walletAddress: string
): Promise<TokenData[]> {
  const assets: TokenData[] = [];
  let provider: ethers.JsonRpcProvider | null = null;

  try {
    const alchemyRpc = process.env.NEXT_PUBLIC_ALCHEMY_ETH_RPC;
    if (!alchemyRpc) {
      throw new Error("Alchemy RPC URL is not defined");
    }
    provider = new ethers.JsonRpcProvider(alchemyRpc);

    // ---------------------------------------------------------
    // 1. LÉPÉS: Native ETH Balance
    // ---------------------------------------------------------
    const balanceWei = await provider.getBalance(walletAddress);
    const ethAmount = Number(ethers.formatEther(balanceWei));

    // ETH Ár lekérése CoinGecko-tól
    let ethPrice = 0;
    try {
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
      );
      const priceData = await priceRes.json();
      ethPrice = priceData.ethereum?.usd ?? 0;
    } catch (e) {
      console.warn("ETH price fetch failed");
    }

    const formattedEthPrice = ethPrice >= 1 ? Math.round(ethPrice) : ethPrice;
    const ethUsdValue = Math.round(ethAmount * ethPrice);
    
    assets.push({
      symbol: "ETH",
      name: "Ethereum",
      amount: ethAmount,
      priceUsd: formattedEthPrice,
      usdValue: ethUsdValue,
      decimals: 18,
    });

    // ---------------------------------------------------------
    // 2. LÉPÉS: ERC-20 Tokenek (Alchemy)
    // ---------------------------------------------------------
    try {
      const tokenBalancesResponse: any = await provider.send("alchemy_getTokenBalances", [
        walletAddress,
        { type: ["erc20"] },
      ]);

      const rawTokens = tokenBalancesResponse.tokenBalances.filter((t: any) => {
        return (
          t.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000" && 
          Number(t.tokenBalance) !== 0
        );
      });

      if (rawTokens.length > 0) {
        // Metaadatok
        const tokensWithMetadata = await Promise.all(
          rawTokens.map(async (t: any) => {
            try {
              const metadata: any = await provider!.send("alchemy_getTokenMetadata", [
                t.contractAddress,
              ]);
              
              if (!metadata.decimals) return null;

              const balance = BigInt(t.tokenBalance);
              const amount = Number(balance) / Math.pow(10, metadata.decimals);

              return {
                contractAddress: t.contractAddress,
                symbol: metadata.symbol || "UNKNOWN",
                name: metadata.name || "Unknown Token",
                amount: amount,
                decimals: metadata.decimals,
              };
            } catch (e) {
              console.error("Failed to parse token metadata", t.contractAddress);
              return null;
            }
          })
        );

        const validTokens = tokensWithMetadata.filter((t): t is any => t !== null);

        // Árak lekérése
        const contractAddresses = validTokens.map((t) => t.contractAddress).join(",");
        let prices: Record<string, { usd: number }> = {};
        
        if (contractAddresses) {
          try {
            const pricesRes = await fetch(
              `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddresses}&vs_currencies=usd`
            );
            prices = await pricesRes.json();
          } catch (e) {
            console.warn("Token prices fetch failed");
          }
        }

        // Összeállítás
        validTokens.forEach((token) => {
          const rawPrice = prices[token.contractAddress.toLowerCase()]?.usd ?? 0;
          
          // 🟢 KEREKÍTÉS TOKENEKRE IS
          // Ha az ár nagyon kicsi (pl. PEPE), hagyjuk meg a tizedeseket, egyébként 2 tizedes
          const formattedPrice = rawPrice > 1 ? Number(rawPrice.toFixed(2)) : rawPrice;
          
          // Total Value mindig 2 tizedes
          const formattedUsdValue = Number((token.amount * rawPrice).toFixed(2));

          assets.push({
            symbol: token.symbol,
            name: token.name,
            amount: token.amount,
            priceUsd: formattedPrice,
            usdValue: formattedUsdValue,
            contractAddress: token.contractAddress,
          });
        });
      }
    } catch (erc20Error) {
      console.warn("Failed to fetch ERC-20 tokens, displaying ETH only:", erc20Error);
    }

    return assets.sort((a, b) => b.usdValue - a.usdValue);

  } catch (error) {
    console.error("Critical error in MetaMask fetch:", error);
    if (assets.length > 0) return assets;
    return [{ symbol: "ETH", name: "Ethereum", amount: 0, priceUsd: 0, usdValue: 0 }];
  }
}