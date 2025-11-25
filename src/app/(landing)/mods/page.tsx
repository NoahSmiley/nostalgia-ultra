"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Package } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";

const mods = [
  {
    name: "Create",
    description: "Build mechanical contraptions, automate your base, and create amazing machines with rotating components.",
    category: "Tech",
    url: "https://modrinth.com/mod/create",
  },
  {
    name: "Create: Steam 'n' Rails",
    description: "Addon for Create that adds trains, rails, and steam-powered vehicles.",
    category: "Tech",
    url: "https://modrinth.com/mod/create-steam-n-rails",
  },
  {
    name: "Farmer's Delight",
    description: "Enhanced cooking system with new crops, recipes, and kitchen equipment.",
    category: "Food",
    url: "https://modrinth.com/mod/farmers-delight",
  },
  {
    name: "Regions Unexplored",
    description: "Discover beautiful new biomes and terrain features as you explore the world.",
    category: "World Gen",
    url: "https://modrinth.com/mod/regions-unexplored",
  },
  {
    name: "Supplementaries",
    description: "Tons of decoration blocks and useful utility items for building and decoration.",
    category: "Decoration",
    url: "https://modrinth.com/mod/supplementaries",
  },
  {
    name: "JourneyMap",
    description: "Real-time mapping in-game or in a web browser as you explore the world.",
    category: "Utility",
    url: "https://modrinth.com/mod/journeymap",
  },
  {
    name: "Just Enough Items (JEI)",
    description: "View items and recipes in-game. Essential for learning mod recipes.",
    category: "Utility",
    url: "https://modrinth.com/mod/jei",
  },
  {
    name: "Sophisticated Backpacks",
    description: "Upgradeable backpacks with many features including auto-pickup and filtering.",
    category: "Storage",
    url: "https://modrinth.com/mod/sophisticated-backpacks",
  },
  {
    name: "Sophisticated Storage",
    description: "Upgradeable chests, barrels, and shulker boxes with advanced features.",
    category: "Storage",
    url: "https://modrinth.com/mod/sophisticated-storage",
  },
  {
    name: "Macaw's Bridges",
    description: "Beautiful decorative bridges in various wood types and styles.",
    category: "Decoration",
    url: "https://modrinth.com/mod/macaws-bridges",
  },
  {
    name: "Macaw's Doors",
    description: "Adds many new door variants including stable doors and barn doors.",
    category: "Decoration",
    url: "https://modrinth.com/mod/macaws-doors",
  },
  {
    name: "Macaw's Windows",
    description: "Decorative windows and shutters in many styles and wood types.",
    category: "Decoration",
    url: "https://modrinth.com/mod/macaws-windows",
  },
  {
    name: "Applied Energistics 2",
    description: "Store items digitally in an ME network with autocrafting capabilities.",
    category: "Tech",
    url: "https://modrinth.com/mod/ae2",
  },
  {
    name: "Botania",
    description: "Tech mod themed around natural magic and mystical flowers.",
    category: "Magic",
    url: "https://modrinth.com/mod/botania",
  },
  {
    name: "Alex's Mobs",
    description: "Adds many new animals and creatures from around the world.",
    category: "Mobs",
    url: "https://modrinth.com/mod/alexs-mobs",
  },
  {
    name: "Iron's Spells 'n Spellbooks",
    description: "RPG-style magic system with spellbooks, scrolls, and upgrades.",
    category: "Magic",
    url: "https://modrinth.com/mod/irons-spells-n-spellbooks",
  },
  {
    name: "Quark",
    description: "Small quality of life improvements that feel like vanilla additions.",
    category: "Utility",
    url: "https://modrinth.com/mod/quark",
  },
  {
    name: "Waystones",
    description: "Craftable teleportation stones for fast travel between locations.",
    category: "Utility",
    url: "https://modrinth.com/mod/waystones",
  },
  {
    name: "Sodium",
    description: "Modern rendering engine for significantly improved FPS.",
    category: "Performance",
    url: "https://modrinth.com/mod/sodium",
  },
  {
    name: "Lithium",
    description: "General-purpose server and client optimization mod.",
    category: "Performance",
    url: "https://modrinth.com/mod/lithium",
  },
];

const categories = ["All", ...Array.from(new Set(mods.map(m => m.category))).sort()];

const categoryColors: Record<string, string> = {
  "Tech": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Food": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "World Gen": "bg-green-500/10 text-green-400 border-green-500/20",
  "Decoration": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Utility": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Storage": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Magic": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Mobs": "bg-red-500/10 text-red-400 border-red-500/20",
  "Performance": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function ModsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredMods = useMemo(() => {
    return mods.filter(mod => {
      const matchesSearch = mod.name.toLowerCase().includes(search.toLowerCase()) ||
        mod.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || mod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-12">
        <p className="text-sm font-medium text-primary mb-4">Modpack Contents</p>
        <h1 className="text-h1 text-foreground mb-6">
          Our Mods
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore the {mods.length}+ mods included in the <Brand /> modpack. Carefully curated for the best experience.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search mods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-6">
        Showing {filteredMods.length} of {mods.length} mods
      </p>

      {/* Mods Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {filteredMods.map((mod) => (
          <Link
            key={mod.name}
            href={mod.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-border bg-card p-5 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[mod.category] || "bg-muted text-muted-foreground"}`}>
                {mod.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
              {mod.name}
              <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {mod.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredMods.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No mods found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="text-center py-12 rounded-2xl border border-border bg-card/50">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Want to play with these mods?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Sign in to get the modpack and join our server.
        </p>
        <Button
          size="lg"
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          className="h-11 px-6 rounded-full"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
