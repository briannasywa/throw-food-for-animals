// Zoo Toss — biome zones & game data (angka game mengikuti prototype)
import { D } from './difficulty.js';

export const SKY_COLOR = 0x7ccbff; // palette.json -> core.background

export const ZONES = [
  {
    id: 'lobby',
    name: 'Lobby',
    minDist: 0,
    maxDist: 300,
    stripes: [0x8ee06a, 0x7ad15a], // palette.json -> biome ground1/ground2
    accent: 0xff3d7f, // palette.json -> core.accent (Pop Pink)
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
    stripes: [0xb8efa0, 0xa3e38a], // palette.json -> biome ground1/ground2
    accent: 0xffe29a, // palette.json -> Farm.hay
    gimmick: 'Hay Fever: a gentle breeze carries hay. Stamina regen +20%.',
    windMultiplier: 0.5,
    animals: [
      { id: 'pastel_chick', name: 'Farm Chick', rarity: 'Common', baseCps: 50, weight: 45, color: 0xffffff },
      { id: 'pastel_sheep', name: 'Farm Sheep', rarity: 'Rare', baseCps: 120, weight: 30, color: 0xf472b6 },
      { id: 'pastel_donkey', name: 'Farm Donkey', rarity: 'Epic', baseCps: 260, weight: 18, color: 0xf1f5f9 },
      { id: 'giant_pastel_pig', name: 'Giant Farm Pig', rarity: 'Legendary', baseCps: 800, weight: 7, color: 0x181425 }
    ]
  },
  {
    id: 'jungle',
    name: 'Jungle',
    minDist: 1001,
    maxDist: 2500,
    stripes: [0x2fa84f, 0x23913f], // palette.json -> biome ground1/ground2
    accent: 0xff9a3d, // palette.json -> Jungle.flower
    gimmick: 'Tropical Rainstorm: rain makes food glide farther.',
    windMultiplier: 0.8,
    animals: [
      { id: 'sunset_monkey', name: 'Jungle Monkey', rarity: 'Common', baseCps: 1200, weight: 45, color: 0x78350f },
      { id: 'sunset_parrot', name: 'Jungle Parrot', rarity: 'Rare', baseCps: 2800, weight: 30, color: 0xef4444 },
      { id: 'sunset_croc', name: 'Jungle Croc', rarity: 'Epic', baseCps: 6500, weight: 18, color: 0x22c55e },
      { id: 'giant_sunset_elephant', name: 'Giant Jungle Elephant', rarity: 'Legendary', baseCps: 18000, weight: 7, color: 0x334155 }
    ]
  },
  {
    id: 'toxic',
    name: 'Toxic',
    minDist: 2501,
    maxDist: 5000,
    stripes: [0x3a2f4f, 0x2c2340], // palette.json -> biome ground1/ground2
    accent: 0x8cff3a, // palette.json -> Toxic.slime
    accentGlow: true, // emissive
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
    stripes: [0x3b2a2a, 0x2a1d1d], // palette.json -> biome ground1/ground2
    accent: 0xff5a1f, // palette.json -> Lava.lava
    accentGlow: true, // emissive
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
    stripes: [0x1f3a6b, 0x17305a], // palette.json -> biome ground1/ground2
    accent: 0x3ff0ff, // palette.json -> GlowSea.glow
    accentGlow: true, // emissive
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
    stripes: [0xf2e6d8, 0xe3d2c0], // palette.json -> biome ground1/ground2
    accent: 0xe8384f, // palette.json -> Christmas.candy
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
    stripes: [0xcfefff, 0xa9ddf7], // palette.json -> biome ground1/ground2
    accent: 0x7fd3ff, // palette.json -> Frost.ice
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
    stripes: [0x2a1b4f, 0x1e1440], // palette.json -> biome ground1/ground2
    accent: 0xfff27a, // palette.json -> Galaxy.star
    accentGlow: true, // emissive
    gimmick: 'Zero Gravity: throws fly with no friction!',
    windMultiplier: 2.2,
    animals: [
      { id: 'nebula_cat', name: 'Nebula Cat', rarity: 'Rare', baseCps: 5000000000000, weight: 40, color: 0xa855f7 },
      { id: 'astral_whale', name: 'Astral Whale', rarity: 'Epic', baseCps: 15000000000000, weight: 35, color: 0x38bdf8 },
      { id: 'star_phoenix', name: 'Star Phoenix', rarity: 'Legendary', baseCps: 50000000000000, weight: 18, color: 0xf59e0b },
      { id: 'cosmic_dragon', name: 'Cosmic Dragon', rarity: 'Mythic', baseCps: 200000000000000, weight: 7, color: 0xf43f5e }
    ]
  }
];

