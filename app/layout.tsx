import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout"; // Beimportáljuk az előbb létrehozott fájlt
import logo from "@/images/logo.png";

// Itt állítjuk be az oldal nevét és ikonját
export const metadata: Metadata = {
  title: "moonstone",
  description: "moonstone Application",
  icons: {
    icon: logo.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <ClientLayout>
            {children}
        </ClientLayout>
      </body>
    </html>
  );
}