"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  Activity,
  Download,
  FileText,
  Sparkles,
  ScrollText,
  LogOut,
  Gamepad2,
  CreditCard,
  Map,
  ChevronRight
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Server Status", href: "/dashboard/status", icon: Activity },
  { title: "Live Map", href: "/dashboard/map", icon: Map },
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

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="w-64 h-screen bg-zinc-950 flex flex-col border-r border-white/5">
      {/* Header */}
      <div className="p-6">
        <Link href="/dashboard" className="inline-block">
          <Logo />
        </Link>
      </div>

      <Separator className="bg-white/5" />

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-white/60 group-hover:text-white"}`} />
                  <span className="flex-1">{item.title}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-black/60" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator className="bg-white/5" />

      {/* Footer / User Section */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="bg-white/10 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-white/40 truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full mt-3 justify-start text-white/60 hover:text-white hover:bg-white/5"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
