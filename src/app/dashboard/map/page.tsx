"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Map, Globe, Users, Layers, Compass, Home } from "lucide-react";

const SERVERS = [
  {
    id: "frontier",
    name: "Frontier",
    description: "Main survival world - explore vast landscapes and player builds",
    url: "http://n1429.pufferfish.host:25096",
    icon: Globe,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    id: "spawn",
    name: "Spawn",
    description: "Hub world - central meeting point and server portal",
    url: "http://n1429.pufferfish.host:25428",
    icon: Home,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
];

export default function MapPage() {
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-10">
        <p className="text-sm font-medium text-primary mb-4">World Explorer</p>
        <h1 className="text-h1 text-foreground mb-4">
          Live Maps
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore our server worlds in real-time. See where players are and discover new places.
        </p>
      </div>

      {/* Server Selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        {SERVERS.map((server) => {
          const Icon = server.icon;
          const isSelected = selectedServer.id === server.id;
          return (
            <button
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                isSelected
                  ? `border-primary bg-primary/10 ${server.color}`
                  : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{server.name}</span>
            </button>
          );
        })}
      </div>

      {/* Map Launch Card */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-8 md:p-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${selectedServer.bgColor}`}>
                <selectedServer.icon className={`h-8 w-8 ${selectedServer.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{selectedServer.name}</h2>
                <p className="text-sm text-muted-foreground">Dynmap</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6">
              {selectedServer.description}. View the world from above, track online players,
              and plan your next adventure with our real-time interactive map.
            </p>
            <Button size="lg" asChild>
              <a href={selectedServer.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5 mr-2" />
                Open {selectedServer.name} Map
              </a>
            </Button>
          </div>

          {/* Map Preview Placeholder */}
          <div className={`w-full md:w-80 h-48 rounded-xl border border-border flex items-center justify-center ${selectedServer.bgColor}`}>
            <Map className={`h-16 w-16 ${selectedServer.color} opacity-50`} />
          </div>
        </div>
      </div>

      {/* All Maps Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {SERVERS.map((server) => {
          const Icon = server.icon;
          return (
            <a
              key={server.id}
              href={server.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border p-5 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${server.bgColor}`}>
                  <Icon className={`h-5 w-5 ${server.color}`} />
                </div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {server.name}
                </h3>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground">{server.description}</p>
            </a>
          );
        })}
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
