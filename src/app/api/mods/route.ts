import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ModInfo {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  url: string;
  side: string;
  modrinthId: string;
  categories: string[];
}

// Cache mods for 1 hour to avoid hitting rate limits
let cachedMods: ModInfo[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Parse TOML-like packwiz files (simple parser for pw.toml format)
function parsePackwizToml(content: string): { name: string; side: string; modrinthId?: string } {
  const lines = content.split('\n');
  let name = '';
  let side = 'both';
  let modrinthId = '';
  let inModrinthSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('name = ')) {
      name = trimmed.replace('name = ', '').replace(/"/g, '');
    } else if (trimmed.startsWith('side = ')) {
      side = trimmed.replace('side = ', '').replace(/"/g, '');
    } else if (trimmed === '[update.modrinth]') {
      inModrinthSection = true;
    } else if (trimmed.startsWith('[') && inModrinthSection) {
      inModrinthSection = false;
    } else if (inModrinthSection && trimmed.startsWith('mod-id = ')) {
      modrinthId = trimmed.replace('mod-id = ', '').replace(/"/g, '');
    }
  }

  return { name, side, modrinthId };
}

function fetchModsFromLocalFiles(): { name: string; side: string; modrinthId?: string }[] {
  // Path to the modpack folder (relative to the next-app directory)
  const modpackPath = path.join(process.cwd(), '..', '..', 'modpack', 'mods');

  try {
    // Read all .pw.toml files from the mods directory
    const files = fs.readdirSync(modpackPath).filter(f => f.endsWith('.pw.toml'));

    const mods = files.map(file => {
      try {
        const content = fs.readFileSync(path.join(modpackPath, file), 'utf-8');
        return parsePackwizToml(content);
      } catch {
        return null;
      }
    });

    return mods.filter((m): m is { name: string; side: string; modrinthId?: string } => m !== null);
  } catch (error) {
    console.error('Failed to read local mod files:', error);
    return [];
  }
}

async function enrichModsWithModrinth(mods: { name: string; side: string; modrinthId?: string }[]): Promise<ModInfo[]> {
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
    }));
  }

  // Batch fetch from Modrinth API
  try {
    const response = await fetch(
      `https://api.modrinth.com/v2/projects?ids=${JSON.stringify(modrinthIds)}`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'NostalgiaUltra/1.0 (website mod list)'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Modrinth API error');
    }

    const projects = await response.json();
    const projectMap = new Map(projects.map((p: { id: string }) => [p.id, p]));

    return mods.map(mod => {
      const project = mod.modrinthId ? projectMap.get(mod.modrinthId) : null;
      return {
        name: mod.name,
        slug: project?.slug || mod.name.toLowerCase().replace(/\s+/g, '-'),
        description: project?.description || '',
        icon: project?.icon_url,
        url: project ? `https://modrinth.com/mod/${project.slug}` : '#',
        side: mod.side,
        modrinthId: mod.modrinthId || '',
        categories: project?.categories || [],
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
    }));
  }
}

export async function GET() {
  try {
    const now = Date.now();

    // Return cached mods if still valid
    if (cachedMods && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({
        mods: cachedMods,
        count: cachedMods.length,
        cached: true,
      });
    }

    // Fetch mods from local packwiz files
    const basicMods = fetchModsFromLocalFiles();

    // Filter out library/API mods for cleaner display (optional)
    const contentMods = basicMods.filter(m => {
      const lowerName = m.name.toLowerCase();
      // Keep mods that aren't just libraries
      return !lowerName.includes(' api') ||
             lowerName.includes('fabric api'); // Keep Fabric API as it's important
    });

    // Enrich with Modrinth data
    const enrichedMods = await enrichModsWithModrinth(contentMods);

    // Sort alphabetically
    enrichedMods.sort((a, b) => a.name.localeCompare(b.name));

    // Update cache
    cachedMods = enrichedMods;
    cacheTimestamp = now;

    return NextResponse.json({
      mods: enrichedMods,
      count: enrichedMods.length,
      cached: false,
    });
  } catch (error) {
    console.error('Failed to fetch mods:', error);

    // If we have cached data, return it even if expired
    if (cachedMods) {
      return NextResponse.json({
        mods: cachedMods,
        count: cachedMods.length,
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
