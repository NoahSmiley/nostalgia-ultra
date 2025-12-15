// CS2 Knife configurations for Ultra members
// Knives are from the CS2 Knifes Pack (namespace: cs2_wt) and Ultra Knives Pack (namespace: cs2_ultra)

export interface KnifeConfig {
  id: string;
  name: string;
  description: string;
  itemId: string; // Item ID for giving via commands
  category?: 'standard' | 'fade' | 'doppler' | 'tiger' | 'crimson';
}

// Standard knives from CS2 Knifes Pack v1.0.1
// Item IDs use lrtactical:melee with MeleeWeaponId NBT tag
const STANDARD_KNIVES: KnifeConfig[] = [
  {
    id: 'butterfly',
    name: 'Butterfly Knife',
    description: 'A classic CS2 butterfly knife with smooth flipping animations',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:butterfly"}',
    category: 'standard',
  },
  {
    id: 'karambit',
    name: 'Karambit',
    description: 'Curved blade karambit with signature spinning inspect',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:karambit"}',
    category: 'standard',
  },
  {
    id: 'push',
    name: 'Shadow Daggers',
    description: 'Dual shadow daggers for quick strikes',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:push"}',
    category: 'standard',
  },
  {
    id: 'bayonet',
    name: 'Bayonet',
    description: 'Military-style bayonet with tactical edge',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:bayonet"}',
    category: 'standard',
  },
  {
    id: 'm9',
    name: 'M9 Bayonet',
    description: 'The iconic M9 bayonet with sleek design',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:m9"}',
    category: 'standard',
  },
  {
    id: 'skeleton',
    name: 'Skeleton Knife',
    description: 'Lightweight skeleton knife with unique grip',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:skeleton"}',
    category: 'standard',
  },
  {
    id: 'tactical',
    name: 'Huntsman Knife',
    description: 'Tactical huntsman knife for outdoor survival',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:tactical"}',
    category: 'standard',
  },
  {
    id: 'css',
    name: 'Classic Knife',
    description: 'The classic CS:S knife design',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:css"}',
    category: 'standard',
  },
  {
    id: 'stiletto',
    name: 'Stiletto Knife',
    description: 'Slim stiletto blade with elegant design',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:stiletto"}',
    category: 'standard',
  },
  {
    id: 'talon',
    name: 'Talon Knife',
    description: 'Serrated talon blade with aggressive styling',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_wt:talon"}',
    category: 'standard',
  },
];

