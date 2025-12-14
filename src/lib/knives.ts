// CS2 Knife configurations for Ultra members
// Knives are from the TaCZ X LR CS2 Knifes Packet (Modrinth)

export interface KnifeConfig {
  id: string;
  name: string;
  description: string;
  itemId: string; // TACZ item ID for giving via commands
}

// Available CS2 knives from the LR CS2 Knifes pack
export const AVAILABLE_KNIVES: KnifeConfig[] = [
  {
    id: 'butterfly',
    name: 'Butterfly Knife',
    description: 'A classic CS2 butterfly knife with smooth flipping animations',
    itemId: 'tacz:cs2_butterfly_knife',
  },
  {
    id: 'karambit',
    name: 'Karambit',
    description: 'Curved blade karambit with signature spinning inspect',
    itemId: 'tacz:cs2_karambit',
  },
  {
    id: 'dagger',
    name: 'Shadow Daggers',
    description: 'Dual shadow daggers for quick strikes',
    itemId: 'tacz:cs2_shadow_daggers',
  },
  {
    id: 'bayonet',
    name: 'Bayonet',
    description: 'Military-style bayonet with tactical edge',
    itemId: 'tacz:cs2_bayonet',
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
