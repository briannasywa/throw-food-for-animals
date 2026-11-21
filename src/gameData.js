// Zoo Toss — biome zones & game data (angka game mengikuti prototype)

export const SKY_COLOR = 0x70c5ff;

export const ZONES = [
  {
    id: 'lobby',
    name: 'Lobby',
    minDist: 0,
    maxDist: 300,
    stripes: [0x84cc16, 0x65a30d], // Lime green stripes
    accent: 0xec4899, // Pink finish line separator
    gimmick: 'Safe Zone & Training Grounds: Angin tenang, tempat ideal pemula.',
    windMultiplier: 0.2,
    animals: [
      { id: 'rabbit', name: 'Rabbit', rarity: 'Common', baseCps: 3, weight: 50, color: 0xffffff },
      { id: 'puppy', name: 'Puppy', rarity: 'Common', baseCps: 6, weight: 35, color: 0xb45309 },
      { id: 'cat', name: 'Cat', rarity: 'Rare', baseCps: 15, weight: 12, color: 0xf59e0b },
      { id: 'golden_retriever', name: 'Golden Retriever', rarity: 'Epic', baseCps: 35, weight: 3, color: 0xfef08a }
    ]
  },
  {
    id: 'farm',
    name: 'Farm',
    minDist: 301,
    maxDist: 1000,
    stripes: [0xa3e635, 0x84cc16], // Light grass green
    accent: 0xf97316,
    gimmick: 'Hay Fever: Angin bertiup lembut membawa jerami, stamina regen +20%.',
    windMultiplier: 0.5,
    animals: [
      { id: 'pastel_chick', name: 'Pastel Chick', rarity: 'Common', baseCps: 50, weight: 45, color: 0xffffff },
      { id: 'pastel_sheep', name: 'Pastel Sheep', rarity: 'Rare', baseCps: 120, weight: 30, color: 0xf472b6 },
      { id: 'pastel_donkey', name: 'Pastel Donkey', rarity: 'Epic', baseCps: 260, weight: 18, color: 0xf1f5f9 },
      { id: 'giant_pastel_pig', name: 'Giant Pastel Pig', rarity: 'Legendary', baseCps: 800, weight: 7, color: 0x181425 }
    ]
  },
  {
    id: 'jungle',
    name: 'Jungle',
    minDist: 1001,
    maxDist: 2500,
    stripes: [0x15803d, 0x166534], // Deep jungle emerald green
    accent: 0xf97316, // Orange bottom curb
    gimmick: 'Tropical Rainstorm: Hujan tropis mempercepat luncuran makanan di udara.',
    windMultiplier: 0.8,
    animals: [
      { id: 'sunset_monkey', name: 'Sunset Monkey', rarity: 'Common', baseCps: 1200, weight: 45, color: 0x78350f },
      { id: 'sunset_parrot', name: 'Sunset Parrot', rarity: 'Rare', baseCps: 2800, weight: 30, color: 0xef4444 },
      { id: 'sunset_croc', name: 'Sunset Croc', rarity: 'Epic', baseCps: 6500, weight: 18, color: 0x22c55e },
      { id: 'giant_sunset_elephant', name: 'Giant Sunset Elephant', rarity: 'Legendary', baseCps: 18000, weight: 7, color: 0x334155 }
    ]
  },
  {
    id: 'toxic',
    name: 'Toxic',
    minDist: 2501,
    maxDist: 5000,
    stripes: [0x312e81, 0x1e1b4b], // Dark purple/indigo
    accent: 0x84cc16, // Radioactive bright lime bottom
    gimmick: 'Radioactive Radiation: Meningkatkan peluang mutasi hewan hingga 3x lipat!',
    windMultiplier: 1.0,
    animals: [
      { id: 'toxic_bunny', name: 'Toxic Bunny', rarity: 'Common', baseCps: 35000, weight: 45, color: 0x6366f1 },
      { id: 'slime_frog', name: 'Slime Frog', rarity: 'Rare', baseCps: 80000, weight: 30, color: 0x22c55e },
      { id: 'mummy_cat', name: 'Mummy Cat', rarity: 'Epic', baseCps: 200000, weight: 18, color: 0x818cf8 },
      { id: 'giant_bat_bear', name: 'Giant Bat Bear', rarity: 'Legendary', baseCps: 600000, weight: 7, color: 0xa855f7 }
    ]
  },
  {
    id: 'lava',
    name: 'Lava',
    minDist: 5001,
    maxDist: 9000,
    stripes: [0x261715, 0x1a0f0d], // Dark magma ash
    accent: 0xf97316, // Bright magma orange
    gimmick: 'Thermal Heatwave: Hawa panas magma mengangkat makanan melambung lebih tinggi.',
    windMultiplier: 1.2,
    animals: [
      { id: 'lava_raptor', name: 'Lava Raptor', rarity: 'Common', baseCps: 1200000, weight: 45, color: 0xea580c },
      { id: 'magma_ankylo', name: 'Magma Ankylo', rarity: 'Rare', baseCps: 3000000, weight: 30, color: 0xd97706 },
      { id: 'lava_trike', name: 'Lava Trike', rarity: 'Epic', baseCps: 8000000, weight: 18, color: 0x991b1b },
      { id: 'volcano_brachio', name: 'Volcano Brachio', rarity: 'Legendary', baseCps: 25000000, weight: 7, color: 0x7c2d12 }
    ]
  },
  {
    id: 'glow_sea',
    name: 'Glow Sea',
    minDist: 9001,
    maxDist: 15000,
    stripes: [0x1e3a8a, 0x172554], // Deep abyssal navy
    accent: 0x06b6d4, // Neon cyan bioluminescence
    gimmick: 'Abyssal Pressure: Angin bergejolak kencang, timing meter bergerak lebih cepat!',
    windMultiplier: 1.5,
    animals: [
      { id: 'glow_squid', name: 'Glow Squid', rarity: 'Common', baseCps: 45000000, weight: 45, color: 0x0284c7 },
      { id: 'glow_hermit_crab', name: 'Glow Hermit Crab', rarity: 'Rare', baseCps: 120000000, weight: 30, color: 0x06b6d4 },
      { id: 'glow_manta', name: 'Glow Manta', rarity: 'Epic', baseCps: 300000000, weight: 18, color: 0x38bdf8 },
      { id: 'abyss_serpent', name: 'Abyss Serpent', rarity: 'Legendary', baseCps: 900000000, weight: 7, color: 0x0ea5e9 }
    ]
  },
  {
    id: 'christmas',
    name: 'Christmas',
    minDist: 15001,
    maxDist: 23000,
    stripes: [0xe11d48, 0xfff1f2], // Red & White candy cane stripes!
    accent: 0x15803d, // Festive green bottom
    gimmick: 'Holiday Blessing: Hadiah Natal melimpah! Nilai jual hewan ke NPC naik +50%.',
    windMultiplier: 0.9,
    animals: [
      { id: 'gingerbread_kitty', name: 'Gingerbread Kitty', rarity: 'Common', baseCps: 1500000000, weight: 45, color: 0xb45309 },
      { id: 'candy_reindeer', name: 'Candy Reindeer', rarity: 'Rare', baseCps: 4000000000, weight: 30, color: 0xd97706 },
      { id: 'peppermint_dragon', name: 'Peppermint Dragon', rarity: 'Epic', baseCps: 10000000000, weight: 18, color: 0xbe123c },
      { id: 'giant_yeti', name: 'Giant Yeti', rarity: 'Legendary', baseCps: 30000000000, weight: 7, color: 0xffffff }
    ]
  },
  {
    id: 'frost',
    name: 'Frost',
    minDist: 23001,
    maxDist: 34000,
    stripes: [0xbae6fd, 0xe0f2fe], // Light glacier icy cyan/white
    accent: 0x38bdf8, // Ice blue bottom
    gimmick: 'Blizzard Freeze: Badai salju es ekstrem! Konsumsi stamina meningkat 2x lipat.',
    windMultiplier: 1.8,
    animals: [
      { id: 'frost_whelp', name: 'Frost Whelp', rarity: 'Common', baseCps: 50000000000, weight: 45, color: 0x7dd3fc },
      { id: 'frost_wolf', name: 'Frost Wolf', rarity: 'Rare', baseCps: 140000000000, weight: 30, color: 0xe0f2fe },
      { id: 'ice_mammoth', name: 'Ice Mammoth', rarity: 'Epic', baseCps: 400000000000, weight: 18, color: 0x38bdf8 },
      { id: 'frost_wyrm', name: 'Frost Wyrm', rarity: 'Legendary', baseCps: 1200000000000, weight: 7, color: 0x0284c7 }
    ]
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    minDist: 34001,
    maxDist: 60000,
    stripes: [0x1e1035, 0x0d0714], // Deep space cosmic black/purple
    accent: 0xfef08a, // Golden cosmic bottom border
    gimmick: 'Zero Gravity & Void Singularity: Jarak lemparan melesat tanpa batas gesekan!',
    windMultiplier: 2.2,
    animals: [
      { id: 'nebula_cat', name: 'Nebula Cat', rarity: 'Rare', baseCps: 5000000000000, weight: 40, color: 0xa855f7 },
      { id: 'astral_whale', name: 'Astral Whale', rarity: 'Epic', baseCps: 15000000000000, weight: 35, color: 0x38bdf8 },
      { id: 'star_phoenix', name: 'Star Phoenix', rarity: 'Legendary', baseCps: 50000000000000, weight: 18, color: 0xf59e0b },
      { id: 'cosmic_dragon', name: 'Cosmic Dragon', rarity: 'Mythic', baseCps: 200000000000000, weight: 7, color: 0xf43f5e }
    ]
  }
];

