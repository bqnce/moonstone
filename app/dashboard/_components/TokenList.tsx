import React from "react";
import { Coins } from "lucide-react";
import { TokenDisplayData } from "../types";

interface TokenListProps {
  tokens: TokenDisplayData[];
}

export default function TokenList({ tokens }: TokenListProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-semibold text-white">Your Tokens</h2>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          {tokens.length} token{tokens.length !== 1 ? "s" : ""} in your
          connected wallets
        </p>
      </div>

      <div className="divide-y divide-zinc-800">
        {tokens.length === 0 ? (
          <div className="p-12 text-center">
            <Coins className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">
              No tokens found. Connect your wallets to see your portfolio.
            </p>
          </div>
        ) : (
          tokens.map((token) => (
            <div
              key={token.id}
              className="p-6 hover:bg-zinc-800/50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Token Icon */}
                  <div className="h-12 w-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl">
                    {token.icon}
                  </div>

                  {/* Token Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-white">
                        {token.name}
                      </h3>
                      <span className="text-sm text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">
                        {token.symbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>
                        {token.amount.toLocaleString("en-US", {
                          maximumFractionDigits: 4,
                        })}{" "}
                        {token.symbol}
                      </span>
                      <span className="text-zinc-600">
                        @ $
                        {token.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Value */}
                <div className="text-right">
                  <p className="font-bold text-lg text-white mb-1">
                    $
                    {token.value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}