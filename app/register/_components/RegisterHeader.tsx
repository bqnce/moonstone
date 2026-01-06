import React from "react";
import Image from "next/image";
import logo from "@/images/logo.png";

export default function RegisterHeader() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mb-4 shadow-2xl">
        <Image
          src={logo.src}
          alt="Logo"
          width={40}
          height={40}
          className="object-contain select-none"
        />
      </div>
      <h1 className="text-3xl font-bold text-white tracking-tight">
        Create Account
      </h1>
      <p className="text-zinc-500 mt-2">Join MoonStone today</p>
    </div>
  );
}