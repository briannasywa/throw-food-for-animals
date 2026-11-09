// Strict 32-Color Palette (Inspired by Endesga 32 / Crossy Road)
export const PALETTE = {
  black: '#181425',
  darkPurple: '#262b44',
  navy: '#3a4466',
  slate: '#5a6988',
  lightSlate: '#8b9bb4',
  paper: '#c0cbdc',
  white: '#ffffff',
  
  darkRed: '#5a1932',
  red: '#a22633',
  orange: '#e43b44',
  amber: '#f77622',
  yellow: '#feae34',
  gold: '#fee761',
  
  darkGreen: '#1e4832',
  forestGreen: '#38734a',
  green: '#63c74d',
  lime: '#b2ea67',
  
  darkBlue: '#1b2632',
  skyBlue: '#0099db',
  cyan: '#2ce8f5',
  
  cream: '#e4a672',
  tan: '#b86f50',
  brown: '#733e39',
  darkBrown: '#3e2731'
};

export const FOOD_TIERS = [
  { id: 'carrot', name: 'Wortel', iconText: 'CARROT', color: PALETTE.amber, cost: 0, luckBonus: 1.0, desc: 'Umpan standar hewan pemula.' },
  { id: 'apple', name: 'Apel Merah', iconText: 'APPLE', color: PALETTE.orange, cost: 100, luckBonus: 1.5, desc: 'Aroma segar menarik hewan sekitar.' },
  { id: 'meat', name: 'Daging Balok', iconText: 'STEAK', color: PALETTE.red, cost: 500, luckBonus: 2.2, desc: 'Favorit predator dan karnivora.' },
  { id: 'burger', name: 'Voxel Burger', iconText: 'BURGER', color: PALETTE.yellow, cost: 2500, luckBonus: 3.5, desc: 'Penuh kalori, menarik hewan eksotis.' },
  { id: 'sushi', name: 'Nori Roll', iconText: 'SUSHI', color: PALETTE.cyan, cost: 15000, luckBonus: 6.0, desc: 'Umpan premium untuk hewan langka.' },
  { id: 'dragon_fruit', name: 'Buah Naga', iconText: 'DRAGON', color: PALETTE.lime, cost: 100000, luckBonus: 12.0, desc: 'Buah legendaris berenergi murni.' },
  { id: 'star_cake', name: 'Kue Bintang', iconText: 'STAR', color: PALETTE.gold, cost: 1000000, luckBonus: 25.0, desc: 'Umpan dewa penakluk naga kosmik.' }
];

export const MUTATION_DATA = {
  Normal: { name: 'Normal', multiplier: 1.0, color: PALETTE.lightSlate, chance: 85 },
  Gold: { name: 'Gold', multiplier: 1.8, color: PALETTE.gold, chance: 10 },
  Diamond: { name: 'Diamond', multiplier: 3.5, color: PALETTE.cyan, chance: 3.5 },
  Emerald: { name: 'Emerald', multiplier: 6.0, color: PALETTE.lime, chance: 1.2 },
  Rainbow: { name: 'Rainbow', multiplier: 12.0, color: PALETTE.orange, chance: 0.3 }
};

export const ZONES = [
  {
    id: 1,
    name: 'Block Forest',
    minDist: 0,
    maxDist: 800,
    groundColor: 0x63c74d,
    trackColor: 0x8b9bb4,
    skyColor: 0x3a4466,
    animals: [
      { id: 'rabbit', name: 'Kelinci', rarity: 'Common', baseCps: 2, weight: 50, color: 0xffffff },
      { id: 'squirrel', name: 'Tupai', rarity: 'Common', baseCps: 4, weight: 35, color: 0xb86f50 },
      { id: 'hedgehog', name: 'Landak', rarity: 'Rare', baseCps: 10, weight: 12, color: 0x733e39 },
      { id: 'deer', name: 'Rusa', rarity: 'Epic', baseCps: 25, weight: 3, color: 0xfeae34 }
    ]
  },
  {
    id: 2,
    name: 'Voxel Savanna',
    minDist: 801,
    maxDist: 2500,
    groundColor: 0xfeae34,
    trackColor: 0x733e39,
    skyColor: 0x262b44,
    animals: [
      { id: 'zebra', name: 'Zebra', rarity: 'Common', baseCps: 40, weight: 45, color: 0x181425 },
      { id: 'giraffe', name: 'Jerapah', rarity: 'Rare', baseCps: 90, weight: 30, color: 0xf77622 },
      { id: 'kangaroo', name: 'Kanguru', rarity: 'Epic', baseCps: 200, weight: 18, color: 0xb86f50 },
      { id: 'lion', name: 'Singa', rarity: 'Legendary', baseCps: 600, weight: 7, color: 0xfee761 }
    ]
  },
  {
    id: 3,
    name: 'Dune Desert',
    minDist: 2501,
    maxDist: 6000,
    groundColor: 0xf77622,
    trackColor: 0x5a1932,
    skyColor: 0x181425,
    animals: [
      { id: 'camel', name: 'Unta', rarity: 'Common', baseCps: 800, weight: 45, color: 0xe4a672 },
      { id: 'scorpion', name: 'Kalajengking', rarity: 'Rare', baseCps: 1800, weight: 30, color: 0xa22633 },
      { id: 'fennec', name: 'Rubah', rarity: 'Epic', baseCps: 4000, weight: 18, color: 0xfeae34 },
      { id: 'cobra', name: 'Kobra', rarity: 'Legendary', baseCps: 12000, weight: 7, color: 0x2ce8f5 }
    ]
  },
  {
    id: 4,
    name: 'Frozen Lake',
    minDist: 6001,
    maxDist: 14000,
    groundColor: 0x0099db,
    trackColor: 0xc0cbdc,
    skyColor: 0x1b2632,
    animals: [
      { id: 'penguin', name: 'Pinguin', rarity: 'Common', baseCps: 25000, weight: 45, color: 0x181425 },
      { id: 'seal', name: 'Anjing Laut', rarity: 'Rare', baseCps: 60000, weight: 30, color: 0x8b9bb4 },
      { id: 'polar_bear', name: 'Beruang Es', rarity: 'Epic', baseCps: 150000, weight: 18, color: 0xffffff },
      { id: 'mammoth', name: 'Mammoth', rarity: 'Legendary', baseCps: 450000, weight: 7, color: 0x733e39 }
    ]
  },
  {
    id: 5,
    name: 'Void Rift',
    minDist: 14001,
    maxDist: 50000,
    groundColor: 0x262b44,
    trackColor: 0x5a1932,
    skyColor: 0x181425,
    animals: [
      { id: 'star_cat', name: 'Kucing Void', rarity: 'Rare', baseCps: 1000000, weight: 40, color: 0x2ce8f5 },
      { id: 'void_whale', name: 'Paus Kosmik', rarity: 'Epic', baseCps: 3000000, weight: 35, color: 0x0099db },
      { id: 'phoenix', name: 'Phoenix', rarity: 'Legendary', baseCps: 10000000, weight: 18, color: 0xe43b44 },
      { id: 'cosmic_dragon', name: 'Naga Astral', rarity: 'Mythic', baseCps: 50000000, weight: 7, color: 0xfee761 }
    ]
  }
];

export const RARITY_COLORS = {
  Common: PALETTE.lightSlate,
  Rare: PALETTE.cyan,
  Epic: PALETTE.amber,
  Legendary: PALETTE.gold,
  Mythic: PALETTE.red
};
