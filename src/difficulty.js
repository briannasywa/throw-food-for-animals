// Zoo Toss — preset kesulitan (ekonomi & progres). Daftar lengkap angka & alasannya: BALANCE.md.
//
//   easy = angka asli prototype (cepat naik zona) → untuk testing dev
//   hard = rate jauh lebih rendah → untuk demo
//
// Cara memilih: tambahkan ?mode=easy atau ?mode=hard di URL. Pilihan diingat di perangkat itu.
// Bawaan (belum pernah memilih) = hard, supaya demo tidak tak sengaja jalan di mode easy.
// Tiap mode punya save sendiri, jadi progres easy tidak terbawa ke hard.

export const PRESETS = {
  easy: {
    label: 'Easy',
    distPerPower: 10,          // jarak (m) per 1 Power sebelum dikali timing (0.5×–2.0×) dan angin
    meterSpeedMul: 1,          // kecepatan jarum meter (1 = asli)
    pullUpRateMul: 1,          // pengali Power/detik dari pull-up
    pullUpCostStart: 50,       // harga upgrade pull-up pertama
    pullUpCostGrowth: 1.8,     // harga upgrade berikutnya ×
    incomeMul: 1,              // pengali uang/detik dari hewan di kandang
    sellSeconds: 25,           // harga jual hewan = penghasilan/detik × detik ini
    foodCostMul: 1,            // pengali harga makanan
    slotCostStart: 200,        // harga Expand Pen pertama (+2 slot)
    slotCostGrowth: 2.5,
    rebirthCostStart: 50000,
    rebirthCostGrowth: 3.5,
    rebirthBonus: 0.5,         // +50% income & Power per rebirth
    questRewardMul: 1,
    petBonusPerCps: 0.0005,    // bonus pet yang di-equip: +0.05% per 1 $/s penghasilan pet
    petBonusCap: Infinity,     // batas bonus pet total (1 = maksimal +100%)
    zoneIncomeGrowth: null,    // null = penghasilan hewan asli (naik ~30× per zona); angka = naik × angka ini per zona
    foodCostSeconds: null,     // null = harga makanan asli × foodCostMul; angka = penghasilan hewan terendah zona × detik ini
    // --- peluang tangkap (robloxSeamlessWorld.js → determineCatch) ---
    zoneFood: false,           // true = Rare ke atas HANYA bisa didapat dengan makanan khusus zona itu
    zoneFoodLuck: null,        // null = pakai Luck asli makanan; angka = Luck tetap saat makanan zona dipakai
    rarityWeightMul: { Rare: 1, Epic: 1, Legendary: 1, Mythic: 1 }, // pengali bobot dasar per rarity
    luckExp: { Rare: 0, Epic: 0.5, Legendary: 1, Mythic: 1 },        // bobot × Luck^pangkat (asli: Epic √Luck, Legendary ×Luck)
  },
  hard: {
    label: 'Hard',
    distPerPower: 1.5,
    meterSpeedMul: 1,
    pullUpRateMul: 0.08,
    pullUpCostStart: 250,
    pullUpCostGrowth: 3.0,
    incomeMul: 0.2,
    sellSeconds: 6,
    foodCostMul: 8,
    slotCostStart: 2000,
    slotCostGrowth: 3.5,
    rebirthCostStart: 3000000,
    rebirthCostGrowth: 6,
    rebirthBonus: 0.2,
    questRewardMul: 0.2,
    petBonusPerCps: 0.00005,
    petBonusCap: 0.5,
    zoneIncomeGrowth: 4,
    foodCostSeconds: 1000,
    zoneFood: true,
    zoneFoodLuck: 3,
    rarityWeightMul: { Rare: 0.5, Epic: 0.3, Legendary: 0.15, Mythic: 0.15 },
    luckExp: { Rare: 0.5, Epic: 1, Legendary: 1.5, Mythic: 1.5 },
  },
};

const STORE_KEY = 'zootoss-mode';

function resolveMode() {
  let mode = null;
  try {
    const q = new URLSearchParams(location.search).get('mode');
    if (q && PRESETS[q]) { mode = q; localStorage.setItem(STORE_KEY, q); }
    else mode = localStorage.getItem(STORE_KEY);
  } catch { /* storage diblokir */ }
  return PRESETS[mode] ? mode : 'hard';
}

export const MODE = resolveMode();
export const D = PRESETS[MODE];
