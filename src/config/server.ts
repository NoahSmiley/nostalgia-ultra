/**
 * Server Configuration
 * Central source of truth for all Minecraft server-related values
 */

export const SERVER_CONFIG = {
  // Server Connection (public-facing address for players)
  ip: process.env.NEXT_PUBLIC_SERVER_IP || 'n1429.pufferfish.host:25565',
  port: 25565,

  // Actual server host for status queries (backend only)
  statusHost: process.env.MC_STATUS_HOST || 'n1429.pufferfish.host',
  statusPort: parseInt(process.env.MC_STATUS_PORT || '25565'),

  // Minecraft & Mod Loader Versions
  mcVersion: process.env.NEXT_PUBLIC_MC_VERSION || '1.20.1',
  forgeVersion: process.env.NEXT_PUBLIC_FORGE_VERSION || '47.3.0',

  // Modpack - hosted via GitHub Pages (direct download link for Prism Launcher import)
  modpackUrl: process.env.NEXT_PUBLIC_MODPACK_URL || 'https://noahsmiley.github.io/noahs-server-modpack/Noahs-Server.mrpack',
  modpackUrlUltra: 'https://noahsmiley.github.io/noahs-server-modpack-ultra/Noahs-Server-Ultra.mrpack',
  modCount: 125,
  modCountUltra: 125,

  // Server Settings
  maxPlayers: 20,
  renderDistance: 12,
  afkTimeout: 15, // minutes
  restartTime: '4:00 AM',
  restartTimezone: 'EST',
  backupFrequency: 'Daily',

  // Display strings (computed)
  get fullRestartTime() {
    return `${this.restartTime} ${this.restartTimezone}`;
  },
  get mcVersionDisplay() {
    return `Minecraft ${this.mcVersion}`;
  },
  get forgeVersionDisplay() {
    return `Forge ${this.forgeVersion}`;
  },
  get modCountDisplay() {
    return `${this.modCount}+`;
  },
} as const;

// System Requirements
export const SYSTEM_REQUIREMENTS = {
  java: {
    version: 21,
    display: 'Java 21 or later',
  },
  ram: {
    minimum: 4, // GB
    recommended: 6,
    minimumDisplay: 'At least 4GB allocated to Minecraft',
    recommendedDisplay: '4-6GB is ideal',
  },
  disk: {
    required: 2, // GB
    display: 'About 2GB of free space',
  },
  renderDistance: {
    recommended: '8-10 chunks',
  },
} as const;

// World Information
export const WORLDS = {
  frontier: {
    name: 'The Frontier',
    description: 'Our main survival world with custom terrain generation. Build, explore, and thrive.',
    status: 'available' as const,
  },
  canvas: {
    name: 'The Canvas',
    description: 'A creative world for building without limits. Design and share your creations.',
    status: 'coming_soon' as const,
  },
  crucible: {
    name: 'The Crucible',
    description: 'Test your skills in competitive PvP battles and events.',
    status: 'coming_soon' as const,
  },
} as const;
