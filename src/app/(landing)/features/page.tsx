"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Shield, Navigation, Globe, Swords, Paintbrush, Clock } from "lucide-react";
import { Brand } from "@/components/brand";

export default function FeaturesPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">What We Offer</p>
        <h1 className="text-h1 text-foreground mb-6">
          Server Features
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Everything that makes <Brand /> a great place to play.
        </p>
      </div>

      {/* Worlds - Bento Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-3">Game Worlds</h2>
        <p className="text-muted-foreground mb-8">
          Multiple worlds for different playstyles, with more coming soon
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* The Frontier - Main Survival */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-green-500/10 to-emerald-500/5 border border-green-500/20 p-6 flex flex-col group hover:border-green-500/40 transition-colors min-h-[200px]">
            <div className="absolute top-4 right-4">
              <Globe className="h-8 w-8 text-green-500/50 group-hover:text-green-500/70 transition-colors" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Survival</span>
              <h3 className="text-2xl font-bold text-foreground mt-1">The Frontier</h3>
              <p className="text-muted-foreground mt-2">
                Our main survival world with custom terrain generation. Build, explore, and thrive.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <span className="inline-flex items-center gap-2 text-sm text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Available Now
              </span>
            </div>
          </div>

          {/* The Canvas - Creative */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent border border-cyan-500/20 p-6 flex flex-col group hover:border-cyan-500/40 transition-colors min-h-[200px] opacity-75">
            <div className="absolute top-4 right-4">
              <Paintbrush className="h-8 w-8 text-cyan-500/50 group-hover:text-cyan-500/70 transition-colors" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Creative</span>
              <h3 className="text-2xl font-bold text-foreground mt-1">The Canvas</h3>
              <p className="text-muted-foreground mt-2">
                A creative world for building without limits. Design and share your creations.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-cyan-500/20">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Coming Soon
              </span>
            </div>
          </div>

          {/* The Crucible - PvP */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent border border-red-500/20 p-6 flex flex-col group hover:border-red-500/40 transition-colors min-h-[200px] opacity-75">
            <div className="absolute top-4 right-4">
              <Swords className="h-8 w-8 text-red-500/50 group-hover:text-red-500/70 transition-colors" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider">PvP</span>
              <h3 className="text-2xl font-bold text-foreground mt-1">The Crucible</h3>
              <p className="text-muted-foreground mt-2">
                Test your skills in competitive PvP battles and events.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-red-500/20">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Core Features */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Core Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 mb-4">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">125+ Custom Mods</h3>
            <p className="text-muted-foreground">
              Our carefully curated modpack includes Create for automation, Farmers Delight for cooking,
              new biomes, and much more.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 mb-4">
              <Navigation className="h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Easy Travel</h3>
            <p className="text-muted-foreground">
              Set multiple homes, teleport to friends, and use server warps to get around quickly.
              Spend less time walking.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 mb-4">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Safe & Fair</h3>
            <p className="text-muted-foreground">
              Active moderation, anti-cheat protection, and automatic backups keep the server fair
              and your progress safe.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-4">
              <Globe className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Multiple Worlds</h3>
            <p className="text-muted-foreground">
              Play in The Frontier survival world now, with The Canvas (creative) and
              The Crucible (PvP) coming soon.
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Quality of Life */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-3">Quality of Life</h2>
        <p className="text-muted-foreground mb-8">
          We've tweaked the server settings to make your experience better
        </p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            "Mob griefing is disabled",
            "Fire spread is disabled",
            "Sleep voting (not everyone needs to sleep)",
            "Keep inventory on death",
            "Daily automatic backups",
            "Scheduled restarts at 4 AM EST",
            "12 chunk render distance",
            "AFK players kicked after 15 minutes",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-12" />

      {/* CTA */}
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Ready to experience these features?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Sign in to get started and join our community today.
        </p>
        <Button
          size="lg"
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          className="h-11 px-6 rounded-full"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
