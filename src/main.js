import './style.css';
import { GameState, formatNum } from './gameState.js';
import { FOOD_TIERS, ZONES, MUTATION_DATA, RARITY_COLORS } from './gameData.js';
import { RetroIsometricWorld } from './retroIsometricWorld.js';
import { RetroRadar } from './miniMap.js';
import { sfx } from './audio.js';

const state = new GameState();

// HTML Layout with Strict 8-Bit Pixel Voxel Styling
const app = document.querySelector('#app');
app.innerHTML = `
<div class="min-h-screen flex flex-col bg-[#181425] text-[#e4a672] p-2 md:p-3 gap-3">
  
  <!-- Retro Top Header Bar -->
  <header class="retro-box p-3 flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-[#feae34] border-2 border-[#181425] flex items-center justify-center font-retro text-xs text-[#181425]">
        🍖
      </div>
      <div>
        <h1 class="font-retro text-xs md:text-sm text-[#fee761] leading-none">
          THROW FOOD: VOXEL
        </h1>
        <p class="font-pixel text-[11px] text-[#8b9bb4] mt-0.5">Retro Isometric Animal Simulator</p>
      </div>
    </div>

    <!-- Retro Stats HUD -->
    <div class="flex items-center gap-2 flex-wrap">
      <div class="bg-[#181425] border-2 border-[#3a4466] px-2.5 py-1.5 flex items-center gap-2">
        <span class="text-xs text-[#fee761] font-retro">$</span>
        <div>
          <div class="text-[9px] text-[#8b9bb4] font-pixel">CASH</div>
          <div id="stat-money" class="text-xs font-retro text-[#63c74d]">$0</div>
        </div>
      </div>

      <div class="bg-[#181425] border-2 border-[#3a4466] px-2.5 py-1.5 flex items-center gap-2">
        <span class="text-xs text-[#feae34] font-retro">PWR</span>
        <div>
          <div class="text-[9px] text-[#8b9bb4] font-pixel">POWER</div>
          <div id="stat-power" class="text-xs font-retro text-[#feae34]">10</div>
        </div>
      </div>

      <div class="bg-[#181425] border-2 border-[#3a4466] px-2.5 py-1.5 flex items-center gap-2">
        <span class="text-xs text-[#2ce8f5] font-retro">CPS</span>
        <div>
          <div class="text-[9px] text-[#8b9bb4] font-pixel">INCOME/S</div>
          <div id="stat-cps" class="text-xs font-retro text-[#2ce8f5]">+$0</div>
        </div>
      </div>

      <div class="bg-[#181425] border-2 border-[#3a4466] px-2.5 py-1.5 flex items-center gap-2">
        <span class="text-xs text-[#fee761] font-retro">★</span>
        <div>
          <div class="text-[9px] text-[#8b9bb4] font-pixel">REBIRTH</div>
          <div id="stat-rebirth" class="text-xs font-retro text-[#fee761]">0x</div>
        </div>
      </div>

      <div class="flex gap-1.5 ml-1">
        <button id="btn-tab-quests" class="retro-btn text-[9px]">QUESTS</button>
        <button id="btn-tab-index" class="retro-btn text-[9px]">INDEX</button>
        <button id="btn-tab-leaderboard" class="retro-btn retro-btn-gold text-[9px]">RANK</button>
        <button id="btn-sound-toggle" class="retro-btn text-[9px]">SND</button>
      </div>
    </div>
  </header>

  <!-- Main Game Stage -->
  <main class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3">
    
    <!-- LEFT 8 COLS: Isometric Viewport & Throw Mechanics -->
    <div class="lg:col-span-8 flex flex-col gap-3">
      
      <!-- 3D Viewport Box -->
      <div class="retro-box relative h-[420px] md:h-[460px] overflow-hidden">
        <div id="viewport-3d" class="w-full h-full"></div>

        <!-- Radar Mini-map (Top Right) -->
        <div class="absolute top-2 right-2 flex flex-col items-end gap-1 pointer-events-none">
          <canvas id="radar-canvas"></canvas>
          <div class="bg-[#181425] px-1.5 py-0.5 text-[8px] font-retro text-[#8b9bb4] border border-[#3a4466]">
            RADAR
          </div>
        </div>

        <!-- Top Left Status -->
        <div class="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none font-retro text-[9px]">
          <div class="bg-[#181425] border-2 border-[#feae34] px-2 py-1 text-[#fee761]">
            <span id="zone-badge">ZONE: BLOCK FOREST</span>
          </div>
          <div class="bg-[#181425] border border-[#3a4466] px-2 py-1 text-[#2ce8f5]">
            <span id="wind-badge">WIND: 0 M/S</span>
          </div>
        </div>

        <!-- Stamina Bar (Bottom Left) -->
        <div class="absolute bottom-3 left-3 bg-[#181425] border-2 border-[#3a4466] p-2 flex flex-col gap-1 w-44 pointer-events-none">
          <div class="flex justify-between text-[8px] font-retro text-[#feae34]">
            <span>STAMINA</span>
            <span id="stamina-text">100%</span>
          </div>
          <div class="w-full h-2 bg-[#262b44] border border-[#181425]">
            <div id="stamina-bar" class="h-full bg-[#63c74d]" style="width: 100%;"></div>
          </div>
        </div>

        <!-- Station Prompt -->
        <div id="station-prompt" class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#e43b44] border-2 border-[#ffffff] px-4 py-2 flex flex-col items-center pointer-events-none hidden">
          <div id="station-title" class="font-retro text-xs text-[#ffffff]">THROW LINE</div>
          <div id="station-desc" class="font-pixel text-[11px] text-[#fee761] mt-0.5">[SPACE] TO THROW</div>
        </div>

        <!-- Flying Distance HUD -->
        <div id="throw-hud" class="absolute top-14 left-1/2 -translate-x-1/2 bg-[#181425] border-2 border-[#fee761] px-4 py-1.5 font-retro text-xs text-[#fee761] hidden">
          DISTANCE: <span id="throw-dist-val">0</span> STUDS
        </div>

        <!-- Catch Toast -->
        <div id="catch-toast" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#262b44] border-3 border-[#fee761] p-3 flex items-center gap-3 pointer-events-none opacity-0 transition-opacity duration-150">
          <div>
            <div id="catch-title" class="font-retro text-xs text-[#fee761]">CAUGHT ANIMAL!</div>
            <div id="catch-desc" class="font-pixel text-[11px] text-[#c0cbdc] mt-0.5">+2 CASH/S</div>
          </div>
        </div>
      </div>

      <!-- Controls & Meter Panel -->
      <div class="retro-box p-3 flex flex-col gap-2.5">
        
        <div class="flex justify-between items-center text-[9px] font-retro text-[#8b9bb4]">
          <span>CONTROLS: [W,A,S,D] MOVE | [SHIFT] SPRINT | [SPACE] THROW | [E] TRAIN</span>
          <span id="meter-text" class="text-[#fee761]">0 / 20</span>
        </div>

        <!-- Meter Bar -->
        <div id="meter-container" class="relative w-full h-7 bg-[#181425] border-2 border-[#3a4466] cursor-pointer">
          <div class="absolute inset-0 flex text-[8px] font-retro items-center opacity-40">
            <div class="w-[50%] bg-[#0099db] h-full flex items-center justify-center text-white">POOR</div>
            <div class="w-[30%] bg-[#63c74d] h-full flex items-center justify-center text-white">GOOD</div>
            <div class="w-[20%] bg-[#feae34] h-full flex items-center justify-center text-white">MAX</div>
          </div>
          <div id="meter-needle" class="absolute top-0 bottom-0 w-3 bg-[#fee761] border border-[#181425] -translate-x-1/2 pointer-events-none" style="left: 0%;"></div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <button id="btn-throw" class="sm:col-span-2 retro-btn retro-btn-orange">
            LEMPAR MAKANAN [SPACE]
          </button>
          <button id="btn-auto-throw" class="retro-btn">
            AUTO-THROW: OFF
          </button>
          <button id="btn-toggle-pullup" class="retro-btn retro-btn-green">
            PULL-UP [E]
          </button>
        </div>

        <!-- Food Tiers -->
        <div class="pt-2 border-t-2 border-[#181425]">
          <div class="text-[9px] font-retro text-[#8b9bb4] mb-1.5 flex justify-between">
            <span>PILIH UMPAN MAKANAN:</span>
            <span id="food-luck-label" class="text-[#fee761]">LUCK: 1.0X</span>
          </div>
          <div id="food-list" class="flex gap-2 overflow-x-auto pb-1"></div>
        </div>

      </div>

    </div>

    <!-- RIGHT 4 COLS: Plot & Upgrades -->
    <div class="lg:col-span-4 flex flex-col gap-3">
      
      <!-- Animal Plot -->
      <div class="retro-box p-3 flex flex-col flex-1">
        <div class="flex justify-between items-center border-b-2 border-[#181425] pb-2 mb-2">
          <div>
            <h2 class="font-retro text-xs text-[#fee761]">KANDANG HEWAN</h2>
            <div id="slot-label" class="text-[9px] font-pixel text-[#8b9bb4]">SLOT: 0 / 4</div>
          </div>
          <button id="btn-sell-all" class="retro-btn retro-btn-orange text-[8px] py-1 px-2">
            JUAL SEMUA
          </button>
        </div>

        <div id="inventory-list" class="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 flex-1"></div>

        <!-- Upgrades -->
        <div class="mt-3 pt-2 border-t-2 border-[#181425] flex flex-col gap-2">
          <button id="btn-upgrade-pullup" class="retro-box p-2 flex justify-between items-center text-left hover:bg-[#3a4466]">
            <div>
              <div class="font-retro text-[9px] text-[#fee761]">LEVEL PULL-UP <span id="label-pullup-level">Lv.1</span></div>
              <div class="text-[9px] text-[#63c74d] font-pixel" id="label-pullup-rate">+3 PWR/S</div>
            </div>
            <div id="cost-upgrade-pullup" class="font-retro text-[9px] text-[#63c74d]">$50</div>
          </button>

          <button id="btn-upgrade-slot" class="retro-box p-2 flex justify-between items-center text-left hover:bg-[#3a4466]">
            <div>
              <div class="font-retro text-[9px] text-[#fee761]">EXPAND PLOT <span id="label-base-capacity">(4)</span></div>
              <div class="text-[9px] text-[#2ce8f5] font-pixel">+2 SLOT</div>
            </div>
            <div id="cost-upgrade-slot" class="font-retro text-[9px] text-[#63c74d]">$200</div>
          </button>

          <button id="btn-rebirth" class="retro-box p-2 flex justify-between items-center text-left hover:bg-[#5a1932] border-[#a22633]">
            <div>
              <div class="font-retro text-[9px] text-[#fee761]">REBIRTH <span id="label-rebirth-count">(0x)</span></div>
              <div class="text-[9px] text-[#e4a672] font-pixel">+50% PERM MULTIPLIER</div>
            </div>
            <div id="cost-rebirth" class="font-retro text-[9px] text-[#fee761]">$50K</div>
          </button>
        </div>
      </div>

    </div>

  </main>

  <!-- Modals (Index, Quest, Leaderboard) -->
  <div id="modal-quests" class="fixed inset-0 bg-[#181425]/90 z-50 flex items-center justify-center p-4 hidden">
    <div class="retro-box max-w-md w-full p-4 flex flex-col max-h-[85vh]">
      <div class="flex justify-between items-center border-b-2 border-[#181425] pb-2">
        <h2 class="font-retro text-xs text-[#fee761]">QUESTS</h2>
        <button id="btn-close-quests" class="font-retro text-sm text-[#e43b44]">&times;</button>
      </div>
      <div id="quests-list" class="overflow-y-auto mt-3 space-y-2 flex-1"></div>
    </div>
  </div>

  <div id="modal-index" class="fixed inset-0 bg-[#181425]/90 z-50 flex items-center justify-center p-4 hidden">
    <div class="retro-box max-w-lg w-full p-4 flex flex-col max-h-[85vh]">
      <div class="flex justify-between items-center border-b-2 border-[#181425] pb-2">
        <h2 class="font-retro text-xs text-[#fee761]">ANIMAL BESTIARY</h2>
        <button id="btn-close-index" class="font-retro text-sm text-[#e43b44]">&times;</button>
      </div>
      <div id="index-list" class="overflow-y-auto mt-3 space-y-3 flex-1"></div>
    </div>
  </div>

  <div id="modal-leaderboard" class="fixed inset-0 bg-[#181425]/90 z-50 flex items-center justify-center p-4 hidden">
    <div class="retro-box max-w-md w-full p-4 flex flex-col">
      <div class="flex justify-between items-center border-b-2 border-[#181425] pb-2">
        <h2 class="font-retro text-xs text-[#fee761]">GLOBAL RANKINGS</h2>
        <button id="btn-close-leaderboard" class="font-retro text-sm text-[#e43b44]">&times;</button>
      </div>
      <div class="mt-3 space-y-2 font-retro text-[9px]">
        <div class="bg-[#181425] p-2 border border-[#3a4466] flex justify-between">
          <span>MOST CATCHES:</span>
          <span id="lb-catches" class="text-[#fee761]">0</span>
        </div>
        <div class="bg-[#181425] p-2 border border-[#3a4466] flex justify-between">
          <span>TOTAL CASH:</span>
          <span id="lb-total-money" class="text-[#63c74d]">$0</span>
        </div>
        <div class="bg-[#181425] p-2 border border-[#3a4466]" id="lb-luckiest-box">
          LUCKIEST: NONE
        </div>
      </div>
    </div>
  </div>

</div>
`;

