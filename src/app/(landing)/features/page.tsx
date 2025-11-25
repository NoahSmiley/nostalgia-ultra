"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Castle, Coins, Sparkles, Shield, MessageSquare, Navigation, Globe, Flame, TreePine, Mountain } from "lucide-react";
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
        <h2 className="text-2xl font-semibold text-foreground mb-3">Multiple Worlds to Explore</h2>
        <p className="text-muted-foreground mb-8">
          Travel between unique dimensions through our portal network
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[140px]">
          {/* Main Overworld - Large */}
          <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-green-500/10 to-emerald-500/5 border border-green-500/20 p-6 flex flex-col justify-end group hover:border-green-500/40 transition-colors">
            <div className="absolute top-4 right-4">
              <Globe className="h-8 w-8 text-green-500/50 group-hover:text-green-500/70 transition-colors" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="relative z-10">
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Main Hub</span>
              <h3 className="text-2xl font-bold text-foreground mt-1">Overworld</h3>
              <p className="text-muted-foreground mt-2">
                Our main survival world with custom terrain, villages, and the spawn area. Build your home here.
              </p>
            </div>
          </div>

          {/* Nether */}
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent border border-red-500/20 p-4 flex flex-col justify-end group hover:border-red-500/40 transition-colors">
            <Flame className="absolute top-3 right-3 h-5 w-5 text-red-500/50 group-hover:text-red-500/70 transition-colors" />
            <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Dimension</span>
            <h3 className="text-lg font-semibold text-foreground mt-1">The Nether</h3>
          </div>

          {/* The End */}
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-transparent border border-purple-500/20 p-4 flex flex-col justify-end group hover:border-purple-500/40 transition-colors">
            <Sparkles className="absolute top-3 right-3 h-5 w-5 text-purple-500/50 group-hover:text-purple-500/70 transition-colors" />
            <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Dimension</span>
            <h3 className="text-lg font-semibold text-foreground mt-1">The End</h3>
          </div>

          {/* Resource World */}
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/20 p-4 flex flex-col justify-end group hover:border-amber-500/40 transition-colors">
            <Mountain className="absolute top-3 right-3 h-5 w-5 text-amber-500/50 group-hover:text-amber-500/70 transition-colors" />
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Resets Monthly</span>
            <h3 className="text-lg font-semibold text-foreground mt-1">Resource World</h3>
          </div>

          {/* Creative World */}
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent border border-cyan-500/20 p-4 flex flex-col justify-end group hover:border-cyan-500/40 transition-colors">
            <TreePine className="absolute top-3 right-3 h-5 w-5 text-cyan-500/50 group-hover:text-cyan-500/70 transition-colors" />
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Build Mode</span>
            <h3 className="text-lg font-semibold text-foreground mt-1">Creative Plot</h3>
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Core Features */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Core Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-4">
              <Castle className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Land Claiming</h3>
            <p className="text-muted-foreground">
              Protect your builds with our chunk-based claiming system. Set permissions for friends,
              create shared areas, and never worry about griefing.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 mb-4">
              <Coins className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Economy & Shops</h3>
            <p className="text-muted-foreground">
              Earn money by selling items, completing jobs, and trading with other players.
              Set up your own shop or browse the marketplace.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 mb-4">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">50+ Custom Mods</h3>
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 mb-4">
              <MessageSquare className="h-6 w-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Discord Integration</h3>
            <p className="text-muted-foreground">
              Chat with players in-game from Discord and vice versa. Get notified about server events
              and stay connected.
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
