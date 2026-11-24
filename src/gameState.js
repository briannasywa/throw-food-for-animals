import { FOOD_TIERS, MUTATION_DATA, ZONES } from './gameData.js';
import { D, MODE } from './difficulty.js';

// Save terpisah per mode (difficulty.js). Save lama tanpa akhiran = progres mode easy.
const SAVE_KEY = MODE === 'easy' ? 'ZooToss_SaveData_v1' : `ZooToss_SaveData_v1_${MODE}`;

/** Harga makanan sesuai mode. */
export const foodCost = (f) => Math.round(f.cost * D.foodCostMul);

export class GameState {
  constructor() {
    this.money = 0;
    this.totalEarned = 0;
    this.power = 10;
    this.pullUpLevel = 1;
    this.pullUpCost = D.pullUpCostStart;
    
    this.maxBaseSlots = 4;
    this.baseSlotCost = D.slotCostStart;
    
    this.selectedFoodIndex = 0;
    this.unlockedFoods = [0]; // Index of unlocked foods
    
    this.inventory = []; // Captured animals in base
    this.indexProgress = {}; // Animal ID -> Set of mutations unlocked
    
    this.totalCatches = 0;
    this.luckiestCatch = null; // { name, rarity, mutation, multiplier }
    
    this.isTraining = false;
    this.autoThrow = false;
    this.rebirthCount = 0;
    this.rebirthCost = D.rebirthCostStart;

    // Web3 Inventory Items (Base Sepolia Testnet)
    this.legendaryBaits = 0; // Count of Legendary Guaranteed Baits available
    this.magicFoodBuff = 0; // Magic food luck charges (menaikkan max luck tier langka)
    this.maxReachedZoneIndex = 0; // Zone terjauh yang pernah dicapai dari lemparan
    
    // Daily & Dynamic Quests System
    this.quests = [
      { id: 'q_pullup', title: 'Hard Training', desc: 'Reach 50 Power with pull-ups', target: 50, current: 0, rewardCash: Math.round(500 * D.questRewardMul), completed: false, claimed: false },
      { id: 'q_catches', title: 'Jungle Hunter', desc: 'Catch 5 animals', target: 5, current: 0, rewardCash: Math.round(1200 * D.questRewardMul), completed: false, claimed: false },
      { id: 'q_distance', title: 'Rocket Throw', desc: 'Throw 2,000 m in one go', target: 2000, current: 0, rewardCash: Math.round(3500 * D.questRewardMul), completed: false, claimed: false },
      { id: 'q_mutation', title: 'Golden Touch', desc: 'Catch 1 animal with a rare mutation', target: 1, current: 0, rewardCash: Math.round(8000 * D.questRewardMul), completed: false, claimed: false }
    ];

    this.equippedPets = []; // UIDs of equipped companion pets (max 2)
    this.autoSellRarity = 'None'; // 'None', 'Common', 'Common+Rare'
    
    this.load();
  }

  getEquippedBonusMultiplier() {
    // Companion pets give active bonus Power & CPS multiplier!
    let bonus = 1.0;
    this.equippedPets.forEach(uid => {
      const pet = this.inventory.find(p => p.uid === uid);
      if (pet) {
        const mutMul = MUTATION_DATA[pet.mutation]?.multiplier || 1.0;
        bonus += (pet.baseCps * mutMul) * D.petBonusPerCps; // active pet perk
      }
    });
    return Math.min(bonus, 1 + D.petBonusCap);
  }

  toggleEquipPet(uid) {
    const idx = this.equippedPets.indexOf(uid);
    if (idx >= 0) {
      this.equippedPets.splice(idx, 1);
      this.save();
      return { equipped: false };
    } else {
      if (this.equippedPets.length < 2) {
        this.equippedPets.push(uid);
        this.save();
        return { equipped: true };
      } else {
        return { error: 'Max 2 pets equipped!' };
      }
    }
  }