// Initialize Retro Isometric 3D World & Radar
const viewport = document.querySelector('#viewport-3d');
const world = new RetroIsometricWorld(viewport);
const radar = new RetroRadar(document.querySelector('#radar-canvas'), world);

function updateRadar() {
  radar.render();
  requestAnimationFrame(updateRadar);
}
requestAnimationFrame(updateRadar);

window.addEventListener('retro:throw', () => triggerThrow());
window.addEventListener('retro:pullup', () => togglePullUp());

// Meter Animation
let meterVal = 0;
let meterDirection = 1;
const meterNeedle = document.querySelector('#meter-needle');
const meterText = document.querySelector('#meter-text');

function animateMeter() {
  if (!world.isThrowing) {
    const spd = 0.5 + Math.abs(world.windSpeed * 0.02);
    meterVal += meterDirection * spd;
    if (meterVal >= 20) { meterVal = 20; meterDirection = -1; }
    else if (meterVal <= 0) { meterVal = 0; meterDirection = 1; }
    meterNeedle.style.left = `${(meterVal / 20) * 100}%`;
    meterText.textContent = `${Math.floor(meterVal)} / 20`;
  }
  requestAnimationFrame(animateMeter);
}
requestAnimationFrame(animateMeter);

// Update UI
function updateUI() {
  document.querySelector('#stat-money').textContent = `$${formatNum(state.money)}`;
  document.querySelector('#stat-power').textContent = formatNum(state.power);
  document.querySelector('#stat-cps').textContent = `+$${formatNum(state.getCurrentCps())}`;
  document.querySelector('#stat-rebirth').textContent = `${state.rebirthCount}x`;

  document.querySelector('#label-pullup-level').textContent = `Lv.${state.pullUpLevel}`;
  document.querySelector('#label-pullup-rate').textContent = `+${formatNum(state.getPullUpRate())} PWR/S`;
  document.querySelector('#cost-upgrade-pullup').textContent = `$${formatNum(state.pullUpCost)}`;

  document.querySelector('#label-base-capacity').textContent = `(${state.maxBaseSlots})`;
  document.querySelector('#cost-upgrade-slot').textContent = `$${formatNum(state.baseSlotCost)}`;

  document.querySelector('#label-rebirth-count').textContent = `(${state.rebirthCount}x)`;
  document.querySelector('#cost-rebirth').textContent = `$${formatNum(state.rebirthCost)}`;

  document.querySelector('#slot-label').textContent = `SLOT: ${state.inventory.length} / ${state.maxBaseSlots}`;

  const pullupBtn = document.querySelector('#btn-toggle-pullup');
  pullupBtn.textContent = state.isTraining ? 'STOP TRAIN [E]' : 'PULL-UP [E]';

  const autoBtn = document.querySelector('#btn-auto-throw');
  autoBtn.textContent = state.autoThrow ? 'AUTO: ON' : 'AUTO: OFF';

  world.updatePlotAnimals(state.inventory);
  world.updateEquippedPets(state.inventory, state.equippedPets);

  renderFoodList();
  renderInventory();
}

