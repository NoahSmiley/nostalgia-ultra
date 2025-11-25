"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2 } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
  return (
    <section
      className="bg-black relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />

      <div className="container-padding-x container mx-auto flex flex-col items-center gap-12 py-20 lg:py-32 relative z-10">
        {/* Content */}
        <div className="flex flex-col items-center gap-8 text-center max-w-3xl">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80">
            <Gamepad2 className="h-4 w-4" />
            <span>Minecraft 1.21.1 Fabric Server</span>
          </div>

          {/* Main Heading */}
          <div className="flex flex-col items-center gap-4">
            <img
              src="/minecraft-sticker.gif"
              alt="Minecraft"
              className="w-48 h-48 object-contain"
            />
            <h1 id="hero-heading" className="flex items-baseline gap-3 justify-center">
              <span className="text-5xl md:text-6xl font-normal text-white tracking-tighter">nostalgia</span>
              <span className="font-[family-name:var(--font-minecraft)] text-2xl md:text-3xl text-white">
                ULTRA
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-white/70 text-lg lg:text-xl max-w-2xl">
            A premium Minecraft experience with custom mods, an active community,
            and seamless multiplayer. Join us for epic adventures.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="ghost" className="text-white border border-white/20 hover:bg-white/10">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
