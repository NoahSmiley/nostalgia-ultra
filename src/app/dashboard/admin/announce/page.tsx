"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Send,
  AlertCircle,
  Check,
  Loader2,
  Info,
  History,
  Volume2,
  MonitorPlay,
  AlertTriangle,
  PartyPopper,
  RefreshCw,
} from "lucide-react";

interface AnnouncementHistory {
  id: string;
  message: string;
  style: string;
  sentAt: string;
  sentBy: string;
}

const ANNOUNCEMENT_STYLES = {
  standard: {
    label: "Standard",
    icon: Megaphone,
    description: "Gold/yellow theme for general announcements",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
  },
  important: {
    label: "Important",
    icon: AlertTriangle,
    description: "Red theme for urgent messages",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
  event: {
    label: "Event",
    icon: PartyPopper,
    description: "Purple/pink theme for events",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  update: {
    label: "Update",
    icon: RefreshCw,
    description: "Green theme for updates",
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
};

export default function AdminAnnouncePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [style, setStyle] = useState<keyof typeof ANNOUNCEMENT_STYLES>("standard");
  const [showTitle, setShowTitle] = useState(true);
  const [playSound, setPlaySound] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<AnnouncementHistory[]>([]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const sendAnnouncement = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          style,
          showTitle,
          playSound,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send announcement");
      } else {
        setSuccess("Announcement sent successfully!");
        setMessage("");

        // Add to local history
        setHistory((prev) => [
          {
            id: Date.now().toString(),
            message: message.trim(),
            style,
            sentAt: new Date().toISOString(),
            sentBy: session?.user?.email || "Unknown",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setError("Failed to send announcement");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const presetMessages = [
    { label: "Restart 5min", message: "Server restart in 5 minutes! Please find a safe place to log out.", style: "important" as const },
    { label: "Restart 10min", message: "Server restart in 10 minutes. Save your progress!", style: "standard" as const },
    { label: "Maintenance", message: "Server going down for maintenance. Back online shortly!", style: "important" as const },
    { label: "Welcome", message: "Welcome to Nostalgia Ultra! Enjoy your stay.", style: "standard" as const },
    { label: "New Update", message: "A new update has been deployed! Check out the changelog.", style: "update" as const },
    { label: "Event Starting", message: "A special event is starting now! Join in on the fun.", style: "event" as const },
  ];

  if (status === "loading") {
    return (
      <div className="w-full">
        <div className="mb-16">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  const currentStyle = ANNOUNCEMENT_STYLES[style];
  const StyleIcon = currentStyle.icon;

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Admin</p>
        <h1 className="text-h1 text-foreground mb-6">Server Announcements</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Send eye-catching announcements to all players with titles, sounds, and styled messages.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Compose Announcement</h2>
                <p className="text-sm text-muted-foreground">Sends to all online players on all servers</p>
              </div>
            </div>

            {/* Error/Success */}
            {error && (
              <div className="mb-4 p-4 rounded-lg border border-red-500/20 bg-red-500/10 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-lg border border-green-500/20 bg-green-500/10 flex gap-3">
                <Check className="h-5 w-5 text-green-400 shrink-0" />
                <p className="text-green-200">{success}</p>
              </div>
            )}

            {/* Announcement Style */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Announcement Style</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.entries(ANNOUNCEMENT_STYLES) as [keyof typeof ANNOUNCEMENT_STYLES, typeof ANNOUNCEMENT_STYLES.standard][]).map(([key, s]) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setStyle(key)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        style === key
                          ? `${s.bgColor} border-current ${s.color}`
                          : "border-border bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-2 ${style === key ? s.color : "text-muted-foreground"}`} />
                      <p className={`font-medium text-sm ${style === key ? s.color : "text-foreground"}`}>{s.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${showTitle ? currentStyle.bgColor : "border-border bg-muted/30"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MonitorPlay className={`h-5 w-5 ${showTitle ? currentStyle.color : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium text-sm">Show Title</p>
                      <p className="text-xs text-muted-foreground">Big text on screen</p>
                    </div>
                  </div>
                  <Switch checked={showTitle} onCheckedChange={setShowTitle} />
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${playSound ? currentStyle.bgColor : "border-border bg-muted/30"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className={`h-5 w-5 ${playSound ? currentStyle.color : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium text-sm">Play Sound</p>
                      <p className="text-xs text-muted-foreground">Alert notification</p>
                    </div>
                  </div>
                  <Switch checked={playSound} onCheckedChange={setPlaySound} />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {presetMessages.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessage(preset.message);
                      setStyle(preset.style);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your announcement message..."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {message.length}/500 characters
              </p>
            </div>

            {/* Preview */}
            {message.trim() && (
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Preview</Label>
                <div className={`p-4 rounded-lg border ${currentStyle.bgColor}`}>
                  <div className="text-center mb-3">
                    <p className={`text-lg font-bold ${currentStyle.color}`}>
                      {style === "important" ? "⚠ IMPORTANT ⚠" : style === "event" ? "🎉 EVENT 🎉" : style === "update" ? "🔄 UPDATE 🔄" : "✦ ANNOUNCEMENT ✦"}
                    </p>
                  </div>
                  <div className="border-t border-b border-gray-600 py-3 my-2">
                    <p className={`text-center ${currentStyle.color}`}>{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={sendAnnouncement}
              disabled={sending || !message.trim()}
              className="w-full h-12"
            >
              {sending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* What Players See */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-foreground">What Players See</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MonitorPlay className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span><strong>Title:</strong> Big centered text on their screen</span>
              </li>
              <li className="flex items-start gap-2">
                <Volume2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span><strong>Sound:</strong> Note block pling sound</span>
              </li>
              <li className="flex items-start gap-2">
                <Megaphone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span><strong>Chat:</strong> Formatted message with separator lines</span>
              </li>
            </ul>
          </div>

          {/* Recent History */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <History className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Recent</h3>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements sent this session</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => {
                  const itemStyle = ANNOUNCEMENT_STYLES[item.style as keyof typeof ANNOUNCEMENT_STYLES] || ANNOUNCEMENT_STYLES.standard;
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-foreground line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${itemStyle.color}`}>
                          {itemStyle.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.sentAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
