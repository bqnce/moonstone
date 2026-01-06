"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Wallet, ArrowRight, Loader2 } from "lucide-react";

interface ConnectWalletCardProps {
  name: string;
  theme: "orange" | "purple";
  description: string;
  isConnecting: boolean;
  onConnect: () => void;
  iconSrc: string;
}

export default function ConnectWalletCard({
  name,
  theme,
  description,
  isConnecting,
  onConnect,
  iconSrc
}: ConnectWalletCardProps) {
  
  // Állapot a képbetöltési hiba kezelésére
  const [imageError, setImageError] = useState(false);

  const themeStyles = theme === "orange" 
    ? {
        border: "hover:border-orange-500/50",
        bgBlur: "bg-orange-500/5",
        bgBlurHover: "group-hover:bg-orange-500/10",
        text: "text-orange-500",
        textAccent: "text-orange-400",
      }
    : {
        border: "hover:border-purple-500/50",
        bgBlur: "bg-purple-500/5",
        bgBlurHover: "group-hover:bg-purple-500/10",
        text: "text-purple-500",
        textAccent: "text-purple-400",
      };

  return (
    <button 
      onClick={onConnect}
      disabled={isConnecting}
      className={`group w-full text-left bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 ${themeStyles.border} rounded-2xl p-8 transition-all duration-300 relative overflow-hidden h-full flex flex-col`}
    >
      <div className={`absolute top-0 right-0 p-32 rounded-full blur-3xl -mr-12 -mt-12 transition-all ${themeStyles.bgBlur} ${themeStyles.bgBlurHover}`} />
      
      <div className="relative z-10 flex flex-col flex-1">
        <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg relative">
           
           {/* LOGIKA JAVÍTVA: Vagy kép, vagy ikon */}
           {!imageError ? (
             <Image 
              src={iconSrc} 
              alt={name} 
              width={32} 
              height={32}
              className="object-contain"
              onError={() => setImageError(true)} 
            /> 
           ) : (
            // Csak akkor jelenik meg, ha a kép hibás
            <Wallet className={`w-6 h-6 ${themeStyles.text}`} /> 
           )}

        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">Connect {name}</h3>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed flex-1">
          {description}
        </p>
        
        <div className={`flex items-center text-sm font-bold tracking-wide uppercase ${themeStyles.textAccent}`}>
          {isConnecting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
          ) : (
            <>Connect Wallet <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
          )}
        </div>
      </div>
    </button>
  );
}