// Mode hard (difficulty.js → zoneIncomeGrowth): penghasilan hewan per zona dipadatkan.
// Angka asli naik ~30× per zona sehingga uang selalu jauh melampaui harga upgrade.
// Di sini hewan terendah zona ke-i dibuat = 3 × growth^i $/s; perbandingan antar rarity dalam zona tetap sama.
if (D.zoneIncomeGrowth) {
  const g = D.zoneIncomeGrowth;
  const base0 = ZONES[0].animals[0].baseCps;
  ZONES.forEach((z, i) => {
    if (i === 0) return;
    const k = (base0 * Math.pow(g, i)) / z.animals[0].baseCps;
    z.animals.forEach(a => { a.baseCps = Math.max(1, Math.round(a.baseCps * k)); });
  });
}

export const FOOD_TIERS = [
  { id: 'carrot', name: 'Carrot', iconText: 'CARROT', color: '#7AD15A', cost: 0, luckBonus: 1.0, desc: 'Basic bait for Lobby animals.' },
  { id: 'apple', name: 'Apple', iconText: 'APPLE', color: '#B8EFA0', cost: 100, luckBonus: 1.5, desc: 'Fresh bait for Farm animals.' },
  { id: 'meat', name: 'Meat', iconText: 'MEAT', color: '#2FA84F', cost: 800, luckBonus: 2.2, desc: 'Tasty bait for Jungle animals.' },
  { id: 'burger', name: 'Burger', iconText: 'BURGER', color: '#8CFF3A', cost: 5000, luckBonus: 3.5, desc: 'Weird bait for Toxic mutants.' },
  { id: 'sushi', name: 'Lava Roll', iconText: 'LAVA ROLL', color: '#FF5A1F', cost: 50000, luckBonus: 5.5, desc: 'Sizzling bait for Lava animals.' },
  { id: 'pearl', name: 'Pearl', iconText: 'PEARL', color: '#3FF0FF', cost: 500000, luckBonus: 9.0, desc: 'Glowing bait for Glow Sea.' },
  { id: 'candy_cane', name: 'Candy', iconText: 'CANDY', color: '#E8384F', cost: 5000000, luckBonus: 14.0, desc: 'Sweet bait for Christmas.' },
  { id: 'ice_crystal', name: 'Ice Gem', iconText: 'ICE GEM', color: '#7FD3FF', cost: 50000000, luckBonus: 22.0, desc: 'Frozen bait for Frost.' },
  { id: 'star_cake', name: 'Galaxy', iconText: 'GALAXY', color: '#B57BFF', cost: 500000000, luckBonus: 35.0, desc: 'Mythic bait for Galaxy.' }
];

/** Makanan khusus zona: urutan FOOD_TIERS = urutan ZONES (Carrot = Lobby, Apple = Farm, …, Galaxy = Galaxy). */
export const zoneFoodOf = (zone) => FOOD_TIERS[Math.max(0, ZONES.findIndex(z => z.id === zone.id))] || FOOD_TIERS[0];
/** Zona tempat sebuah makanan menjadi makanan khusus. */
export const foodZoneOf = (food) => ZONES[FOOD_TIERS.indexOf(food)] || null;

export const MUTATION_DATA = {
  // warna dari palette.json -> mutation (Rainbow = gradasi di UI, warna ini hanya cadangan)
  Normal: { name: 'Normal', multiplier: 1.0, color: '#B8C2CC', chance: 85 },
  Gold: { name: 'Gold', multiplier: 1.8, color: '#FFD54A', chance: 10 },
  Diamond: { name: 'Diamond', multiplier: 3.5, color: '#9BEBFF', chance: 3.5 },
  Emerald: { name: 'Emerald', multiplier: 6.0, color: '#2EE59D', chance: 1.2 },
  Rainbow: { name: 'Rainbow', multiplier: 12.0, color: '#FF4B4B', chance: 0.3 }
};

// palette.json -> rarity
export const RARITY_COLORS = {
  Common: '#B8C2CC',
  Rare: '#2F8CFF',
  Epic: '#A24BFF',
  Legendary: '#FFC21A',
  Mythic: '#19E6C1'
};
