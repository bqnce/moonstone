"use client";

import Sidebar from "@/components/sidebar";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { WalletProvider } from "@/app/wallets/contexts/WalletContext";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

// Ez a belső komponens kezeli a sidebar elrejtést
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}

// Ez a fő wrapper, ami a providereket tartalmazza
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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