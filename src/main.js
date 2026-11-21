import './style.css';
import './ui-kit.css';
import { GameState, formatNum } from './gameState.js';
import { FOOD_TIERS, ZONES, MUTATION_DATA, RARITY_COLORS } from './gameData.js';
import { RobloxSeamlessWorld } from './robloxSeamlessWorld.js';
import { sfx } from './audio.js';

const state = new GameState();

// FULL SCREEN IMMERSIVE MAP LAYOUT - CHUNKY VOXEL DIORAMA (ZOO TOSS)
const app = document.querySelector('#app');
app.innerHTML = `
<div class="relative w-screen h-screen overflow-hidden bg-[#7CCBFF] font-ui text-[#1B2233] select-none">
  
  <!-- 3D FULLSCREEN CANVAS CONTAINER -->
  <div id="full-map-viewport" class="absolute inset-0 w-full h-full z-0"></div>

  <!-- FLOATING HUD (TOP LEFT: LEADERSTATS) -->
  <div class="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
    <!-- Stats Badge -->
    <div class="zt-panel px-4 py-2.5 flex items-center gap-4 shadow-xl pointer-events-auto">
      <div>
        <div class="text-[10px] text-[#2A9D4B] font-display">CASH</div>
        <div id="hud-money" class="text-xs md:text-sm font-display text-[#1B2233]">$0</div>
      </div>
      <div class="w-0.5 h-6 bg-[#1B2233]/20"></div>
      <div>
        <div class="text-[10px] text-[#C2560B] font-display">POWER</div>
        <div id="hud-power" class="text-xs md:text-sm font-display text-[#1B2233]">10</div>
      </div>
      <div class="w-0.5 h-6 bg-[#1B2233]/20"></div>
      <div>
        <div class="text-[10px] text-[#1A4F99] font-display">CPS</div>
        <div id="hud-cps" class="text-xs md:text-sm font-display text-[#1B2233]">+$0</div>
      </div>
      <div class="w-0.5 h-6 bg-[#1B2233]/20"></div>
      <div>
        <div class="text-[10px] text-[#C23030] font-display">REBIRTH</div>
        <div id="hud-rebirth" class="text-xs md:text-sm font-display text-[#1B2233]">0x</div>
      </div>
    </div>

    <!-- Active Zone Banner -->
    <div class="zt-card px-3.5 py-2 flex flex-col gap-0.5 max-w-sm pointer-events-auto">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-[#3CCB5A]"></span>
        <span id="hud-zone-name" class="font-display text-[11px] text-[#FF7A1A]">ZONE: LOBBY (0 - 300m)</span>
      </div>
      <div id="hud-zone-gimmick" class="text-[11px] text-[#1B2233] font-ui">Safe zone and training grounds. Calm winds, perfect for beginners.</div>
    </div>
  </div>

  <!-- TOP RIGHT: QUICK SHORTCUTS & CAMERA HINT -->
  <div class="absolute top-4 right-4 z-20 flex flex-col items-end gap-1.5">
    <div class="flex items-center gap-2">
      <button id="btn-open-quests" class="zt-btn zt-btn--primary text-xs py-1.5 px-3">
        📜 QUEST
      </button>
      <button id="btn-open-index" class="zt-btn zt-btn--primary text-xs py-1.5 px-3">
        📖 INDEX
      </button>
      <button id="btn-open-rank" class="zt-btn zt-btn--primary text-xs py-1.5 px-3">
        🏆 RANK
      </button>
      <button id="btn-toggle-sound" class="zt-btn zt-btn--secondary text-xs py-1.5 px-2.5">
        🔊
      </button>
    </div>
    <div class="zt-card px-2.5 py-1 text-[10px] text-[#1B2233]/80 font-ui shadow-sm">
      🖱️ Drag mouse to rotate view • Scroll to zoom POV
    </div>
  </div>

  <!-- BOTTOM CENTER CONTROLS: UNIFIED THROW METER & ACTION BAR -->
  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-md flex flex-col gap-2 items-center pointer-events-none">
    
    <!-- CONTEXT ACTION PROMPT (WHEN STANDING AT STATIONS) -->
    <div id="context-action-bar" class="w-full transition-all duration-200 hidden pointer-events-auto">
      <div class="zt-panel px-4 py-2 flex items-center justify-between shadow-xl">
        <div class="flex items-center gap-2.5">
          <span id="context-key" class="font-display text-xs text-white bg-[#FF7A1A] border-2 border-[#1B2233] px-2 py-0.5 rounded">[SPACE]</span>
          <div>
            <div id="context-action" class="font-display text-xs text-[#FF7A1A]">THROW FOOD</div>
            <div id="context-desc" class="text-[10px] text-[#1B2233] font-ui">Press key or tap execute</div>
          </div>
        </div>
        <button id="btn-context-trigger" class="zt-btn zt-btn--secondary text-xs py-1 px-3">
          EXECUTE
        </button>
      </div>
    </div>

    <!-- FLOATING THROW CONTROLLER (CHUNKY VOXEL POWER METER & BAIT BAR) -->
    <div id="throw-control-floating" class="w-full zt-panel p-3 flex flex-col gap-2 pointer-events-auto shadow-2xl">
      <div class="flex justify-between items-center text-[11px] font-display">
        <span class="text-[#1B2233]">POWER METER</span>
        <span id="floating-meter-val" class="text-[#FF7A1A]">0 / 20</span>
        <span id="floating-wind-val" class="text-[#2F8CFF]">WIND: 0 M/S</span>
      </div>

      <!-- Precision Meter -->
      <div id="meter-container" class="relative w-full h-8 bg-[#1B2233] border-3 border-[#1B2233] rounded-lg overflow-hidden cursor-pointer" title="Click or tap to throw!">
        <div class="absolute inset-0 flex text-[9px] font-display items-center text-white">
          <div class="w-[50%] bg-[#FF3B3B] h-full flex items-center justify-center border-r-2 border-[#1B2233]">POOR</div>
          <div class="w-[30%] bg-[#FFE14D] text-[#1B2233] h-full flex items-center justify-center border-r-2 border-[#1B2233]">GOOD</div>
          <div class="w-[20%] bg-[#3CCB5A] h-full flex items-center justify-center">MAX</div>
        </div>
        <div id="meter-needle" class="absolute top-0 bottom-0 w-3 bg-[#FFFFFF] border-2 border-[#1B2233] -translate-x-1/2 pointer-events-none" style="left: 0%;"></div>
      </div>

      <div class="flex items-center justify-between gap-2 pt-0.5">
        <!-- Food Select Bar -->
        <div class="flex items-center gap-1.5 overflow-x-auto flex-1 pb-1" id="mini-food-selector"></div>
        
        <button id="btn-toggle-auto" class="zt-btn zt-btn--accent text-[10px] py-1 px-2.5 whitespace-nowrap">
          AUTO: OFF
        </button>
      </div>
    </div>
  </div>

  <!-- FLYING DISTANCE HUD (IN METERS) -->
  <div id="throw-flight-hud" class="absolute top-16 left-1/2 -translate-x-1/2 z-30 zt-panel px-6 py-2 font-display text-sm text-[#FF7A1A] hidden">
    DISTANCE: <span id="flight-distance">0</span> M
  </div>

  <!-- CATCH NOTIFICATION TOAST -->
  <div id="catch-toast" class="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 zt-panel p-3.5 flex items-center gap-3 opacity-0 transition-opacity duration-200 pointer-events-none shadow-2xl">
    <div>
      <div id="catch-name" class="font-display text-xs text-[#FF7A1A]">CAUGHT!</div>
      <div id="catch-sub" class="text-[11px] text-[#1B2233] mt-0.5">+50 CASH/S</div>
    </div>
  </div>

  <!-- MODAL: SHOP & NPC BOOTH -->
  <div id="modal-shop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="zt-panel max-w-xl w-full p-5 flex flex-col max-h-[85vh]">
      <div class="flex justify-between items-center border-b-2 border-[#1B2233]/20 pb-3">
        <div>
          <h2 class="font-display text-sm text-[#FF7A1A]">ZOOKEEPER MERCHANT STAND</h2>
          <p class="text-xs text-[#1B2233]/70 font-ui">Sell caught animals & upgrade your strength!</p>
        </div>
        <button id="btn-close-shop" class="zt-btn zt-btn--danger text-xs py-1 px-2.5">&times;</button>
      </div>

      <div class="mt-4 overflow-y-auto space-y-3 flex-1 pr-1">
        <!-- Quick Sell All -->
        <div class="zt-card p-3 flex justify-between items-center">
          <div>
            <div class="font-display text-xs text-[#1B2233]">SELL ALL ANIMALS</div>
            <div class="text-[11px] text-[#1B2233]/70 font-ui">Sell all pen inventory for immediate coins</div>
          </div>
          <button id="btn-shop-sell-all" class="zt-btn zt-btn--danger text-xs py-1.5 px-3">
            SELL ALL
          </button>
        </div>

        <!-- Upgrade Pull-Up -->
        <div class="zt-card p-3 flex justify-between items-center">
          <div>
            <div class="font-display text-xs text-[#FF7A1A]">TRAINING LEVEL <span id="shop-pullup-lv">Lv.1</span></div>
            <div class="text-[11px] text-[#2A9D4B] font-display" id="shop-pullup-rate">+3 Power / sec</div>
          </div>
          <button id="btn-shop-upgrade-pullup" class="zt-btn zt-btn--secondary text-xs py-1.5 px-3">
            $50
          </button>
        </div>

        <!-- Expand Base Slots -->
        <div class="zt-card p-3 flex justify-between items-center">
          <div>
            <div class="font-display text-xs text-[#2F8CFF]">EXPAND PEN SLOTS <span id="shop-slots-count">(4)</span></div>
            <div class="text-[11px] text-[#1A4F99] font-ui">+2 New Animal Slots</div>
          </div>
          <button id="btn-shop-upgrade-slots" class="zt-btn zt-btn--primary text-xs py-1.5 px-3">
            $200
          </button>
        </div>

        <!-- Rebirth -->
        <div class="zt-card p-3 flex justify-between items-center border-2 border-[#A24BFF]">
          <div>
            <div class="font-display text-xs text-[#A24BFF]">REBIRTH PRESTIGE <span id="shop-rebirth-count">(0x)</span></div>
            <div class="text-[11px] text-[#5A2299] font-ui">+50% Permanent Power & CPS Multiplier!</div>
          </div>
          <button id="btn-shop-rebirth" class="zt-btn zt-btn--accent text-xs py-1.5 px-3">
            $50K
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: ANIMAL PEN / PLOT -->
  <div id="modal-plot" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="zt-panel max-w-2xl w-full p-5 flex flex-col max-h-[85vh]">
      <div class="flex justify-between items-center border-b-2 border-[#1B2233]/20 pb-3">
        <div>
          <h2 class="font-display text-sm text-[#3CCB5A]">ANIMAL PEN</h2>
          <div id="plot-capacity-text" class="text-xs text-[#1B2233]/70 font-ui">Slots: 0 / 4 Used</div>
        </div>
        <button id="btn-close-plot" class="zt-btn zt-btn--danger text-xs py-1 px-2.5">&times;</button>
      </div>
      <div id="plot-animals-list" class="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto mt-4 flex-1 pr-1"></div>
    </div>
  </div>

  <!-- MODAL: QUESTS -->
  <div id="modal-quests" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="zt-panel max-w-lg w-full p-5 flex flex-col max-h-[85vh]">
      <div class="flex justify-between items-center border-b-2 border-[#1B2233]/20 pb-3">
        <h2 class="font-display text-sm text-[#FF7A1A]">DAILY QUESTS</h2>
        <button id="btn-close-quests" class="zt-btn zt-btn--danger text-xs py-1 px-2.5">&times;</button>
      </div>
      <div id="quests-list" class="overflow-y-auto mt-4 space-y-2.5 flex-1"></div>
    </div>
  </div>

  <!-- MODAL: BESTIARY INDEX (9 ZONES) -->
  <div id="modal-index" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="zt-panel max-w-2xl w-full p-5 flex flex-col max-h-[85vh]">
      <div class="flex justify-between items-center border-b-2 border-[#1B2233]/20 pb-3">
        <h2 class="font-display text-sm text-[#2F8CFF]">ZONE BESTIARY INDEX</h2>
        <button id="btn-close-index" class="zt-btn zt-btn--danger text-xs py-1 px-2.5">&times;</button>
      </div>
      <div id="index-list" class="overflow-y-auto mt-4 space-y-3.5 flex-1"></div>
    </div>
  </div>

  <!-- MODAL: RANKINGS -->
  <div id="modal-rank" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="zt-panel max-w-md w-full p-5 flex flex-col">
      <div class="flex justify-between items-center border-b-2 border-[#1B2233]/20 pb-3">
        <h2 class="font-display text-sm text-[#FF3D7F]">GLOBAL LEADERBOARD</h2>
        <button id="btn-close-rank" class="zt-btn zt-btn--danger text-xs py-1 px-2.5">&times;</button>
      </div>
      <div class="mt-4 space-y-2.5 font-display text-xs">
        <div class="zt-card p-3 flex justify-between">
          <span>MOST CATCHES:</span>
          <span id="lb-catches" class="text-[#FF7A1A]">0</span>
        </div>
        <div class="zt-card p-3 flex justify-between">
          <span>TOTAL CASH:</span>
          <span id="lb-money" class="text-[#3CCB5A]">$0</span>
        </div>
        <div class="zt-card p-3" id="lb-luck">
          LUCKIEST: NONE
        </div>
      </div>
    </div>
  </div>

</div>
`;

