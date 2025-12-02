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
  Trash2,
  Loader2,
  AlertCircle,
  Megaphone,
  Sparkles,
  X,
} from "lucide-react";

interface ServerUpdate {
  id: string;
  title: string;
  description: string;
  changes: string[];
  isHighlight: boolean;
  createdAt: string;
}

export default function AdminUpdatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [updates, setUpdates] = useState<ServerUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [changes, setChanges] = useState<string[]>([""]);
  const [isHighlight, setIsHighlight] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchUpdates();
  }, [session, status, router]);

  const fetchUpdates = async () => {
    try {
      const res = await fetch("/api/server-updates");
      if (res.ok) {
        const data = await res.json();
        setUpdates(data);
      }
    } catch (err) {
      console.error("Failed to fetch updates:", err);
      setError("Failed to load updates");
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/server-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          changes: changes.filter((c) => c.trim()),
          isHighlight,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUpdates([data, ...updates]);
        // Reset form
        setTitle("");
        setDescription("");
        setChanges([""]);
        setIsHighlight(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create update");
      }
    } catch {
      setError("Failed to create update");
    } finally {
      setCreating(false);
    }
  };

  const addChangeField = () => {
    setChanges([...changes, ""]);
  };

  const updateChange = (index: number, value: string) => {
    const newChanges = [...changes];
    newChanges[index] = value;
    setChanges(newChanges);
  };

  const removeChange = (index: number) => {
    if (changes.length > 1) {
      setChanges(changes.filter((_, i) => i !== index));
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isNew = (date: string) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(date) > sevenDaysAgo;
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
        <h1 className="text-h1 text-foreground mb-6">Server Updates</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Create and manage server update announcements. Highlighted updates
          show in the banner.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Create New Update */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Create New Update
        </h2>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Update title (e.g., December Server Update)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11"
          />
          <Input
            type="text"
            placeholder="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-11"
          />

          {/* Changes list */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Changes (bullet points)
            </label>
            {changes.map((change, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder={`Change ${index + 1}`}
                  value={change}
                  onChange={(e) => updateChange(index, e.target.value)}
                  className="h-10"
                />
                {changes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChange(index)}
                    className="h-10 w-10 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addChangeField}
              className="mt-1"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Change
            </Button>
          </div>

          {/* Highlight toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsHighlight(!isHighlight)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isHighlight ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isHighlight ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              Show in banner (highlighted updates appear at the top of the site
              for 7 days)
            </span>
          </div>

          <Button
            onClick={createUpdate}
            disabled={creating}
            className="h-11 px-6"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Megaphone className="h-4 w-4 mr-2" />
            )}
            Publish Update
          </Button>
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Previous Updates
        </h2>
        {updates.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              No updates yet
            </p>
            <p className="text-muted-foreground">
              Create your first server update above.
            </p>
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className={`rounded-xl border bg-card p-5 ${
                update.isHighlight && isNew(update.createdAt)
                  ? "border-primary/30 bg-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {update.title}
                    </h3>
                    {update.isHighlight && isNew(update.createdAt) && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Banner Active
                      </Badge>
                    )}
                    {update.isHighlight && !isNew(update.createdAt) && (
                      <Badge className="bg-muted text-muted-foreground border-border">
                        Banner Expired
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {update.description}
                  </p>
                  {update.changes && update.changes.length > 0 && (
                    <ul className="space-y-1">
                      {update.changes.map((change, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    {formatDate(update.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
