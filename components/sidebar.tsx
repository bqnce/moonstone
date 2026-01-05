"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BarChart3,
  Settings,
  Wallet,
  LogOut,
  BanknoteArrowUp,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import logo from "@/images/logo.png";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Wallets",
    icon: Wallet,
    href: "/wallets",
  },
  {
    name: "Accounts",
    icon: User,
    href: "/accounts",
  },
  {
    name: "Salary",
    icon: BanknoteArrowUp,
    href: "/salary",
  },
  {
    name: "History",
    icon: History,
    href: "/history",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  // Egyszerűsített monogram generáló (pl. "admin" -> "A", "John Doe" -> "JD")
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = session?.user?.name || "Admin";
  const userInitials = getInitials(userName);

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-sidebar-border bg-sidebar p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="relative h-10 w-10 flex items-center justify-center">
          <Image
            src={logo}
            alt="Moonstone Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            Moonstone
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-sidebar-primary/80">
            Portfolio Tracker
          </span>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                "hover:bg-sidebar-accent/50",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 h-6 w-1 rounded-r-full bg-sidebar-primary" />
              )}

              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                  "group-hover:scale-110"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      {/* --- Footer / User Profile --- */}
      <div className="mt-auto pt-4 border-t border-sidebar-border/50">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 font-bold shadow-sm">
            {userInitials}
          </div>

          {/* Info */}
          <div className="flex-1 overflow-hidden">
            <h4 className="truncate text-sm font-semibold text-foreground">
              {userName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            // Alap stílusok (mindig látható)
            "mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/20 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-200",
            // Hover stílusok (pirosas effekt)
            "hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95 cursor-pointer"
          )}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
