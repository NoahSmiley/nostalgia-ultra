"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Megaphone,
  Send,
  Clock,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
  Info,
  History,
} from "lucide-react";

interface AnnouncementHistory {
  id: string;
  message: string;
  type: string;
  sentAt: string;
  sentBy: string;
  scheduled?: string;
}

export default function AdminAnnouncePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"alert" | "formatted">("alert");
  const [scheduleType, setScheduleType] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledTime, setScheduledTime] = useState("");
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

    if (scheduleType === "scheduled" && !scheduledTime) {
      setError("Please select a scheduled time");
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
          type,
          scheduled: scheduleType === "scheduled" ? scheduledTime : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send announcement");
      } else {
        setSuccess(
          scheduleType === "scheduled"
            ? `Announcement scheduled for ${new Date(scheduledTime).toLocaleString()}`
            : "Announcement sent successfully!"
        );
        setMessage("");

        // Add to local history
        setHistory((prev) => [
          {
            id: Date.now().toString(),
            message: message.trim(),
            type,
            sentAt: new Date().toISOString(),
            sentBy: session?.user?.email || "Unknown",
            scheduled: scheduleType === "scheduled" ? scheduledTime : undefined,
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
    { label: "Restart 5min", message: "Server restart in 5 minutes! Please find a safe place to log out." },
    { label: "Restart 10min", message: "Server restart in 10 minutes! Save your progress." },
    { label: "Maintenance", message: "Server going down for maintenance. Back online shortly!" },
    { label: "Welcome", message: "Welcome to Nostalgia Ultra! Enjoy your stay." },
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

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Admin</p>
        <h1 className="text-h1 text-foreground mb-6">Server Announcements</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Send announcements to all players currently online in the server.
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
                <p className="text-sm text-muted-foreground">This will be sent to all online players</p>
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

            {/* Message Type */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Message Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4" />
                      <span>Simple Alert</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="formatted">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Formatted (MiniMessage)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {type === "formatted" && (
                <p className="text-xs text-muted-foreground mt-2">
                  Use MiniMessage formatting: &lt;red&gt;text&lt;/red&gt;, &lt;bold&gt;, &lt;gradient:#ff0000:#00ff00&gt;
                </p>
              )}
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
                    onClick={() => setMessage(preset.message)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-4">
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

            {/* Schedule */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">When to Send</Label>
              <div className="flex gap-4 mb-3">
                <Button
                  variant={scheduleType === "immediate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScheduleType("immediate")}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button
                  variant={scheduleType === "scheduled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScheduleType("scheduled")}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>

              {scheduleType === "scheduled" && (
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full"
                />
              )}
            </div>

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
              ) : scheduleType === "scheduled" ? (
                <>
                  <Clock className="h-5 w-5 mr-2" />
                  Schedule Announcement
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
          {/* Tips */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-foreground">Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Announcements go to all online players across all servers</li>
              <li>• Use formatted messages for colorful announcements</li>
              <li>• Schedule restarts during low-traffic hours</li>
              <li>• Keep messages concise and clear</li>
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
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-foreground line-clamp-2">{item.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
