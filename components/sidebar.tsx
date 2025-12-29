"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, BarChart3, Settings, Wallet, LogOut, BanknoteArrowUp, History } from "lucide-react";
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

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-sidebar-border bg-sidebar p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center">
          <Image
            src={logo}
            alt="Moonstone Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-sidebar-foreground">
            Moonstone
          </span>
          <span className="text-xs text-muted-foreground">Portfolio Tracker</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "hover:translate-x-1 hover:shadow-lg",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
                  : "text-sidebar-foreground/70"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
              )}

              {/* Icon with hover animation */}
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  "group-hover:scale-110 group-hover:text-sidebar-primary",
                  isActive && "text-sidebar-primary scale-110"
                )}
              />

              {/* Label */}
              <span className="flex-1">{item.name}</span>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/10 to-sidebar-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-sidebar-border space-y-4">
        {session?.user && (
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-sidebar-foreground mb-1">
              {session.user.name || "User"}
            </p>
            <p className="text-sidebar-foreground/50">Logged in</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
            "text-sidebar-foreground/70"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
