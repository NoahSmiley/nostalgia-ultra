"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, ArrowRight, ExternalLink, Server, Users, Clock, Gamepad2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [mcAccount, setMcAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const serverIP = "play.nostalgraultra.com";

  useEffect(() => {
    if (status === "loading") return;

    const fetchData = async () => {
      try {
        const [subRes, mcRes] = await Promise.all([
          fetch("/api/subscription"),
          session?.user?.minecraftLinked ? fetch("/api/minecraft/account") : Promise.resolve(null),
        ]);

        if (subRes.ok) {
          setSubscription(await subRes.json());
        }
        if (mcRes?.ok) {
          setMcAccount(await mcRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSubscribed = subscription?.status === "active";
  const isLinked = session?.user?.minecraftLinked && mcAccount;

  // Loading State - Skeleton
  if (status === "loading" || loading) {
    return (
      <div className="w-full">
        {/* Hero skeleton */}
        <div className="mb-12">
          <Skeleton className="h-5 w-48 mb-4" />
          <Skeleton className="h-10 w-72 mb-6" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>

        {/* Quick actions skeleton */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <Skeleton className="h-12 w-12 rounded-xl mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>

        {/* Server info skeleton */}
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section - Personalized */}
      <div className="mb-12">
        <p className="text-sm font-medium text-primary mb-4">Dashboard</p>
        <h1 className="text-h1 text-foreground mb-6">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {isSubscribed
            ? "You have full server access. Jump in and start playing!"
            : "Complete the setup steps below to get whitelisted on the server."
          }
        </p>
      </div>

      {/* Status Cards - What matters to the member */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {/* Minecraft Account Status */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${
            isLinked ? "bg-green-500/10" : "bg-yellow-500/10"
          }`}>
            <Gamepad2 className={`h-6 w-6 ${isLinked ? "text-green-500" : "text-yellow-500"}`} />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Minecraft Account</h3>
          {isLinked ? (
            <p className="text-sm text-muted-foreground">
              Linked as <span className="text-foreground font-mono">{mcAccount.username}</span>
            </p>
          ) : (
            <p className="text-sm text-yellow-500">Not linked yet</p>
          )}
          <Link
            href="/dashboard/minecraft"
            className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
          >
            {isLinked ? "Manage" : "Link now"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Subscription Status */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${
            isSubscribed ? "bg-green-500/10" : "bg-yellow-500/10"
          }`}>
            <Server className={`h-6 w-6 ${isSubscribed ? "text-green-500" : "text-yellow-500"}`} />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Server Access</h3>
          {isSubscribed ? (
            <p className="text-sm text-green-500">Active • {subscription.tier} tier</p>
          ) : (
            <p className="text-sm text-yellow-500">Subscription required</p>
          )}
          <Link
            href="/dashboard/subscription"
            className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
          >
            {isSubscribed ? "Manage" : "Subscribe"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Quick Connect */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
            <Copy className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Server IP</h3>
          <p className="text-sm font-mono text-muted-foreground mb-2">{serverIP}</p>
          <button
            onClick={copyToClipboard}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            {copied ? (
              <><Check className="h-3 w-3" /> Copied!</>
            ) : (
              <>Copy to clipboard</>
            )}
          </button>
        </div>
      </div>

      {/* Server Status */}
      <div className="rounded-xl border border-border bg-card/50 p-6 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500 font-medium">Online</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>12 players</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hidden sm:flex">
              <Clock className="h-4 w-4" />
              <span>Version 1.21.1</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/status">
              View Status <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-foreground mb-6">Quick Links</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/install" className="rounded-xl border border-border p-4 hover:border-primary/50 hover:bg-muted/30 transition-all">
            <h3 className="font-medium text-foreground mb-1">Install Guide</h3>
            <p className="text-sm text-muted-foreground">Get the modpack set up</p>
          </Link>
          <Link href="/dashboard/map" className="rounded-xl border border-border p-4 hover:border-primary/50 hover:bg-muted/30 transition-all">
            <h3 className="font-medium text-foreground mb-1">Live Map</h3>
            <p className="text-sm text-muted-foreground">Explore the world</p>
          </Link>
          <Link href="/dashboard/mods" className="rounded-xl border border-border p-4 hover:border-primary/50 hover:bg-muted/30 transition-all">
            <h3 className="font-medium text-foreground mb-1">Mod List</h3>
            <p className="text-sm text-muted-foreground">50+ mods included</p>
          </Link>
          <Link href="/dashboard/rules" className="rounded-xl border border-border p-4 hover:border-primary/50 hover:bg-muted/30 transition-all">
            <h3 className="font-medium text-foreground mb-1">Server Rules</h3>
            <p className="text-sm text-muted-foreground">Community guidelines</p>
          </Link>
        </div>
      </div>

      {/* Recent Updates */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Recent Updates</h2>
          <Link href="/dashboard/updates" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-0 divide-y divide-border">
          {[
            { title: "Server updated to 1.21.1", date: "2 days ago" },
            { title: "New spawn area completed", date: "1 week ago" },
            { title: "Performance improvements deployed", date: "2 weeks ago" },
          ].map((news, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <span className="text-foreground">{news.title}</span>
              <span className="text-sm text-muted-foreground">{news.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
