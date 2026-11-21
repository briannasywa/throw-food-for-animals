// Official Color Palette & Biome Zones based on Art Direction — Sunny Voxel Diorama (ZOO TOSS)
// Sky color: #7CCBFF

export const SKY_COLOR = 0x7CCBFF;

export const ZONES = [
  {
    id: 'lobby',
    name: 'Lobby',
    minDist: 0,
    maxDist: 300,
    stripes: [0x8EE06A, 0x7AD15A], // Lobby ground1 / ground2
    accent: 0xFF3D7F, // Pop Pink throw line / finish line
    gimmick: 'Safe zone and training grounds. Calm winds, perfect for beginners.',
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
    stripes: [0xB8EFA0, 0xA3E38A], // Farm ground1 / ground2
    accent: 0xFF7A1A,
    gimmick: 'Hay Fever: a gentle breeze carries hay. Stamina regen +20%.',
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
    stripes: [0x2FA84F, 0x23913F], // Jungle ground1 / ground2
    accent: 0xFF9A3D,
    gimmick: 'Tropical Rainstorm: rain makes food glide farther.',
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
    stripes: [0x3A2F4F, 0x2C2340], // Toxic ground1 / ground2
    accent: 0x8CFF3A, // Neon Slime
    gimmick: 'Radioactive: mutation chance up to 3×!',
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
    stripes: [0x3B2A2A, 0x2A1D1D], // Lava ground1 / ground2
    accent: 0xFF5A1F, // Lava Orange
    gimmick: 'Heatwave: rising magma heat lifts food higher.',
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
    stripes: [0x1F3A6B, 0x17305A], // Glow Sea ground1 / ground2
    accent: 0x3FF0FF, // Glow Cyan
    gimmick: 'Abyssal Pressure: strong gusts, the throw meter moves faster!',
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
    stripes: [0xF2E6D8, 0xE3D2C0], // Warm Snow ground1 / ground2 (revisi 9 Nov 2026)
    accent: 0xE8384F, // Candy Red
    gimmick: 'Holiday Blessing: animals sell for +50% at the booth.',
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
    stripes: [0xCFEFFF, 0xA9DDF7], // Frost Blue ground1 / ground2
    accent: 0x7FD3FF, // Crystal Ice
    gimmick: 'Blizzard: stamina drains 2× faster.',
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
    stripes: [0x2A1B4F, 0x1E1440], // Cosmic Space ground1 / ground2
    accent: 0xFFF27A, // Star Gold
    gimmick: 'Zero Gravity: throws fly with no friction!',
    windMultiplier: 2.2,
    animals: [
      { id: 'nebula_cat', name: 'Nebula Cat', rarity: 'Rare', baseCps: 5000000000000, weight: 40, color: 0xa855f7 },
      { id: 'astral_whale', name: 'Astral Whale', rarity: 'Epic', baseCps: 15000000000000, weight: 35, color: 0x38bdf8 },
      { id: 'star_phoenix', name: 'Star Phoenix', rarity: 'Legendary', baseCps: 50000000000000, weight: 18, color: 0xf59e0b },
      { id: 'cosmic_dragon', name: 'Cosmic Dragon', rarity: 'Mythic', baseCps: 200000000000000, weight: 7, color: 0x19E6C1 }
    ]
  }
];

export const FOOD_TIERS = [
  { id: 'carrot', name: 'Carrot', iconText: 'CARROT', color: '#FF7A1A', cost: 0, luckBonus: 1.0, desc: 'Basic bait for Lobby animals.' },
  { id: 'apple', name: 'Apple', iconText: 'APPLE', color: '#3CCB5A', cost: 100, luckBonus: 1.5, desc: 'Crisp bait for Farm animals.' },
  { id: 'meat', name: 'Meat', iconText: 'MEAT', color: '#B45309', cost: 800, luckBonus: 2.2, desc: 'Delicious bait for Jungle animals.' },
  { id: 'burger', name: 'Burger', iconText: 'BURGER', color: '#8CFF3A', cost: 5000, luckBonus: 3.5, desc: 'Strange bait for Toxic mutants.' },
  { id: 'sushi', name: 'Lava Roll', iconText: 'LAVA ROLL', color: '#FF5A1F', cost: 50000, luckBonus: 5.5, desc: 'Scorching bait for Lava beasts.' },
  { id: 'pearl', name: 'Pearl', iconText: 'PEARL', color: '#3FF0FF', cost: 500000, luckBonus: 9.0, desc: 'Glowing bait for Glow Sea creatures.' },
  { id: 'candy_cane', name: 'Candy', iconText: 'CANDY', color: '#E8384F', cost: 5000000, luckBonus: 14.0, desc: 'Festive treat for Christmas animals.' },
  { id: 'ice_crystal', name: 'Ice Gem', iconText: 'ICE GEM', color: '#7FD3FF', cost: 50000000, luckBonus: 22.0, desc: 'Subzero crystal for Frost creatures.' },
  { id: 'star_cake', name: 'Galaxy', iconText: 'GALAXY', color: '#FFF27A', cost: 500000000, luckBonus: 35.0, desc: 'Cosmic delicacy to summon mythical titans.' }
];

export const MUTATION_DATA = {
  Normal: { name: 'Normal', multiplier: 1.0, color: '#B8C2CC', chance: 85 },
  Gold: { name: 'Gold', multiplier: 1.8, color: '#FFD54A', chance: 10 },
  Diamond: { name: 'Diamond', multiplier: 3.5, color: '#9BEBFF', chance: 3.5 },
  Emerald: { name: 'Emerald', multiplier: 6.0, color: '#2EE59D', chance: 1.2 },
  Rainbow: { name: 'Rainbow', multiplier: 12.0, color: '#FF3D7F', chance: 0.3 }
};

export const RARITY_COLORS = {
  Common: '#B8C2CC',
  CommonDark: '#5E6B78',
  Rare: '#2F8CFF',
  RareDark: '#1A4F99',
  Epic: '#A24BFF',
  EpicDark: '#5A2299',
  Legendary: '#FFC21A',
  LegendaryDark: '#A66F00',
  Mythic: '#19E6C1',
  MythicDark: '#0B7A66'
};
