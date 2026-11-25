// Zoo Toss — biome zones & game data (angka game mengikuti prototype)
import { D } from './difficulty.js';

export const SKY_COLOR = 0x7ccbff; // palette.json -> core.background

// Jarak dalam meter = unit dunia (1 unit = 1 m, sejak 0.5.1). Dulu 1 unit = 12 m sehingga 800 m di layar terasa dekat.
export const ZONES = [
  {
    id: 'lobby',
    name: 'Lobby',
    minDist: 0,
    maxDist: 25,
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
    minDist: 26,
    maxDist: 85,
    stripes: [0xb8efa0, 0xa3e38a], // palette.json -> biome ground1/ground2
    accent: 0xffe29a, // palette.json -> Farm.hay
    gimmick: 'Hay Fever: a gentle breeze carries hay. Stamina regen +20%.',
    windMultiplier: 0.5,
    animals: [
      // v1 & v2 berpasangan per rarity: bobot rarity dibagi 55/45, hewan v2 = penghasilan v1 x1.25
      { id: 'pastel_chick', name: 'Farm Chick', rarity: 'Common', baseCps: 50, weight: 25, color: 0xffffff },
      { id: 'farm_goat', name: 'Farm Goat', rarity: 'Common', baseCps: 62, weight: 20, color: 0xffe9b8, set: 'v2' },
      { id: 'pastel_sheep', name: 'Farm Sheep', rarity: 'Rare', baseCps: 120, weight: 16, color: 0xf472b6 },
      { id: 'farm_duck', name: 'Farm Duck', rarity: 'Rare', baseCps: 150, weight: 14, color: 0xffd6e5, set: 'v2' },
      { id: 'pastel_donkey', name: 'Farm Donkey', rarity: 'Epic', baseCps: 260, weight: 10, color: 0xf1f5f9 },
      { id: 'farm_llama', name: 'Farm Llama', rarity: 'Epic', baseCps: 325, weight: 8, color: 0xffd3b0, set: 'v2' },
      { id: 'giant_pastel_pig', name: 'Giant Farm Pig', rarity: 'Legendary', baseCps: 800, weight: 4, color: 0x181425 },
      { id: 'giant_farm_turkey', name: 'Giant Farm Turkey', rarity: 'Legendary', baseCps: 1000, weight: 3, color: 0xffe6b0, set: 'v2' }
    ]
  },
  {
    id: 'jungle',
    name: 'Jungle',
    minDist: 86,
    maxDist: 210,
    stripes: [0x2fa84f, 0x23913f], // palette.json -> biome ground1/ground2
    accent: 0xff9a3d, // palette.json -> Jungle.flower
    gimmick: 'Tropical Rainstorm: rain makes food glide farther.',
    windMultiplier: 0.8,
    animals: [
      // v1 & v2 berpasangan per rarity: bobot rarity dibagi 55/45, hewan v2 = penghasilan v1 x1.25
      { id: 'sunset_monkey', name: 'Jungle Monkey', rarity: 'Common', baseCps: 1200, weight: 25, color: 0x78350f },
      { id: 'jungle_flamingo', name: 'Jungle Flamingo', rarity: 'Common', baseCps: 1500, weight: 20, color: 0xff7fb8, set: 'v2' },
      { id: 'sunset_parrot', name: 'Jungle Parrot', rarity: 'Rare', baseCps: 2800, weight: 16, color: 0xef4444 },
      { id: 'jungle_zebra', name: 'Jungle Zebra', rarity: 'Rare', baseCps: 3500, weight: 14, color: 0xffd23f, set: 'v2' },
      { id: 'sunset_croc', name: 'Jungle Croc', rarity: 'Epic', baseCps: 6500, weight: 10, color: 0x22c55e },
      { id: 'jungle_tiger', name: 'Jungle Tiger', rarity: 'Epic', baseCps: 8125, weight: 8, color: 0xffa94d, set: 'v2' },
      { id: 'giant_sunset_elephant', name: 'Giant Jungle Elephant', rarity: 'Legendary', baseCps: 18000, weight: 4, color: 0x334155 },
      { id: 'giant_jungle_buffalo', name: 'Giant Jungle Buffalo', rarity: 'Legendary', baseCps: 22500, weight: 3, color: 0xa8508f, set: 'v2' }
    ]
  },
  {
    id: 'toxic',
    name: 'Toxic',
    minDist: 211,
    maxDist: 420,
    stripes: [0x3a2f4f, 0x2c2340], // palette.json -> biome ground1/ground2
    accent: 0x8cff3a, // palette.json -> Toxic.slime
    accentGlow: true, // emissive
    gimmick: 'Radioactive: mutation chance up to 3×!',
    windMultiplier: 1.0,
    animals: [
      // v1 & v2 berpasangan per rarity: bobot rarity dibagi 55/45, hewan v2 = penghasilan v1 x1.25
      { id: 'toxic_bunny', name: 'Toxic Bunny', rarity: 'Common', baseCps: 35000, weight: 25, color: 0x6366f1 },
      { id: 'ghost_owl', name: 'Ghost Owl', rarity: 'Common', baseCps: 43750, weight: 20, color: 0xe8ffe0, set: 'v2' },
      { id: 'slime_frog', name: 'Slime Frog', rarity: 'Rare', baseCps: 80000, weight: 16, color: 0x22c55e },
      { id: 'sludge_worm', name: 'Sludge Worm', rarity: 'Rare', baseCps: 100000, weight: 14, color: 0xff9a3d, set: 'v2' },
      { id: 'mummy_cat', name: 'Mummy Cat', rarity: 'Epic', baseCps: 200000, weight: 10, color: 0x818cf8 },
      { id: 'cyclops_imp', name: 'Cyclops Imp', rarity: 'Epic', baseCps: 250000, weight: 8, color: 0xff6b5a, set: 'v2' },
      { id: 'giant_bat_bear', name: 'Giant Bat Bear', rarity: 'Legendary', baseCps: 600000, weight: 4, color: 0xa855f7 },
      { id: 'giant_cauldron_witch', name: 'Giant Cauldron Witch', rarity: 'Legendary', baseCps: 750000, weight: 3, color: 0xe0864a, set: 'v2' }
    ]
  },
  {
    id: 'lava',
    name: 'Lava',
    minDist: 421,
    maxDist: 750,
    stripes: [0x3b2a2a, 0x2a1d1d], // palette.json -> biome ground1/ground2
    accent: 0xff5a1f, // palette.json -> Lava.lava
    accentGlow: true, // emissive
    gimmick: 'Heatwave: rising magma heat lifts food higher.',
    windMultiplier: 1.2,
    animals: [
      // v1 & v2 berpasangan per rarity: bobot rarity dibagi 55/45, hewan v2 = penghasilan v1 x1.25
      { id: 'lava_raptor', name: 'Lava Raptor', rarity: 'Common', baseCps: 1200000, weight: 25, color: 0xea580c },
      { id: 'cinder_boar', name: 'Cinder Boar', rarity: 'Common', baseCps: 1500000, weight: 20, color: 0xe8603a, set: 'v2' },
      { id: 'magma_ankylo', name: 'Magma Ankylo', rarity: 'Rare', baseCps: 3000000, weight: 16, color: 0xd97706 },
      { id: 'hellhound_pup', name: 'Hellhound Pup', rarity: 'Rare', baseCps: 3750000, weight: 14, color: 0xe8452e, set: 'v2' },
      { id: 'lava_trike', name: 'Lava Trike', rarity: 'Epic', baseCps: 8000000, weight: 10, color: 0x991b1b },
      { id: 'lava_stego', name: 'Lava Stego', rarity: 'Epic', baseCps: 10000000, weight: 8, color: 0xff7a45, set: 'v2' },
      { id: 'volcano_brachio', name: 'Volcano Brachio', rarity: 'Legendary', baseCps: 25000000, weight: 4, color: 0x7c2d12 },
      { id: 'giant_obsidian_ape', name: 'Giant Obsidian Ape', rarity: 'Legendary', baseCps: 31250000, weight: 3, color: 0x6b6fa8, set: 'v2' }
    ]
  },
  {
    id: 'glow_sea',
    name: 'Glow Sea',
    minDist: 751,
    maxDist: 1250,
    stripes: [0x1f3a6b, 0x17305a], // palette.json -> biome ground1/ground2
    accent: 0x3ff0ff, // palette.json -> GlowSea.glow
    accentGlow: true, // emissive
    gimmick: 'Abyssal Pressure: strong gusts, the throw meter moves faster!',
    windMultiplier: 1.5,
    animals: [
      // v1 & v2 berpasangan per rarity: bobot rarity dibagi 55/45, hewan v2 = penghasilan v1 x1.25
      { id: 'glow_squid', name: 'Glow Squid', rarity: 'Common', baseCps: 45000000, weight: 25, color: 0x0284c7 },
      { id: 'glow_jelly', name: 'Glow Jelly', rarity: 'Common', baseCps: 56250000, weight: 20, color: 0xffb8e8, set: 'v2' },
      { id: 'glow_hermit_crab', name: 'Glow Hermit Crab', rarity: 'Rare', baseCps: 120000000, weight: 16, color: 0x06b6d4 },
      { id: 'glow_pufferfish', name: 'Glow Pufferfish', rarity: 'Rare', baseCps: 150000000, weight: 14, color: 0xa8f0ff, set: 'v2' },
      { id: 'glow_manta', name: 'Glow Manta', rarity: 'Epic', baseCps: 300000000, weight: 10, color: 0x38bdf8 },
      { id: 'glow_shark', name: 'Glow Shark', rarity: 'Epic', baseCps: 375000000, weight: 8, color: 0xe6f0ff, set: 'v2' },
      { id: 'abyss_serpent', name: 'Abyss Serpent', rarity: 'Legendary', baseCps: 900000000, weight: 4, color: 0x0ea5e9 },
      { id: 'giant_glow_anglerfish', name: 'Giant Glow Anglerfish', rarity: 'Legendary', baseCps: 1125000000, weight: 3, color: 0xff8fb8, set: 'v2' }
    ]
  },
  {
    id: 'christmas',
    name: 'Christmas',
    minDist: 1251,
    maxDist: 1920,
    stripes: [0xf2e6d8, 0xe3d2c0], // palette.json -> biome ground1/ground2
    accent: 0xe8384f, // palette.json -> Christmas.candy
    gimmick: 'Holiday Blessing: animals sell for +50% at the booth.',
    windMultiplier: 0.9,
    animals: [
      // v1 & v2 berpasangan per rarity: bobot rarity dibagi 55/45, hewan v2 = penghasilan v1 x1.25
      { id: 'gingerbread_kitty', name: 'Gingerbread Kitty', rarity: 'Common', baseCps: 1500000000, weight: 25, color: 0xb45309 },
      { id: 'elf_penguin', name: 'Elf Penguin', rarity: 'Common', baseCps: 1875000000, weight: 20, color: 0x2fa866, set: 'v2' },
      { id: 'candy_reindeer', name: 'Candy Reindeer', rarity: 'Rare', baseCps: 4000000000, weight: 16, color: 0xd97706 },
      { id: 'ribbon_fox', name: 'Ribbon Fox', rarity: 'Rare', baseCps: 5000000000, weight: 14, color: 0xe89a50, set: 'v2' },
      { id: 'peppermint_dragon', name: 'Peppermint Dragon', rarity: 'Epic', baseCps: 10000000000, weight: 10, color: 0xbe123c },
      { id: 'candy_hamster', name: 'Candy Hamster', rarity: 'Epic', baseCps: 12500000000, weight: 8, color: 0xc9b8ff, set: 'v2' },
      { id: 'giant_yeti', name: 'Giant Yeti', rarity: 'Legendary', baseCps: 30000000000, weight: 4, color: 0xffffff },
      { id: 'giant_gingerbread_bear', name: 'Giant Gingerbread Bear', rarity: 'Legendary', baseCps: 37500000000, weight: 3, color: 0xb8692e, set: 'v2' }
    ]
  },
  {
    id: 'frost',
    name: 'Frost',
    minDist: 1921,
    maxDist: 2830,
    stripes: [0xcfefff, 0xa9ddf7], // palette.json -> biome ground1/ground2
    accent: 0x7fd3ff, // palette.json -> Frost.ice
    gimmick: 'Blizzard: stamina drains 2× faster.',
    windMultiplier: 1.8,
    animals: [
      // v1 & v2 berpasangan per rarity: bobot rarity dibagi 55/45, hewan v2 = penghasilan v1 x1.25
      { id: 'frost_whelp', name: 'Frost Whelp', rarity: 'Common', baseCps: 50000000000, weight: 25, color: 0x7dd3fc },
      { id: 'snow_owl', name: 'Snow Owl', rarity: 'Common', baseCps: 62500000000, weight: 20, color: 0x8c7cf0, set: 'v2' },
      { id: 'frost_wolf', name: 'Frost Wolf', rarity: 'Rare', baseCps: 140000000000, weight: 16, color: 0xe0f2fe },
      { id: 'walrus', name: 'Walrus', rarity: 'Rare', baseCps: 175000000000, weight: 14, color: 0xd9577f, set: 'v2' },
      { id: 'ice_mammoth', name: 'Ice Mammoth', rarity: 'Epic', baseCps: 400000000000, weight: 10, color: 0x38bdf8 },
      { id: 'crystal_drake', name: 'Crystal Drake', rarity: 'Epic', baseCps: 500000000000, weight: 8, color: 0x6f73e0, set: 'v2' },
      { id: 'frost_wyrm', name: 'Frost Wyrm', rarity: 'Legendary', baseCps: 1200000000000, weight: 4, color: 0x0284c7 },
      { id: 'giant_blizzard_hydra', name: 'Giant Blizzard Hydra', rarity: 'Legendary', baseCps: 1500000000000, weight: 3, color: 0x2bb5a8, set: 'v2' }
    ]
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    minDist: 2831,
    maxDist: 5000,
    stripes: [0x2a1b4f, 0x1e1440], // palette.json -> biome ground1/ground2
    accent: 0xfff27a, // palette.json -> Galaxy.star
    accentGlow: true, // emissive
    gimmick: 'Zero Gravity: throws fly with no friction!',
    windMultiplier: 2.2,
    animals: [
      // v1 & v2 berpasangan per rarity: bobot rarity dibagi 55/45, hewan v2 = penghasilan v1 x1.25
      { id: 'nebula_cat', name: 'Nebula Cat', rarity: 'Rare', baseCps: 5000000000000, weight: 22, color: 0xa855f7 },
      { id: 'space_axolotl', name: 'Space Axolotl', rarity: 'Rare', baseCps: 6250000000000, weight: 18, color: 0xffa8d8, set: 'v2' },
      { id: 'astral_whale', name: 'Astral Whale', rarity: 'Epic', baseCps: 15000000000000, weight: 19, color: 0x38bdf8 },
      { id: 'robo_alien', name: 'Robo Alien', rarity: 'Epic', baseCps: 18750000000000, weight: 16, color: 0xc8d0ff, set: 'v2' },
      { id: 'star_phoenix', name: 'Star Phoenix', rarity: 'Legendary', baseCps: 50000000000000, weight: 10, color: 0xf59e0b },
      { id: 'star_unicorn', name: 'Star Unicorn', rarity: 'Legendary', baseCps: 62500000000000, weight: 8, color: 0xf0e8ff, set: 'v2' },
      { id: 'cosmic_dragon', name: 'Cosmic Dragon', rarity: 'Mythic', baseCps: 200000000000000, weight: 4, color: 0xf43f5e },
      { id: 'giant_moon_griffin', name: 'Giant Moon Griffin', rarity: 'Mythic', baseCps: 250000000000000, weight: 3, color: 0xb8c4ff, set: 'v2' }
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

// Makanan khusus zona (sejak 0.6.0). Tiap zona punya 2 makanan:
//   basic    = rarity terbawah zona (Common–Rare; Galaxy Rare–Epic)
//   enhanced = rarity teratas zona (Epic–Legendary; Galaxy Legendary–Mythic; Lobby hanya Epic)
// Mendarat di zona lain = tidak ada yang makan (lemparan gagal). Makanan tetap sekali beli.
// Urutan 0–8 = basic lama (index tersimpan di save), 9–17 = enhanced baru.
export const FOOD_TIERS = [
  { id: 'carrot', zone: 'lobby', tier: 'basic', name: 'Carrot', iconText: 'CARROT', color: '#7AD15A', cost: 0, luckBonus: 1.0, desc: 'Lobby pets love it.' },
  { id: 'apple', zone: 'farm', tier: 'basic', name: 'Apple', iconText: 'APPLE', color: '#B8EFA0', cost: 100, luckBonus: 1.0, desc: 'Fresh from the Farm.' },
  { id: 'meat', zone: 'jungle', tier: 'basic', name: 'Meat', iconText: 'MEAT', color: '#2FA84F', cost: 800, luckBonus: 1.0, desc: 'For hungry Jungle animals.' },
  { id: 'burger', zone: 'toxic', tier: 'basic', name: 'Burger', iconText: 'BURGER', color: '#8CFF3A', cost: 5000, luckBonus: 1.0, desc: 'Weird bait for Toxic mutants.' },
  { id: 'sushi', zone: 'lava', tier: 'basic', name: 'Lava Roll', iconText: 'LAVA ROLL', color: '#FF5A1F', cost: 50000, luckBonus: 1.0, desc: 'Sizzling bait for Lava animals.' },
  { id: 'pearl', zone: 'glow_sea', tier: 'basic', name: 'Pearl', iconText: 'PEARL', color: '#3FF0FF', cost: 500000, luckBonus: 1.0, desc: 'Glowing bait for the Glow Sea.' },
  { id: 'candy_cane', zone: 'christmas', tier: 'basic', name: 'Candy', iconText: 'CANDY', color: '#E8384F', cost: 5000000, luckBonus: 1.0, desc: 'Sweet bait for Christmas.' },
  { id: 'ice_crystal', zone: 'frost', tier: 'basic', name: 'Ice Gem', iconText: 'ICE GEM', color: '#7FD3FF', cost: 50000000, luckBonus: 1.0, desc: 'Frozen bait for Frost.' },
  { id: 'star_cake', zone: 'galaxy', tier: 'basic', name: 'Galaxy', iconText: 'GALAXY', color: '#B57BFF', cost: 500000000, luckBonus: 1.0, desc: 'Starry bait for Galaxy.' },
  { id: 'golden_carrot', zone: 'lobby', tier: 'enhanced', name: 'Golden Carrot', iconText: 'GOLD CARROT', color: '#FFC21A', cost: 500, luckBonus: 1.0, desc: 'A shiny treat only the best pets get.' },
  { id: 'honey_apple', zone: 'farm', tier: 'enhanced', name: 'Honey Apple', iconText: 'HONEY APPLE', color: '#FFB547', cost: 1000, luckBonus: 1.0, desc: 'Dripping with honey. Giant Farm animals come running.' },
  { id: 'prime_steak', zone: 'jungle', tier: 'enhanced', name: 'Prime Steak', iconText: 'PRIME STEAK', color: '#C8323C', cost: 8000, luckBonus: 1.0, desc: 'The juiciest cut in the Jungle.' },
  { id: 'mega_burger', zone: 'toxic', tier: 'enhanced', name: 'Mega Burger', iconText: 'MEGA BURGER', color: '#B6FF3A', cost: 50000, luckBonus: 1.0, desc: 'Triple stacked and glowing.' },
  { id: 'magma_roll', zone: 'lava', tier: 'enhanced', name: 'Magma Roll', iconText: 'MAGMA ROLL', color: '#FF2E1F', cost: 500000, luckBonus: 1.0, desc: 'Too hot for small fry.' },
  { id: 'black_pearl', zone: 'glow_sea', tier: 'enhanced', name: 'Black Pearl', iconText: 'BLACK PEARL', color: '#3A2D6B', cost: 5000000, luckBonus: 1.0, desc: 'A deep-sea treasure.' },
  { id: 'gingerbread_star', zone: 'christmas', tier: 'enhanced', name: 'Gingerbread Star', iconText: 'GINGER STAR', color: '#C9822E', cost: 50000000, luckBonus: 1.0, desc: 'Baked for the biggest Christmas guests.' },
  { id: 'frost_crystal', zone: 'frost', tier: 'enhanced', name: 'Frost Crystal', iconText: 'FROST CRYSTAL', color: '#B8F0FF', cost: 500000000, luckBonus: 1.0, desc: 'Colder than a blizzard.' },
  { id: 'nebula_cake', zone: 'galaxy', tier: 'enhanced', name: 'Nebula Cake', iconText: 'NEBULA CAKE', color: '#FF7BD8', cost: 5000000000, luckBonus: 1.0, desc: 'Baked in a star. Mythic animals cannot resist.' },
];

const RARITY_RANK = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
/** Rarity yang ada di zona, dari terendah ke tertinggi (mis. Lobby: Common, Rare, Epic). */
export const rarityTiers = (zone) => [...new Set(zone.animals.map(a => a.rarity))].sort((x, y) => RARITY_RANK.indexOf(x) - RARITY_RANK.indexOf(y));
/** Zona milik sebuah makanan. */
export const foodZoneOf = (food) => ZONES.find(z => z.id === food?.zone) || null;
/** Makanan milik sebuah zona: [basic, enhanced]. */
export const foodsOfZone = (zone) => FOOD_TIERS.filter(f => f.zone === zone.id);
/** Rarity yang bisa didapat makanan ini di zonanya: basic = 2 tingkat terbawah, enhanced = sisanya. */
export const foodRarities = (food) => {
  const z = foodZoneOf(food);
  if (!z) return [];
  const t = rarityTiers(z);
  return food.tier === 'enhanced' ? t.slice(2) : t.slice(0, 2);
};
/** Label rentang rarity, mis. "Common–Rare". */
export const foodRarityLabel = (food) => { const r = foodRarities(food); return r.length > 1 ? `${r[0]}–${r[r.length - 1]}` : (r[0] || ''); };

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