// Initialize Fullscreen 3D World
const viewportContainer = document.querySelector('#full-map-viewport');
const world = new RobloxSeamlessWorld(viewportContainer);

// In-World Context Action Execution
document.querySelector('#btn-context-trigger').onclick = () => {
  if (world.currentStation?.id === 'throw') triggerThrow();
  else if (world.currentStation?.id === 'gym') togglePullUp();
  else if (world.currentStation?.id === 'shop') openModal('shop');
  else if (world.currentStation?.id === 'plot') openModal('plot');
};

// Meter Animation
let meterVal = 0;
let meterDir = 1;
const needle = document.querySelector('#meter-needle');
const meterValText = document.querySelector('#floating-meter-val');

function animateMeter() {
  if (!world.isThrowing) {
    const spd = 0.52 + Math.abs(world.windSpeed * 0.02);
    meterVal += meterDir * spd;
    if (meterVal >= 20) { meterVal = 20; meterDir = -1; }
    else if (meterVal <= 0) { meterVal = 0; meterDir = 1; }
    needle.style.left = `${(meterVal / 20) * 100}%`;
    meterValText.textContent = `${Math.floor(meterVal)} / 20`;
  }
  requestAnimationFrame(animateMeter);
}
requestAnimationFrame(animateMeter);

// Update UI
function updateUI() {
  document.querySelector('#hud-money').textContent = `$${formatNum(state.money)}`;
  document.querySelector('#hud-power').textContent = formatNum(state.power);
  document.querySelector('#hud-cps').textContent = `+$${formatNum(state.getCurrentCps())}`;
  document.querySelector('#hud-rebirth').textContent = `${state.rebirthCount}x`;

  // Shop values
  document.querySelector('#shop-pullup-lv').textContent = `Lv.${state.pullUpLevel}`;
  document.querySelector('#shop-pullup-rate').textContent = `+${formatNum(state.getPullUpRate())} Power / sec`;
  document.querySelector('#btn-shop-upgrade-pullup').textContent = `$${formatNum(state.pullUpCost)}`;

  document.querySelector('#shop-slots-count').textContent = `(${state.maxBaseSlots})`;
  document.querySelector('#btn-shop-upgrade-slots').textContent = `$${formatNum(state.baseSlotCost)}`;

  document.querySelector('#shop-rebirth-count').textContent = `(${state.rebirthCount}x)`;
  document.querySelector('#btn-shop-rebirth').textContent = `$${formatNum(state.rebirthCost)}`;

  document.querySelector('#plot-capacity-text').textContent = `Slots: ${state.inventory.length} / ${state.maxBaseSlots} Used`;

  // Sync 3D in-world plot
  world.updatePlotAnimals(state.inventory);
  world.updateEquippedPets(state.inventory, state.equippedPets);

  renderMiniFoodSelector();
  renderPlotAnimals();
}

