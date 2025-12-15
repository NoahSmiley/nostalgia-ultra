// CS2 Knife configurations for Ultra members
// Knives are from the CS2 Knifes Pack (namespace: cs2_wt)

export interface KnifeConfig {
  id: string;
  name: string;
  description: string;
  itemId: string; // Item ID for giving via commands (cs2_wt namespace)
}

// Available CS2 knives from the CS2 Knifes Pack v1.0.1
// Item IDs use lrtactical:melee with NBT tag for the specific knife
export const AVAILABLE_KNIVES: KnifeConfig[] = [
  {
    id: 'butterfly',
    name: 'Butterfly Knife',
    description: 'A classic CS2 butterfly knife with smooth flipping animations',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:butterfly"}',
  },
  {
    id: 'karambit',
    name: 'Karambit',
    description: 'Curved blade karambit with signature spinning inspect',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:karambit"}',
  },
  {
    id: 'push',
    name: 'Shadow Daggers',
    description: 'Dual shadow daggers for quick strikes',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:push"}',
  },
  {
    id: 'bayonet',
    name: 'Bayonet',
    description: 'Military-style bayonet with tactical edge',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:bayonet"}',
  },
  {
    id: 'm9',
    name: 'M9 Bayonet',
    description: 'The iconic M9 bayonet with sleek design',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:m9"}',
  },
  {
    id: 'skeleton',
    name: 'Skeleton Knife',
    description: 'Lightweight skeleton knife with unique grip',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:skeleton"}',
  },
  {
    id: 'tactical',
    name: 'Huntsman Knife',
    description: 'Tactical huntsman knife for outdoor survival',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:tactical"}',
  },
  {
    id: 'css',
    name: 'Classic Knife',
    description: 'The classic CS:S knife design',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:css"}',
  },
  {
    id: 'stiletto',
    name: 'Stiletto Knife',
    description: 'Slim stiletto blade with elegant design',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:stiletto"}',
  },
  {
    id: 'talon',
    name: 'Talon Knife',
    description: 'Serrated talon blade with aggressive styling',
    itemId: 'lrtactical:melee{Melee:"cs2_wt:talon"}',
  },
];

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
