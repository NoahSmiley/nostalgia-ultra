"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Shield, RefreshCw, Heart } from "lucide-react";
import { Brand } from "@/components/brand";

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">About Us</p>
        <h1 className="text-h1 text-foreground mb-6">
          The Idea
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          <Brand /> is a private, invite-only Minecraft server built for sustainability.
        </p>
      </div>

      {/* Story Section */}
      <div className="mb-16 max-w-3xl">
        <p className="text-lg text-muted-foreground mb-6">
          We've all been there. You start a Minecraft world with friends, play for a few weeks, and then... it fizzles out.
          Someone loses interest. The world gets corrupted. Setting up the modpack again is too much hassle. The cycle repeats.
        </p>
        <p className="text-lg text-muted-foreground mb-6">
          I wanted to break that cycle. <Brand /> is my attempt to create a Minecraft platform that actually lasts—a place
          where our builds don't disappear, where the server is always ready to jump into, and where the modpack is already
          set up and working.
        </p>
        <p className="text-lg text-muted-foreground">
          This isn't a public server trying to attract thousands of players. It's a private space for me and my friends to
          play Minecraft the way we want—with great mods, no hassle, and a world that's always there when we're ready to come back.
        </p>
      </div>

      <Separator className="my-12" />

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Why We Built This</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-4">
              <RefreshCw className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No More Lost Worlds</h3>
            <p className="text-muted-foreground">
              How many Minecraft worlds have you lost? Corrupted saves, forgotten backups, or just moved on and never came back.
              Our server runs 24/7 with automatic backups. Your builds are safe.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 mb-4">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Zero Setup Hassle</h3>
            <p className="text-muted-foreground">
              No more "hey can you send me the modpack again" or spending an hour troubleshooting why someone's game won't launch.
              One-click install, always up to date, just works.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 mb-4">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Invite Only</h3>
            <p className="text-muted-foreground">
              This isn't a public server. It's for friends—people we actually want to play with. No random griefers,
              no strangers, just people we know.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mb-4">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Always There</h3>
            <p className="text-muted-foreground">
              Take a break for a month. Come back whenever. The server's still running, your stuff is still there,
              and you can pick up right where you left off.
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Server Stats */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">The Server</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">50+</p>
            <p className="text-muted-foreground">Curated Mods</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">24/7</p>
            <p className="text-muted-foreground">Always Online</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">1.21.1</p>
            <p className="text-muted-foreground">MC Version</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">Daily</p>
            <p className="text-muted-foreground">Backups</p>
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* CTA */}
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Got an invite?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          If you've been invited to join, sign in with your Microsoft account to get started.
        </p>
        <Button
          size="lg"
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          className="h-11 px-6 rounded-full"
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