function renderFoodList() {
  const container = document.querySelector('#food-list');
  container.innerHTML = '';

  FOOD_TIERS.forEach((f, idx) => {
    const isUnlocked = state.unlockedFoods.includes(idx);
    const isSelected = state.selectedFoodIndex === idx;

    const btn = document.createElement('div');
    btn.className = `retro-box flex-shrink-0 w-24 p-2 text-center cursor-pointer ${
      isSelected ? 'border-[#fee761] bg-[#3a4466]' : isUnlocked ? 'bg-[#262b44]' : 'opacity-50'
    }`;

    btn.innerHTML = `
      <div class="font-retro text-[9px] text-[#fee761]">${f.iconText}</div>
      <div class="font-pixel text-[10px] text-[#c0cbdc] mt-0.5 truncate">${f.name}</div>
      <div class="font-retro text-[8px] text-[#2ce8f5] mt-1">${f.luckBonus}X</div>
      <div class="font-retro text-[8px] mt-1 ${isUnlocked ? 'text-[#63c74d]' : 'text-[#e4a672]'}">
        ${isUnlocked ? (isSelected ? 'ACTIVE' : 'SELECT') : `$${formatNum(f.cost)}`}
      </div>
    `;

    btn.onclick = () => {
      sfx.playPop();
      if (isUnlocked) {
        state.selectedFoodIndex = idx;
        state.save();
        updateUI();
      } else {
        if (state.money >= f.cost) {
          state.buyFood(idx);
          sfx.playLevelUp();
          updateUI();
        } else {
          alert('UANG TIDAK CUKUP!');
        }
      }
    };
    container.appendChild(btn);
  });

  const curFood = FOOD_TIERS[state.selectedFoodIndex];
  document.querySelector('#food-luck-label').textContent = `LUCK: ${curFood.luckBonus}X`;
}

