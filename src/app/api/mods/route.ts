import { NextResponse } from 'next/server';
import staticModsBase from '@/data/mods-base.json';
import staticModsUltra from '@/data/mods-ultra.json';

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

interface ModrinthProject {
  id: string;
  slug: string;
  description: string;
  icon_url?: string;
  categories: string[];
}

// Cache mods for 1 hour to avoid hitting rate limits
let cachedStandardMods: ModInfo[] | null = null;
let cachedUltraMods: ModInfo[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function enrichModsWithModrinth(
  mods: { name: string; side: string; modrinthId?: string }[],
  ultraOnly: boolean = false
): Promise<ModInfo[]> {
  const modrinthIds = mods.filter(m => m.modrinthId).map(m => m.modrinthId);

  if (modrinthIds.length === 0) {
    return mods.map(m => ({
      name: m.name,
      slug: m.name.toLowerCase().replace(/\s+/g, '-'),
      description: '',
      url: '#',
      side: m.side,
      modrinthId: m.modrinthId || '',
      categories: [],
      ultraOnly,
    }));
  }

  // Batch fetch from Modrinth API
  try {
    const response = await fetch(
      `https://api.modrinth.com/v2/projects?ids=${JSON.stringify(modrinthIds)}`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Endless/1.0 (website mod list)'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Modrinth API error');
    }

    const projects: ModrinthProject[] = await response.json();
    const projectMap = new Map<string, ModrinthProject>(projects.map((p) => [p.id, p]));

    return mods.map(mod => {
      const project = mod.modrinthId ? projectMap.get(mod.modrinthId) : undefined;
      return {
        name: mod.name,
        slug: project?.slug || mod.name.toLowerCase().replace(/\s+/g, '-'),
        description: project?.description || '',
        icon: project?.icon_url,
        url: project ? `https://modrinth.com/mod/${project.slug}` : '#',
        side: mod.side,
        modrinthId: mod.modrinthId || '',
        categories: project?.categories || [],
        ultraOnly,
      };
    });
  } catch (error) {
    console.error('Failed to enrich mods with Modrinth data:', error);
    // Return basic info without Modrinth enrichment
    return mods.map(m => ({
      name: m.name,
      slug: m.name.toLowerCase().replace(/\s+/g, '-'),
      description: '',
      url: m.modrinthId ? `https://modrinth.com/mod/${m.modrinthId}` : '#',
      side: m.side,
      modrinthId: m.modrinthId || '',
      categories: [],
      ultraOnly,
    }));
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pack = searchParams.get('pack') || 'all'; // 'standard', 'ultra', or 'all'

    const now = Date.now();
    const cacheValid = (now - cacheTimestamp) < CACHE_TTL;

    // Return cached mods if still valid
    if (cacheValid && cachedStandardMods && cachedUltraMods) {
      if (pack === 'standard') {
        return NextResponse.json({
          mods: cachedStandardMods,
          count: cachedStandardMods.length,
          cached: true,
        });
      } else if (pack === 'ultra') {
        return NextResponse.json({
          mods: cachedUltraMods,
          count: cachedUltraMods.length,
          cached: true,
        });
      } else {
        // Combine standard + ultra-only mods
        const standardModIds = new Set(cachedStandardMods.map(m => m.modrinthId));
        const ultraOnlyMods = cachedUltraMods.filter(m => !standardModIds.has(m.modrinthId));
        const allMods = [...cachedStandardMods, ...ultraOnlyMods].sort((a, b) => a.name.localeCompare(b.name));
        return NextResponse.json({
          mods: allMods,
          count: allMods.length,
          standardCount: cachedStandardMods.length,
          ultraOnlyCount: ultraOnlyMods.length,
          cached: true,
        });
      }
    }

    // Use static JSON files
    const standardMods = staticModsBase;
    const ultraMods = staticModsUltra;

    // Enrich with Modrinth data
    const enrichedStandard = await enrichModsWithModrinth(standardMods, false);

    // Find ultra-only mods (mods in ultra but not in standard)
    const standardModIds = new Set(standardMods.map(m => m.modrinthId));
    const ultraOnlyBasic = ultraMods.filter(m => !standardModIds.has(m.modrinthId));
    const enrichedUltraOnly = await enrichModsWithModrinth(ultraOnlyBasic, true);

    // Sort alphabetically
    enrichedStandard.sort((a, b) => a.name.localeCompare(b.name));
    enrichedUltraOnly.sort((a, b) => a.name.localeCompare(b.name));

    // Update cache
    cachedStandardMods = enrichedStandard;
    cachedUltraMods = enrichedUltraOnly;
    cacheTimestamp = now;

    if (pack === 'standard') {
      return NextResponse.json({
        mods: enrichedStandard,
        count: enrichedStandard.length,
        cached: false,
      });
    } else if (pack === 'ultra') {
      return NextResponse.json({
        mods: enrichedUltraOnly,
        count: enrichedUltraOnly.length,
        cached: false,
      });
    } else {
      // Combine standard + ultra-only mods
      const allMods = [...enrichedStandard, ...enrichedUltraOnly].sort((a, b) => a.name.localeCompare(b.name));
      return NextResponse.json({
        mods: allMods,
        count: allMods.length,
        standardCount: enrichedStandard.length,
        ultraOnlyCount: enrichedUltraOnly.length,
        cached: false,
      });
    }
  } catch (error) {
    console.error('Failed to fetch mods:', error);

    // If we have cached data, return it even if expired
    if (cachedStandardMods && cachedUltraMods) {
      const allMods = [...cachedStandardMods, ...cachedUltraMods].sort((a, b) => a.name.localeCompare(b.name));
      return NextResponse.json({
        mods: allMods,
        count: allMods.length,
        cached: true,
        error: 'Using cached data due to fetch error',
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch mod list', mods: [], count: 0 },
      { status: 500 }
    );
  }
}
