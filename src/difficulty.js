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
  },
  hard: {
    label: 'Hard',
    distPerPower: 2,
    meterSpeedMul: 1.25,
    pullUpRateMul: 0.35,
    pullUpCostStart: 150,
    pullUpCostGrowth: 2.0,
    incomeMul: 0.3,
    sellSeconds: 10,
    foodCostMul: 5,
    slotCostStart: 1000,
    slotCostGrowth: 3,
    rebirthCostStart: 1000000,
    rebirthCostGrowth: 5,
    rebirthBonus: 0.25,
    questRewardMul: 0.3,
    petBonusPerCps: 0.0001,
    petBonusCap: 1.0,
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
