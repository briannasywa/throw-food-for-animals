// ui-kit.css dulu, lalu style.css (penyesuaian prototype & HP) supaya override-nya menang
import './ui-kit.css';
import './style.css';
import confetti from 'canvas-confetti';
import { GameState, formatNum } from './gameState.js';
import { FOOD_TIERS, ZONES, MUTATION_DATA } from './gameData.js';
import { RobloxSeamlessWorld } from './robloxSeamlessWorld.js';
import { sfx } from './audio.js';
import { getAnimalThumb } from './animalThumbs.js';
import { web3Manager } from './web3Manager.js';

const state = new GameState();

// ---------- helper tampilan (Chunky Voxel, ui-spec v2) ----------
const RARITY_ORDER = ['Mythic', 'Legendary', 'Epic', 'Rare', 'Common'];
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
const meters = (n) => `${Math.floor(n).toLocaleString('en-US')} m`;
const zoneRange = (z) => `${z.minDist.toLocaleString('en-US')}–${z.maxDist.toLocaleString('en-US')} m`;
const rarityTag = (r) => `<span class="zt-tag zt-tag--${r.toLowerCase()}">${r}</span>`;
const mutTag = (m) => (m && m !== 'Normal' ? `<span class="zt-mut zt-mut--${m.toLowerCase()}">${m}</span>` : '');
const sellPriceOf = (item) => Math.max(10, Math.floor(item.baseCps * (MUTATION_DATA[item.mutation]?.multiplier || 1) * 25));
const incomeOf = (item) => Math.floor(item.baseCps * (MUTATION_DATA[item.mutation]?.multiplier || 1));
const zoneOfDistance = (d) => { for (let i = ZONES.length - 1; i >= 0; i--) if (d >= ZONES[i].minDist) return ZONES[i]; return ZONES[0]; };
const zoneOfAnimal = (id) => ZONES.find(z => z.animals.some(a => a.id === id));

const SPEAKER_ON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B2233" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#1B2233"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>`;
const SPEAKER_OFF = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B2233" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#1B2233"/><path d="M17 9l5 6M22 9l-5 6"/></svg>`;

const modal = (id, title, body, sub = '') => `
  <div id="modal-${id}" class="zt-modal-shade hidden">
    <div class="zt-panel zt-modal">
      <div class="zt-modal__head zt-title zt-outline">${title}</div>
      <button id="btn-close-${id}" class="zt-btn zt-btn--danger zt-btn--icon zt-modal__close" aria-label="Close">✕</button>
      ${sub}
      <div class="zt-modal__body">${body}</div>
    </div>
  </div>`;