function renderMiniFoodSelector() {
  const container = document.querySelector('#mini-food-selector');
  container.innerHTML = '';

  FOOD_TIERS.forEach((f, idx) => {
    const isUnlocked = state.unlockedFoods.includes(idx);
    const isSelected = state.selectedFoodIndex === idx;

    const btn = document.createElement('button');
    btn.className = `px-2.5 py-1 text-[10px] font-display rounded-md border-2 border-[#1B2233] transition whitespace-nowrap cursor-pointer ${
      isSelected
        ? 'bg-[#FF7A1A] text-white scale-105'
        : isUnlocked
        ? 'bg-[#FFF4DC] text-[#1B2233] hover:bg-[#F2DFB8]'
        : 'bg-[#C9C2B3] text-[#1B2233]/50 opacity-60'
    }`;
    btn.innerHTML = `${f.iconText} <span class="${isUnlocked ? 'text-[#3CCB5A]' : 'text-[#FF7A1A]'}">${isUnlocked ? '✓' : '$' + formatNum(f.cost)}</span>`;

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
          alert('Not enough cash to unlock this bait!');
        }
      }
    };
    container.appendChild(btn);
  });
}

function renderPlotAnimals() {
  const container = document.querySelector('#plot-animals-list');
  container.innerHTML = '';

  if (state.inventory.length === 0) {
    container.innerHTML = `<div class="col-span-3 text-center text-[#1B2233]/50 text-xs py-10 font-display">PEN IS EMPTY</div>`;
    return;
  }

  state.inventory.forEach((item, idx) => {
    const mut = MUTATION_DATA[item.mutation] || MUTATION_DATA.Normal;
    const isEquipped = state.equippedPets.includes(item.uid);
    const cps = Math.floor(item.baseCps * mut.multiplier);
    const sellPrice = Math.max(10, Math.floor(cps * 25));

    const card = document.createElement('div');
    card.className = 'zt-card p-3 flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start font-display text-[11px]">
          <span class="text-[#1B2233]">${item.name}</span>
          <span style="color:${RARITY_COLORS[item.rarity] || '#1B2233'}">${item.rarity}</span>
        </div>
        <div class="text-[10px] font-ui font-semibold mt-0.5" style="color:${mut.color}">[${mut.name}]</div>
        <div class="font-display text-[10px] text-[#3CCB5A] mt-1">+${formatNum(cps)}/s</div>
      </div>
      <div class="flex gap-1.5 mt-2.5">
        <button class="zt-btn ${isEquipped ? 'zt-btn--accent' : 'zt-btn--secondary'} flex-1 text-[9px] py-1 px-1" data-equip="${item.uid}">
          ${isEquipped ? 'EQUIPPED' : 'EQUIP'}
        </button>
        <button class="zt-btn zt-btn--danger text-[9px] py-1 px-1" data-sell="${idx}">
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
  const name = document.querySelector('#catch-name');
  const sub = document.querySelector('#catch-sub');

  name.textContent = `CAUGHT: ${animal.name.toUpperCase()}`;
  if (sellPrice) sub.textContent = `PEN FULL! AUTO-SOLD: +$${formatNum(sellPrice)}`;
  else sub.textContent = `+${formatNum(animal.baseCps)}/S [${animal.mutation.toUpperCase()}]`;

  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function triggerThrow() {
  if (world.isThrowing) return;
  const food = FOOD_TIERS[state.selectedFoodIndex];
  const score = Math.floor(meterVal);

  sfx.playThrow(score);
  const hud = document.querySelector('#throw-flight-hud');
  hud.classList.remove('hidden');

  const baseDist = (state.power * 10) * (0.5 + (score / 20) * 1.5);
  const windEffect = 1 + (world.windSpeed * 0.03 * world.windDirection);
  const distance = Math.max(15, Math.floor(baseDist * windEffect));

  let targetZone = ZONES[0];
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (distance >= ZONES[i].minDist) {
      targetZone = ZONES[i];
      break;
    }
  }

  world.throwFood(distance, targetZone, food, (caughtAnimal, dist) => {
    hud.classList.add('hidden');
    sfx.playCatch(caughtAnimal.rarity, caughtAnimal.mutation);

    state.checkQuest('catch', 1);
    state.checkQuest('distance', dist);
    state.checkQuest('mutation', caughtAnimal.mutation);

    const res = state.addAnimal(caughtAnimal);
    showCatchToast(caughtAnimal, res.autoSold ? res.sellPrice : null);
    updateUI();
  });
}

function togglePullUp() {
  sfx.playPop();
  state.isTraining = !state.isTraining;
  world.setTrainingMode(state.isTraining);
  updateUI();
}

// Tick loop for distance, wind & zone info
setInterval(() => {
  if (world.isThrowing) {
    document.querySelector('#flight-distance').textContent = world.currentDistance;
    document.querySelector('#hud-zone-name').textContent = `ZONE: ${world.targetZone.name.toUpperCase()} (${world.targetZone.minDist}-${world.targetZone.maxDist}m)`;
    document.querySelector('#hud-zone-gimmick').textContent = world.targetZone.gimmick;
  }

  const windDir = world.windDirection > 0 ? 'TAILWIND' : 'HEADWIND';
  document.querySelector('#floating-wind-val').textContent = `WIND: ${world.windSpeed} M/S (${windDir})`;
}, 50);

// Buttons & Actions
document.querySelector('#meter-container').onclick = () => triggerThrow();

document.querySelector('#btn-toggle-auto').onclick = () => {
  sfx.playPop();
  state.autoThrow = !state.autoThrow;
  state.save();
  document.querySelector('#btn-toggle-auto').textContent = state.autoThrow ? 'AUTO: ON' : 'AUTO: OFF';
};

// Modal helpers
function openModal(id) {
  sfx.playPop();
  const m = document.querySelector(`#modal-${id}`);
  if (m) m.classList.remove('hidden');
}

function closeModal(id) {
  const m = document.querySelector(`#modal-${id}`);
  if (m) m.classList.add('hidden');
}

['shop', 'plot', 'quests', 'index', 'rank'].forEach(id => {
  const btnClose = document.querySelector(`#btn-close-${id}`);
  if (btnClose) btnClose.onclick = () => closeModal(id);
});

document.querySelector('#btn-open-quests').onclick = () => { renderQuestsModal(); openModal('quests'); };
document.querySelector('#btn-open-index').onclick = () => { renderIndexModal(); openModal('index'); };
document.querySelector('#btn-open-rank').onclick = () => { updateRankModal(); openModal('rank'); };

document.querySelector('#btn-toggle-sound').onclick = () => {
  sfx.enabled = !sfx.enabled;
  document.querySelector('#btn-toggle-sound').textContent = sfx.enabled ? '🔊' : '🔇';
};

// Shop actions
document.querySelector('#btn-shop-sell-all').onclick = () => {
  if (state.inventory.length === 0) return;
  sfx.playCoins();
  const res = state.sellAllAnimals();
  alert(`Sold ${res.count} animals for +$${formatNum(res.totalSellPrice)}!`);
  updateUI();
};

document.querySelector('#btn-shop-upgrade-pullup').onclick = () => {
  if (state.upgradePullUp()) { sfx.playLevelUp(); updateUI(); }
  else alert('Not enough cash!');
};

document.querySelector('#btn-shop-upgrade-slots').onclick = () => {
  if (state.upgradeBaseSlot()) { sfx.playLevelUp(); updateUI(); }
  else alert('Not enough cash!');
};

document.querySelector('#btn-shop-rebirth').onclick = () => {
  if (state.canRebirth()) {
    if (confirm('REBIRTH NOW? Money & Power will reset, but you get a permanent +50% multiplier!')) {
      state.doRebirth();
      sfx.playLevelUp();
      updateUI();
    }
  } else {
    alert(`Need $${formatNum(state.rebirthCost)} for Rebirth!`);
  }
};

function renderQuestsModal() {
  const list = document.querySelector('#quests-list');
  list.innerHTML = '';
  state.quests.forEach(q => {
    const card = document.createElement('div');
    card.className = `zt-card p-3 flex justify-between items-center ${q.claimed ? 'opacity-40' : ''}`;
    const pct = Math.min(100, Math.round((q.current / q.target) * 100));
    card.innerHTML = `
      <div>
        <div class="font-display text-xs text-[#FF7A1A]">${q.title}</div>
        <div class="text-[11px] text-[#1B2233] font-ui">${q.desc}</div>
        <div class="font-display text-[10px] text-[#3CCB5A] mt-1">${formatNum(q.current)}/${formatNum(q.target)} (${pct}%)</div>
      </div>
      <div>
        ${q.claimed ? '<span class="text-[10px] font-display text-[#1B2233]/40">COMPLETED</span>' : q.completed ? `<button class="zt-btn zt-btn--primary text-[10px] py-1 px-2.5" data-claim="${q.id}">CLAIM</button>` : `<span class="text-[11px] font-display text-[#3CCB5A]">+$${formatNum(q.rewardCash)}</span>`}
      </div>
    `;
    if (q.completed && !q.claimed) {
      card.querySelector(`[data-claim="${q.id}"]`).onclick = () => {
        sfx.playLevelUp();
        state.claimQuest(q.id);
        renderQuestsModal();
        updateUI();
      };
    }
    list.appendChild(card);
  });
}

function renderIndexModal() {
  const list = document.querySelector('#index-list');
  list.innerHTML = '';
  ZONES.forEach(z => {
    const box = document.createElement('div');
    box.className = 'zt-card p-3';
    let anHtml = '';
    z.animals.forEach(an => {
      const disc = (state.indexProgress[an.id] || []).length > 0;
      anHtml += `
        <div class="bg-[#FFF4DC] p-2 rounded-md border-2 border-[#1B2233] flex justify-between font-display text-[10px] ${disc ? '' : 'opacity-40'}">
          <span>${disc ? an.name : '???'}</span>
          <span style="color:${RARITY_COLORS[an.rarity] || '#1B2233'}">${an.rarity}</span>
        </div>
      `;
    });
    box.innerHTML = `
      <div class="flex justify-between items-center font-display text-xs text-[#FF7A1A] mb-1.5">
        <span>${z.name}</span>
        <span class="text-[10px] text-[#1B2233]/60">${z.minDist}-${z.maxDist}m</span>
      </div>
      <div class="text-[11px] text-[#1B2233]/80 font-ui mb-2.5 italic">${z.gimmick}</div>
      <div class="grid grid-cols-2 gap-2">${anHtml}</div>
    `;
    list.appendChild(box);
  });
}

function updateRankModal() {
  document.querySelector('#lb-catches').textContent = `${formatNum(state.totalCatches)}`;
  document.querySelector('#lb-money').textContent = `$${formatNum(state.totalEarned)}`;
  if (state.luckiestCatch) {
    document.querySelector('#lb-luck').innerHTML = `
      LUCKIEST: ${state.luckiestCatch.name} (${state.luckiestCatch.rarity}) [${state.luckiestCatch.mutation}]
    `;
  }
}

// 1-second passive loop
setInterval(() => {
  if (state.autoThrow && !world.isThrowing && !state.isTraining) {
    triggerThrow();
  }
  if (state.isTraining) {
    const gain = state.getPullUpRate();
    state.power += gain;
    state.checkQuest('pullup', gain);
    document.querySelector('#hud-power').textContent = formatNum(state.power);
  }
  const cps = state.getCurrentCps();
  if (cps > 0) {
    state.money += cps;
    state.totalEarned += cps;
    document.querySelector('#hud-money').textContent = `$${formatNum(state.money)}`;
  }
}, 1000);

updateUI();