function renderInventory() {
  const container = document.querySelector('#inventory-list');
  container.innerHTML = '';

  if (state.inventory.length === 0) {
    container.innerHTML = `<div class="col-span-2 text-center font-retro text-[8px] text-[#8b9bb4] py-8">KANDANG KOSONG</div>`;
    return;
  }

  state.inventory.forEach((item, idx) => {
    const mut = MUTATION_DATA[item.mutation] || MUTATION_DATA.Normal;
    const card = document.createElement('div');
    const isEquipped = state.equippedPets.includes(item.uid);

    card.className = `retro-box p-2 flex flex-col justify-between`;
    const cps = Math.floor(item.baseCps * mut.multiplier);
    const sellPrice = Math.max(10, Math.floor(cps * 25));

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start font-retro text-[8px]">
          <span class="text-[#fee761]">${item.name}</span>
          <span style="color:${RARITY_COLORS[item.rarity]}">${item.rarity[0]}</span>
        </div>
        <div class="font-pixel text-[9px] mt-0.5" style="color:${mut.color}">${mut.name}</div>
        <div class="font-retro text-[8px] text-[#63c74d] mt-1">+${formatNum(cps)}/S</div>
      </div>
      <div class="flex gap-1 mt-2">
        <button class="retro-btn flex-1 text-[7px] py-1 px-1 ${isEquipped ? 'retro-btn-gold' : ''}" data-equip="${item.uid}">
          ${isEquipped ? 'EQUIP' : 'USE'}
        </button>
        <button class="retro-btn retro-btn-orange text-[7px] py-1 px-1" data-sell="${idx}">
          $${formatNum(sellPrice)}
        </button>
      </div>
    `;

    card.querySelector(`[data-equip="${item.uid}"]`).onclick = () => {
      sfx.playPop();
      state.toggleEquipPet(item.uid);
      updateUI();
    };

    card.querySelector(`[data-sell="${idx}"]`).onclick = () => {
      sfx.playCoins();
      state.sellAnimal(idx);
      updateUI();
    };

    container.appendChild(card);
  });
}

function showCatchToast(animal, sellPrice = null) {
  const toast = document.querySelector('#catch-toast');
  const title = document.querySelector('#catch-title');
  const desc = document.querySelector('#catch-desc');

  title.textContent = `CAUGHT: ${animal.name.toUpperCase()}`;
  if (sellPrice) desc.textContent = `AUTO-SOLD: +$${formatNum(sellPrice)}`;
  else desc.textContent = `+${formatNum(animal.baseCps)}/S [${animal.mutation.toUpperCase()}]`;

  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function triggerThrow() {
  if (world.isThrowing) return;
  const food = FOOD_TIERS[state.selectedFoodIndex];
  const score = Math.floor(meterVal);

  sfx.playThrow(score);
  const hud = document.querySelector('#throw-hud');
  hud.classList.remove('hidden');

  world.startThrow({
    food,
    power: state.power,
    timingScore: score,
    onFinish: (caughtAnimal, dist) => {
      hud.classList.add('hidden');
      sfx.playCatch(caughtAnimal.rarity, caughtAnimal.mutation);

      state.checkQuest('catch', 1);
      state.checkQuest('distance', dist);
      state.checkQuest('mutation', caughtAnimal.mutation);

      const res = state.addAnimal(caughtAnimal);
      showCatchToast(caughtAnimal, res.autoSold ? res.sellPrice : null);
      updateUI();
    }
  });
}

function togglePullUp() {
  sfx.playPop();
  state.isTraining = !state.isTraining;
  world.setTrainingMode(state.isTraining);
  updateUI();
}

// Distance & Wind Tick
setInterval(() => {
  if (world.isThrowing) {
    document.querySelector('#throw-dist-val').textContent = world.currentDistance;
    document.querySelector('#zone-badge').textContent = `ZONE: ${world.targetZone.name.toUpperCase()}`;
  }

  const stamPct = Math.round((world.stamina / world.maxStamina) * 100);
  document.querySelector('#stamina-text').textContent = `${stamPct}%`;
  document.querySelector('#stamina-bar').style.width = `${stamPct}%`;

  const wText = world.windDirection > 0 ? 'TAILWIND' : 'HEADWIND';
  document.querySelector('#wind-badge').textContent = `WIND: ${world.windSpeed} M/S (${wText})`;
}, 50);

// Buttons
document.querySelector('#btn-throw').onclick = () => triggerThrow();
document.querySelector('#meter-container').onclick = () => triggerThrow();

document.querySelector('#btn-auto-throw').onclick = () => {
  sfx.playPop();
  state.autoThrow = !state.autoThrow;
  state.save();
  updateUI();
};

document.querySelector('#btn-toggle-pullup').onclick = () => togglePullUp();

document.querySelector('#btn-upgrade-pullup').onclick = () => {
  if (state.upgradePullUp()) { sfx.playLevelUp(); updateUI(); }
};

document.querySelector('#btn-upgrade-slot').onclick = () => {
  if (state.upgradeBaseSlot()) { sfx.playLevelUp(); updateUI(); }
};

document.querySelector('#btn-rebirth').onclick = () => {
  if (state.canRebirth()) {
    if (confirm('REBIRTH RESTART POWER & CASH UNTUK +50% BONUS?')) {
      state.doRebirth();
      sfx.playLevelUp();
      updateUI();
    }
  } else {
    alert(`BUTUH $${formatNum(state.rebirthCost)}`);
  }
};

document.querySelector('#btn-sell-all').onclick = () => {
  if (state.inventory.length === 0) return;
  sfx.playCoins();
  state.sellAllAnimals();
  updateUI();
};

document.querySelector('#btn-sound-toggle').onclick = () => {
  sfx.enabled = !sfx.enabled;
};

// Modals
const mQuests = document.querySelector('#modal-quests');
document.querySelector('#btn-tab-quests').onclick = () => {
  sfx.playPop();
  renderQuests();
  mQuests.classList.remove('hidden');
};
document.querySelector('#btn-close-quests').onclick = () => mQuests.classList.add('hidden');

function renderQuests() {
  const list = document.querySelector('#quests-list');
  list.innerHTML = '';
  state.quests.forEach(q => {
    const box = document.createElement('div');
    box.className = `retro-box p-2 flex justify-between items-center ${q.claimed ? 'opacity-40' : ''}`;
    const pct = Math.min(100, Math.round((q.current / q.target) * 100));
    box.innerHTML = `
      <div>
        <div class="font-retro text-[9px] text-[#fee761]">${q.title}</div>
        <div class="font-pixel text-[9px] text-[#8b9bb4]">${q.desc}</div>
        <div class="font-retro text-[8px] text-[#63c74d] mt-1">${formatNum(q.current)}/${formatNum(q.target)} (${pct}%)</div>
      </div>
      <div>
        ${q.claimed ? '<span class="font-retro text-[8px] text-[#8b9bb4]">DONE</span>' : q.completed ? `<button class="retro-btn retro-btn-gold text-[8px]" data-claim="${q.id}">CLAIM</button>` : `<span class="font-retro text-[8px] text-[#63c74d]">+$${formatNum(q.rewardCash)}</span>`}
      </div>
    `;
    if (q.completed && !q.claimed) {
      box.querySelector(`[data-claim="${q.id}"]`).onclick = () => {
        sfx.playLevelUp();
        state.claimQuest(q.id);
        renderQuests();
        updateUI();
      };
    }
    list.appendChild(box);
  });
}

const mIndex = document.querySelector('#modal-index');
document.querySelector('#btn-tab-index').onclick = () => {
  sfx.playPop();
  renderIndex();
  mIndex.classList.remove('hidden');
};
document.querySelector('#btn-close-index').onclick = () => mIndex.classList.add('hidden');

function renderIndex() {
  const list = document.querySelector('#index-list');
  list.innerHTML = '';
  ZONES.forEach(z => {
    const box = document.createElement('div');
    box.className = 'retro-box p-2';
    let anHtml = '';
    z.animals.forEach(an => {
      const disc = (state.indexProgress[an.id] || []).length > 0;
      anHtml += `
        <div class="bg-[#181425] p-1.5 border border-[#3a4466] flex justify-between font-retro text-[8px] ${disc ? '' : 'opacity-30'}">
          <span>${disc ? an.name : '???'}</span>
          <span style="color:${RARITY_COLORS[an.rarity]}">${an.rarity}</span>
        </div>
      `;
    });
    box.innerHTML = `
      <div class="font-retro text-[9px] text-[#fee761] mb-1">${z.name}</div>
      <div class="grid grid-cols-2 gap-1">${anHtml}</div>
    `;
    list.appendChild(box);
  });
}

const mLb = document.querySelector('#modal-leaderboard');
document.querySelector('#btn-tab-leaderboard').onclick = () => {
  sfx.playPop();
  document.querySelector('#lb-catches').textContent = `${formatNum(state.totalCatches)}`;
  document.querySelector('#lb-total-money').textContent = `$${formatNum(state.totalEarned)}`;
  if (state.luckiestCatch) {
    document.querySelector('#lb-luckiest-box').innerHTML = `
      LUCKIEST: ${state.luckiestCatch.name} (${state.luckiestCatch.rarity}) [${state.luckiestCatch.mutation}]
    `;
  }
  mLb.classList.remove('hidden');
};
document.querySelector('#btn-close-leaderboard').onclick = () => mLb.classList.add('hidden');

// Passive Tick
setInterval(() => {
  if (state.autoThrow && !world.isThrowing && !state.isTraining) {
    triggerThrow();
  }
  if (state.isTraining) {
    const gain = state.getPullUpRate();
    state.power += gain;
    state.checkQuest('pullup', gain);
    document.querySelector('#stat-power').textContent = formatNum(state.power);
  }
  const cps = state.getCurrentCps();
  if (cps > 0) {
    state.money += cps;
    state.totalEarned += cps;
    document.querySelector('#stat-money').textContent = `$${formatNum(state.money)}`;
  }
}, 1000);

updateUI();
