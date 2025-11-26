"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Map, Globe, Users, Layers, Compass } from "lucide-react";

const DYNMAP_URL = process.env.NEXT_PUBLIC_DYNMAP_URL || "";

export default function MapPage() {
  if (!DYNMAP_URL) {
    return (
      <div className="w-full">
        {/* Hero */}
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
            We&apos;re working on adding a live server map. Check back soon to explore the world,
            see where your friends are, and plan your next adventure!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-4">World Explorer</p>
        <h1 className="text-h1 text-foreground mb-4">
          Live Map
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore the server world in real-time. See where players are and discover new places.
        </p>
      </div>

      {/* Map Launch Card */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-8 md:p-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Dynmap</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              View the entire server world from a bird&apos;s eye perspective. Track online players,
              explore builds, and plan your next adventure with our real-time interactive map.
            </p>
            <Button size="lg" asChild>
              <a href={DYNMAP_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Live Map
              </a>
            </Button>
          </div>

          {/* Map Preview Placeholder */}
          <div className="w-full md:w-80 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center">
            <Map className="h-16 w-16 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="rounded-xl border border-border p-5 text-center">
          <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">Full World View</h3>
          <p className="text-sm text-muted-foreground">See every explored chunk from above</p>
        </div>
        <div className="rounded-xl border border-border p-5 text-center">
          <Users className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">Player Tracking</h3>
          <p className="text-sm text-muted-foreground">Find online players on the map</p>
        </div>
        <div className="rounded-xl border border-border p-5 text-center">
          <Layers className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">Multiple Views</h3>
          <p className="text-sm text-muted-foreground">Switch between surface and cave modes</p>
        </div>
        <div className="rounded-xl border border-border p-5 text-center">
          <Compass className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">Easy Navigation</h3>
          <p className="text-sm text-muted-foreground">Pan, zoom, and explore freely</p>
        </div>
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
