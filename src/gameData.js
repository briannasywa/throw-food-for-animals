// Official Color Palette & Biome Zones based on Roblox "Throw Food For Animals"
// Sky color: #70c5ff (Vibrant Roblox Sky Blue)

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
      { id: 'rabbit', name: 'Kelinci', rarity: 'Common', baseCps: 3, weight: 50, color: 0xffffff },
      { id: 'dog', name: 'Anjing Puppy', rarity: 'Common', baseCps: 6, weight: 35, color: 0xb45309 },
      { id: 'cat', name: 'Kucing Kampung', rarity: 'Rare', baseCps: 15, weight: 12, color: 0xf59e0b },
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
      { id: 'chicken', name: 'Ayam Jago', rarity: 'Common', baseCps: 50, weight: 45, color: 0xffffff },
      { id: 'pig', name: 'Babi Lucu', rarity: 'Rare', baseCps: 120, weight: 30, color: 0xf472b6 },
      { id: 'sheep', name: 'Domba Wol', rarity: 'Epic', baseCps: 260, weight: 18, color: 0xf1f5f9 },
      { id: 'cow', name: 'Sapi Perah', rarity: 'Legendary', baseCps: 800, weight: 7, color: 0x181425 }
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
      { id: 'monkey', name: 'Monyet Lincah', rarity: 'Common', baseCps: 1200, weight: 45, color: 0x78350f },
      { id: 'parrot', name: 'Burung Beo', rarity: 'Rare', baseCps: 2800, weight: 30, color: 0xef4444 },
      { id: 'snake', name: 'Ular Sanca', rarity: 'Epic', baseCps: 6500, weight: 18, color: 0x22c55e },
      { id: 'gorilla', name: 'Gorila Perak', rarity: 'Legendary', baseCps: 18000, weight: 7, color: 0x334155 }
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
      { id: 'mutant_rat', name: 'Tikus Radioaktif', rarity: 'Common', baseCps: 35000, weight: 45, color: 0x6366f1 },
      { id: 'toxic_slime', name: 'Slime Beracun', rarity: 'Rare', baseCps: 80000, weight: 30, color: 0x22c55e },
      { id: 'mutant_bat', name: 'Kelelawar Asam', rarity: 'Epic', baseCps: 200000, weight: 18, color: 0x818cf8 },
      { id: 'radioactive_spider', name: 'Laba-laba Nuklir', rarity: 'Legendary', baseCps: 600000, weight: 7, color: 0xa855f7 }
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
      { id: 'magma_snail', name: 'Siput Magma', rarity: 'Common', baseCps: 1200000, weight: 45, color: 0xea580c },
      { id: 'fire_lizard', name: 'Kadal Api', rarity: 'Rare', baseCps: 3000000, weight: 30, color: 0xd97706 },
      { id: 'hell_hound', name: 'Cerberus Neraka', rarity: 'Epic', baseCps: 8000000, weight: 18, color: 0x991b1b },
      { id: 'volcano_golem', name: 'Golem Lahar Raksasa', rarity: 'Legendary', baseCps: 25000000, weight: 7, color: 0x7c2d12 }
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
      { id: 'anglerfish', name: 'Ikan Sungut Lampu', rarity: 'Common', baseCps: 45000000, weight: 45, color: 0x0284c7 },
      { id: 'glow_jellyfish', name: 'Ubur-ubur Neon', rarity: 'Rare', baseCps: 120000000, weight: 30, color: 0x06b6d4 },
      { id: 'giant_squid', name: 'Cumi Raksasa Abisal', rarity: 'Epic', baseCps: 300000000, weight: 18, color: 0x38bdf8 },
      { id: 'leviathan', name: 'Leviathan Samudra', rarity: 'Legendary', baseCps: 900000000, weight: 7, color: 0x0ea5e9 }
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
      { id: 'gingerbread_man', name: 'Manusia Jahe', rarity: 'Common', baseCps: 1500000000, weight: 45, color: 0xb45309 },
      { id: 'snow_reindeer', name: 'Rusa Kutub Sinterklas', rarity: 'Rare', baseCps: 4000000000, weight: 30, color: 0xd97706 },
      { id: 'nutcracker', name: 'Prajurit Nutcracker', rarity: 'Epic', baseCps: 10000000000, weight: 18, color: 0xbe123c },
      { id: 'santa_yeti', name: 'Yeti Topi Merah', rarity: 'Legendary', baseCps: 30000000000, weight: 7, color: 0xffffff }
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
      { id: 'ice_golem', name: 'Golem Es Kristal', rarity: 'Common', baseCps: 50000000000, weight: 45, color: 0x7dd3fc },
      { id: 'frost_wolf', name: 'Serigala Badai Salju', rarity: 'Rare', baseCps: 140000000000, weight: 30, color: 0xe0f2fe },
      { id: 'mammoth_frost', name: 'Mammoth Gading Es', rarity: 'Epic', baseCps: 400000000000, weight: 18, color: 0x38bdf8 },
      { id: 'frost_wyrm', name: 'Naga Es Beku Kuno', rarity: 'Legendary', baseCps: 1200000000000, weight: 7, color: 0x0284c7 }
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
      { id: 'star_cat', name: 'Kucing Nebula', rarity: 'Rare', baseCps: 5000000000000, weight: 40, color: 0xa855f7 },
      { id: 'void_whale', name: 'Paus Kosmik Astral', rarity: 'Epic', baseCps: 15000000000000, weight: 35, color: 0x38bdf8 },
      { id: 'phoenix_sun', name: 'Phoenix Bintang Surya', rarity: 'Legendary', baseCps: 50000000000000, weight: 18, color: 0xf59e0b },
      { id: 'cosmic_dragon', name: 'Naga Kosmik Keabadian', rarity: 'Mythic', baseCps: 200000000000000, weight: 7, color: 0xf43f5e }
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
