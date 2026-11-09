import { FOOD_TIERS, MUTATION_DATA, ZONES } from './gameData.js';

const SAVE_KEY = 'ThrowFoodForAnimals_SaveData_v1';

export class GameState {
  constructor() {
    this.money = 0;
    this.totalEarned = 0;
    this.power = 10;
    this.pullUpLevel = 1;
    this.pullUpCost = 50;
    
    this.maxBaseSlots = 4;
    this.baseSlotCost = 200;
    
    this.selectedFoodIndex = 0;
    this.unlockedFoods = [0]; // Index of unlocked foods
    
    this.inventory = []; // Captured animals in base
    this.indexProgress = {}; // Animal ID -> Set of mutations unlocked
    
    this.totalCatches = 0;
    this.luckiestCatch = null; // { name, rarity, mutation, multiplier }
    
    this.isTraining = false;
    this.autoThrow = false;
    this.rebirthCount = 0;
    this.rebirthCost = 50000;
    
    // Daily & Dynamic Quests System
    this.quests = [
      { id: 'q_pullup', title: 'Latihan Keras', desc: 'Lakukan Pull-up hingga mengumpulkan 50 Power', target: 50, current: 0, rewardCash: 500, completed: false, claimed: false },
      { id: 'q_catches', title: 'Pemburu Rimba', desc: 'Tangkap 5 hewan apapun di lintasan', target: 5, current: 0, rewardCash: 1200, completed: false, claimed: false },
      { id: 'q_distance', title: 'Lemparan Roket', desc: 'Capai jarak lemparan minimal 2000 studs', target: 2000, current: 0, rewardCash: 3500, completed: false, claimed: false },
      { id: 'q_mutation', title: 'Sentuhan Emas', desc: 'Dapatkan 1 hewan dengan mutasi langka', target: 1, current: 0, rewardCash: 8000, completed: false, claimed: false }
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
        bonus += (pet.baseCps * mutMul) * 0.0005; // active pet perk
      }
    });
    return bonus;
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
        return { error: 'Maksimal 2 Pet Companion terpasang!' };
      }
    }
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

  getRebirthMultiplier() {
    return 1 + (this.rebirthCount * 0.5); // +50% per rebirth
  }

  canRebirth() {
    return this.money >= this.rebirthCost;
  }

  doRebirth() {
    if (this.canRebirth()) {
      this.rebirthCount += 1;
      this.rebirthCost = Math.floor(this.rebirthCost * 3.5);
      // Reset money & power, but keep bestiary, pets & get huge multiplier!
      this.money = 0;
      this.power = 10;
      this.pullUpLevel = 1;
      this.pullUpCost = 50;
      this.save();
      return true;
    }
    return false;
  }

  getPullUpRate() {
    // Power gained per second when pull up training, scaled with Rebirth & Equipped Pet bonus
    const baseRate = Math.floor(1 + Math.pow(this.pullUpLevel, 1.4) * 2);
    return Math.floor(baseRate * this.getRebirthMultiplier() * this.getEquippedBonusMultiplier());
  }

  getCurrentCps() {
    const rawCps = this.inventory.reduce((sum, item) => {
      const mutMul = MUTATION_DATA[item.mutation]?.multiplier || 1.0;
      return sum + Math.floor(item.baseCps * mutMul);
    }, 0);
    return Math.floor(rawCps * this.getRebirthMultiplier() * this.getEquippedBonusMultiplier());
  }

  buyFood(index) {
    const food = FOOD_TIERS[index];
    if (!food) return false;
    if (this.unlockedFoods.includes(index)) {
      this.selectedFoodIndex = index;
      this.save();
      return true;
    }
    if (this.money >= food.cost) {
      this.money -= food.cost;
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
      this.pullUpCost = Math.floor(this.pullUpCost * 1.8);
      this.save();
      return true;
    }
    return false;
  }

  upgradeBaseSlot() {
    if (this.money >= this.baseSlotCost) {
      this.money -= this.baseSlotCost;
      this.maxBaseSlots += 2;
      this.baseSlotCost = Math.floor(this.baseSlotCost * 2.5);
      this.save();
      return true;
    }
    return false;
  }

  sellAnimal(index) {
    if (index >= 0 && index < this.inventory.length) {
      const animal = this.inventory[index];
      const mutMul = MUTATION_DATA[animal.mutation]?.multiplier || 1.0;
      // Sell price based on baseCps * mutMul * 20 sec
      const sellPrice = Math.max(10, Math.floor(animal.baseCps * mutMul * 25));
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
      const mutMul = MUTATION_DATA[item.mutation]?.multiplier || 1.0;
      const price = Math.max(10, Math.floor(item.baseCps * mutMul * 25));
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
      const sellPrice = Math.max(10, Math.floor(animalData.baseCps * mutMul * 25));
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
        this.pullUpCost = d.pullUpCost ?? 50;
        this.maxBaseSlots = d.maxBaseSlots ?? 4;
        this.baseSlotCost = d.baseSlotCost ?? 200;
        this.selectedFoodIndex = d.selectedFoodIndex ?? 0;
        this.unlockedFoods = d.unlockedFoods ?? [0];
        this.inventory = d.inventory ?? [];
        this.indexProgress = d.indexProgress ?? {};
        this.totalCatches = d.totalCatches ?? 0;
        this.luckiestCatch = d.luckiestCatch ?? null;
        this.autoThrow = d.autoThrow ?? false;
        this.rebirthCount = d.rebirthCount ?? 0;
        this.rebirthCost = d.rebirthCost ?? 50000;
        if (d.quests) this.quests = d.quests;
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