  updateMaxDistance(distance) {
    let farthestIdx = 0;
    for (let i = 0; i < ZONES.length; i++) {
      if (distance >= ZONES[i].minDist) {
        farthestIdx = i;
      }
    }
    if (farthestIdx > this.maxReachedZoneIndex) {
      this.maxReachedZoneIndex = farthestIdx;
      this.save();
    }
    return this.maxReachedZoneIndex;
  }

  getFarthestZone() {
    return ZONES[this.maxReachedZoneIndex] || ZONES[0];
  }

  /**
   * Beli boost Power dengan Cash (berdasarkan persentase power saat ini, contoh 5% atau 10%)
   * @param {number} percent 5 untuk 5%, 10 untuk 10%
   */
  buyPowerPercent(percent = 5) {
    const gained = Math.max(5, Math.round(this.power * (percent / 100)));
    // Harga berskala seimbang dengan level & power saat ini
    const cost = Math.max(50, Math.round(gained * 12 * Math.sqrt(this.power / 10)));
    if (this.money >= cost) {
      this.money -= cost;
      this.power += gained;
      this.save();
      return { success: true, gained, cost };
    }
    return { success: false, cost, needed: cost - this.money };
  }

  /**
   * Beli Cash instan dengan Power (contoh tukar 5% atau 10% power untuk cash)
   * atau jual bagian power untuk uang instan
   * @param {number} percent 5 untuk 5%, 10 untuk 10%
   */
  buyCashWithPowerPercent(percent = 10) {
    const powerSpent = Math.max(5, Math.round(this.power * (percent / 100)));
    if (this.power > powerSpent + 5) { // menjaga minimal power
      const cashGain = Math.max(100, Math.round(powerSpent * 35 * this.getRebirthMultiplier()));
      this.power -= powerSpent;
      this.money += cashGain;
      this.totalEarned += cashGain;
      this.save();
      return { success: true, powerSpent, cashGain };
    }
    return { success: false, reason: 'Power minimal dibutuhkan 15' };
  }

  addMagicFood(qty) {
    this.magicFoodBuff = (this.magicFoodBuff || 0) + qty;
    this.save();
    return this.magicFoodBuff;
  }

  checkQuest(type, amount) {
    let questUpdated = false;
    this.quests.forEach(q => {
      if (!q.completed) {
        if (type === 'pullup' && q.id === 'q_pullup') {
          q.current = Math.min(q.target, q.current + amount);
        } else if (type === 'catch' && q.id === 'q_catches') {
          q.current = Math.min(q.target, q.current + amount);
        } else if (type === 'distance' && q.id === 'q_distance') {
          if (amount >= q.target) q.current = q.target;
        } else if (type === 'mutation' && q.id === 'q_mutation') {
          if (amount !== 'Normal') q.current = q.target;
        }

        if (q.current >= q.target && !q.completed) {
          q.completed = true;
          questUpdated = true;
        }
      }
    });
    if (questUpdated) this.save();
    return questUpdated;
  }

  claimQuest(id) {
    const q = this.quests.find(x => x.id === id);
    if (q && q.completed && !q.claimed) {
      q.claimed = true;
      this.money += q.rewardCash;
      this.totalEarned += q.rewardCash;
      this.save();
      return q.rewardCash;
    }
    return 0;
  }

  /** Penghasilan dasar satu hewan per detik (sebelum rebirth & bonus pet), sesuai mode. */
  incomeOf(item) {
    return Math.floor(item.baseCps * (MUTATION_DATA[item.mutation]?.multiplier || 1) * D.incomeMul);
  }

  /** Harga jual = penghasilan per detik x D.sellSeconds (minimal $10). */
  sellPriceOf(item) {
    return Math.max(10, Math.floor(item.baseCps * (MUTATION_DATA[item.mutation]?.multiplier || 1) * D.incomeMul * D.sellSeconds));
  }