// FULL SCREEN IMMERSIVE MAP LAYOUT
const app = document.querySelector('#app');
app.innerHTML = `
<div class="zt-root relative w-screen h-screen overflow-hidden bg-[#7CCBFF] select-none">

  <!-- 3D FULLSCREEN CANVAS CONTAINER -->
  <div id="full-map-viewport" class="absolute inset-0 w-full h-full z-0"></div>

  <!-- H1 stat bar · H2 zone chip · H5 stamina (kiri atas) -->
  <div class="absolute top-3 left-3 z-20 flex flex-col items-start gap-2.5 pointer-events-none">
    <div class="zt-panel zt-stats pointer-events-auto">
      <div class="zt-stat"><div class="zt-stat__label">Cash</div><div id="hud-money" class="zt-stat__value">$0</div></div>
      <div class="zt-stat"><div class="zt-stat__label">Power</div><div id="hud-power" class="zt-stat__value" style="color:var(--zt-primary-d)">10</div></div>
      <div class="zt-stat"><div class="zt-stat__label">Income</div><div id="hud-cps" class="zt-stat__value" style="color:var(--zt-good-d)">+$0/s</div></div>
      <div class="zt-stat"><div class="zt-stat__label">Rebirth</div><div id="hud-rebirth" class="zt-stat__value" style="color:var(--zt-accent-d)">0x</div></div>
    </div>
    <div class="zt-panel zt-zonechip pointer-events-auto">
      <span id="hud-zone-swatch" class="zt-swatch" style="background:${hex(ZONES[0].stripes[0])}"></span>
      <div>
        <div id="hud-zone-name" class="zt-title zt-zone-name">${ZONES[0].name.toUpperCase()} · ${zoneRange(ZONES[0])}</div>
        <div id="hud-zone-gimmick" class="zt-zone-gimmick">${ZONES[0].gimmick}</div>
      </div>
    </div>
    <div id="hud-stamina" class="zt-stamina is-faded"><i></i></div>
  </div>

  <!-- H3 zone banner -->
  <div id="zone-banner" class="zt-banner hidden">
    <div id="zone-banner-title" class="zt-title zt-outline zt-banner__title">ENTERING JUNGLE</div>
    <div id="zone-banner-sub" class="zt-banner__sub"></div>
  </div>

  <!-- H4 menu (kanan atas) -->
  <div class="zt-menu absolute top-3 right-3 z-20 flex items-center gap-2">
    <button id="btn-connect-wallet" class="zt-btn zt-btn--plain zt-btn--sm"><span id="wallet-btn-text">Connect Wallet</span></button>
    <button id="btn-open-quests" class="zt-btn zt-btn--primary">Quests</button>
    <button id="btn-open-index" class="zt-btn zt-btn--accent">Index</button>
    <button id="btn-open-rank" class="zt-btn zt-btn--good">Rank</button>
    <button id="btn-toggle-sound" class="zt-btn zt-btn--plain zt-btn--icon" aria-label="Sound">${SPEAKER_ON}</button>
  </div>

  <!-- Prompt stasiun (bawah tengah) -->
  <div id="context-action-bar" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 hidden">
    <div class="zt-panel zt-prompt">
      <span id="context-key" class="zt-key">SPACE</span>
      <div class="zt-prompt__text">
        <div id="context-action" class="zt-title zt-prompt__title">THROW FOOD</div>
        <div id="context-desc" class="zt-prompt__desc">Press Space or tap to throw</div>
      </div>
      <button id="btn-context-trigger" class="zt-btn zt-btn--primary">Go</button>
    </div>
  </div>

  <!-- Panel lempar -->
  <div id="throw-control-floating" class="zt-panel zt-throw absolute left-1/2 -translate-x-1/2 z-20">
    <div class="zt-throw__head">
      <span class="zt-title zt-throw__title">Throw</span>
      <span id="floating-wind-val" class="zt-wind is-tail">WIND 0 m/s</span>
      <span class="zt-throw__count"><small>TIMING</small><span id="floating-meter-val">0 / 20</span></span>
    </div>
    <div class="relative">
      <div id="meter-container" class="zt-meter">
        <div id="meter-needle" class="zt-meter__marker" style="left: 0%;"></div>
      </div>
      <div id="meter-result-slot"></div>
    </div>
    <div class="zt-meter__labels"><span>POOR</span><span>GOOD</span><span>MAX</span></div>
    <div class="zt-throw__foot">
      <div id="mini-food-selector" class="zt-food-row"></div>
      <div class="zt-throw__actions">
        <button id="btn-toggle-auto" class="zt-btn zt-btn--plain zt-btn--sm">AUTO: OFF</button>
        <button id="btn-throw" class="zt-btn zt-btn--primary">Throw</button>
      </div>
    </div>
  </div>

  <!-- F1 jarak selama lemparan -->
  <div id="throw-flight-hud" class="zt-flight absolute top-24 left-1/2 -translate-x-1/2 z-30 hidden">
    <div class="zt-title zt-outline zt-flight__dist"><span id="flight-distance">0</span> m</div>
    <div class="zt-panel zt-zonechip">
      <span id="flight-zone-swatch" class="zt-swatch"></span>
      <span id="flight-zone-name" class="zt-title zt-zone-name">LOBBY</span>
    </div>
  </div>

  <!-- F2 kartu tangkapan -->
  <div id="catch-toast" class="zt-panel zt-toast zt-catch">
    <img id="catch-img" class="zt-catch__img" alt="">
    <div class="min-w-0">
      <div class="zt-title zt-catch__head">Caught! <span id="catch-new" class="zt-new hidden">NEW!</span></div>
      <div id="catch-name" class="zt-title zt-catch__name">Rabbit</div>
      <div id="catch-tags" class="zt-tags"></div>
      <div id="catch-sub" class="zt-card__income" style="margin-top:4px">+$3/s</div>
      <div id="catch-sold" class="zt-catch__sold hidden"></div>
    </div>
  </div>

  ${modal('shop', 'Shop', `
    <div class="zt-web3">
      <div class="zt-web3__head">
        <span class="zt-title zt-web3__title">USDC Shop</span>
        <span class="zt-tag zt-tag--rare">Base Sepolia · testnet</span>
      </div>
      <div id="shop-wallet-status" class="zt-row__desc">Wallet not connected</div>
      <div class="zt-row">
        <div class="zt-row__main">
          <div class="zt-title zt-row__title">+100 Power</div>
          <div class="zt-row__desc">Permanent +100 throwing Power</div>
        </div>
        <button id="btn-buy-web3-power" class="zt-btn zt-btn--primary">0.10 USDC</button>
      </div>
      <div class="zt-row">
        <div class="zt-row__main">
          <div class="zt-title zt-row__title">Legendary Bait ×5 <span id="legendary-baits-owned" class="zt-muted">(own 0)</span></div>
          <div class="zt-row__desc">Your next 5 throws catch a Legendary animal</div>
        </div>
        <button id="btn-buy-web3-bait" class="zt-btn zt-btn--accent">0.50 USDC</button>
      </div>
    </div>
    <div class="zt-row">
      <div class="zt-row__main">
        <div class="zt-title zt-row__title">Upgrade Pull-Up <span id="shop-pullup-lv" class="zt-muted">Lv.1</span></div>
        <div id="shop-pullup-rate" class="zt-row__desc">+3 Power / sec</div>
      </div>
      <button id="btn-shop-upgrade-pullup" class="zt-btn zt-btn--good">$50</button>
    </div>
    <div class="zt-row">
      <div class="zt-row__main">
        <div class="zt-title zt-row__title">Expand Pen <span id="shop-slots-count" class="zt-muted">(4 slots)</span></div>
        <div class="zt-row__desc">+2 animal slots</div>
      </div>
      <button id="btn-shop-upgrade-slots" class="zt-btn zt-btn--good">$200</button>
    </div>
    <div class="zt-row">
      <div class="zt-row__main">
        <div class="zt-title zt-row__title">Sell All Animals</div>
        <div class="zt-row__desc">Sell every animal in your pen for instant cash</div>
      </div>
      <button id="btn-shop-sell-all" class="zt-btn zt-btn--danger">Sell All</button>
    </div>
    <div class="zt-row">
      <div class="zt-row__main">
        <div class="zt-title zt-row__title">Rebirth <span id="shop-rebirth-count" class="zt-muted">0x</span></div>
        <div class="zt-row__desc">Reset cash and Power for a permanent +50% income &amp; Power boost</div>
      </div>
      <button id="btn-shop-rebirth" class="zt-btn zt-btn--accent">$50K</button>
    </div>
  `)}

  ${modal('plot', 'My Pen', `<div id="plot-animals-list" class="zt-grid"></div>`,
    `<div id="plot-capacity-text" class="zt-modal__sub">0 / 4 SLOTS</div>`)}

  ${modal('quests', 'Quests', `<div id="quests-list" class="flex flex-col gap-2.5"></div>`)}

  ${modal('index', 'Index', `
    <div id="index-tabs" class="zt-tabs"></div>
    <div id="index-list" class="flex flex-col gap-3"></div>
  `, `<div id="index-total" class="zt-modal__sub">0 / 36</div>`)}

  ${modal('rank', 'Records', `
    <div class="zt-stat-cards">
      <div class="zt-row zt-stat-card"><div class="zt-stat-card__label">Most Catches</div><div id="lb-catches" class="zt-stat-card__value">0</div></div>
      <div class="zt-row zt-stat-card"><div class="zt-stat-card__label">Total Cash</div><div id="lb-money" class="zt-stat-card__value" style="color:var(--zt-good-d)">$0</div></div>
      <div class="zt-row zt-stat-card" id="lb-luck"><div class="zt-stat-card__label">Luckiest Catch</div><div class="zt-stat-card__value">—</div></div>
    </div>
  `, `<div class="zt-modal__sub">Your best runs on this device</div>`)}

  <!-- R1–R3 popup konfirmasi -->
  <div id="modal-confirm" class="zt-modal-shade hidden" style="z-index:70">
    <div class="zt-panel zt-modal zt-confirm">
      <div id="confirm-title" class="zt-modal__head zt-title zt-outline">Sure?</div>
      <div id="confirm-body" class="zt-confirm__text"></div>
      <div class="zt-confirm__actions">
        <button id="confirm-cancel" class="zt-btn zt-btn--plain">Cancel</button>
        <button id="confirm-ok" class="zt-btn zt-btn--danger">OK</button>
      </div>
    </div>
  </div>

  <div id="zt-notice" class="zt-panel zt-notice hidden"></div>
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

// Prompt stasiun: seluruh panel bisa di-tap (di HP keycap disembunyikan)
document.querySelector('#context-action-bar').onclick = () => {
  if (world.currentStation?.id === 'throw') triggerThrow();
  else if (world.currentStation?.id === 'gym') togglePullUp();
  else if (world.currentStation?.id === 'shop') openModal('shop');
  else if (world.currentStation?.id === 'plot') openModal('plot');
};

// ---------- notifikasi & konfirmasi ----------
let noticeTimer = null;
function showNotice(text) {
  const n = document.querySelector('#zt-notice');
  n.textContent = text;
  n.classList.remove('hidden');
  n.style.animation = 'none'; void n.offsetWidth; n.style.animation = '';
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => n.classList.add('hidden'), 1800);
}

function confirmDialog({ title, html, okLabel, okClass = 'zt-btn--danger' }) {
  return new Promise((resolve) => {
    const m = document.querySelector('#modal-confirm');
    document.querySelector('#confirm-title').textContent = title;
    document.querySelector('#confirm-body').innerHTML = html;
    const ok = document.querySelector('#confirm-ok');
    ok.className = `zt-btn ${okClass}`;
    ok.textContent = okLabel;
    m.classList.remove('hidden');
    const done = (v) => { m.classList.add('hidden'); confirmResolve = null; resolve(v); };
    confirmResolve = done;
    ok.onclick = () => done(true);
    document.querySelector('#confirm-cancel').onclick = () => done(false);
  });
}
let confirmResolve = null;

// Prompt stasiun selalu di atas panel lempar (penting di HP, panel lempar ada di paling bawah)
const throwPanel = document.querySelector('#throw-control-floating');
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--zt-throw-h', `${throwPanel.offsetHeight}px`);
}).observe(throwPanel);

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

// Angka membesar sebentar saat berubah
function setStat(sel, text) {
  const el = document.querySelector(sel);
  if (el.textContent === text) return;
  el.textContent = text;
  el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump');
}

// Titik merah: QUESTS (hadiah siap diklaim), INDEX (hewan baru belum dilihat)
let indexHasNew = false;
function updateDots() {
  document.querySelector('#btn-open-quests').classList.toggle('zt-dot', state.quests.some(q => q.completed && !q.claimed));
  document.querySelector('#btn-open-index').classList.toggle('zt-dot', indexHasNew);
}

// Update UI
function updateUI() {
  setStat('#hud-money', `$${formatNum(state.money)}`);
  setStat('#hud-power', formatNum(state.power));
  setStat('#hud-cps', `+$${formatNum(state.getCurrentCps())}/s`);
  setStat('#hud-rebirth', `${state.rebirthCount}x`);

  // Shop values
  document.querySelector('#shop-pullup-lv').textContent = `Lv.${state.pullUpLevel}`;
  document.querySelector('#shop-pullup-rate').textContent = `+${formatNum(state.getPullUpRate())} Power / sec`;
  document.querySelector('#btn-shop-upgrade-pullup').textContent = `$${formatNum(state.pullUpCost)}`;

  document.querySelector('#shop-slots-count').textContent = `(${state.maxBaseSlots} slots)`;
  document.querySelector('#btn-shop-upgrade-slots').textContent = `$${formatNum(state.baseSlotCost)}`;

  document.querySelector('#shop-rebirth-count').textContent = `${state.rebirthCount}x`;
  document.querySelector('#btn-shop-rebirth').textContent = `$${formatNum(state.rebirthCost)}`;

  document.querySelector('#legendary-baits-owned').textContent = `(own ${state.legendaryBaits || 0})`;

  document.querySelector('#plot-capacity-text').textContent =
    `${state.inventory.length} / ${state.maxBaseSlots} SLOTS · ${state.equippedPets.length} / 2 PETS EQUIPPED`;

  // Sync 3D in-world plot
  world.updatePlotAnimals(state.inventory);
  world.updateEquippedPets(state.inventory, state.equippedPets);

  renderMiniFoodSelector();
  renderPlotAnimals();
  updateDots();
}

function renderMiniFoodSelector() {
  const container = document.querySelector('#mini-food-selector');
  container.innerHTML = '';

  // Umpan Legendary (web3). Kalau stok habis, chip membuka Shop.
  const legCount = state.legendaryBaits || 0;
  const legBtn = document.createElement('button');
  legBtn.className = `zt-chip zt-chip--legend ${state.selectedFoodIndex === 'web3_legendary' ? 'is-active' : ''} ${legCount ? '' : 'is-locked'}`;
  legBtn.innerHTML = `<span class="zt-chip__swatch" style="background:${LEGENDARY_BAIT.color}"></span>LEGENDARY
    <span class="zt-chip__price">×${legCount}</span>`;
  legBtn.onclick = () => {
    sfx.playPop();
    if (legCount > 0) {
      state.selectedFoodIndex = 'web3_legendary';
      state.save();
      updateUI();
    } else {
      openModal('shop');
    }
  };
  container.appendChild(legBtn);

  FOOD_TIERS.forEach((f, idx) => {
    const isUnlocked = state.unlockedFoods.includes(idx);
    const isSelected = state.selectedFoodIndex === idx;
    const canAfford = state.money >= f.cost;

    const btn = document.createElement('button');
    btn.className = `zt-chip ${isSelected ? 'is-active' : ''} ${!isUnlocked && !canAfford ? 'is-locked' : ''}`;
    btn.innerHTML = `<span class="zt-chip__swatch" style="background:${f.color}"></span>${f.iconText}
      ${isUnlocked
        ? `<span class="zt-chip__check">${isSelected ? '✓' : ''}</span>`
        : `<span class="zt-chip__price ${canAfford ? '' : 'is-short'}">$${formatNum(f.cost)}</span>`}`;

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
          showNotice('NOT ENOUGH CASH!');
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
    container.innerHTML = `<div class="zt-empty">YOUR PEN IS EMPTY · GO THROW SOME FOOD!</div>`;
    return;
  }

  // Urutan tampilan: Mythic → Common, lalu penghasilan tertinggi (data inventory tidak diubah)
  const rows = state.inventory.map((item, idx) => ({ item, idx }));
  rows.sort((a, b) => (RARITY_ORDER.indexOf(a.item.rarity) - RARITY_ORDER.indexOf(b.item.rarity)) || (incomeOf(b.item) - incomeOf(a.item)));

  rows.forEach(({ item }) => {
    const isEquipped = state.equippedPets.includes(item.uid);
    const card = document.createElement('div');
    card.className = `zt-card zt-card--${item.rarity.toLowerCase()}`;
    card.innerHTML = `
      <img class="zt-card__img" src="${getAnimalThumb(item.id)}" alt="">
      <div class="zt-card__name">${item.name}</div>
      <div class="zt-tags" style="justify-content:center">${rarityTag(item.rarity)}${mutTag(item.mutation)}</div>
      <div class="zt-card__income">+$${formatNum(incomeOf(item))}/s</div>
      <div class="zt-card__actions">
        <button class="zt-btn zt-btn--sm ${isEquipped ? 'zt-btn--plain' : 'zt-btn--good'}" data-equip>${isEquipped ? '✓ Equipped' : 'Equip'}</button>
        <button class="zt-btn zt-btn--sm zt-btn--danger" data-sell>Sell $${formatNum(sellPriceOf(item))}</button>
      </div>
    `;

    card.querySelector('[data-equip]').onclick = () => {
      sfx.playPop();
      const res = state.toggleEquipPet(item.uid);
      if (res?.error) showNotice('MAX 2 PETS EQUIPPED!');
      updateUI();
    };

    card.querySelector('[data-sell]').onclick = async () => {
      const big = RARITY_ORDER.indexOf(item.rarity) <= 2 || item.mutation !== 'Normal';
      const ok = await confirmDialog({
        title: 'Sell Animal?',
        html: `<img src="${getAnimalThumb(item.id)}" alt="" style="width:96px;height:96px;margin:0 auto">
          <div class="zt-title" style="font-size:18px">${item.name}</div>
          <div class="zt-tags" style="justify-content:center;margin:4px 0 8px">${rarityTag(item.rarity)}${mutTag(item.mutation)}</div>
          ${big ? `<div class="zt-confirm__warn">THIS IS A RARE ANIMAL!</div>` : ''}
          <div class="zt-title" style="font-size:20px;color:var(--zt-good-d)">YOU GET $${formatNum(sellPriceOf(item))}</div>`,
        okLabel: 'Sell',
      });
      if (!ok) return;
      const idx = state.inventory.findIndex(x => x.uid === item.uid);
      if (idx < 0) return;
      sfx.playCoins();
      state.sellAnimal(idx);
      updateUI();
    };

    container.appendChild(card);
  });
}

let toastTimer = null;
function showCatchToast(animal, { sellPrice = null, isNew = false } = {}) {
  const toast = document.querySelector('#catch-toast');
  toast.style.borderColor = `var(--zt-${animal.rarity.toLowerCase()})`;
  document.querySelector('#catch-img').src = getAnimalThumb(animal.id);
  document.querySelector('#catch-name').textContent = animal.name;
  document.querySelector('#catch-tags').innerHTML = rarityTag(animal.rarity) + mutTag(animal.mutation);
  document.querySelector('#catch-sub').textContent = `+$${formatNum(incomeOf(animal))}/s`;
  document.querySelector('#catch-new').classList.toggle('hidden', !isNew);
  const sold = document.querySelector('#catch-sold');
  sold.classList.toggle('hidden', !sellPrice);
  if (sellPrice) sold.textContent = `PEN FULL! AUTO-SOLD +$${formatNum(sellPrice)}`;

  toast.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-show'), 3000);

  // Epic ke atas: confetti warna palet
  if (['Epic', 'Legendary', 'Mythic'].includes(animal.rarity) || animal.mutation === 'Rainbow') {
    confetti({ particleCount: animal.rarity === 'Epic' ? 60 : 120, spread: 70, origin: { x: 0.85, y: 0.4 },
      colors: ['#FF7A1A', '#3CCB5A', '#FF3D7F', '#FFC21A', '#2F8CFF', '#A24BFF', '#19E6C1'] });
  }
}

let bannerTimer = null;
function showZoneBanner(zone) {
  const b = document.querySelector('#zone-banner');
  b.style.background = hex(zone.accent);
  document.querySelector('#zone-banner-title').textContent = `Entering ${zone.name}`;
  document.querySelector('#zone-banner-sub').textContent = zone.gimmick;
  b.classList.remove('hidden');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.add('hidden'), 2000);
}

function showMeterResult(score) {
  // Label hasil (tampilan saja): MAX = 90–100%, GOOD = 55–90%, POOR = di bawahnya
  const pct = score / 20;
  const [label, color] = pct >= 0.9 ? ['MAX!', 'var(--zt-good)'] : pct >= 0.55 ? ['GOOD!', 'var(--zt-legendary)'] : ['POOR', 'var(--zt-danger)'];
  const slot = document.querySelector('#meter-result-slot');
  slot.innerHTML = `<div class="zt-title zt-meter-result" style="color:${color};text-shadow:2px 2px 0 #1B2233,-2px 2px 0 #1B2233,2px -2px 0 #1B2233,-2px -2px 0 #1B2233">${label}</div>`;
  const m = document.querySelector('#meter-container');
  m.classList.remove('is-flash'); void m.offsetWidth; m.classList.add('is-flash');
}

// Umpan Legendary dari toko web3 (logika dari tim: dijamin hewan Legendary/Mythic di zona tujuan)
const LEGENDARY_BAIT = {
  id: 'web3_legendary', name: 'Legendary Bait', iconText: 'LEGENDARY', color: '#FFC21A',
  luckBonus: 50.0, isLegendaryBait: true, desc: 'Guaranteed Legendary catch!'
};

function triggerThrow() {
  if (world.isThrowing) return;

  let food;
  if (state.selectedFoodIndex === 'web3_legendary') {
    if ((state.legendaryBaits || 0) <= 0) {
      showNotice('NO LEGENDARY BAIT LEFT!');
      state.selectedFoodIndex = 0;
      updateUI();
      return;
    }
    state.legendaryBaits -= 1;
    state.save();
    food = LEGENDARY_BAIT;
  } else {
    food = FOOD_TIERS[state.selectedFoodIndex] || FOOD_TIERS[0];
  }
  const score = Math.floor(meterVal);

  sfx.playThrow(score);
  showMeterResult(score);
  const hud = document.querySelector('#throw-flight-hud');
  hud.classList.remove('hidden');

  // Rumus jarak versi tim (main ba5b48a)
  const baseDist = (state.power * 10) * (0.5 + (score / 20) * 1.5);
  const windEffect = 1 + (world.windSpeed * 0.03 * world.windDirection);
  const distance = Math.max(15, Math.floor(baseDist * windEffect));
  const targetZone = zoneOfDistance(distance);

  world.throwFood(distance, targetZone, food, (caughtAnimal, dist) => {
    hud.classList.add('hidden');
    sfx.playCatch(caughtAnimal.rarity, caughtAnimal.mutation);

    // Info untuk tampilan (dibaca sebelum state berubah)
    const isNew = !(state.indexProgress[caughtAnimal.id] || []).length;
    const zone = zoneOfAnimal(caughtAnimal.id);
    const zoneFirstTime = zone && zone.id !== 'lobby' && !zone.animals.some(a => (state.indexProgress[a.id] || []).length);

    state.checkQuest('catch', 1);
    state.checkQuest('distance', dist);
    state.checkQuest('mutation', caughtAnimal.mutation);

    const res = state.addAnimal(caughtAnimal);
    if (isNew) indexHasNew = true;
    if (zoneFirstTime) showZoneBanner(zone);
    showCatchToast(caughtAnimal, { sellPrice: res.autoSold ? res.sellPrice : null, isNew });
    updateUI();
  });
}

function togglePullUp() {
  sfx.playPop();
  state.isTraining = !state.isTraining;
  world.setTrainingMode(state.isTraining);
  updateUI();
}

// Tick loop for distance, wind, zone info & stamina
let lastWindKey = '';
let staminaFullSince = 0;
setInterval(() => {
  if (world.isThrowing) {
    document.querySelector('#flight-distance').textContent = Math.floor(world.currentDistance).toLocaleString('en-US');
    const fz = zoneOfDistance(world.currentDistance);
    document.querySelector("#flight-zone-name").textContent = fz.name.toUpperCase();
    document.querySelector('#flight-zone-swatch').style.background = hex(fz.stripes[0]);

    const z = world.targetZone;
    document.querySelector("#hud-zone-name").textContent = `${z.name.toUpperCase()} · ${zoneRange(z)}`;
    document.querySelector('#hud-zone-gimmick').textContent = z.gimmick;
    document.querySelector('#hud-zone-swatch').style.background = hex(z.stripes[0]);
  }

  // T2 angin: TAILWIND (dari belakang, hijau) / HEADWIND (dari depan, merah)
  const tail = world.windDirection > 0;
  const windKey = `${world.windSpeed}|${tail}`;
  if (windKey !== lastWindKey) {
    const w = document.querySelector('#floating-wind-val');
    w.className = `zt-wind ${tail ? 'is-tail' : 'is-head'} ${lastWindKey ? 'is-flash' : ''}`;
    w.innerHTML = `<span class="zt-wind__arrow" style="transform:rotate(${tail ? 0 : 180}deg)">➜</span>WIND ${world.windSpeed} m/s · ${tail ? 'TAILWIND' : 'HEADWIND'}`;
    lastWindKey = windKey;
  }

  // H5 stamina: tampil saat berkurang, hilang perlahan 2 dtk setelah penuh
  const st = document.querySelector('#hud-stamina');
  const pct = world.stamina / world.maxStamina;
  st.firstElementChild.style.width = `${pct * 100}%`;
  st.classList.toggle('is-low', pct < 0.3);
  if (pct < 1) { staminaFullSince = 0; st.classList.remove('is-faded'); }
  else {
    if (!staminaFullSince) staminaFullSince = performance.now();
    if (performance.now() - staminaFullSince > 2000) st.classList.add('is-faded');
  }
}, 50);

// Buttons & Actions
document.querySelector('#meter-container').onclick = () => triggerThrow();
document.querySelector('#btn-throw').onclick = () => triggerThrow();

function renderAutoBtn() {
  const b = document.querySelector('#btn-toggle-auto');
  b.textContent = state.autoThrow ? 'AUTO: ON' : 'AUTO: OFF';
  b.className = `zt-btn zt-btn--sm ${state.autoThrow ? 'zt-btn--good' : 'zt-btn--plain'}`;
}
document.querySelector('#btn-toggle-auto').onclick = () => {
  sfx.playPop();
  state.autoThrow = !state.autoThrow;
  state.save();
  renderAutoBtn();
};
renderAutoBtn();

// Modal helpers — hanya satu panel terbuka; tutup dengan X atau Esc
const MODALS = ['shop', 'plot', 'quests', 'index', 'rank'];
function openModal(id) {
  sfx.playPop();
  MODALS.forEach(other => other !== id && closeModal(other));
  const m = document.querySelector(`#modal-${id}`);
  if (m) m.classList.remove('hidden');
}

