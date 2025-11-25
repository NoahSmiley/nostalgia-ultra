"use client";

import { Logo } from "@/components/logo";
import { Brand } from "@/components/brand";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const MAIN_NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#install", label: "Install" },
  { href: "/login", label: "Sign In" },
];

export function LandingFooter() {
  return (
    <footer
      className="bg-black text-sm border-t border-white/10"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-padding-x container mx-auto py-12 lg:py-16">
        <div className="flex flex-col gap-8">
          {/* Top Section */}
          <div className="flex w-full flex-col items-center gap-8 text-center">
            {/* Logo Section */}
            <Link href="/" aria-label="Go to homepage">
              <Logo />
            </Link>

            {/* Main Navigation */}
            <nav
              className="flex flex-col items-center gap-4 md:flex-row md:gap-8"
              aria-label="Footer navigation"
            >
              {MAIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Divider */}
          <Separator className="bg-white/10" role="presentation" />

          {/* Bottom Section */}
          <div className="flex w-full flex-col items-center gap-4 text-center">
            {/* Copyright Text */}
            <p className="text-white/40">
              Copyright © {new Date().getFullYear()} <Brand />. All rights reserved.
            </p>
            <p className="text-white/40 text-xs">
              Not affiliated with Mojang Studios or Microsoft.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