  getRebirthMultiplier() {
    return 1 + (this.rebirthCount * D.rebirthBonus); // easy +50%, hard +25% per rebirth
  }

  canRebirth() {
    return this.money >= this.rebirthCost;
  }

  doRebirth() {
    if (this.canRebirth()) {
      this.rebirthCount += 1;
      this.rebirthCost = Math.floor(this.rebirthCost * D.rebirthCostGrowth);
      // Reset money & power, but keep bestiary, pets & get huge multiplier!
      this.money = 0;
      this.power = 10;
      this.pullUpLevel = 1;
      this.pullUpCost = D.pullUpCostStart;
      this.save();
      return true;
    }
    return false;
  }

  getPullUpRate() {
    // Power gained per second when pull up training, scaled with Rebirth & Equipped Pet bonus
    const baseRate = Math.floor(1 + Math.pow(this.pullUpLevel, 1.4) * 2);
    return Math.max(1, Math.floor(baseRate * D.pullUpRateMul * this.getRebirthMultiplier() * this.getEquippedBonusMultiplier()));
  }

  getCurrentCps() {
    const rawCps = this.inventory.reduce((sum, item) => {
      const mutMul = MUTATION_DATA[item.mutation]?.multiplier || 1.0;
      return sum + Math.floor(item.baseCps * mutMul);
    }, 0);
    return Math.floor(rawCps * D.incomeMul * this.getRebirthMultiplier() * this.getEquippedBonusMultiplier());
  }

  buyFood(index) {
    const food = FOOD_TIERS[index];
    if (!food) return false;
    if (this.unlockedFoods.includes(index)) {
      this.selectedFoodIndex = index;
      this.save();
      return true;
    }
    if (this.money >= foodCost(food)) {
      this.money -= foodCost(food);
      this.unlockedFoods.push(index);
      this.selectedFoodIndex = index;
      this.save();
      return true;
    }
    return false;
  }

  upgradePullUp() {
    if (this.money >= this.pullUpCost) {
      this.money -= this.pullUpCost;
      this.pullUpLevel += 1;
      this.pullUpCost = Math.floor(this.pullUpCost * D.pullUpCostGrowth);
      this.save();
      return true;
    }
    return false;
  }

  upgradeBaseSlot() {
    if (this.money >= this.baseSlotCost) {
      this.money -= this.baseSlotCost;
      this.maxBaseSlots += 2;
      this.baseSlotCost = Math.floor(this.baseSlotCost * D.slotCostGrowth);
      this.save();
      return true;
    }
    return false;
  }

  sellAnimal(index) {
    if (index >= 0 && index < this.inventory.length) {
      const animal = this.inventory[index];
      const sellPrice = this.sellPriceOf(animal);
      this.money += sellPrice;
      this.totalEarned += sellPrice;
      this.inventory.splice(index, 1);
      this.save();
      return { animal, sellPrice };
    }
    return null;
  }

  sellAllAnimals() {
    let totalSellPrice = 0;
    const count = this.inventory.length;
    while (this.inventory.length > 0) {
      const item = this.inventory.pop();
      const price = this.sellPriceOf(item);
      totalSellPrice += price;
    }
    this.money += totalSellPrice;
    this.totalEarned += totalSellPrice;
    this.save();
    return { count, totalSellPrice };
  }

