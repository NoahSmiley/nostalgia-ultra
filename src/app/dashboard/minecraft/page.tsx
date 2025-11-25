"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Loader2, Gamepad2, Info, Link2, Unlink, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function MinecraftLinkPage() {
  const { data: session, status, update } = useSession();
  const [mcUsername, setMcUsername] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mcAccount, setMcAccount] = useState<any>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.minecraftLinked) {
      fetchMinecraftAccount();
    } else {
      setLoadingAccount(false);
    }
  }, [session, status]);

  const fetchMinecraftAccount = async () => {
    try {
      const res = await fetch("/api/minecraft/account");
      if (res.ok) {
        const data = await res.json();
        setMcAccount(data);
      }
    } catch (err) {
      console.error("Failed to fetch Minecraft account:", err);
    } finally {
      setLoadingAccount(false);
    }
  };

  const linkAccount = async () => {
    if (!mcUsername.trim()) {
      setError("Please enter your Minecraft username");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/minecraft/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode: mcUsername.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMcAccount(data);
        setMcUsername("");
        await update();
      } else {
        setError(data.error || "Failed to link account");
      }
    } catch (err) {
      setError("Failed to link account. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const unlinkAccount = async () => {
    if (!confirm("Are you sure you want to unlink your Minecraft account?")) {
      return;
    }

    try {
      const res = await fetch("/api/minecraft/unlink", {
        method: "POST",
      });

      if (res.ok) {
        setMcAccount(null);
        setSuccess(false);
        await update();
        window.location.reload();
      }
    } catch (err) {
      setError("Failed to unlink account");
    }
  };

  // Loading State - Skeleton
  if (status === "loading" || loadingAccount) {
    return (
      <div className="w-full">
        {/* Hero skeleton */}
        <div className="mb-16">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-12 w-80 mb-6" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>

        {/* Card skeleton */}
        <div className="max-w-xl rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Linked State
  if (session?.user?.minecraftLinked && mcAccount) {
    return (
      <div className="w-full">
        {/* Hero - OpenAI Style */}
        <div className="mb-16">
          <p className="text-sm font-medium text-green-500 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Account Linked
          </p>
          <h1 className="text-h1 text-foreground mb-6">
            You're connected
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your Minecraft account is connected and ready to play!
          </p>
        </div>

        {/* Account Info Card */}
        <div className="max-w-xl rounded-2xl border border-border bg-card p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-muted-foreground">Minecraft Username</span>
            <span className="text-2xl font-mono font-semibold text-foreground">{mcAccount.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Server Access</span>
            {mcAccount.whitelisted ? (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Whitelisted</Badge>
            ) : (
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Subscription Required</Badge>
            )}
          </div>
        </div>

        {/* Subscription CTA if not whitelisted */}
        {!mcAccount.whitelisted && (
          <Link href="/dashboard/subscription" className="block max-w-xl mb-10">
            <div className="rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Get Server Access</h3>
                  <p className="text-muted-foreground">
                    Subscribe to get whitelisted and start playing on the server.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        )}

        <Separator className="my-12" />

        {/* Unlink Option */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Manage Account</h2>
          <p className="text-muted-foreground mb-4">
            Need to link a different Minecraft account? You can unlink your current account below.
          </p>
          <Button onClick={unlinkAccount} variant="outline">
            <Unlink className="mr-2 h-4 w-4" />
            Unlink Minecraft Account
          </Button>
        </div>
      </div>
    );
  }

  // Unlinked State
  return (
    <div className="w-full">
      {/* Hero - OpenAI Style */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Account Setup</p>
        <h1 className="text-h1 text-foreground mb-6">
          Link Your Minecraft Account
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Connect your Minecraft Java Edition account to get whitelisted on the server.
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-10 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-200 font-medium mb-1">How It Works</p>
          <p className="text-blue-200/80">
            Since you signed in with Microsoft, we just need your Minecraft username to link your account.
            Make sure you own Minecraft Java Edition on this Microsoft account.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
          <XCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && !session?.user?.minecraftLinked && (
        <div className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <p className="text-green-200">Successfully linked your Minecraft account!</p>
        </div>
      )}

      {/* Link Form */}
      <div className="max-w-xl rounded-2xl border border-border bg-card p-8 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Gamepad2 className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Enter Your Username</h2>
            <p className="text-muted-foreground">Your in-game name, not your Microsoft email</p>
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <Input
            value={mcUsername}
            onChange={(e) => setMcUsername(e.target.value)}
            placeholder="Enter your Minecraft username"
            className="flex-1 h-12 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && linkAccount()}
          />
          <Button
            onClick={linkAccount}
            disabled={verifying || !mcUsername.trim()}
            size="lg"
            className="h-12"
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Link Account
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Example: Steve, Alex, YourCoolName123
        </p>
      </div>

      {/* Benefits */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-8">Why Link Your Account?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-2">Automatic Whitelist</h3>
            <p className="text-muted-foreground">
              Once you subscribe, you're automatically added to the server whitelist.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-2">Sync Your Profile</h3>
            <p className="text-muted-foreground">
              Your website account and in-game profile stay connected.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-2">Member Perks</h3>
            <p className="text-muted-foreground">
              Access exclusive in-game features tied to your subscription tier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
