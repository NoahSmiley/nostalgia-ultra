"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  Ticket,
  Crown,
  Infinity,
  Calendar,
} from "lucide-react";

interface Voucher {
  id: string;
  code: string;
  type: "time_limited" | "lifetime";
  tier: "member" | "ultra";
  durationDays: number | null;
  maxUses: number;
  uses: number;
  active: boolean;
  note: string | null;
  expiresAt: string | null;
  createdAt: string;
  createdBy: { displayName: string | null; email: string } | null;
  redemptions: { user: { displayName: string | null; email: string }; createdAt: string }[];
}

export default function AdminVouchersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [voucherType, setVoucherType] = useState<"time_limited" | "lifetime">("time_limited");
  const [voucherTier, setVoucherTier] = useState<"member" | "ultra">("member");
  const [durationDays, setDurationDays] = useState("30");
  const [maxUses, setMaxUses] = useState("1");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchVouchers();
  }, [session, status, router]);

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/admin/vouchers");
      if (res.ok) {
        const data = await res.json();
        setVouchers(data.vouchers);
      } else if (res.status === 403) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch vouchers:", err);
      setError("Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  };

  const createVoucher = async () => {
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: voucherType,
          tier: voucherTier,
          durationDays: voucherType === "lifetime" ? undefined : parseInt(durationDays),
          maxUses: parseInt(maxUses) || 1,
          note: note.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVouchers([data.voucher, ...vouchers]);
        setNote("");
        setDurationDays("30");
        setMaxUses("1");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create voucher");
      }
    } catch {
      setError("Failed to create voucher");
    } finally {
      setCreating(false);
    }
  };

  const deactivateVoucher = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/vouchers?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setVouchers(
          vouchers.map((v) =>
            v.id === id ? { ...v, active: false } : v
          )
        );
      }
    } catch (err) {
      console.error("Failed to deactivate voucher:", err);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="w-full">
        <div className="mb-16">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Not admin
  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Admin</p>
        <h1 className="text-h1 text-foreground mb-6">Subscription Vouchers</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Generate voucher codes for free subscriptions, including lifetime passes.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Create New Voucher */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Create New Voucher
        </h2>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Type */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Type</label>
              <Select value={voucherType} onValueChange={(v) => setVoucherType(v as "time_limited" | "lifetime")}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_limited">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Time Limited
                    </span>
                  </SelectItem>
                  <SelectItem value="lifetime">
                    <span className="flex items-center gap-2">
                      <Infinity className="h-4 w-4" />
                      Lifetime
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tier */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tier</label>
              <Select value={voucherTier} onValueChange={(v) => setVoucherTier(v as "member" | "ultra")}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Standard</SelectItem>
                  <SelectItem value="ultra">
                    <span className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Ultra
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration (only for time_limited) */}
            {voucherType === "time_limited" && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Duration (days)</label>
                <Input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="h-11"
                />
              </div>
            )}

            {/* Max Uses */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Max Uses</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Note (e.g., For John - Lifetime pass)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 h-11"
            />
            <Button
              onClick={createVoucher}
              disabled={creating}
              className="h-11 px-6"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Voucher
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {vouchers.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Vouchers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {vouchers.filter((v) => v.active && v.uses < v.maxUses).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Infinity className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {vouchers.filter((v) => v.type === "lifetime").length}
              </p>
              <p className="text-sm text-muted-foreground">Lifetime</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Crown className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {vouchers.reduce((sum, v) => sum + v.uses, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Redemptions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vouchers List */}
      <div className="space-y-4">
        {vouchers.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              No vouchers yet
            </p>
            <p className="text-muted-foreground">
              Create your first voucher above.
            </p>
          </div>
        ) : (
          vouchers.map((voucher) => {
            const isUsable = voucher.active && voucher.uses < voucher.maxUses;

            return (
              <div
                key={voucher.id}
                className={`rounded-xl border bg-card p-5 ${
                  isUsable ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-2xl font-bold text-foreground tracking-wider">
                      {voucher.code}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(voucher.code, voucher.id)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === voucher.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      {voucher.type === "lifetime" ? (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                          <Infinity className="h-3 w-3 mr-1" />
                          Lifetime
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          <Calendar className="h-3 w-3 mr-1" />
                          {voucher.durationDays} days
                        </Badge>
                      )}

                      {voucher.tier === "ultra" ? (
                        <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          <Crown className="h-3 w-3 mr-1" />
                          Ultra
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground">
                          Standard
                        </Badge>
                      )}

                      {isUsable ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      ) : !voucher.active ? (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                          Deactivated
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Used Up
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {voucher.uses}/{voucher.maxUses} uses
                    </span>
                    {isUsable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deactivateVoucher(voucher.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {voucher.note && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Note: {voucher.note}
                  </p>
                )}

                {voucher.redemptions && voucher.redemptions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Redeemed by:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {voucher.redemptions.map((redemption, i) => (
                        <span
                          key={i}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {redemption.user.displayName || redemption.user.email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Created {new Date(voucher.createdAt).toLocaleDateString()}
                  {voucher.createdBy &&
                    ` by ${voucher.createdBy.displayName || voucher.createdBy.email}`}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
