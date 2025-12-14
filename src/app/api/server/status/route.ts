import { NextResponse } from 'next/server';
import { SERVER_CONFIG } from '@/config';

interface McServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  version?: string;
  motd?: string;
}

// Cache the status for 15 seconds to reduce API calls while keeping it responsive
let cachedStatus: McServerStatus | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 15 * 1000; // 15 seconds

async function queryMinecraftServer(): Promise<McServerStatus> {
  const host = SERVER_CONFIG.statusHost;
  const port = SERVER_CONFIG.statusPort;

  // Use mcstatus.io API - has shorter cache (60s) than mcsrvstat.us (5min)
  const response = await fetch(
    `https://api.mcstatus.io/v2/status/java/${host}:${port}`,
    { cache: 'no-store' } // Don't cache on our end, let mcstatus.io handle it
  );

  if (!response.ok) {
    throw new Error('Failed to query server status');
  }

  const data = await response.json();

  return {
    online: data.online ?? false,
    players: {
      online: data.players?.online ?? 0,
      max: data.players?.max ?? SERVER_CONFIG.maxPlayers,
      list: data.players?.list?.map((p: { name_clean: string }) => p.name_clean),
    },
    version: data.version?.name_clean,
    motd: data.motd?.clean,
  };
}

export async function GET() {
  try {
    const now = Date.now();

    // Return cached status if still valid
    if (cachedStatus && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({
        ...cachedStatus,
        cached: true,
        config: {
          ip: SERVER_CONFIG.ip,
          mcVersion: SERVER_CONFIG.mcVersion,
          forgeVersion: SERVER_CONFIG.forgeVersion,
          maxPlayers: SERVER_CONFIG.maxPlayers,
          restartTime: SERVER_CONFIG.fullRestartTime,
        },
      });
    }

    // Query the Minecraft server
    const status = await queryMinecraftServer();

    // Update cache
    cachedStatus = status;
    cacheTimestamp = now;

    return NextResponse.json({
      ...status,
      cached: false,
      config: {
        ip: SERVER_CONFIG.ip,
        mcVersion: SERVER_CONFIG.mcVersion,
        forgeVersion: SERVER_CONFIG.forgeVersion,
        maxPlayers: SERVER_CONFIG.maxPlayers,
        restartTime: SERVER_CONFIG.fullRestartTime,
      },
    });
  } catch (error) {
    console.error('Failed to fetch server status:', error);

    // Return fallback status with config values
    return NextResponse.json({
      online: false,
      players: {
        online: 0,
        max: SERVER_CONFIG.maxPlayers,
      },
      error: 'Unable to reach server',
      config: {
        ip: SERVER_CONFIG.ip,
        mcVersion: SERVER_CONFIG.mcVersion,
        forgeVersion: SERVER_CONFIG.forgeVersion,
        maxPlayers: SERVER_CONFIG.maxPlayers,
        restartTime: SERVER_CONFIG.fullRestartTime,
      },
    });
  }
}
