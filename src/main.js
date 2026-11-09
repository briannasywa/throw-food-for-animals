import './style.css';
import { GameState, formatNum } from './gameState.js';
import { FOOD_TIERS, ZONES, MUTATION_DATA, RARITY_COLORS } from './gameData.js';
import { RobloxSeamlessWorld } from './robloxSeamlessWorld.js';
import { sfx } from './audio.js';

const state = new GameState();

// FULL SCREEN IMMERSIVE MAP LAYOUT
const app = document.querySelector('#app');
app.innerHTML = `
<div class="relative w-screen h-screen overflow-hidden bg-[#70c5ff] font-pixel text-white select-none">
  
  <!-- 3D FULLSCREEN CANVAS CONTAINER -->
  <div id="full-map-viewport" class="absolute inset-0 w-full h-full z-0"></div>

  <!-- FLOATING MINIMALIST HUD (TOP LEFT: LEADERSTATS) -->
  <div class="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
    <!-- Stats Badge -->
    <div class="bg-black/80 backdrop-blur-md border-2 border-white/40 px-3.5 py-2 rounded-xl flex items-center gap-4 shadow-2xl pointer-events-auto">
      <div>
        <div class="text-[9px] text-[#84cc16] font-retro">CASH</div>
        <div id="hud-money" class="text-xs md:text-sm font-retro text-[#a3e635]">$0</div>
      </div>
      <div class="w-px h-6 bg-white/20"></div>
      <div>
        <div class="text-[9px] text-[#f97316] font-retro">POWER</div>
        <div id="hud-power" class="text-xs md:text-sm font-retro text-[#fed7aa]">10</div>
      </div>
      <div class="w-px h-6 bg-white/20"></div>
      <div>
        <div class="text-[9px] text-[#06b6d4] font-retro">CPS</div>
        <div id="hud-cps" class="text-xs md:text-sm font-retro text-[#67e8f9]">+$0</div>
      </div>
      <div class="w-px h-6 bg-white/20"></div>
      <div>
        <div class="text-[9px] text-[#e11d48] font-retro">REBIRTH</div>
        <div id="hud-rebirth" class="text-xs md:text-sm font-retro text-[#fecdd3]">0x</div>
      </div>
    </div>

    <!-- Active Zone Banner & Gimmick Alert -->
    <div class="bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg flex flex-col gap-0.5 max-w-sm pointer-events-auto">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse"></span>
        <span id="hud-zone-name" class="font-retro text-[10px] text-yellow-300">ZONE: LOBBY (0 - 300m)</span>
      </div>
      <div id="hud-zone-gimmick" class="text-[9px] text-slate-300 font-pixel">Safe Zone: Tempat latihan pemula.</div>
    </div>
  </div>

  <!-- TOP RIGHT: QUICK SHORTCUTS & RADAR COMPASS -->
  <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
    <button id="btn-open-quests" class="retro-btn text-[9px] bg-black/80 border-2 border-amber-400 text-yellow-300 hover:scale-105 active:scale-95 transition">
      📜 QUEST
    </button>
    <button id="btn-open-index" class="retro-btn text-[9px] bg-black/80 border-2 border-cyan-400 text-cyan-300 hover:scale-105 active:scale-95 transition">
      📖 INDEX
    </button>
    <button id="btn-open-rank" class="retro-btn text-[9px] bg-black/80 border-2 border-rose-400 text-rose-300 hover:scale-105 active:scale-95 transition">
      🏆 RANK
    </button>
    <button id="btn-toggle-sound" class="retro-btn text-[9px] bg-black/80 border-2 border-white/40">
      🔊
    </button>
  </div>

  <!-- BOTTOM CENTER: CONTEXT-AWARE IN-WORLD ACTION BAR (MUNCUL KETIKA BERINTERAKSI / DI LOKASI MAP) -->
  <div id="context-action-bar" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-200 hidden">
    <div class="bg-black/90 backdrop-blur-md border-3 border-amber-400 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
      <span id="context-key" class="font-retro text-sm text-black bg-yellow-400 px-2.5 py-1 rounded-md">[SPACE]</span>
      <div>
        <div id="context-action" class="font-retro text-xs md:text-sm text-yellow-300">LEMPAR MAKANAN</div>
        <div id="context-desc" class="text-[10px] text-slate-300 font-pixel">Garis Lempar • Tekan [SPASI] untuk aksi</div>
      </div>
      <button id="btn-context-trigger" class="retro-btn retro-btn-orange text-[10px] py-1.5 px-3">
        EKSEKUSI
      </button>
    </div>
  </div>

  <!-- FLOATING THROW CONTROLLER (MUNCUL OTOMATIS SAAT BERADA DI GARIS LEMPAR / BISA DI-TRIGGER) -->
  <div id="throw-control-floating" class="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-lg bg-black/85 backdrop-blur-md border-2 border-white/30 p-3 rounded-2xl flex flex-col gap-2 shadow-2xl transition-all">
    <div class="flex justify-between items-center text-[9px] font-retro">
      <span class="text-slate-300">THROW METER</span>
      <span id="floating-meter-val" class="text-yellow-300">0 / 20</span>
      <span id="floating-wind-val" class="text-cyan-300">WIND: 0 M/S</span>
    </div>

    <!-- Precision Meter -->
    <div id="meter-container" class="relative w-full h-8 bg-slate-900 border-2 border-white/20 rounded-lg overflow-hidden cursor-pointer">
      <div class="absolute inset-0 flex text-[8px] font-retro items-center opacity-30">
        <div class="w-[50%] bg-blue-500 h-full flex items-center justify-center">POOR</div>
        <div class="w-[30%] bg-emerald-500 h-full flex items-center justify-center">GOOD</div>
        <div class="w-[20%] bg-amber-400 h-full flex items-center justify-center text-white">MAX</div>
      </div>
      <div id="meter-needle" class="absolute top-0 bottom-0 w-3 bg-yellow-400 border border-white -translate-x-1/2 pointer-events-none" style="left: 0%;"></div>
    </div>

    <div class="flex items-center justify-between gap-2 pt-1">
      <!-- Food Select Dropdown / Mini-bar -->
      <div class="flex items-center gap-1.5 overflow-x-auto flex-1 pb-1" id="mini-food-selector"></div>
      
      <button id="btn-toggle-auto" class="retro-btn text-[8px] py-1 px-2 whitespace-nowrap">
        AUTO: OFF
      </button>
    </div>
  </div>

  <!-- FLYING DISTANCE HUD (WHEN PROJECTILE FLIES) -->
  <div id="throw-flight-hud" class="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-black/90 border-2 border-yellow-400 px-6 py-2 rounded-xl font-retro text-sm text-yellow-300 hidden">
    JARAK: <span id="flight-distance">0</span> STUDS
  </div>

  <!-- CATCH NOTIFICATION TOAST -->
  <div id="catch-toast" class="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 bg-black/95 border-3 border-yellow-400 p-3.5 rounded-2xl flex items-center gap-3 opacity-0 transition-opacity duration-200 pointer-events-none shadow-2xl">
    <div>
      <div id="catch-name" class="font-retro text-xs text-yellow-300">TERTANGKAP!</div>
      <div id="catch-sub" class="text-[10px] text-slate-200 mt-0.5">+50 CASH/S</div>
    </div>
  </div>

  <!-- MODAL: SHOP & NPC BOOTH (MUNCUL KETIKA INTERAKSI DENGAN NPC) -->
  <div id="modal-shop" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-black/95 border-3 border-amber-500 rounded-2xl max-w-xl w-full p-4 flex flex-col max-h-[85vh] shadow-2xl">
      <div class="flex justify-between items-center border-b border-white/20 pb-2.5">
        <div>
          <h2 class="font-retro text-xs text-yellow-300">🧙‍♂️ MASTER NPC STAND</h2>
          <p class="text-[10px] text-slate-400">Jual hewan tangkapan & upgrade kekuatan!</p>
        </div>
        <button id="btn-close-shop" class="retro-btn text-xs text-rose-400">&times;</button>
      </div>

      <div class="mt-3 overflow-y-auto space-y-3 flex-1 pr-1">
        <!-- Quick Sell All -->
        <div class="bg-slate-900 border border-white/20 p-3 rounded-xl flex justify-between items-center">
          <div>
            <div class="font-retro text-[10px] text-white">JUAL SEMUA HEWAN</div>
            <div class="text-[9px] text-slate-400">Jual semua isi kandang untuk koin instan</div>
          </div>
          <button id="btn-shop-sell-all" class="retro-btn retro-btn-orange text-[9px]">
            JUAL SEMUA
          </button>
        </div>

        <!-- Upgrade Pull-Up -->
        <div class="bg-slate-900 border border-white/20 p-3 rounded-xl flex justify-between items-center">
          <div>
            <div class="font-retro text-[10px] text-yellow-300">UPGRADE LEVEL PULL-UP <span id="shop-pullup-lv">Lv.1</span></div>
            <div class="text-[9px] text-emerald-400" id="shop-pullup-rate">+3 Power / detik</div>
          </div>
          <button id="btn-shop-upgrade-pullup" class="retro-btn retro-btn-green text-[9px]">
            $50
          </button>
        </div>

        <!-- Expand Base Slots -->
        <div class="bg-slate-900 border border-white/20 p-3 rounded-xl flex justify-between items-center">
          <div>
            <div class="font-retro text-[10px] text-cyan-300">PERLUAS KANDANG <span id="shop-slots-count">(4)</span></div>
            <div class="text-[9px] text-cyan-400">+2 Slot Hewan Baru</div>
          </div>
          <button id="btn-shop-upgrade-slots" class="retro-btn text-[9px]">
            $200
          </button>
        </div>

        <!-- Rebirth -->
        <div class="bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500 p-3 rounded-xl flex justify-between items-center">
          <div>
            <div class="font-retro text-[10px] text-purple-300">REBIRTH PRESTIGE <span id="shop-rebirth-count">(0x)</span></div>
            <div class="text-[9px] text-purple-200">+50% Permanen Power & CPS Multiplier!</div>
          </div>
          <button id="btn-shop-rebirth" class="retro-btn retro-btn-gold text-[9px]">
            $50K
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: ANIMAL PEN / PLOT (MUNCUL KETIKA INTERAKSI DI BASE KANDANG) -->
  <div id="modal-plot" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-black/95 border-3 border-emerald-500 rounded-2xl max-w-2xl w-full p-4 flex flex-col max-h-[85vh] shadow-2xl">
      <div class="flex justify-between items-center border-b border-white/20 pb-2.5">
        <div>
          <h2 class="font-retro text-xs text-emerald-300">🏡 KANDANG HEWAN (PLOT)</h2>
          <div id="plot-capacity-text" class="text-[10px] text-slate-400">Slot: 0 / 4 Terpakai</div>
        </div>
        <button id="btn-close-plot" class="retro-btn text-xs text-rose-400">&times;</button>
      </div>
      <div id="plot-animals-list" class="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto mt-3 flex-1 pr-1"></div>
    </div>
  </div>

  <!-- MODAL: QUESTS -->
  <div id="modal-quests" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-black/95 border-3 border-amber-500 rounded-2xl max-w-lg w-full p-4 flex flex-col max-h-[85vh] shadow-2xl">
      <div class="flex justify-between items-center border-b border-white/20 pb-2">
        <h2 class="font-retro text-xs text-yellow-300">📜 MISI HARIAN (QUESTS)</h2>
        <button id="btn-close-quests" class="retro-btn text-xs text-rose-400">&times;</button>
      </div>
      <div id="quests-list" class="overflow-y-auto mt-3 space-y-2 flex-1"></div>
    </div>
  </div>

  <!-- MODAL: BESTIARY INDEX (9 ZONES) -->
  <div id="modal-index" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-black/95 border-3 border-cyan-500 rounded-2xl max-w-2xl w-full p-4 flex flex-col max-h-[85vh] shadow-2xl">
      <div class="flex justify-between items-center border-b border-white/20 pb-2">
        <h2 class="font-retro text-xs text-cyan-300">📖 INDEKS 9 ZONA BIOMA</h2>
        <button id="btn-close-index" class="retro-btn text-xs text-rose-400">&times;</button>
      </div>
      <div id="index-list" class="overflow-y-auto mt-3 space-y-3 flex-1"></div>
    </div>
  </div>

  <!-- MODAL: RANKINGS -->
  <div id="modal-rank" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-black/95 border-3 border-rose-500 rounded-2xl max-w-md w-full p-4 flex flex-col shadow-2xl">
      <div class="flex justify-between items-center border-b border-white/20 pb-2">
        <h2 class="font-retro text-xs text-rose-300">🏆 PAPAN PERINGKAT GLOBAL</h2>
        <button id="btn-close-rank" class="retro-btn text-xs text-rose-400">&times;</button>
      </div>
      <div class="mt-3 space-y-2 font-retro text-[9px]">
        <div class="bg-slate-900 p-2 border border-white/20 flex justify-between">
          <span>MOST CATCHES:</span>
          <span id="lb-catches" class="text-yellow-300">0</span>
        </div>
        <div class="bg-slate-900 p-2 border border-white/20 flex justify-between">
          <span>TOTAL CASH:</span>
          <span id="lb-money" class="text-emerald-400">$0</span>
        </div>
        <div class="bg-slate-900 p-2 border border-white/20" id="lb-luck">
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

// Custom Events from in-world keys
window.addEventListener('roblox:throw', () => triggerThrow());
window.addEventListener('roblox:pullup', () => togglePullUp());
window.addEventListener('roblox:shop', () => openModal('shop'));
window.addEventListener('roblox:plot', () => openModal('plot'));

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
  document.querySelector('#shop-pullup-rate').textContent = `+${formatNum(state.getPullUpRate())} Power/detik`;
  document.querySelector('#btn-shop-upgrade-pullup').textContent = `$${formatNum(state.pullUpCost)}`;

  document.querySelector('#shop-slots-count').textContent = `(${state.maxBaseSlots})`;
  document.querySelector('#btn-shop-upgrade-slots').textContent = `$${formatNum(state.baseSlotCost)}`;

  document.querySelector('#shop-rebirth-count').textContent = `(${state.rebirthCount}x)`;
  document.querySelector('#btn-shop-rebirth').textContent = `$${formatNum(state.rebirthCost)}`;

  document.querySelector('#plot-capacity-text').textContent = `Slot: ${state.inventory.length} / ${state.maxBaseSlots} Terpakai`;

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
    btn.className = `px-2 py-1 text-[8px] font-retro rounded border transition whitespace-nowrap cursor-pointer ${
      isSelected
        ? 'bg-yellow-400 text-black border-yellow-300 font-black scale-105'
        : isUnlocked
        ? 'bg-black/60 text-slate-200 border-white/30 hover:border-white'
        : 'bg-black/30 text-slate-500 border-white/10 opacity-50'
    }`;
    btn.innerHTML = `${f.iconText} <span class="text-emerald-400">${isUnlocked ? '✓' : '$' + formatNum(f.cost)}</span>`;

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
          alert('Uang tidak cukup untuk membuka umpan ini!');
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
    container.innerHTML = `<div class="col-span-3 text-center text-slate-500 text-[10px] py-10 font-retro">KANDANG KOSONG</div>`;
    return;
  }

  state.inventory.forEach((item, idx) => {
    const mut = MUTATION_DATA[item.mutation] || MUTATION_DATA.Normal;
    const isEquipped = state.equippedPets.includes(item.uid);
    const cps = Math.floor(item.baseCps * mut.multiplier);
    const sellPrice = Math.max(10, Math.floor(cps * 25));

    const card = document.createElement('div');
    card.className = 'bg-slate-900 border-2 border-white/20 p-2 rounded-xl flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start font-retro text-[8px]">
          <span class="text-yellow-300">${item.name}</span>
          <span style="color:${RARITY_COLORS[item.rarity]}">${item.rarity}</span>
        </div>
        <div class="text-[9px] font-pixel mt-0.5" style="color:${mut.color}">[${mut.name}]</div>
        <div class="font-retro text-[8px] text-emerald-400 mt-1">+${formatNum(cps)}/s</div>
      </div>
      <div class="flex gap-1 mt-2">
        <button class="retro-btn flex-1 text-[7px] py-1 px-1 ${isEquipped ? 'retro-btn-gold' : ''}" data-equip="${item.uid}">
          ${isEquipped ? 'PAKAI' : 'PASANG'}
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
  const name = document.querySelector('#catch-name');
  const sub = document.querySelector('#catch-sub');

  name.textContent = `TERTANGKAP: ${animal.name.toUpperCase()}`;
  if (sellPrice) sub.textContent = `KANDANG PENUH! AUTO-SOLD: +$${formatNum(sellPrice)}`;
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

// Tick loop for distance, wind & zone info
setInterval(() => {
  if (world.isThrowing) {
    document.querySelector('#flight-distance').textContent = world.currentDistance;
    document.querySelector('#hud-zone-name').textContent = `ZONE: ${world.targetZone.name.toUpperCase()} (${world.targetZone.minDist}-${world.targetZone.maxDist}m)`;
    document.querySelector('#hud-zone-gimmick').textContent = world.targetZone.gimmick;
  }

  const windDir = world.windDirection > 0 ? 'DORONG (TAIL)' : 'LAWAN (HEAD)';
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
  alert(`Berhasil menjual ${res.count} hewan ke Master Game seharga +$${formatNum(res.totalSellPrice)}!`);
  updateUI();
};

document.querySelector('#btn-shop-upgrade-pullup').onclick = () => {
  if (state.upgradePullUp()) { sfx.playLevelUp(); updateUI(); }
  else alert('Uang tidak cukup!');
};

document.querySelector('#btn-shop-upgrade-slots').onclick = () => {
  if (state.upgradeBaseSlot()) { sfx.playLevelUp(); updateUI(); }
  else alert('Uang tidak cukup!');
};

document.querySelector('#btn-shop-rebirth').onclick = () => {
  if (state.canRebirth()) {
    if (confirm('REBIRTH SEKARANG? Uang & Power di-reset, tapi kamu dapat bonus +50% PERMANEN!')) {
      state.doRebirth();
      sfx.playLevelUp();
      updateUI();
    }
  } else {
    alert(`Butuh $${formatNum(state.rebirthCost)} untuk Rebirth!`);
  }
};

function renderQuestsModal() {
  const list = document.querySelector('#quests-list');
  list.innerHTML = '';
  state.quests.forEach(q => {
    const card = document.createElement('div');
    card.className = `p-2.5 rounded-xl border border-white/20 bg-slate-900 flex justify-between items-center ${q.claimed ? 'opacity-40' : ''}`;
    const pct = Math.min(100, Math.round((q.current / q.target) * 100));
    card.innerHTML = `
      <div>
        <div class="font-retro text-[9px] text-yellow-300">${q.title}</div>
        <div class="text-[9px] text-slate-300">${q.desc}</div>
        <div class="font-retro text-[8px] text-emerald-400 mt-1">${formatNum(q.current)}/${formatNum(q.target)} (${pct}%)</div>
      </div>
      <div>
        ${q.claimed ? '<span class="text-[8px] text-slate-500">SELESAI</span>' : q.completed ? `<button class="retro-btn retro-btn-gold text-[8px]" data-claim="${q.id}">KLAIM</button>` : `<span class="text-[8px] text-emerald-400">+$${formatNum(q.rewardCash)}</span>`}
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
    box.className = 'bg-slate-900 border border-white/20 p-2.5 rounded-xl';
    let anHtml = '';
    z.animals.forEach(an => {
      const disc = (state.indexProgress[an.id] || []).length > 0;
      anHtml += `
        <div class="bg-black/60 p-1.5 rounded border border-white/10 flex justify-between font-retro text-[8px] ${disc ? '' : 'opacity-30'}">
          <span>${disc ? an.name : '???'}</span>
          <span style="color:${RARITY_COLORS[an.rarity]}">${an.rarity}</span>
        </div>
      `;
    });
    box.innerHTML = `
      <div class="flex justify-between items-center font-retro text-[9px] text-yellow-300 mb-1.5">
        <span>${z.name}</span>
        <span class="text-[8px] text-slate-400">${z.minDist}-${z.maxDist}m</span>
      </div>
      <div class="text-[9px] text-cyan-300 mb-2 italic">${z.gimmick}</div>
      <div class="grid grid-cols-2 gap-1.5">${anHtml}</div>
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