export const FOOD_TIERS = [
  { id: 'carrot', name: 'Wortel', iconText: 'CARROT', color: '#84cc16', cost: 0, luckBonus: 1.0, desc: 'Umpan dasar hewan Lobby.' },
  { id: 'apple', name: 'Apel Kebun', iconText: 'APPLE', color: '#a3e635', cost: 100, luckBonus: 1.5, desc: 'Umpan segar hewan Farm.' },
  { id: 'meat', name: 'Daging Rimba', iconText: 'MEAT', color: '#15803d', cost: 800, luckBonus: 2.2, desc: 'Umpan lezat hewan Jungle.' },
  { id: 'burger', name: 'Burger Toksik', iconText: 'BURGER', color: '#6366f1', cost: 5000, luckBonus: 3.5, desc: 'Umpan aneh mutasi Toxic.' },
  { id: 'sushi', name: 'Lahar Sushi', iconText: 'LAVA ROLL', color: '#f97316', cost: 50000, luckBonus: 5.5, desc: 'Umpan membara hewan Lava.' },
  { id: 'pearl', name: 'Mutiara Laut', iconText: 'PEARL', color: '#06b6d4', cost: 500000, luckBonus: 9.0, desc: 'Umpan bercahaya Glow Sea.' },
  { id: 'candy_cane', name: 'Permen Natal', iconText: 'CANDY', color: '#e11d48', cost: 5000000, luckBonus: 14.0, desc: 'Umpan manis zona Christmas.' },
  { id: 'ice_crystal', name: 'Kristal Es Abadi', iconText: 'ICE GEM', color: '#38bdf8', cost: 50000000, luckBonus: 22.0, desc: 'Umpan dingin zona Frost.' },
  { id: 'star_cake', name: 'Kue Bintang Kosmik', iconText: 'GALAXY', color: '#fef08a', cost: 500000000, luckBonus: 35.0, desc: 'Umpan mitologis penakluk Galaxy.' }
];

export const MUTATION_DATA = {
  Normal: { name: 'Normal', multiplier: 1.0, color: '#94a3b8', chance: 85 },
  Gold: { name: 'Gold', multiplier: 1.8, color: '#f59e0b', chance: 10 },
  Diamond: { name: 'Diamond', multiplier: 3.5, color: '#06b6d4', chance: 3.5 },
  Emerald: { name: 'Emerald', multiplier: 6.0, color: '#10b981', chance: 1.2 },
  Rainbow: { name: 'Rainbow', multiplier: 12.0, color: '#ec4899', chance: 0.3 }
};

export const RARITY_COLORS = {
  Common: '#94a3b8',
  Rare: '#06b6d4',
  Epic: '#a855f7',
  Legendary: '#f59e0b',
  Mythic: '#ef4444'
};
