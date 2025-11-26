"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Maximize2, Minimize2, ExternalLink, RefreshCw, AlertCircle, Map } from "lucide-react";

const DYNMAP_URL = process.env.NEXT_PUBLIC_DYNMAP_URL || "";
// Use proxied URL to avoid mixed content issues (HTTP dynmap on HTTPS site)
const PROXIED_DYNMAP_URL = "/dynmap/";

export default function MapPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setIframeError(false);
    setKey(prev => prev + 1);
  };

  if (!DYNMAP_URL) {
    return (
      <div className="w-full">
        {/* Hero - OpenAI Style */}
        <div className="mb-16">
          <p className="text-sm font-medium text-primary mb-4">World Explorer</p>
          <h1 className="text-h1 text-foreground mb-6">
            Live Map
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore the server world in real-time with Dynmap.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="rounded-2xl border border-border bg-card p-12 text-center mb-16">
          <Map className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're working on adding a live server map. Check back soon to explore the world,
            see where your friends are, and plan your next adventure!
          </p>
        </div>

        {/* What is Dynmap */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">What is Dynmap?</h2>
          <p className="text-muted-foreground mb-6">
            Dynmap is a real-time map viewer that shows you the Minecraft world from a bird&apos;s eye view.
            When it&apos;s ready, you&apos;ll be able to:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-5">
              <p className="text-foreground">View the entire server world from above</p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <p className="text-foreground">See online players and where they&apos;re exploring</p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <p className="text-foreground">Switch between surface and cave views</p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <p className="text-foreground">Find cool builds and places to visit</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
            <Minimize2 className="w-4 h-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>
        <iframe
          key={key}
          src={PROXIED_DYNMAP_URL}
          className="w-full h-full border-0"
          title="Dynmap"
          allow="fullscreen"
          onError={() => setIframeError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero - OpenAI Style */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-primary mb-4">World Explorer</p>
            <h1 className="text-h1 text-foreground mb-4">
              Live Map
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore the server world in real-time. See where players are and discover new places.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={DYNMAP_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                New Tab
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {iframeError && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-yellow-200">
            Unable to load the map in this frame. Try opening it in a new tab instead.
          </p>
        </div>
      )}

      {/* Map Frame */}
      <div className="rounded-2xl overflow-hidden border border-border mb-16">
        <iframe
          key={key}
          src={PROXIED_DYNMAP_URL}
          className="w-full border-0"
          style={{ height: "600px" }}
          title="Dynmap"
          allow="fullscreen"
          onError={() => setIframeError(true)}
        />
      </div>

      <Separator className="my-12" />

      {/* Controls Help */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-8">How to Use the Map</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Navigate</h3>
            <p className="text-muted-foreground">Click and drag to pan around the world.</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Zoom</h3>
            <p className="text-muted-foreground">Scroll up/down or use the controls to zoom in and out.</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Find Players</h3>
            <p className="text-muted-foreground">Look for player icons on the map or use the player list.</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Switch Views</h3>
            <p className="text-muted-foreground">Toggle between surface, cave, and other render modes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
