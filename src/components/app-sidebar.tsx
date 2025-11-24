"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Home, Activity, Download, FileText, Sparkles, ScrollText, LogOut, Gamepad2, CreditCard } from "lucide-react";

const navItems = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Server Status", href: "/dashboard/status", icon: Activity },
  { title: "Link Minecraft", href: "/dashboard/minecraft", icon: Gamepad2 },
  { title: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { title: "Install Guide", href: "/dashboard/install", icon: Download },
  { title: "Updates", href: "/dashboard/updates", icon: FileText },
  { title: "Features", href: "/dashboard/features", icon: Sparkles },
  { title: "Rules", href: "/dashboard/rules", icon: ScrollText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="w-64 h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link href="/dashboard" className="font-bold flex items-baseline gap-2">
          <span className="text-2xl text-white">Nostalgia</span>
          <span
            className="font-[family-name:var(--font-minecraft)] text-sm font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0080ff, #8000ff)' }}
          >
            ULTRA
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="text-sm text-zinc-500 mb-3">
          Signed in as <span className="text-zinc-300">{session?.user?.name}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900/50 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
