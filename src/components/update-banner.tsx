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

// Export height constant for other components to use
export const BANNER_HEIGHT = 40; // px

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
          // Set CSS variable for other components
          document.documentElement.style.setProperty('--banner-height', `${BANNER_HEIGHT}px`);
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
    // Remove CSS variable
    document.documentElement.style.setProperty('--banner-height', '0px');
  };

  if (dismissed || !update) return null;

  return (
    <div
      className="bg-blue-600 text-white fixed top-0 left-0 right-0 z-[60]"
      style={{ height: BANNER_HEIGHT }}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <Sparkles className="h-4 w-4 shrink-0" />
            <p className="text-sm truncate">
              <span className="font-semibold">{update.title}</span>
              <span className="ml-2 hidden sm:inline opacity-90">
                {update.message}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/updates"
              className="text-sm font-medium hover:underline underline-offset-2"
            >
              View details
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
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

// Spacer component to push content down when banner is shown
export function UpdateBannerSpacer() {
  const [hasBanner, setHasBanner] = useState(false);

  useEffect(() => {
    async function checkBanner() {
      try {
        const res = await fetch("/api/update-banner");
        const data: UpdateData = await res.json();

        if (!data.show || !data.id) {
          return;
        }

        const dismissedUpdates = localStorage.getItem("dismissedUpdates");
        const dismissedList = dismissedUpdates ? JSON.parse(dismissedUpdates) : [];

        if (!dismissedList.includes(data.id)) {
          setHasBanner(true);
        }
      } catch (error) {
        // Ignore errors
      }
    }

    checkBanner();

    // Listen for storage changes (when banner is dismissed)
    const handleStorage = () => {
      checkBanner();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!hasBanner) return null;

  return <div style={{ height: BANNER_HEIGHT }} />;
}
