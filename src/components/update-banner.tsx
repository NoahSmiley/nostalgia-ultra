"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";

interface UpdateData {
  show: boolean;
  id?: string;
  title?: string;
  message?: string;
}

export function UpdateBanner() {
  const [update, setUpdate] = useState<UpdateData | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch("/api/update-banner");
        const data: UpdateData = await res.json();

        if (!data.show || !data.id) {
          return;
        }

        // Check if already dismissed
        const dismissedUpdates = localStorage.getItem("dismissedUpdates");
        const dismissedList = dismissedUpdates ? JSON.parse(dismissedUpdates) : [];

        if (!dismissedList.includes(data.id)) {
          setUpdate(data);
          setDismissed(false);
        }
      } catch (error) {
        console.error("Failed to fetch update banner:", error);
      }
    }

    fetchBanner();
  }, []);

  const handleDismiss = () => {
    if (!update?.id) return;

    const dismissedUpdates = localStorage.getItem("dismissedUpdates");
    const dismissedList = dismissedUpdates ? JSON.parse(dismissedUpdates) : [];
    dismissedList.push(update.id);
    localStorage.setItem("dismissedUpdates", JSON.stringify(dismissedList));
    setDismissed(true);
  };

  if (dismissed || !update) return null;

  return (
    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/20">
      <div className="max-w-6xl mx-auto px-6 lg:px-16 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm text-foreground truncate">
              <span className="font-medium">{update.title}</span>
              <span className="text-muted-foreground ml-2 hidden sm:inline">
                {update.message}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/updates"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View details
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