// Ultra exclusive skin variants from CS2 Ultra Knives Pack
// These use the cs2_ultra namespace
const ULTRA_KNIVES: KnifeConfig[] = [
  // Butterfly Knife Variants
  {
    id: 'butterfly_fade',
    name: 'Butterfly Knife | Fade',
    description: 'Purple to pink to gold gradient finish',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:butterfly_fade"}',
    category: 'fade',
  },
  {
    id: 'butterfly_doppler',
    name: 'Butterfly Knife | Doppler',
    description: 'Swirling pink and purple pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:butterfly_doppler"}',
    category: 'doppler',
  },
  {
    id: 'butterfly_tiger',
    name: 'Butterfly Knife | Tiger Tooth',
    description: 'Golden blade with dark tiger stripes',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:butterfly_tiger"}',
    category: 'tiger',
  },
  {
    id: 'butterfly_crimson',
    name: 'Butterfly Knife | Crimson Web',
    description: 'Deep red with dark web pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:butterfly_crimson"}',
    category: 'crimson',
  },

  // Karambit Variants
  {
    id: 'karambit_fade',
    name: 'Karambit | Fade',
    description: 'Purple to pink to gold gradient finish',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:karambit_fade"}',
    category: 'fade',
  },
  {
    id: 'karambit_doppler',
    name: 'Karambit | Doppler',
    description: 'Swirling pink and purple pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:karambit_doppler"}',
    category: 'doppler',
  },
  {
    id: 'karambit_tiger',
    name: 'Karambit | Tiger Tooth',
    description: 'Golden blade with dark tiger stripes',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:karambit_tiger"}',
    category: 'tiger',
  },
  {
    id: 'karambit_crimson',
    name: 'Karambit | Crimson Web',
    description: 'Deep red with dark web pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:karambit_crimson"}',
    category: 'crimson',
  },

  // M9 Bayonet Variants
  {
    id: 'm9_fade',
    name: 'M9 Bayonet | Fade',
    description: 'Purple to pink to gold gradient finish',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:m9_fade"}',
    category: 'fade',
  },
  {
    id: 'm9_doppler',
    name: 'M9 Bayonet | Doppler',
    description: 'Swirling pink and purple pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:m9_doppler"}',
    category: 'doppler',
  },
  {
    id: 'm9_tiger',
    name: 'M9 Bayonet | Tiger Tooth',
    description: 'Golden blade with dark tiger stripes',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:m9_tiger"}',
    category: 'tiger',
  },
  {
    id: 'm9_crimson',
    name: 'M9 Bayonet | Crimson Web',
    description: 'Deep red with dark web pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:m9_crimson"}',
    category: 'crimson',
  },

  // Bayonet Variants
  {
    id: 'bayonet_fade',
    name: 'Bayonet | Fade',
    description: 'Purple to pink to gold gradient finish',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:bayonet_fade"}',
    category: 'fade',
  },
  {
    id: 'bayonet_doppler',
    name: 'Bayonet | Doppler',
    description: 'Swirling pink and purple pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:bayonet_doppler"}',
    category: 'doppler',
  },
  {
    id: 'bayonet_tiger',
    name: 'Bayonet | Tiger Tooth',
    description: 'Golden blade with dark tiger stripes',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:bayonet_tiger"}',
    category: 'tiger',
  },
  {
    id: 'bayonet_crimson',
    name: 'Bayonet | Crimson Web',
    description: 'Deep red with dark web pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:bayonet_crimson"}',
    category: 'crimson',
  },

  // Skeleton Knife Variants
  {
    id: 'skeleton_fade',
    name: 'Skeleton Knife | Fade',
    description: 'Purple to pink to gold gradient finish',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:skeleton_fade"}',
    category: 'fade',
  },
  {
    id: 'skeleton_doppler',
    name: 'Skeleton Knife | Doppler',
    description: 'Swirling pink and purple pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:skeleton_doppler"}',
    category: 'doppler',
  },
  {
    id: 'skeleton_tiger',
    name: 'Skeleton Knife | Tiger Tooth',
    description: 'Golden blade with dark tiger stripes',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:skeleton_tiger"}',
    category: 'tiger',
  },
  {
    id: 'skeleton_crimson',
    name: 'Skeleton Knife | Crimson Web',
    description: 'Deep red with dark web pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:skeleton_crimson"}',
    category: 'crimson',
  },

  // Talon Knife Variants
  {
    id: 'talon_fade',
    name: 'Talon Knife | Fade',
    description: 'Purple to pink to gold gradient finish',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:talon_fade"}',
    category: 'fade',
  },
  {
    id: 'talon_doppler',
    name: 'Talon Knife | Doppler',
    description: 'Swirling pink and purple pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:talon_doppler"}',
    category: 'doppler',
  },
  {
    id: 'talon_tiger',
    name: 'Talon Knife | Tiger Tooth',
    description: 'Golden blade with dark tiger stripes',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:talon_tiger"}',
    category: 'tiger',
  },
  {
    id: 'talon_crimson',
    name: 'Talon Knife | Crimson Web',
    description: 'Deep red with dark web pattern',
    itemId: 'lrtactical:melee{MeleeWeaponId:"cs2_ultra:talon_crimson"}',
    category: 'crimson',
  },
];

// Combined list of all available knives
export const AVAILABLE_KNIVES: KnifeConfig[] = [...STANDARD_KNIVES, ...ULTRA_KNIVES];

// Get a knife config by ID
export function getKnifeById(id: string): KnifeConfig | undefined {
  return AVAILABLE_KNIVES.find((knife) => knife.id === id);
}

// Validate if a knife ID is valid
export function isValidKnifeId(id: string): boolean {
  return AVAILABLE_KNIVES.some((knife) => knife.id === id);
}

// Get all knife IDs
export function getKnifeIds(): string[] {
  return AVAILABLE_KNIVES.map((knife) => knife.id);
}

// Get knives by category
export function getKnivesByCategory(category: KnifeConfig['category']): KnifeConfig[] {
  return AVAILABLE_KNIVES.filter((knife) => knife.category === category);
}

// Get all categories
export function getCategories(): string[] {
  return ['standard', 'fade', 'doppler', 'tiger', 'crimson'];
}
