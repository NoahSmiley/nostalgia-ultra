/**
 * External Links Configuration
 * Central source of truth for all external URLs
 */

export const LINKS = {
  // Social & Community
  discord: process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/kZ73ZH5hz6',

  // Launcher Downloads
  prismLauncher: 'https://prismlauncher.org/download',
  atLauncher: 'https://atlauncher.com/downloads',
  forgeInstaller: 'https://files.minecraftforge.net/net/minecraftforge/forge/',

  // Documentation & Help
  forgeWiki: 'https://docs.minecraftforge.net/',
  minecraftWiki: 'https://minecraft.wiki/',
} as const;

// Brand/Site Info
export const SITE_CONFIG = {
  name: 'Nostalgia Ultra',
  tagline: 'A premium Minecraft community experience',
  description: 'Join the Nostalgia Ultra Minecraft server - a carefully curated modded survival experience.',
} as const;
