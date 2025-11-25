"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
  Key,
} from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  maxUses: number;
  uses: number;
  active: boolean;
  note: string | null;
  createdAt: string;
  createdBy: { displayName: string | null; email: string } | null;
  users: { displayName: string | null; email: string; createdAt: string }[];
}

export default function AdminInvitesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newCodeNote, setNewCodeNote] = useState("");
  const [newCodeMaxUses, setNewCodeMaxUses] = useState("1");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchInvites();
  }, [session, status, router]);

  const fetchInvites = async () => {
    try {
      const res = await fetch("/api/admin/invites");
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites);
      } else if (res.status === 403) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch invites:", err);
      setError("Failed to load invite codes");
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async () => {
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxUses: parseInt(newCodeMaxUses) || 1,
          note: newCodeNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInvites([data.inviteCode, ...invites]);
        setNewCodeNote("");
        setNewCodeMaxUses("1");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create invite code");
      }
    } catch {
      setError("Failed to create invite code");
    } finally {
      setCreating(false);
    }
  };

  const deactivateInvite = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/invites?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInvites(
          invites.map((inv) =>
            inv.id === id ? { ...inv, active: false } : inv
          )
        );
      }
    } catch (err) {
      console.error("Failed to deactivate invite:", err);
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
        <h1 className="text-h1 text-foreground mb-6">Invite Codes</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Generate and manage invite codes for new members.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Create New Code */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Create New Invite Code
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Note (e.g., For John)"
            value={newCodeNote}
            onChange={(e) => setNewCodeNote(e.target.value)}
            className="flex-1 h-11"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Max uses:
            </span>
            <Input
              type="number"
              min="1"
              max="100"
              value={newCodeMaxUses}
              onChange={(e) => setNewCodeMaxUses(e.target.value)}
              className="w-20 h-11"
            />
          </div>
          <Button
            onClick={createInvite}
            disabled={creating}
            className="h-11 px-6"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Generate Code
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {invites.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Codes</p>
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
                {invites.filter((i) => i.active && i.uses < i.maxUses).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {invites.reduce((sum, i) => sum + i.uses, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Uses</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {invites.filter((i) => !i.active || i.uses >= i.maxUses).length}
              </p>
              <p className="text-sm text-muted-foreground">Expired/Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Codes List */}
      <div className="space-y-4">
        {invites.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              No invite codes yet
            </p>
            <p className="text-muted-foreground">
              Create your first invite code above.
            </p>
          </div>
        ) : (
          invites.map((invite) => {
            const isUsable = invite.active && invite.uses < invite.maxUses;

            return (
              <div
                key={invite.id}
                className={`rounded-xl border bg-card p-5 ${
                  isUsable ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-2xl font-bold text-foreground tracking-wider">
                      {invite.code}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(invite.code, invite.id)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === invite.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {isUsable ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Active
                      </Badge>
                    ) : !invite.active ? (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                        Deactivated
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        Used Up
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {invite.uses}/{invite.maxUses} uses
                    </span>
                    {isUsable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deactivateInvite(invite.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {invite.note && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Note: {invite.note}
                  </p>
                )}

                {invite.users.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Used by:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {invite.users.map((user, i) => (
                        <span
                          key={i}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {user.displayName || user.email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Created {new Date(invite.createdAt).toLocaleDateString()}
                  {invite.createdBy &&
                    ` by ${invite.createdBy.displayName || invite.createdBy.email}`}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
