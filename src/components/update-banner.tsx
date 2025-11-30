"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";

// Update this when releasing new server updates
// Format: { id: unique_string, message: string, link?: string, expires?: Date }
const CURRENT_UPDATE = {
  id: "nov-30-2024-mods",
  title: "New Mods Added!",
  message: "15+ new mods including JEI, Xaero's Maps, and more. Your game will auto-update on next launch.",
  link: "/dashboard/updates",
  expires: new Date("2024-12-07"), // Show for 1 week
};

export function UpdateBanner() {
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    // Check if update has expired
    if (CURRENT_UPDATE.expires && new Date() > CURRENT_UPDATE.expires) {
      return;
    }

    // Check if already dismissed
    const dismissedUpdates = localStorage.getItem("dismissedUpdates");
    const dismissed = dismissedUpdates ? JSON.parse(dismissedUpdates) : [];

    if (!dismissed.includes(CURRENT_UPDATE.id)) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    const dismissedUpdates = localStorage.getItem("dismissedUpdates");
    const dismissed = dismissedUpdates ? JSON.parse(dismissedUpdates) : [];
    dismissed.push(CURRENT_UPDATE.id);
    localStorage.setItem("dismissedUpdates", JSON.stringify(dismissed));
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/20">
      <div className="max-w-6xl mx-auto px-6 lg:px-16 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm text-foreground truncate">
              <span className="font-medium">{CURRENT_UPDATE.title}</span>
              <span className="text-muted-foreground ml-2 hidden sm:inline">
                {CURRENT_UPDATE.message}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {CURRENT_UPDATE.link && (
              <Link
                href={CURRENT_UPDATE.link}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View details
              </Link>
            )}
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
