"use client";

import Sidebar from "@/components/sidebar";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { WalletProvider } from "@/app/wallets/contexts/WalletContext";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // ITT A VÁLTOZÁS: Bővítjük a listát a registerrel
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
        <MetaMaskProvider
          debug={false}
          sdkOptions={{
            dappMetadata: {
              name: "Moonstone",
              url: typeof window !== "undefined" ? window.location.href : "",
            },
          }}
        >
          <WalletProvider>
            <LayoutContent>{children}</LayoutContent>
          </WalletProvider>
        </MetaMaskProvider>
        <Toaster />
    </SessionProvider>
  );
}