  addAnimal(animalData) {
    this.totalCatches += 1;
    
    // Track best luck
    const mutMul = MUTATION_DATA[animalData.mutation]?.multiplier || 1.0;
    const luckScore = (animalData.baseCps * mutMul);
    if (!this.luckiestCatch || luckScore > (this.luckiestCatch.score || 0)) {
      this.luckiestCatch = {
        name: animalData.name,
        rarity: animalData.rarity,
        mutation: animalData.mutation,
        icon: animalData.icon,
        id: animalData.id,
        score: luckScore
      };
    }

    // Bestiary track
    if (!this.indexProgress[animalData.id]) {
      this.indexProgress[animalData.id] = [];
    }
    if (!this.indexProgress[animalData.id].includes(animalData.mutation)) {
      this.indexProgress[animalData.id].push(animalData.mutation);
    }

    // Auto-fit into inventory if slots available, else return overflow warning
    if (this.inventory.length < this.maxBaseSlots) {
      this.inventory.push({ ...animalData, uid: Date.now() + Math.random() });
      this.save();
      return { placed: true };
    } else {
      // Auto-sell immediately if plot full!
      const sellPrice = this.sellPriceOf(animalData);
      this.money += sellPrice;
      this.totalEarned += sellPrice;
      this.save();
      return { placed: false, autoSold: true, sellPrice };
    }
  }

  save() {
    const data = {
      money: this.money,
      totalEarned: this.totalEarned,
      power: this.power,
      pullUpLevel: this.pullUpLevel,
      pullUpCost: this.pullUpCost,
      maxBaseSlots: this.maxBaseSlots,
      baseSlotCost: this.baseSlotCost,
      selectedFoodIndex: this.selectedFoodIndex,
      unlockedFoods: this.unlockedFoods,
      inventory: this.inventory,
      indexProgress: this.indexProgress,
      totalCatches: this.totalCatches,
      luckiestCatch: this.luckiestCatch,
      autoThrow: this.autoThrow,
      rebirthCount: this.rebirthCount,
      rebirthCost: this.rebirthCost,
      legendaryBaits: this.legendaryBaits,
      magicFoodBuff: this.magicFoodBuff,
      maxReachedZoneIndex: this.maxReachedZoneIndex,
      quests: this.quests,
      equippedPets: this.equippedPets,
      autoSellRarity: this.autoSellRarity
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  load() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        this.money = d.money ?? 0;
        this.totalEarned = d.totalEarned ?? 0;
        this.power = d.power ?? 10;
        this.pullUpLevel = d.pullUpLevel ?? 1;
        this.pullUpCost = d.pullUpCost ?? D.pullUpCostStart;
        this.maxBaseSlots = d.maxBaseSlots ?? 4;
        this.baseSlotCost = d.baseSlotCost ?? D.slotCostStart;
        this.selectedFoodIndex = d.selectedFoodIndex ?? 0;
        this.unlockedFoods = d.unlockedFoods ?? [0];
        this.inventory = d.inventory ?? [];
        this.indexProgress = d.indexProgress ?? {};
        this.totalCatches = d.totalCatches ?? 0;
        this.luckiestCatch = d.luckiestCatch ?? null;
        this.autoThrow = d.autoThrow ?? false;
        this.rebirthCount = d.rebirthCount ?? 0;
        this.rebirthCost = d.rebirthCost ?? D.rebirthCostStart;
        this.legendaryBaits = d.legendaryBaits ?? 0;
        this.magicFoodBuff = d.magicFoodBuff ?? 0;
        this.maxReachedZoneIndex = d.maxReachedZoneIndex ?? 0;
        // Progres quest dari save, teks (judul/deskripsi) tetap dari definisi terbaru
        if (d.quests) this.quests = this.quests.map(q => {
          const sq = d.quests.find(x => x.id === q.id);
          return sq ? { ...q, current: sq.current, completed: sq.completed, claimed: sq.claimed } : q;
        });
        if (d.equippedPets) this.equippedPets = d.equippedPets;
        if (d.autoSellRarity) this.autoSellRarity = d.autoSellRarity;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
  }

  reset() {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }
}

export function formatNum(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  if (n < 1000) return Math.floor(n).toString();
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
  const exp = Math.min(Math.floor(Math.log10(n) / 3), suffixes.length - 1);
  const shortVal = (n / Math.pow(10, exp * 3)).toFixed(1);
  return `${shortVal}${suffixes[exp]}`;
}