function closeModal(id) {
  const m = document.querySelector(`#modal-${id}`);
  if (m) m.classList.add('hidden');
}

MODALS.forEach(id => {
  const btnClose = document.querySelector(`#btn-close-${id}`);
  if (btnClose) btnClose.onclick = () => closeModal(id);
  // klik di latar gelap juga menutup
  document.querySelector(`#modal-${id}`).addEventListener('click', (e) => { if (e.target.id === `modal-${id}`) closeModal(id); });
});
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (confirmResolve) { confirmResolve(false); return; }
  MODALS.forEach(closeModal);
});

document.querySelector('#btn-open-quests').onclick = () => { renderQuestsModal(); openModal('quests'); };
document.querySelector('#btn-open-index').onclick = () => { indexHasNew = false; updateDots(); renderIndexModal(); openModal('index'); };
document.querySelector('#btn-open-rank').onclick = () => { updateRankModal(); openModal('rank'); };

document.querySelector('#btn-toggle-sound').onclick = () => {
  sfx.enabled = !sfx.enabled;
  document.querySelector('#btn-toggle-sound').innerHTML = sfx.enabled ? SPEAKER_ON : SPEAKER_OFF;
};

// Web3 (Base Sepolia testnet, USDC) — logika dari tim (web3Manager.js), tampilan versi art direction
document.querySelector('#btn-connect-wallet').onclick = async () => {
  sfx.playPop();
  if (!web3Manager.isMetaMaskAvailable()) { showNotice('NO WALLET FOUND · INSTALL METAMASK'); return; }
  const acc = await web3Manager.connectWallet();
  if (acc) updateWalletUI(acc);
};

