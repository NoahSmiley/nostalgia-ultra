"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  Activity,
  Download,
  FileText,
  ScrollText,
  LogOut,
  Link2,
  CreditCard,
  Map,
  Menu,
  X,
  UserPlus,
  Ticket,
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
import { useState } from "react";

const navItems = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Link Account", href: "/dashboard/minecraft", icon: Link2 },
  { title: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { title: "Setup Guide", href: "/dashboard/install", icon: Download },
  { title: "Server Status", href: "/dashboard/status", icon: Activity },
  { title: "Live Map", href: "/dashboard/map", icon: Map },
  { title: "Rules", href: "/dashboard/rules", icon: ScrollText },
  { title: "Updates", href: "/dashboard/updates", icon: FileText },
];

const adminItems = [
  { title: "Invites", href: "/dashboard/admin/invites", icon: UserPlus },
  { title: "Vouchers", href: "/dashboard/admin/vouchers", icon: Ticket },
];

export function DashboardNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  // Mobile top bar component
  const MobileTopBar = () => (
    <div
      className="bg-background flex h-14 items-center justify-between px-4"
    >
      {/* Mobile menu toggle button */}
      <Button
        variant="ghost"
        onClick={toggleMenu}
        className="relative -ml-2 flex h-9 w-9 items-center justify-center [&_svg]:size-5"
      >
        <span
          className={`absolute transition-all duration-300 ${
            isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
          }`}
        >
          <Menu />
        </span>
        <span
          className={`absolute transition-all duration-300 ${
            isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          }`}
        >
          <X />
        </span>
      </Button>

      {/* Logo */}
      <Link href="/dashboard" className="absolute left-1/2 -translate-x-1/2 transform">
        <Logo className="h-8 w-8" />
      </Link>

      {/* Mobile user avatar */}
      <div className="absolute right-4 flex items-center">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={session?.user?.image || undefined} />
          <AvatarFallback className="bg-muted text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );

  // Navigation items component
  const NavItems = ({ isMobile = false }) => {
    const isAdmin = session?.user?.isAdmin;

    return (
      <>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const linkClasses = `font-medium flex items-center gap-2 ${isMobile ? "text-base" : "text-sm"} ${
            isActive
              ? "text-primary"
              : isMobile
              ? "text-muted-foreground"
              : "text-muted-foreground hover:bg-primary/5"
          } px-3 py-2 rounded-md`;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setIsMenuOpen(false)}
              className={linkClasses}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
        {isAdmin && (
          <>
            {isMobile && <Separator className="my-2" />}
            {!isMobile && <div className="w-px h-6 bg-border mx-2" />}
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const linkClasses = `font-medium flex items-center gap-2 ${isMobile ? "text-base" : "text-sm"} ${
                isActive
                  ? "text-amber-500"
                  : isMobile
                  ? "text-amber-500/70"
                  : "text-amber-500/70 hover:bg-amber-500/5"
              } px-3 py-2 rounded-md`;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setIsMenuOpen(false)}
                  className={linkClasses}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </>
        )}
      </>
    );
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-background hidden h-16 lg:block sticky top-0 z-50">
        <div className="container mx-auto flex h-full items-center justify-between px-6">
          {/* Left section: Logo */}
          <div className="flex items-center gap-x-4">
            <Link href="/dashboard">
              <Logo />
            </Link>
          </div>
          {/* Right section: nav and user menu */}
          <div className="flex items-center gap-x-4">
            <div className="flex items-center gap-x-1">
              <NavItems />
            </div>
            {/* User menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-muted">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden sticky top-0 z-50 bg-background">
        <MobileTopBar />
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="bg-background lg:hidden fixed top-14 left-0 right-0 z-40">
          <div className="flex flex-col">
            {/* Mobile menu content */}
            <div className="flex-grow overflow-y-auto p-2">
              <div className="flex flex-col">
                <NavItems isMobile={true} />
              </div>
            </div>
            {/* Mobile user profile section */}
            <div className="p-2">
              {/* User info */}
              <div className="flex items-center space-x-3 p-2">
                <Avatar>
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-muted">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              {/* Sign out link */}
              <div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-muted-foreground block rounded-md px-2 py-2 font-medium w-full text-left hover:bg-primary/5"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
