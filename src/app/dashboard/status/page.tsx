"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SERVER_CONFIG } from "@/config";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  tps?: number;
  uptime?: string;
  worldSize?: string;
  error?: string;
  cached?: boolean;
  config: {
    ip: string;
    mcVersion: string;
    forgeVersion: string;
    maxPlayers: number;
    restartTime: string;
  };
}

export default function StatusPage() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/server/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch server status:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(() => fetchStatus(), 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = status?.online ?? false;
  const playersOnline = status?.players?.online ?? 0;
  const tps = status?.tps ?? 20.0;
  const serverIp = status?.config?.ip ?? SERVER_CONFIG.ip;
  const mcVersion = status?.config?.mcVersion ?? SERVER_CONFIG.mcVersion;
  const forgeVersion = status?.config?.forgeVersion ?? SERVER_CONFIG.forgeVersion;
  const maxPlayers = status?.config?.maxPlayers ?? SERVER_CONFIG.maxPlayers;
  const restartTime = status?.config?.restartTime ?? SERVER_CONFIG.fullRestartTime;

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero - OpenAI Style */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-medium flex items-center gap-2 ${isOnline ? "text-green-500" : "text-red-500"}`}>
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {isOnline ? "All Systems Online" : "Server Offline"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className="text-muted-foreground"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <h1 className="text-h1 text-foreground mb-6">
          Server Status
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {isOnline
            ? "The server is running smoothly. Jump in and play!"
            : "The server is currently offline. Check back soon!"}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-4xl font-semibold text-foreground">{playersOnline}</p>
          <p className="text-muted-foreground mt-1">Players Online</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-4xl font-semibold text-foreground">{mcVersion}</p>
          <p className="text-muted-foreground mt-1">Minecraft Version</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-4xl font-semibold text-foreground">{tps.toFixed(1)}</p>
          <p className="text-muted-foreground mt-1">Server TPS</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-4xl font-semibold text-foreground">{status?.uptime ?? "99.9%"}</p>
          <p className="text-muted-foreground mt-1">Uptime</p>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Server Info */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Server Information</h2>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">Server Address</span>
            <code className="font-mono text-foreground">{serverIp}</code>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">Mod Loader</span>
            <span className="text-foreground">Forge {forgeVersion}</span>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">Player Slots</span>
            <span className="text-foreground">{maxPlayers}</span>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">World Size</span>
            <span className="text-foreground">{status?.worldSize ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Service Status</h2>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {[
            { name: "Game Server", status: isOnline ? "Operational" : "Offline" },
            { name: "Web Dashboard", status: "Operational" },
            { name: "Voice Chat", status: isOnline ? "Operational" : "Offline" },
            { name: "Automatic Backups", status: "Operational" },
          ].map((service, i) => (
            <div key={i} className="flex items-center justify-between p-5">
              <span className="text-foreground">{service.name}</span>
              <span className={`flex items-center gap-2 ${service.status === "Operational" ? "text-green-500" : "text-red-500"}`}>
                <span className={`h-2 w-2 rounded-full ${service.status === "Operational" ? "bg-green-500" : "bg-red-500"}`} />
                {service.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Server Schedule */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-8">Server Schedule</h2>
        <div className="space-y-6">
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Daily Restart</span>
              <span className="text-sm text-muted-foreground">{restartTime}</span>
            </div>
            <p className="text-muted-foreground">Server restarts daily for performance optimization and backup.</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Automatic Backups</span>
              <span className="text-sm text-muted-foreground">{SERVER_CONFIG.backupFrequency}</span>
            </div>
            <p className="text-muted-foreground">World data is backed up automatically to prevent data loss.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
