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
  Users,
  UserPlus,
  UserMinus,
  Shield,
  ShieldCheck,
  Crown,
  Circle,
  Search,
  RefreshCw,
  LogOut,
  Pencil,
  X,
  Check,
  AlertCircle,
  Loader2,
  Server,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Player {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  createdAt: string;
  minecraft: {
    username: string;
    uuid: string;
    nickname: string | null;
    isOnline: boolean;
    currentServer?: string;
    isWhitelisted: boolean;
  } | null;
  subscription: {
    tier: string;
    status: string;
    isLifetime: boolean;
  } | null;
}

export default function AdminPlayersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "whitelisted" | "member" | "ultra">("all");
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingNickname, setEditingNickname] = useState<string | null>(null);
  const [nicknameValue, setNicknameValue] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchPlayers();
  }, [session, status, router]);

  const fetchPlayers = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/players");
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
        setWhitelistEnabled(data.whitelistEnabled);
        setOnlineCount(data.onlineCount);
      } else if (res.status === 403) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch players:", err);
      setError("Failed to load players");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const performAction = async (action: string, params: Record<string, unknown>) => {
    setActionLoading(`${action}-${params.username || params.userId || ''}`);
    setError(null);
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...params }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
      } else {
        await fetchPlayers();
      }
    } catch (err) {
      setError("Failed to perform action");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetNickname = async (player: Player) => {
    if (!player.minecraft || !nicknameValue.trim()) return;
    await performAction("set_nickname", {
      username: player.minecraft.username,
      userId: player.id,
      nickname: nicknameValue.trim(),
    });
    setEditingNickname(null);
    setNicknameValue("");
  };

  const handleClearNickname = async (player: Player) => {
    if (!player.minecraft) return;
    await performAction("clear_nickname", {
      username: player.minecraft.username,
      userId: player.id,
    });
  };

  const filteredPlayers = players.filter(player => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      player.email.toLowerCase().includes(searchLower) ||
      player.displayName?.toLowerCase().includes(searchLower) ||
      player.minecraft?.username.toLowerCase().includes(searchLower) ||
      player.minecraft?.nickname?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Category filter
    switch (filter) {
      case "online":
        return player.minecraft?.isOnline;
      case "whitelisted":
        return player.minecraft?.isWhitelisted;
      case "member":
        return player.subscription?.tier === "member";
      case "ultra":
        return player.subscription?.tier === "ultra";
      default:
        return true;
    }
  });

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

  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Admin</p>
        <h1 className="text-h1 text-foreground mb-6">Player Management</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Manage whitelist, roles, and player settings.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-200">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{players.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Circle className="h-5 w-5 text-green-500 fill-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{onlineCount}</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {players.filter(p => p.minecraft?.isWhitelisted).length}
              </p>
              <p className="text-sm text-muted-foreground">Whitelisted</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <ShieldCheck className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {players.filter(p => p.subscription?.tier === "member").length}
              </p>
              <p className="text-sm text-muted-foreground">Members</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Crown className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {players.filter(p => p.subscription?.tier === "ultra").length}
              </p>
              <p className="text-sm text-muted-foreground">Ultra</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or Minecraft username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[160px] h-11">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Players</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="whitelisted">Whitelisted</SelectItem>
            <SelectItem value="member">Members</SelectItem>
            <SelectItem value="ultra">Ultra</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => fetchPlayers(true)}
          disabled={refreshing}
          className="h-11"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Whitelist Toggle */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {whitelistEnabled ? (
            <ToggleRight className="h-6 w-6 text-green-500" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium text-foreground">Whitelist</p>
            <p className="text-sm text-muted-foreground">
              {whitelistEnabled ? "Only whitelisted players can join" : "Anyone can join the server"}
            </p>
          </div>
        </div>
        <Button
          variant={whitelistEnabled ? "default" : "outline"}
          onClick={() => performAction("whitelist_toggle", { enabled: !whitelistEnabled })}
          disabled={actionLoading === "whitelist_toggle-"}
        >
          {actionLoading === "whitelist_toggle-" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {whitelistEnabled ? "Disable" : "Enable"}
        </Button>
      </div>

      {/* Players List */}
      <div className="space-y-4">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No players found</p>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term" : "No players match your filter"}
            </p>
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-foreground truncate">
                      {player.displayName || player.email}
                    </span>
                    {player.isAdmin && (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                        Admin
                      </Badge>
                    )}
                    {player.subscription?.tier === "admin" && (
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin Tag
                      </Badge>
                    )}
                    {player.subscription?.tier === "ultra" && (
                      <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        <Crown className="h-3 w-3 mr-1" />
                        Ultra
                      </Badge>
                    )}
                    {player.subscription?.tier === "member" && (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        Member
                      </Badge>
                    )}
                    {player.subscription?.isLifetime && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Lifetime
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{player.email}</p>

                  {player.minecraft ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        {player.minecraft.isOnline ? (
                          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                        ) : (
                          <Circle className="h-2 w-2 text-muted-foreground" />
                        )}
                        <span className="font-mono">{player.minecraft.username}</span>
                      </div>
                      {player.minecraft.nickname && (
                        <span className="text-muted-foreground">
                          aka &quot;{player.minecraft.nickname}&quot;
                        </span>
                      )}
                      {player.minecraft.currentServer && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Server className="h-3 w-3" />
                          {player.minecraft.currentServer}
                        </div>
                      )}
                      {player.minecraft.isWhitelisted && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Whitelisted
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No Minecraft account linked</p>
                  )}
                </div>

                {/* Actions */}
                {player.minecraft && (
                  <div className="flex flex-wrap gap-2">
                    {/* Nickname (Ultra or Admin only) */}
                    {(player.subscription?.tier === "ultra" || player.subscription?.tier === "admin") && (
                      editingNickname === player.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={nicknameValue}
                            onChange={(e) => setNicknameValue(e.target.value)}
                            placeholder="Nickname"
                            className="h-9 w-32"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSetNickname(player)}
                            disabled={!!actionLoading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNickname(null);
                              setNicknameValue("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNickname(player.id);
                            setNicknameValue(player.minecraft?.nickname || "");
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          {player.minecraft.nickname ? "Edit Nick" : "Set Nick"}
                        </Button>
                      )
                    )}

                    {player.minecraft.nickname && editingNickname !== player.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleClearNickname(player)}
                        disabled={actionLoading === `clear_nickname-${player.minecraft?.username}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Whitelist */}
                    {player.minecraft.isWhitelisted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          performAction("whitelist_remove", {
                            username: player.minecraft?.username,
                          })
                        }
                        disabled={actionLoading === `whitelist_remove-${player.minecraft.username}`}
                      >
                        {actionLoading === `whitelist_remove-${player.minecraft.username}` ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <UserMinus className="h-4 w-4 mr-1" />
                        )}
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          performAction("whitelist_add", {
                            username: player.minecraft?.username,
                          })
                        }
                        disabled={actionLoading === `whitelist_add-${player.minecraft.username}`}
                      >
                        {actionLoading === `whitelist_add-${player.minecraft.username}` ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-1" />
                        )}
                        Whitelist
                      </Button>
                    )}

                    {/* Role Management */}
                    <Select
                      value={player.subscription?.tier || "none"}
                      onValueChange={(tier) => {
                        if (tier === "none") {
                          performAction("remove_group", {
                            username: player.minecraft?.username,
                            userId: player.id,
                            group: player.subscription?.tier,
                          });
                        } else {
                          performAction("set_group", {
                            username: player.minecraft?.username,
                            userId: player.id,
                            group: tier,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 w-[120px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Role</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="ultra">Ultra</SelectItem>
                        {player.isAdmin && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    {/* Kick */}
                    {player.minecraft.isOnline && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          performAction("kick", {
                            username: player.minecraft?.username,
                          })
                        }
                        disabled={actionLoading === `kick-${player.minecraft.username}`}
                      >
                        {actionLoading === `kick-${player.minecraft.username}` ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <LogOut className="h-4 w-4 mr-1" />
                        )}
                        Kick
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
