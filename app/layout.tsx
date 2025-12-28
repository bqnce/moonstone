"use client";

import "./globals.css";
import Sidebar from "@/components/sidebar";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { WalletProvider } from "@/contexts/WalletContext";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
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
        </SessionProvider>
      </body>
    </html>
  );
}