function updateWalletUI(acc) {
  const btn = document.querySelector('#wallet-btn-text');
  const shopStatus = document.querySelector('#shop-wallet-status');
  if (acc) {
    const shortAcc = `${acc.slice(0, 6)}…${acc.slice(-4)}`;
    btn.textContent = shortAcc;
    shopStatus.textContent = `Wallet ${shortAcc}`;
    web3Manager.getUsdcBalance().then(bal => { shopStatus.textContent = `Wallet ${shortAcc} · ${bal} USDC`; });
  } else {
    btn.textContent = 'Connect Wallet';
    shopStatus.textContent = 'Wallet not connected';
  }
}
window.addEventListener('web3:accountChanged', (e) => updateWalletUI(e.detail));
window.addEventListener('web3:disconnected', () => updateWalletUI(null));

async function buyWeb3Item(btnSel, itemId, price, label, onSuccess) {
  const btn = document.querySelector(btnSel);
  btn.disabled = true;
  btn.textContent = 'Processing…';
  try {
    const res = await web3Manager.buyShopItem(itemId, price);
    if (res && res.success) {
      sfx.playLevelUp();
      onSuccess();
      state.save();
      updateUI();
      showNotice(`PURCHASE COMPLETE! TX ${res.txHash.slice(0, 10)}…`);
    }
  } catch (err) {
    showNotice('TRANSACTION CANCELLED OR FAILED');
    console.warn('[web3]', err);
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}
document.querySelector('#btn-buy-web3-power').onclick = () =>
  buyWeb3Item('#btn-buy-web3-power', 1, '0.1', '0.10 USDC', () => { state.power += 100; });
document.querySelector('#btn-buy-web3-bait').onclick = () =>
  buyWeb3Item('#btn-buy-web3-bait', 2, '0.5', '0.50 USDC', () => { state.legendaryBaits = (state.legendaryBaits || 0) + 5; });

// Shop actions
document.querySelector('#btn-shop-sell-all').onclick = async () => {
  if (state.inventory.length === 0) { showNotice('YOUR PEN IS EMPTY!'); return; }
  const total = state.inventory.reduce((s, it) => s + sellPriceOf(it), 0);
  const ok = await confirmDialog({
    title: 'Sell All?',
    html: `<div class="zt-title" style="font-size:20px">${state.inventory.length} animals · $${formatNum(total)} total</div>`,
    okLabel: 'Sell All',
  });
  if (!ok) return;
  sfx.playCoins();
  const res = state.sellAllAnimals();
  showNotice(`SOLD ${res.count} ANIMALS · +$${formatNum(res.totalSellPrice)}`);
  updateUI();
};

document.querySelector('#btn-shop-upgrade-pullup').onclick = () => {
  if (state.upgradePullUp()) { sfx.playLevelUp(); updateUI(); }
  else showNotice('NOT ENOUGH CASH!');
};

document.querySelector('#btn-shop-upgrade-slots').onclick = () => {
  if (state.upgradeBaseSlot()) { sfx.playLevelUp(); updateUI(); }
  else showNotice('NOT ENOUGH CASH!');
};

document.querySelector('#btn-shop-rebirth').onclick = async () => {
  if (state.canRebirth()) {
    const ok = await confirmDialog({
      title: 'Rebirth?',
      html: `You'll lose your cash and Power, but keep your animals, food and Index.<br><b>+50% income and Power forever.</b>`,
      okLabel: 'Rebirth',
      okClass: 'zt-btn--accent',
    });
    if (ok) {
      state.doRebirth();
      sfx.playLevelUp();
      updateUI();
    }
  } else {
    showNotice(`NEED $${formatNum(state.rebirthCost)} TO REBIRTH`);
  }
};

function renderQuestsModal() {
  const list = document.querySelector('#quests-list');
  list.innerHTML = '';
  state.quests.forEach(q => {
    const card = document.createElement('div');
    card.className = `zt-row ${q.claimed ? 'is-done' : ''}`;
    const pct = Math.min(100, Math.round((q.current / q.target) * 100));
    card.innerHTML = `
      <div class="zt-row__main">
        <div class="zt-title zt-row__title">${q.title}</div>
        <div class="zt-row__desc">${q.desc}</div>
        <div class="zt-bar"><i style="width:${pct}%"></i></div>
        <div class="flex justify-between mt-1">
          <span class="zt-row__desc">${formatNum(q.current)} / ${formatNum(q.target)}</span>
          <span class="zt-reward">+$${formatNum(q.rewardCash)}</span>
        </div>
      </div>
      ${q.claimed
        ? `<button class="zt-btn zt-btn--plain zt-btn--sm" disabled style="--c:var(--zt-panel);--cd:var(--zt-panel-d);color:var(--zt-ink)">Claimed ✓</button>`
        : q.completed
          ? `<button class="zt-btn zt-btn--good" data-claim="${q.id}" style="animation:zt-bump .8s ease-in-out infinite">Claim</button>`
          : `<button class="zt-btn zt-btn--sm" disabled>In Progress</button>`}
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

// Index: tab zona + grid 4 kartu
let indexZoneIdx = 0;
function zoneReached(i) {
  if (i === 0) return true;
  return ZONES.slice(i).some(z => z.animals.some(a => (state.indexProgress[a.id] || []).length));
}

function renderIndexModal() {
  const discovered = (an) => (state.indexProgress[an.id] || []).length > 0;
  const total = ZONES.reduce((s, z) => s + z.animals.filter(discovered).length, 0);
  document.querySelector('#index-total').textContent = `${total} / ${ZONES.reduce((s, z) => s + z.animals.length, 0)} DISCOVERED`;

  const tabs = document.querySelector('#index-tabs');
  tabs.innerHTML = '';
  ZONES.forEach((z, i) => {
    const t = document.createElement('button');
    const reached = zoneReached(i);
    t.className = `zt-tab ${i === indexZoneIdx ? 'is-active' : ''} ${reached ? '' : 'is-locked'}`;
    t.innerHTML = `<span class="zt-tab__strip" style="background:linear-gradient(90deg, ${hex(z.stripes[0])} 50%, ${hex(z.stripes[1])} 50%)"></span>
      <span class="zt-tab__label">${reached ? '' : '🔒 '}${z.name}</span>`;
    t.onclick = () => { sfx.playPop(); indexZoneIdx = i; renderIndexModal(); };
    tabs.appendChild(t);
  });

  const z = ZONES[indexZoneIdx];
  const found = z.animals.filter(discovered).length;
  const cards = z.animals.map(an => {
    const d = discovered(an);
    return `<div class="zt-card zt-card--${an.rarity.toLowerCase()} ${d ? '' : 'is-unknown'}">
      <img class="zt-card__img" src="${getAnimalThumb(an.id, { silhouette: !d })}" alt="">
      <div class="zt-card__name">${d ? an.name : '???'}</div>
      ${d ? rarityTag(an.rarity) : ''}
    </div>`;
  }).join('');

  document.querySelector('#index-list').innerHTML = `
    <div class="zt-zoneinfo">
      <span class="zt-title zt-zoneinfo__name">${z.name}</span>
      <span class="zt-zoneinfo__dist">${zoneRange(z)}</span>
    </div>
    <div class="zt-zoneinfo__fx" style="margin-top:-8px">${z.gimmick}</div>
    <div class="zt-grid">${cards}</div>
    <div>
      <div class="flex justify-between"><span class="zt-title" style="font-size:14px">${z.name} ${found} / ${z.animals.length}</span></div>
      <div class="zt-bar"><i style="width:${(found / z.animals.length) * 100}%"></i></div>
    </div>
  `;
}

function updateRankModal() {
  document.querySelector('#lb-catches').textContent = `${formatNum(state.totalCatches)}`;
  document.querySelector('#lb-money').textContent = `$${formatNum(state.totalEarned)}`;
  const l = state.luckiestCatch;
  document.querySelector('#lb-luck').innerHTML = `
    <div class="zt-stat-card__label">Luckiest Catch</div>
    ${l ? `<div class="zt-stat-card__value" style="font-size:18px">${l.name}</div>
      <div class="zt-tags" style="justify-content:center">${rarityTag(l.rarity)}${mutTag(l.mutation)}</div>`
      : `<div class="zt-stat-card__value">—</div>`}
  `;
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
    setStat('#hud-power', formatNum(state.power));
  }
  const cps = state.getCurrentCps();
  if (cps > 0) {
    state.money += cps;
    state.totalEarned += cps;
    setStat('#hud-money', `$${formatNum(state.money)}`);
    renderMiniFoodSelector(); // warna harga makanan ikut berubah saat uang cukup
  }
  updateDots();
}, 1000);

updateUI();
