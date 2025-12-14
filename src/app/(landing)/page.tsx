"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const highlights = [
  {
    name: "The Frontier",
    label: "Survival",
    description: "Our main survival world with custom terrain generation. Build, explore, and thrive.",
    gradient: "from-green-500/30 via-green-500/10 to-emerald-500/5",
    borderColor: "border-green-500/30",
    labelColor: "text-green-400",
    Icon: Globe,
    iconColor: "text-green-500/60",
    status: "available",
  },
];

export default function LandingPage() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSignIn = () => {
    signIn("microsoft-entra-id", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="w-full">
      {/* Hero Section - OpenAI Style (Centered) */}
      <div className="mb-20 lg:mb-28 text-center">
        <p className="text-sm font-medium text-foreground mb-16">
          A Private Minecraft Server
        </p>
        <div className="mb-20 relative py-8">
          <div className="absolute inset-x-[18%] inset-y-[22%] bg-cyan-500/30 blur-[90px] rounded-full" />
          <div className="relative inline-block">
            <Image
              src="/images/hero.webp"
              alt="Minecraft Steve and Alex"
              width={650}
              height={737}
              className="mx-auto"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 60%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 60%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                maskComposite: 'intersect',
                WebkitMaskComposite: 'source-in',
              }}
              priority
              unoptimized
            />
          </div>
        </div>
        <h1 className="text-h1 mb-8">
          <span className="text-[0.7em]">Your adventure awaits on</span><br />
          <span className="inline-flex items-baseline gap-2"><span className="tracking-tighter">nostalgia</span><span className="font-[family-name:var(--font-minecraft)] text-[0.6em]">ULTRA</span></span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          A private, invite-only Minecraft server for friends. No lost worlds, no setup hassle,
          just a place to play that's always there when you're ready.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" variant="outline" asChild className="h-11 px-6 rounded-full">
            <Link href="/about">
              Learn More
            </Link>
          </Button>
        </div>
      </div>

      {/* Two Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-20">
        {/* What is Nostalgia Ultra Card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">What is this?</h2>
          <p className="text-muted-foreground mb-6">
            A Minecraft server built to solve the problems we always ran into playing together.
          </p>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">No more lost worlds—server runs 24/7 with daily backups</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">No setup hassle—one-click modpack install that just works</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">125+ carefully selected mods that work together</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Always there when you want to come back</span>
            </li>
          </ul>

          <Button variant="ghost" asChild>
            <Link href="/about" className="flex items-center gap-1">
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Invite Code + Sign In Card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">Got an invite?</h2>
          <p className="text-muted-foreground mb-6">
            This server is invite-only for friends and family. Enter your invite code to get started.
          </p>

          <Button asChild className="w-full h-11 rounded-full mb-4">
            <Link href="/invite">
              Enter Invite Code
            </Link>
          </Button>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Already have an account?</p>
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="w-full h-11 rounded-full"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Server Info Strip */}
      <div className="rounded-xl border border-border bg-card/50 p-6 mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500 font-medium">Online</span>
            </span>
            <span className="text-muted-foreground">Version 1.20.1</span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-muted-foreground hidden sm:inline">Modded</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">Server IP available after sign in</span>
          </div>
        </div>
      </div>

      {/* Worlds Carousel */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-sans font-normal text-foreground mb-2">Game Worlds</h2>
            <p className="text-muted-foreground">Multiple worlds for different playstyles, with more coming soon.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {highlights.map((item, i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-[calc(50%-12px)] min-w-[400px] snap-start relative rounded-2xl overflow-hidden group cursor-pointer bg-gradient-to-br ${item.gradient} border ${item.borderColor} hover:border-opacity-60 transition-colors ${item.status === "coming_soon" ? "opacity-75" : ""}`}
            >
              <div className="absolute top-6 right-6">
                <item.Icon className={`h-12 w-12 ${item.iconColor} group-hover:opacity-80 transition-opacity`} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="relative h-[300px] p-8 flex flex-col justify-end">
                <span className={`text-xs uppercase tracking-wider font-medium mb-2 ${item.labelColor}`}>
                  {item.label}
                </span>
                <h3 className="text-3xl font-sans text-foreground mb-3">{item.name}</h3>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                {item.status === "available" ? (
                  <span className="inline-flex items-center gap-2 text-sm text-green-400">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Available Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-16 rounded-2xl border border-border bg-card/50">
        <h2 className="text-3xl font-semibold text-foreground mb-4">Ready to join?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Got an invite code? We use Microsoft to verify your Minecraft ownership.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" className="h-11 px-8 rounded-full">
            <Link href="/invite">Enter Invite Code</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-8 rounded-full"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
