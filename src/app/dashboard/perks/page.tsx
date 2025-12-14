"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, Loader2, Sword, Lock, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface KnifeConfig {
  id: string;
  name: string;
  description: string;
  itemId: string;
}

interface KnifeData {
  selectedKnife: string | null;
  availableKnives: KnifeConfig[];
  hasUltra: boolean;
}

export default function PerksPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [data, setData] = useState<KnifeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchKnifeData();
  }, []);

  const fetchKnifeData = async () => {
    try {
      const res = await fetch("/api/minecraft/knife");
      if (res.ok) {
        const knifeData = await res.json();
        setData(knifeData);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to load knife data");
      }
    } catch (err) {
      console.error("Failed to fetch knife data:", err);
      setError("Failed to load knife data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKnife = async (knifeId: string) => {
    setSaving(knifeId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/minecraft/knife", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knifeId }),
      });

      const result = await res.json();

      if (res.ok) {
        setData((prev) =>
          prev ? { ...prev, selectedKnife: knifeId } : null
        );
        setSuccess(result.message);
      } else {
        setError(result.error || "Failed to select knife");
      }
    } catch (err) {
      console.error("Failed to select knife:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleClearKnife = async () => {
    setSaving("clear");
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/minecraft/knife", {
        method: "DELETE",
      });

      if (res.ok) {
        setData((prev) =>
          prev ? { ...prev, selectedKnife: null } : null
        );
        setSuccess("Knife selection cleared");
      } else {
        const result = await res.json();
        setError(result.error || "Failed to clear knife selection");
      }
    } catch (err) {
      console.error("Failed to clear knife:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <PerksSkeleton />;
  }

  // Check if Minecraft account is linked
  if (!session?.user?.minecraftLinked) {
    return (
      <div className="w-full">
        <div className="mb-16">
          <p className="text-sm font-medium text-primary mb-4">Ultra Perks</p>
          <h1 className="text-h1 text-foreground mb-6">CS2 Knives</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose your CS2 knife to spawn with on the server.
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-200 mb-2">
                Link your Minecraft account first
              </h3>
              <p className="text-yellow-200/80 mb-4">
                You need to link your Minecraft account before you can select a knife.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/minecraft">Link Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has Ultra subscription
  if (!data?.hasUltra) {
    return (
      <div className="w-full">
        <div className="mb-16">
          <p className="text-sm font-medium text-primary mb-4">Ultra Perks</p>
          <h1 className="text-h1 text-foreground mb-6">CS2 Knives</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose your CS2 knife to spawn with on the server.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ultra Members Only
              </h3>
              <p className="text-muted-foreground">
                CS2 knives are an exclusive perk for Ultra members. Upgrade your
                subscription to unlock this feature and spawn with your favorite
                knife every time you join the server.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/subscription">Upgrade to Ultra</Link>
          </Button>
        </div>

        <Separator className="my-12" />

        {/* Preview of knives */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Available Knives
          </h2>
          <p className="text-muted-foreground mb-8">
            Here&apos;s a preview of the knives available with Ultra membership
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {data?.availableKnives.map((knife) => (
              <div
                key={knife.id}
                className="rounded-xl border border-border bg-card/50 p-5 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      {knife.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {knife.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ultra member view - can select knives
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Ultra Perks</p>
        <h1 className="text-h1 text-foreground mb-6">CS2 Knives</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Choose your CS2 knife to spawn with on the server. Your knife will be
          given to you automatically when you join.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-8 p-5 rounded-xl border border-green-500/20 bg-green-500/10 flex gap-3">
          <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
          <p className="text-green-200">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-8 p-5 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Current Selection */}
      {data?.selectedKnife && (
        <div className="mb-8">
          <div className="rounded-2xl border border-primary/30 bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Sword className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Knife</p>
                  <p className="text-lg font-medium text-foreground">
                    {data.availableKnives.find((k) => k.id === data.selectedKnife)
                      ?.name || data.selectedKnife}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleClearKnife}
                disabled={saving === "clear"}
              >
                {saving === "clear" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Clear Selection"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Knife Grid */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          {data?.selectedKnife ? "Change Knife" : "Select Your Knife"}
        </h2>
        <p className="text-muted-foreground mb-8">
          Click on a knife to select it as your spawn weapon
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {data?.availableKnives.map((knife) => {
            const isSelected = data.selectedKnife === knife.id;
            const isSaving = saving === knife.id;

            return (
              <button
                key={knife.id}
                onClick={() => handleSelectKnife(knife.id)}
                disabled={!!saving || isSelected}
                className={`rounded-xl border p-5 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
                } ${saving && !isSaving ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : isSelected ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <Sword
                        className={`h-5 w-5 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium mb-1 ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {knife.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {knife.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="my-12" />

      {/* Info */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h3 className="font-medium text-foreground mb-2">How it works</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            Your selected knife will be given to you when you join the server
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            You can only have one knife selected at a time
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            Change your knife anytime from this page
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            Knives are from the TaCZ CS2 Knifes pack
          </li>
        </ul>
      </div>
    </div>
  );
}

function PerksSkeleton() {
  return (
    <div className="w-full">
      <div className="mb-16">
        <Skeleton className="h-5 w-24 mb-4" />
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-6 w-96 max-w-full" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-3" />
        <Skeleton className="h-5 w-64 mb-8" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
