"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Menu, X, LogIn } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Features", href: "/features" },
  { title: "Mods", href: "/mods" },
  { title: "Pricing", href: "/pricing" },
];

export function LandingSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[200px] bg-background z-40">
        {/* Logo Section */}
        <div className="px-6 pt-5 pb-28">
          <Link href="/">
            <Logo className="h-5" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 overflow-y-auto">
          {navItems.map(item => renderNavLink(item))}
        </nav>

        {/* Sign In Button */}
        <div className="p-5">
          <Button
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
            className="w-full rounded-full"
            size="sm"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
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

        <Link href="/">
          <Logo className="h-5" />
        </Link>

        <Button
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          size="sm"
          className="rounded-full h-8 px-3 text-xs"
        >
          Sign In
        </Button>
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
              {navItems.map((item) => {
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
              <Button
                onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
                className="w-full rounded-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In with Microsoft
              </Button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
