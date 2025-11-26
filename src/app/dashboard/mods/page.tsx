"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Package, Loader2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ModInfo {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  url: string;
  side: string;
  modrinthId: string;
  categories: string[];
  ultraOnly?: boolean;
}

interface ModsApiResponse {
  mods: ModInfo[];
  count: number;
  standardCount?: number;
  ultraOnlyCount?: number;
  cached: boolean;
}

// Map Modrinth categories to display categories
function getDisplayCategory(categories: string[]): string {
  const categoryMap: Record<string, string> = {
    'technology': 'Tech',
    'storage': 'Storage',
    'decoration': 'Decoration',
    'worldgen': 'World Gen',
    'food': 'Food',
    'magic': 'Magic',
    'utility': 'Utility',
    'library': 'Library',
    'optimization': 'Performance',
    'adventure': 'Adventure',
    'mobs': 'Mobs',
    'equipment': 'Equipment',
    'social': 'Social',
    'cursed': 'Misc',
    'economy': 'Economy',
    'minigame': 'Minigame',
    'transportation': 'Transport',
  };

  for (const cat of categories) {
    if (categoryMap[cat]) return categoryMap[cat];
  }

  // Default based on first category or 'Misc'
  return categories[0] ? categories[0].charAt(0).toUpperCase() + categories[0].slice(1) : 'Misc';
}

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
  "Library": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Adventure": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Equipment": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Social": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Transport": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

export default function ModsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPack, setSelectedPack] = useState<"all" | "standard" | "ultra">("all");
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [standardCount, setStandardCount] = useState(0);
  const [ultraOnlyCount, setUltraOnlyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMods = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/mods?pack=all");
      if (!res.ok) throw new Error("Failed to fetch mods");
      const data: ModsApiResponse = await res.json();
      setMods(data.mods || []);
      setStandardCount(data.standardCount || 0);
      setUltraOnlyCount(data.ultraOnlyCount || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load mod list");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMods();
  }, []);

  // Get unique categories from mods
  const categories = useMemo(() => {
    const cats = new Set<string>();
    mods.forEach(mod => {
      cats.add(getDisplayCategory(mod.categories));
    });
    return ["All", ...Array.from(cats).sort()];
  }, [mods]);

  const filteredMods = useMemo(() => {
    return mods.filter(mod => {
      const matchesSearch = mod.name.toLowerCase().includes(search.toLowerCase()) ||
        mod.description.toLowerCase().includes(search.toLowerCase());
      const modCategory = getDisplayCategory(mod.categories);
      const matchesCategory = selectedCategory === "All" || modCategory === selectedCategory;
      const matchesPack = selectedPack === "all" ||
        (selectedPack === "standard" && !mod.ultraOnly) ||
        (selectedPack === "ultra" && mod.ultraOnly);
      return matchesSearch && matchesCategory && matchesPack;
    });
  }, [search, selectedCategory, selectedPack, mods]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero - OpenAI Style */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-primary">Modpack Contents</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchMods(true)}
            disabled={refreshing}
            className="text-muted-foreground"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <h1 className="text-h1 text-foreground mb-6">
          Our Mods
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore the {mods.length} mods included in the <Brand /> modpack.
          {standardCount > 0 && ultraOnlyCount > 0 && (
            <span className="block mt-2 text-base">
              <span className="text-foreground font-medium">{standardCount}</span> standard mods
              {" + "}
              <span className="text-purple-400 font-medium">{ultraOnlyCount}</span> Ultra exclusive mods.
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}. Showing cached data if available.
        </div>
      )}

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

        {/* Pack Filter Tabs */}
        <div className="flex gap-2 border-b border-border pb-4">
          <button
            onClick={() => setSelectedPack("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPack === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Mods ({mods.length})
          </button>
          <button
            onClick={() => setSelectedPack("standard")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPack === "standard"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Standard ({standardCount})
          </button>
          <button
            onClick={() => setSelectedPack("ultra")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectedPack === "ultra"
                ? "bg-purple-600 text-white"
                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ultra Exclusive ({ultraOnlyCount})
          </button>
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMods.map((mod) => {
          const displayCategory = getDisplayCategory(mod.categories);
          return (
            <Link
              key={mod.modrinthId || mod.name}
              href={mod.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group rounded-2xl border bg-card p-5 transition-colors ${
                mod.ultraOnly
                  ? "border-purple-500/30 hover:border-purple-500/50"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0 overflow-hidden">
                  {mod.icon ? (
                    <Image
                      src={mod.icon}
                      alt={mod.name}
                      width={40}
                      height={40}
                      className="rounded-xl"
                      unoptimized
                    />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {mod.ultraOnly && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Ultra
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[displayCategory] || "bg-muted text-muted-foreground border-border"}`}>
                    {displayCategory}
                  </span>
                </div>
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors flex items-center gap-2 ${
                mod.ultraOnly
                  ? "text-foreground group-hover:text-purple-400"
                  : "text-foreground group-hover:text-primary"
              }`}>
                {mod.name}
                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {mod.description || "No description available."}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMods.length === 0 && !loading && (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No mods found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-12 rounded-2xl border border-border bg-card/50 p-6">
        <p className="text-muted-foreground">
          This list is automatically synced with our modpack. Some library mods may be hidden for clarity.
          For the complete list, check the modpack files in your Prism Launcher instance.
        </p>
      </div>
    </div>
  );
}
