"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

// Main nav items (shown at root level)
const mainNavItems = [
  { title: "Home", href: "/dashboard" },
  { title: "Setup Guide", href: "/dashboard/install" },
  { title: "Mods", href: "/dashboard/mods" },
  { title: "Server Status", href: "/dashboard/status" },
  { title: "Live Map", href: "/dashboard/map" },
];

// Account sub-menu items
const accountNavItems = [
  { title: "Link Account", href: "/dashboard/minecraft" },
  { title: "Subscription", href: "/dashboard/subscription" },
];

// Server info items
const serverNavItems = [
  { title: "Updates", href: "/dashboard/updates" },
  { title: "Rules", href: "/dashboard/rules" },
];

// Admin items
const adminNavItems = [
  { title: "Players", href: "/dashboard/admin/players" },
  { title: "Announcements", href: "/dashboard/admin/announce" },
  { title: "Server Updates", href: "/dashboard/admin/updates" },
  { title: "Invites", href: "/dashboard/admin/invites" },
  { title: "Vouchers", href: "/dashboard/admin/vouchers" },
];

// All items for mobile (admin items added conditionally)
const allNavItems = [...mainNavItems, ...accountNavItems, ...serverNavItems];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  // Check if we're in a submenu page
  const isInAccountSection = accountNavItems.some(item => pathname === item.href);
  const isInServerSection = serverNavItems.some(item => pathname === item.href);
  const isInAdminSection = adminNavItems.some(item => pathname === item.href) || pathname.startsWith("/dashboard/admin");
  const isAdmin = session?.user?.isAdmin;

  // Auto-open the correct submenu based on current pathname
  useEffect(() => {
    if (isInAccountSection) {
      setActiveSubmenu("account");
    } else if (isInServerSection) {
      setActiveSubmenu("server");
    } else if (isInAdminSection) {
      setActiveSubmenu("admin");
    } else {
      setActiveSubmenu(null);
    }
  }, [pathname, isInAccountSection, isInServerSection, isInAdminSection]);

  const renderNavLink = (item: { title: string; href: string }, onClick?: () => void) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`block py-2 text-sm transition-colors ${
          isActive
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {item.title}
      </Link>
    );
  };

  const renderSubmenuLink = (label: string, items: typeof accountNavItems) => {
    const isInSection = items.some(item => pathname === item.href);
    const firstItemHref = items[0].href;

    return (
      <Link
        href={firstItemHref}
        className={`block py-2 text-sm transition-colors ${
          isInSection
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };

  // Render submenu view (like OpenAI's sub-page navigation)
  const renderSubmenuView = (items: typeof accountNavItems) => (
    <>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Home
      </Link>
      {items.map(item => renderNavLink(item))}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed but respects banner space */}
      <aside className="hidden lg:flex flex-col fixed left-0 bottom-0 w-[200px] bg-background z-40" style={{ top: 'var(--banner-height, 0px)' }}>
        {/* Logo Section - OpenAI Style */}
        <div className="px-6 pt-5 pb-28">
          <Link href="/dashboard">
            <Logo className="h-5" />
          </Link>
        </div>

        {/* Navigation - OpenAI Style */}
        <nav className="flex-1 px-6 overflow-y-auto">
          {activeSubmenu === "account" ? (
            renderSubmenuView(accountNavItems)
          ) : activeSubmenu === "server" ? (
            renderSubmenuView(serverNavItems)
          ) : activeSubmenu === "admin" ? (
            renderSubmenuView(adminNavItems)
          ) : (
            <>
              {/* Main nav items */}
              {mainNavItems.map(item => renderNavLink(item))}

              {/* Account submenu trigger */}
              {renderSubmenuLink("Account", accountNavItems)}

              {/* Server Info submenu trigger */}
              {renderSubmenuLink("Server Info", serverNavItems)}

              {/* Admin submenu trigger - only for admins */}
              {isAdmin && renderSubmenuLink("Admin", adminNavItems)}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-muted text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <Separator className="my-1" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background z-50 flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-9 w-9"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <Link href="/dashboard">
          <Logo className="h-5" />
        </Link>

        <Avatar className="h-8 w-8">
          <AvatarImage src={session?.user?.image || undefined} />
          <AvatarFallback className="bg-muted text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-14 bottom-0 w-[280px] bg-background z-50 flex flex-col">
            <nav className="flex-1 px-5 py-8 space-y-1 overflow-y-auto">
              {[...allNavItems, ...(isAdmin ? adminNavItems : [])].map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-3 text-base transition-colors ${
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="p-5">
              <div className="flex items-center gap-3 py-2 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-muted">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
