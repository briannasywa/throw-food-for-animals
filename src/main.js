// ui-kit.css dulu, lalu style.css (penyesuaian prototype & HP) supaya override-nya menang
import './ui-kit.css';
import './style.css';
import confetti from 'canvas-confetti';
import { GameState, formatNum, foodCost } from './gameState.js';
import { D, MODE } from './difficulty.js';
import { FOOD_TIERS, ZONES, MUTATION_DATA, foodZoneOf } from './gameData.js';
import { RobloxSeamlessWorld } from './robloxSeamlessWorld.js';
import { sfx } from './audio.js';
import { getAnimalThumb } from './animalThumbs.js';
import { web3Manager } from './web3Manager.js';
import { CHANGELOG, LATEST_VERSION } from './changelog.js';

const state = new GameState();

// ---------- helper tampilan (Chunky Voxel, ui-spec v2) ----------
const RARITY_ORDER = ['Mythic', 'Legendary', 'Epic', 'Rare', 'Common'];
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
const meters = (n) => `${Math.floor(n).toLocaleString('en-US')} m`;
const zoneRange = (z) => `${z.minDist.toLocaleString('en-US')}–${z.maxDist.toLocaleString('en-US')} m`;
const rarityTag = (r) => `<span class="zt-tag zt-tag--${r.toLowerCase()}">${r}</span>`;
const mutTag = (m) => (m && m !== 'Normal' ? `<span class="zt-mut zt-mut--${m.toLowerCase()}">${m}</span>` : '');
// Harga jual & penghasilan per hewan sesuai mode (difficulty.js)
const sellPriceOf = (item) => state.sellPriceOf(item);
const incomeOf = (item) => state.incomeOf(item);
const zoneOfDistance = (d) => { for (let i = ZONES.length - 1; i >= 0; i--) if (d >= ZONES[i].minDist) return ZONES[i]; return ZONES[0]; };
const zoneOfAnimal = (id) => ZONES.find(z => z.animals.some(a => a.id === id));

const SPEAKER_ON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B2233" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#1B2233"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>`;
const SPEAKER_OFF = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B2233" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#1B2233"/><path d="M17 9l5 6M22 9l-5 6"/></svg>`;

// Keycap hotkey kecil di tombol menu (tampil saat camera lock aktif; disembunyikan di layar sentuh)
const hk = (key, always = false) => `<kbd class="zt-hk ${always ? 'is-always' : ''}">${key}</kbd>`;
const BURGER_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B2233" stroke-width="3" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
const CAMLOCK_ICON = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B2233" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="1.6" fill="#1B2233"/></svg>`;

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
      <div class="zt-stat zt-stat--rebirth"><div class="zt-stat__label">Rebirth</div><div id="hud-rebirth" class="zt-stat__value" style="color:var(--zt-accent-d)">0x</div></div>
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
    <button id="btn-mode" class="zt-btn zt-btn--plain zt-btn--sm zt-modebtn" title="Difficulty">Mode: <b>${D.label}</b></button>
    <button id="btn-connect-wallet" class="zt-btn zt-btn--plain zt-btn--sm"><span id="wallet-btn-text">Connect Wallet</span></button>
    <button id="btn-open-quests" class="zt-btn zt-btn--primary">Quests${hk('Q')}</button>
    <button id="btn-open-index" class="zt-btn zt-btn--accent">Index${hk('I')}</button>
    <button id="btn-open-rank" class="zt-btn zt-btn--good">Rank${hk('R')}</button>
    <button id="btn-open-changelog" class="zt-btn zt-btn--plain" title="What's new (C)">Changelog${hk('C')}</button>
    <button id="btn-toggle-camlock" class="zt-btn zt-btn--plain zt-btn--icon" aria-label="Camera lock" title="Camera lock (L)">${CAMLOCK_ICON}${hk('L')}</button>
    <button id="btn-mobile-menu" class="zt-btn zt-btn--plain zt-menu__burger" aria-label="Menu">${BURGER_ICON}<span>Menu</span></button>
    <button id="btn-toggle-sound" class="zt-btn zt-btn--plain zt-btn--icon" aria-label="Sound" title="Sound (M)"><span id="sound-icon">${SPEAKER_ON}</span>${hk('M')}</button>
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

  <!-- Panel lempar: meter + tombol Throw (Space) -->
  <div id="throw-control-floating" class="zt-panel zt-throw absolute left-1/2 -translate-x-1/2 z-20 hidden">
    <div class="relative zt-throw__meter">
      <div id="meter-container" class="zt-meter">
        <div id="meter-needle" class="zt-meter__marker" style="left: 0%;"></div>
      </div>
      <div id="meter-result-slot"></div>
    </div>
    <button id="btn-throw" class="zt-btn zt-btn--primary zt-throw__btn">Throw <span class="zt-key zt-key--sm">Space</span></button>
  </div>

  <!-- Food Bag (kiri bawah): hanya makanan yang di-equip; klik → inventory -->
  <button id="btn-food-bag" class="zt-panel zt-foodbag absolute z-20">
    <span class="zt-foodbag__label">FOOD BAG${hk('F', true)}</span>
    <span class="zt-foodbag__item">
      <span id="foodbag-swatch" class="zt-foodbag__swatch"></span>
      <span class="zt-foodbag__text">
        <span id="foodbag-name" class="zt-title zt-foodbag__name">Carrot</span>
        <span id="foodbag-sub" class="zt-foodbag__sub">Luck ×1</span>
      </span>
    </span>
  </button>

  <!-- HP: joystick virtual (kiri bawah) -->
  <div id="joystick" class="zt-joy hidden" aria-label="Move">
    <div class="zt-joy__knob"></div>
  </div>

  <!-- HP: bar area (nama area, tombol aksi, Exit). Pemain terkunci di area sampai menekan Exit. -->
  <div id="area-bar" class="zt-panel zt-areabar hidden">
    <span id="area-title" class="zt-title zt-areabar__title">Throw Pad</span>
    <div id="area-actions" class="zt-areabar__actions"></div>
    <button id="area-exit" class="zt-btn zt-btn--danger zt-btn--sm">Exit</button>
  </div>

  <!-- Mode sinematik: pita hitam atas-bawah (latihan pull-up & View Biome) -->
  <div id="cine" class="zt-cine hidden">
    <div class="zt-cine__bar zt-cine__bar--top">
      <div id="cine-kicker" class="zt-cine__kicker">TRAINING</div>
      <div id="cine-title" class="zt-title zt-cine__title">Pull-Up</div>
    </div>
    <div class="zt-cine__bar zt-cine__bar--bottom">
      <div id="cine-info" class="zt-cine__info"></div>
      <button id="cine-exit" class="zt-btn zt-btn--plain zt-btn--sm">Stop <span id="cine-exit-key" class="zt-key zt-key--sm">E</span></button>
    </div>
  </div>

  <!-- Onboarding kunjungan pertama -->
  <div id="onboarding" class="zt-panel zt-onboard hidden">
    <div class="zt-onboard__steps" id="onboard-dots"></div>
    <div id="onboard-title" class="zt-title zt-onboard__title">Welcome to Zoo Toss!</div>
    <div id="onboard-text" class="zt-onboard__text"></div>
    <div class="zt-onboard__actions">
      <button id="onboard-skip" class="zt-btn zt-btn--plain zt-btn--sm">Skip</button>
      <button id="onboard-next" class="zt-btn zt-btn--primary zt-btn--sm hidden">Got it</button>
    </div>
  </div>

  <!-- Camera lock: titik bidik di tengah + petunjuk -->
  <div id="camlock-crosshair" class="zt-crosshair hidden"></div>
  <div id="camlock-hint" class="zt-camlock-hint hidden">CAMERA LOCK ON · Press <b>L</b> to turn off</div>

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

    <!-- 1. TELUR AJAIB (GACHA CS2 HEWAN PALING LANGKA SESUAI BIOME TERJAUH) -->
    <div class="zt-row" style="background:#FFF0D6; border-color:#FFC21A;">
      <div class="zt-row__main">
        <div class="zt-title zt-row__title flex items-center gap-2">
          <span>🥚 Telur Ajaib (Mystery Egg)</span>
          <span class="zt-tag zt-tag--legendary">CS2 Gacha</span>
        </div>
        <div class="zt-row__desc">Gacha hewan terlangka dari <b>biome terjauhmu</b>: <b id="shop-egg-farthest-zone">LOBBY</b>!</div>
      </div>
      <button id="btn-shop-open-egg" class="zt-btn zt-btn--accent">$250</button>
    </div>

    <!-- 2. MAKANAN AJAIB (LUCK BOOST MULTIPLIER UNTUK BIOME) -->
    <div class="zt-row">
      <div class="zt-row__main">
        <div class="zt-title zt-row__title flex items-center gap-2">
          <span>✨ Makanan Ajaib</span>
          <span id="shop-magic-food-owned" class="zt-muted">(Buff: 0 throw)</span>
        </div>
        <div class="zt-row__desc">Naikkan 3.5× max luck hewan langka &amp; mutasi di biome saat lempar</div>
        <div class="flex gap-2 mt-2">
          <button id="btn-buy-magic-1" class="zt-btn zt-btn--sm zt-btn--good">1 Pcs ($100)</button>
          <button id="btn-buy-magic-5" class="zt-btn zt-btn--sm zt-btn--good">5 Pcs ($450)</button>
          <button id="btn-buy-magic-10" class="zt-btn zt-btn--sm zt-btn--good">10 Pcs ($850)</button>
        </div>
      </div>
    </div>

    <!-- 3. LEVEL POWER (% DARI POWER SAAT INI) -->
    <div class="zt-row">
      <div class="zt-row__main">
        <div class="zt-title zt-row__title">⚡ Boost Level Power (%)</div>
        <div class="zt-row__desc">Tambah kekuatan instan berskala % dari Power sekarang</div>
        <div class="flex gap-2 mt-2">
          <button id="btn-buy-power-pct5" class="zt-btn zt-btn--sm zt-btn--primary">+5% Power</button>
          <button id="btn-buy-power-pct10" class="zt-btn zt-btn--sm zt-btn--primary">+10% Power</button>
        </div>
      </div>
    </div>

    <!-- 4. UANG (% CASH DARI POWER ATAU REBIRTH) -->
    <div class="zt-row">
      <div class="zt-row__main">
        <div class="zt-title zt-row__title">💰 Instant Cash (% Conversion)</div>
        <div class="zt-row__desc">Tukar 5% atau 10% Power saat ini untuk suntikan uang tunai instan</div>
        <div class="flex gap-2 mt-2">
          <button id="btn-buy-cash-pct5" class="zt-btn zt-btn--sm zt-btn--accent">Tukar 5% Power</button>
          <button id="btn-buy-cash-pct10" class="zt-btn zt-btn--sm zt-btn--accent">Tukar 10% Power</button>
        </div>
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
        <div class="zt-row__desc">Reset cash and Power for a permanent +${Math.round(D.rebirthBonus * 100)}% income &amp; Power boost</div>
      </div>
      <button id="btn-shop-rebirth" class="zt-btn zt-btn--accent">$50K</button>
    </div>
  `)}

  <!-- HP: menu overlay dari atas (Quests, Index, Rank, Sound, Wallet + detail Rebirth) -->
  <div id="modal-menu" class="zt-mmenu hidden">
    <div class="zt-panel zt-mmenu__sheet">
      <div class="zt-mmenu__head">
        <span class="zt-title zt-mmenu__title">Menu</span>
        <button id="btn-close-menu" class="zt-btn zt-btn--danger zt-btn--icon zt-modal__close" aria-label="Close">✕</button>
      </div>
      <div class="zt-mmenu__zone"><span id="mmenu-zone-swatch" class="zt-swatch"></span><span id="mmenu-zone" class="zt-title"></span></div>
      <div class="zt-mmenu__rebirth">
        <div class="zt-mmenu__rb-main">
          <div class="zt-title zt-mmenu__rb-title">Rebirth <span id="mmenu-rb-count">0x</span></div>
          <div id="mmenu-rb-desc" class="zt-row__desc">Income &amp; Power ×1.0</div>
          <div id="mmenu-rb-next" class="zt-row__desc">Next: ×1.5 for $50K</div>
        </div>
        <button id="mmenu-rebirth" class="zt-btn zt-btn--accent zt-btn--sm">Rebirth</button>
      </div>
      <div class="zt-mmenu__mode">
        <span class="zt-title zt-mmenu__mode-label">Difficulty</span>
        <div class="zt-seg">
          <button class="zt-seg__btn ${MODE === 'easy' ? 'is-on' : ''}" data-mode="easy">Easy</button>
          <button class="zt-seg__btn ${MODE === 'hard' ? 'is-on' : ''}" data-mode="hard">Hard</button>
        </div>
      </div>
      <div class="zt-mmenu__grid">
        <button class="zt-btn zt-btn--primary" data-mm="quests">Quests</button>
        <button class="zt-btn zt-btn--accent" data-mm="index">Index</button>
        <button class="zt-btn zt-btn--good" data-mm="rank">Rank</button>
        <button class="zt-btn zt-btn--plain" data-mm="sound" id="mmenu-sound">Sound: On</button>
        <button class="zt-btn zt-btn--plain zt-mmenu__wide" data-mm="changelog">Changelog</button>
        <button class="zt-btn zt-btn--plain zt-mmenu__wide" data-mm="wallet" id="mmenu-wallet">Connect Wallet</button>
      </div>
    </div>
  </div>

  ${modal('food', 'Food Bag', `<div id="food-bag-list" class="flex flex-col gap-2.5"></div>`,
    `<div class="zt-modal__sub">${D.zoneFood ? 'Rare catches need the food of that zone' : 'Better food = luckier catches'}</div>`)}

  ${modal('plot', 'My Pen', `<div id="plot-animals-list" class="zt-grid"></div>`,
    `<div id="plot-capacity-text" class="zt-modal__sub">0 / 4 SLOTS</div>`)}

  ${modal('quests', 'Quests', `<div id="quests-list" class="flex flex-col gap-2.5"></div>`)}

  ${modal('changelog', 'Changelog', `<div id="changelog-list" class="zt-clog"></div>`,
    `<div class="zt-modal__sub">Version ${LATEST_VERSION}</div>`)}

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

  <!-- CS2 Style Gacha Egg Overlay -->
  <div id="gacha-overlay" class="zt-gacha-overlay hidden">
    <div class="zt-gacha-box">
      <div class="zt-modal__head zt-title zt-outline">🥚 TELUR AJAIB UNBOXING</div>
      <div class="text-center mt-2">
        <div id="gacha-biome-title" class="zt-title" style="color:#FFD54A; font-size:18px">FAR BIOME: LOBBY</div>
        <div class="text-xs text-slate-300">Memutar hewan-hewan eksotis dari batas terjauh lemparanmu!</div>
      </div>

      <!-- Roulette Track -->
      <div class="zt-gacha-roulette-container">
        <div class="zt-gacha-indicator"></div>
        <div id="gacha-track" class="zt-gacha-track"></div>
      </div>

      <!-- Result Banner -->
      <div id="gacha-result" class="text-center hidden mb-2">
        <div class="zt-title" style="color:#38BDF8; font-size:22px" id="gacha-result-name">UNLOCKED!</div>
        <div class="text-sm text-slate-200" id="gacha-result-desc">Rare animal unlocked for your pen!</div>
      </div>

      <div class="flex gap-3">
        <button id="btn-gacha-spin" class="zt-btn zt-btn--accent">SPIN AGAIN</button>
        <button id="btn-gacha-close" class="zt-btn zt-btn--plain">COLLECT &amp; CLOSE</button>
      </div>
    </div>
  </div>

  <!-- Mobile MetaMask Guidance Modal -->
  <div id="modal-metamask-mobile" class="zt-modal-shade hidden" style="z-index:75">
    <div class="zt-panel zt-modal" style="width:min(480px, 94vw); text-align:center;">
      <div class="zt-modal__head zt-title zt-outline">🦊 KONEKSI METAMASK HP</div>
      <button id="btn-close-mobile-mm" class="zt-btn zt-btn--danger zt-btn--icon zt-modal__close">✕</button>
      <div class="zt-modal__body mt-4 flex flex-col gap-3 text-left">
        <div class="p-3 bg-amber-100/90 border-2 border-amber-400 rounded-lg text-xs leading-relaxed text-slate-800">
          <b>Penting untuk Browser Android (Chrome / Samsung):</b><br>
          Browser HP biasa tidak mengizinkan ekstensi wallet. Gunakan <b>Browser bawaan di dalam aplikasi MetaMask</b>.
        </div>

        <div class="text-sm text-slate-800 font-semibold">Langkah Mudah:</div>
        <ol class="list-decimal list-inside text-xs text-slate-700 flex flex-col gap-2 pl-1">
          <li>Salin alamat game di bawah ini.</li>
          <li>Buka aplikasi <b>MetaMask</b> di HP Anda.</li>
          <li>Pilih menu <b>Browser</b> (ikon bola dunia 🌐 di bawah).</li>
          <li>Tempelkan (Paste) alamat lalu buka.</li>
        </ol>

        <div class="flex items-center gap-2 p-2 bg-slate-100 border-2 border-slate-300 rounded-lg">
          <input id="mobile-mm-url" type="text" readonly class="text-xs text-slate-700 font-mono w-full bg-transparent outline-none select-all" value="">
          <button id="btn-copy-mm-url" class="zt-btn zt-btn--sm zt-btn--primary flex-none">Copy URL</button>
        </div>

        <div class="flex gap-2 mt-2">
          <button id="btn-launch-mm-app" class="zt-btn zt-btn--accent w-full">Buka Aplikasi MetaMask</button>
        </div>
      </div>
    </div>
  </div>

  <div id="zt-notice" class="zt-panel zt-notice hidden"></div>
  ${MODE === 'easy' ? `<div class="zt-modebadge" title="Easy mode (dev testing). Open with ?mode=hard for the demo.">EASY MODE · DEV</div>` : ''}
</div>
`;

// Initialize Fullscreen 3D World
const viewportContainer = document.querySelector('#full-map-viewport');
const world = new RobloxSeamlessWorld(viewportContainer);
// ---------- Mode HP (layar sentuh) ----------
// Joystick untuk berjalan, geser layar untuk memutar kamera. Masuk area (pad lempar, pull-up, kandang, shop)
// mengunci pemain di area itu sampai menekan Exit. Paksa di PC untuk tes: tambahkan ?mobile=1 di URL.
const isTouchUI = matchMedia('(pointer: coarse)').matches || new URLSearchParams(location.search).has('mobile');
if (isTouchUI) document.querySelector('.zt-root').classList.add('is-touch');

// Hanya di dev server (npm run dev): akses dari console untuk cek visual, mis. __zt.world.avatar.position.z = 300
if (import.meta.env.DEV) window.__zt = { world, state };

// Dev saja: tombol ` (backtick) menampilkan FPS, draw call, segitiga, dan far clip
if (import.meta.env.DEV) {
  const box = document.createElement('div');
  box.className = 'zt-devstats hidden';
  document.querySelector('.zt-root').appendChild(box);
  let frames = 0, last = performance.now();
  const count = () => { frames++; requestAnimationFrame(count); };
  requestAnimationFrame(count);
  setInterval(() => {
    const now = performance.now();
    const fps = Math.round(frames * 1000 / (now - last));
    frames = 0; last = now;
    const r = world.renderer.info.render;
    box.textContent = `${fps} FPS · ${r.calls} calls · ${(r.triangles / 1000).toFixed(1)}k tris · far ${Math.round(world.camera.far)} · ${world.lighting.quality}${world.lighting.compact ? ' compact' : ''} · mode ${MODE}`;
  }, 500);
  window.addEventListener('keydown', (e) => { if (e.code === 'Backquote') box.classList.toggle('hidden'); });
}

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
    syncModalState();
    const done = (v) => { m.classList.add('hidden'); confirmResolve = null; syncModalState(); resolve(v); };
    confirmResolve = done;
    ok.onclick = () => done(true);
    document.querySelector('#confirm-cancel').onclick = () => done(false);
  });
}
let confirmResolve = null;

// Prompt stasiun selalu di atas panel lempar (penting di HP, panel lempar ada di paling bawah)
const throwPanel = document.querySelector('#throw-control-floating');
new ResizeObserver(() => {
  if (throwPanel.offsetHeight) document.documentElement.style.setProperty('--zt-throw-h', `${throwPanel.offsetHeight}px`);
}).observe(throwPanel);

// Meter Animation
let meterVal = 0;
let meterDir = 1;
const needle = document.querySelector('#meter-needle');

function animateMeter() {
  if (!world.isThrowing) {
    const spd = (0.52 + Math.abs(world.windSpeed * 0.02)) * D.meterSpeedMul;
    meterVal += meterDir * spd;
    if (meterVal >= 20) { meterVal = 20; meterDir = -1; }
    else if (meterVal <= 0) { meterVal = 0; meterDir = 1; }
    needle.style.left = `${(meterVal / 20) * 100}%`;
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
  document.querySelector('#btn-open-changelog').classList.toggle('zt-dot', changelogUnseen());
  document.querySelector('#btn-mobile-menu').classList.toggle('zt-dot', indexHasNew || changelogUnseen() || state.quests.some(q => q.completed && !q.claimed));
}

// ---------- Changelog (isi dari CHANGELOG.md, wajib diisi tiap update yang di-merge) ----------
// kunci localStorage: 'zootoss-changelog-seen' (ditulis literal karena updateDots bisa dipanggil sebelum baris ini jalan)
function changelogUnseen() {
  try { return localStorage.getItem('zootoss-changelog-seen') !== LATEST_VERSION; } catch { return false; }
}
const escHtml = (t) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Markdown kecil di dalam kalimat: **tebal** dan `kode`
const inlineMd = (t) => escHtml(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
function renderChangelogModal() {
  let seen = null;
  try { seen = localStorage.getItem('zootoss-changelog-seen'); } catch { /* storage diblokir */ }
  const seenIdx = CHANGELOG.findIndex(e => e.version === seen);
  document.querySelector('#changelog-list').innerHTML = CHANGELOG.map((e, i) => `
    <section class="zt-row zt-clog__entry ${i === 0 ? 'is-latest' : ''}">
      <div class="zt-clog__head">
        <span class="zt-title zt-clog__ver">v${e.version}</span>
        ${(seenIdx === -1 ? i === 0 : i < seenIdx) ? '<span class="zt-clog__new">NEW</span>' : ''}
        <span class="zt-clog__date">${e.date}</span>
      </div>
      ${e.sections.map(s => `
        <div class="zt-clog__sec zt-clog__sec--${s.name.toLowerCase()}">${escHtml(s.name)}</div>
        <ul class="zt-clog__list">${s.items.map(it => `<li>${inlineMd(it)}</li>`).join('')}</ul>`).join('')}
    </section>`).join('');
  try { localStorage.setItem('zootoss-changelog-seen', LATEST_VERSION); } catch { /* storage diblokir */ }
  updateDots();
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

  // Update item shop baru
  const farZone = state.getFarthestZone();
  const eggCost = Math.max(250, Math.round(500 * (state.maxReachedZoneIndex + 1) * D.foodCostMul));
  const eggZoneEl = document.querySelector('#shop-egg-farthest-zone');
  if (eggZoneEl) eggZoneEl.textContent = `${farZone.name.toUpperCase()} (${zoneRange(farZone)})`;
  const eggBtn = document.querySelector('#btn-shop-open-egg');
  if (eggBtn) eggBtn.textContent = `$${formatNum(eggCost)}`;

  const magicOwnedEl = document.querySelector('#shop-magic-food-owned');
  if (magicOwnedEl) magicOwnedEl.textContent = `(Buff: ${state.magicFoodBuff || 0} throw)`;

  const pCost5 = Math.max(50, Math.round(Math.max(5, Math.round(state.power * 0.05)) * 12 * Math.sqrt(state.power / 10)));
  const pCost10 = Math.max(90, Math.round(Math.max(10, Math.round(state.power * 0.10)) * 12 * Math.sqrt(state.power / 10)));
  const pBtn5 = document.querySelector('#btn-buy-power-pct5');
  if (pBtn5) pBtn5.textContent = `+5% Power ($${formatNum(pCost5)})`;
  const pBtn10 = document.querySelector('#btn-buy-power-pct10');
  if (pBtn10) pBtn10.textContent = `+10% Power ($${formatNum(pCost10)})`;

  const cash5Gain = Math.max(100, Math.round(Math.max(5, Math.round(state.power * 0.05)) * 35 * state.getRebirthMultiplier()));
  const cash10Gain = Math.max(200, Math.round(Math.max(10, Math.round(state.power * 0.10)) * 35 * state.getRebirthMultiplier()));
  const cashBtn5 = document.querySelector('#btn-buy-cash-pct5');
  if (cashBtn5) cashBtn5.textContent = `5% Power (+$${formatNum(cash5Gain)})`;
  const cashBtn10 = document.querySelector('#btn-buy-cash-pct10');
  if (cashBtn10) cashBtn10.textContent = `10% Power (+$${formatNum(cash10Gain)})`;

  document.querySelector('#plot-capacity-text').textContent =
    `${state.inventory.length} / ${state.maxBaseSlots} SLOTS · ${state.equippedPets.length} / 2 PETS EQUIPPED`;

  // Sync 3D in-world plot (kandang membesar saat Expand Pen)
  world.setPenSize(state.maxBaseSlots);
  world.updatePlotAnimals(state.inventory);
  world.updateEquippedPets(state.inventory, state.equippedPets);

  renderFoodBag();
  renderPlotAnimals();
  updateDots();
}

// ---------- Food Bag ----------
// Depan: hanya makanan yang di-equip. Klik / F -> modal inventory (equip, beli, Legendary Bait).
function equippedFood() {
  if (state.selectedFoodIndex === 'web3_legendary' && (state.legendaryBaits || 0) > 0) return LEGENDARY_BAIT;
  return FOOD_TIERS[state.selectedFoodIndex] || FOOD_TIERS[0];
}

function renderFoodBag() {
  const f = equippedFood();
  const leg = f === LEGENDARY_BAIT;
  document.querySelector('#foodbag-swatch').style.background = f.color;
  document.querySelector('#foodbag-name').textContent = leg ? `Legendary ×${state.legendaryBaits}` : f.name;
  document.querySelector('#foodbag-sub').textContent = leg ? 'Guaranteed Legendary' : foodLuckLabel(f);
  document.querySelector('#btn-food-bag').classList.toggle('is-legend', leg);
  if (!document.querySelector('#modal-food').classList.contains('hidden')) renderFoodBagModal();
}

// Teks Luck makanan. Mode hard: makanan hanya membuka Rare+ di zonanya sendiri (difficulty.js → zoneFood).
function foodLuckLabel(f) {
  if (!D.zoneFood) return `Luck ×${f.luckBonus}`;
  const z = foodZoneOf(f);
  return z ? `Rare catches in ${z.name}` : `Luck ×${f.luckBonus}`;
}

function equipFood(idx) {
  sfx.playPop();
  state.selectedFoodIndex = idx;
  state.save();
  updateUI();
}

function renderFoodBagModal() {
  const list = document.querySelector('#food-bag-list');
  const cur = equippedFood();
  const legCount = state.legendaryBaits || 0;
  const row = ({ color, title, desc, btn, active, legend }) => `
    <div class="zt-row zt-foodrow ${active ? 'is-active' : ''} ${legend ? 'zt-foodrow--legend' : ''}">
      <span class="zt-foodrow__swatch" style="background:${color}"></span>
      <div class="zt-row__main">
        <div class="zt-title zt-row__title">${title}</div>
        <div class="zt-row__desc">${desc}</div>
      </div>
      ${btn}
    </div>`;

  const equippedBtn = `<button class="zt-btn zt-btn--plain zt-btn--sm" disabled>✓ Equipped</button>`;
  let html = row({
    color: LEGENDARY_BAIT.color, legend: true, active: cur === LEGENDARY_BAIT,
    title: `Legendary Bait <span class="zt-muted">×${legCount}</span>`,
    desc: 'Guaranteed Legendary catch · bought with USDC',
    btn: cur === LEGENDARY_BAIT ? equippedBtn
      : legCount > 0 ? `<button class="zt-btn zt-btn--accent zt-btn--sm" data-food="legend">Equip</button>`
      : `<button class="zt-btn zt-btn--plain zt-btn--sm" data-food="shop">Get in Shop</button>`,
  });
  FOOD_TIERS.forEach((f, idx) => {
    const owned = state.unlockedFoods.includes(idx);
    const canAfford = state.money >= foodCost(f);
    html += row({
      color: f.color, active: cur === f,
      title: f.name,
      desc: D.zoneFood ? `${f.desc} · <b>Needed for rare catches in ${foodZoneOf(f)?.name}</b>` : `${f.desc} · Luck ×${f.luckBonus}`,
      btn: cur === f ? equippedBtn
        : owned ? `<button class="zt-btn zt-btn--good zt-btn--sm" data-food="${idx}">Equip</button>`
        : `<button class="zt-btn zt-btn--sm ${canAfford ? 'zt-btn--primary' : 'zt-btn--plain is-short'}" data-food="${idx}">Buy $${formatNum(foodCost(f))}</button>`,
    });
  });
  list.innerHTML = html;

  list.querySelectorAll('[data-food]').forEach(b => {
    b.onclick = () => {
      const v = b.dataset.food;
      if (v === 'shop') { openModal('shop'); return; }
      if (v === 'legend') { equipFood('web3_legendary'); return; }
      const idx = Number(v);
      if (state.unlockedFoods.includes(idx)) { equipFood(idx); return; }
      if (state.money < foodCost(FOOD_TIERS[idx])) { showNotice('NOT ENOUGH CASH!'); return; }
      state.buyFood(idx);   // beli -> langsung di-equip (perilaku lama dari gameState)
      sfx.playLevelUp();
      updateUI();
    };
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
  document.querySelector('#catch-sub').textContent = `+$${formatNum(incomeOf(animal))}/s`
    + (animal.zoneFoodMiss ? ` · Use ${animal.zoneFoodName} for rarer catches here` : '');
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
  if (world.currentStation?.id !== 'throw') return; // hanya bisa melempar dari pad pink

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
  // Mode easy: 10 m per Power (angka asli), hard: 2 m per Power (difficulty.js)
  const baseDist = (state.power * D.distPerPower) * (0.5 + (score / 20) * 1.5);
  const windEffect = 1 + (world.windSpeed * 0.03 * world.windDirection);
  const distance = Math.max(15, Math.floor(baseDist * windEffect));
  const targetZone = zoneOfDistance(distance);
  document.querySelector('#camlock-crosshair').classList.add('hidden');
  document.querySelector('#camlock-hint').classList.add('hidden');

  let throwFoodItem = { ...food };
  if (state.magicFoodBuff > 0) {
    throwFoodItem.magicFoodMultiplier = 3.5; // Menaikkan maks luck hewan langka di biome tujuan
    state.magicFoodBuff -= 1;
    state.save();
    showNotice(`MAGIC FOOD APPLIED! 3.5X LUCK (Remains: ${state.magicFoodBuff})`);
  }

  onboarding.onThrow();
  world.throwFood(distance, targetZone, throwFoodItem, (caughtAnimal, dist) => {
    hud.classList.add('hidden');
    syncCamLockUI();
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
    state.updateMaxDistance(dist);
    showCatchToast(caughtAnimal, { sellPrice: res.autoSold ? res.sellPrice : null, isNew });
    updateUI();
    onboarding.onCatch(caughtAnimal);
  });
}

function togglePullUp() {
  sfx.playPop();
  state.isTraining = !state.isTraining;
  world.setTrainingMode(state.isTraining);
  if (state.isTraining) showCinematic('training');
  else hideCinematic();
  updateUI();
  // HP: berhenti latihan = keluar dari area pull-up
  if (!state.isTraining && activeArea === 'gym') exitArea();
}

// ---------- Area (HP) ----------
let activeArea = null;
const AREAS = {
  throw: { title: 'Throw Pad' },
  gym: { title: 'Pull-Up' },
  plot: { title: 'My Pen', actions: [['Manage Pen', 'zt-btn--good', () => openModal('plot')]] },
  shop: { title: 'Shop', actions: [['Open Shop', 'zt-btn--primary', () => openModal('shop')]] },
};
// Titik keluar: di luar jangkauan area supaya tidak langsung masuk lagi
function areaExitPoint(id) {
  const st = world.worldStations.find(s => s.id === id);
  if (id === 'throw') return [0, 2, Math.PI];
  if (id === 'plot') return [0, st.pos.z + st.radius + 1.5, 0];
  return [st.pos.x, st.pos.z + st.radius + 1.5, 0];
}

function enterArea(id) {
  activeArea = id;
  const root = document.querySelector('.zt-root');
  root.classList.add('is-in-area', `area-${id}`);
  world.setAreaLock(true, world.areaShot(id));
  resetJoystick();
  if (id === 'throw') { world.cameraOrbit.yaw = 0; world.cameraOrbit.pitch = 0.5; }
  if (id === 'gym') { if (!state.isTraining) togglePullUp(); return; } // pita sinematik punya tombol Stop sendiri

  const a = AREAS[id];
  document.querySelector('#area-title').textContent = a.title;
  const box = document.querySelector('#area-actions');
  box.innerHTML = '';
  (a.actions || []).forEach(([label, cls, fn]) => {
    const b = document.createElement('button');
    b.className = `zt-btn zt-btn--sm ${cls}`;
    b.textContent = label;
    b.onclick = () => fn();
    box.appendChild(b);
  });
  document.querySelector('#area-bar').classList.remove('hidden');
  if (id === 'shop') openModal('shop');
}

function exitArea() {
  const id = activeArea;
  if (!id || world.isThrowing) return;
  activeArea = null;
  if (id === 'gym' && state.isTraining) togglePullUp();
  MODALS.forEach(m => closeModal(m, true));
  syncModalState();
  const [x, z, rot] = areaExitPoint(id);
  world.setAreaLock(false);
  world.teleport(x, z, rot);
  const root = document.querySelector('.zt-root');
  root.classList.remove('is-in-area', `area-${id}`);
  document.querySelector('#area-bar').classList.add('hidden');
}
document.querySelector('#area-exit').onclick = () => { sfx.playPop(); exitArea(); };

// ---------- Joystick virtual ----------
const joy = document.querySelector('#joystick');
const knob = joy.querySelector('.zt-joy__knob');
let joyId = null;
const JOY_R = 44;
function resetJoystick() {
  joyId = null;
  knob.style.transform = '';
  joy.classList.remove('is-active');
  world.setJoystick(0, 0);
}
function moveJoystick(e) {
  const r = joy.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width / 2);
  let dy = e.clientY - (r.top + r.height / 2);
  const len = Math.hypot(dx, dy);
  if (len > JOY_R) { dx *= JOY_R / len; dy *= JOY_R / len; }
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
  world.setJoystick(dx / JOY_R, -dy / JOY_R);
}
joy.addEventListener('pointerdown', (e) => {
  if (joyId !== null) return;
  joyId = e.pointerId;
  try { joy.setPointerCapture(e.pointerId); } catch { /* event sintetis / pointer sudah lepas */ }
  joy.classList.add('is-active');
  moveJoystick(e);
});
joy.addEventListener('pointermove', (e) => { if (e.pointerId === joyId) moveJoystick(e); });
joy.addEventListener('pointerup', (e) => { if (e.pointerId === joyId) resetJoystick(); });
joy.addEventListener('pointercancel', (e) => { if (e.pointerId === joyId) resetJoystick(); });
if (isTouchUI) joy.classList.remove('hidden');

// ---------- Mode sinematik ----------
// 'training': kamera rendah berputar pelan di pull-up bar, HUD disembunyikan, info Power di pita bawah.
// 'biome': kamera menyusuri zona (dari Index → View Biome), keluar dengan Esc / tombol Exit.
let cineMode = null;
function showCinematic(mode, zone) {
  cineMode = mode;
  document.querySelector('.zt-root').classList.add('is-cinematic');
  document.querySelector('#cine').classList.remove('hidden');
  if (camLock) world.setCameraLock(false);
  if (mode === 'training') {
    document.querySelector('#cine-kicker').textContent = 'TRAINING';
    document.querySelector('#cine-title').textContent = 'Pull-Up';
    document.querySelector('#cine-exit').firstChild.textContent = 'Stop ';
    document.querySelector('#cine-exit-key').textContent = 'E';
    updateCineInfo();
  } else {
    document.querySelector('#cine-kicker').textContent = `BIOME PREVIEW · ${zoneRange(zone)}`;
    document.querySelector('#cine-title').textContent = zone.name;
    document.querySelector('#cine-info').textContent = zone.gimmick;
    document.querySelector('#cine-exit').firstChild.textContent = 'Exit ';
    document.querySelector('#cine-exit-key').textContent = 'Esc';
  }
}
function hideCinematic() {
  cineMode = null;
  document.querySelector('.zt-root').classList.remove('is-cinematic');
  document.querySelector('#cine').classList.add('hidden');
  if (camLock) world.setCameraLock(!anyModalOpen());
}
function updateCineInfo() {
  if (cineMode !== 'training') return;
  document.querySelector('#cine-info').innerHTML =
    `POWER <b>${formatNum(state.power)}</b> · <span class="zt-cine__gain">+${formatNum(state.getPullUpRate())} / SEC</span>`;
}
function startBiomeView(zone) {
  if (world.isThrowing) return;
  if (state.isTraining) togglePullUp();
  MODALS.forEach(id => closeModal(id, true));
  syncModalState();
  world.startBiomeView(zone);
  showCinematic('biome', zone);
}
function exitCinematic() {
  if (cineMode === 'training') togglePullUp();
  else if (cineMode === 'biome') { world.stopBiomeView(); hideCinematic(); }
}
document.querySelector('#cine-exit').onclick = () => { sfx.playPop(); exitCinematic(); };

// ---------- Onboarding (kunjungan pertama) ----------
// 1 jalan ke pad pink → 2 hentikan jarum di hijau & lempar → 3 tunggu tangkapan → 4 penjelasan kandang & Food Bag.
// Selesai / Skip disimpan di localStorage, jadi hanya muncul sekali per perangkat.
const onboarding = (() => {
  const KEY = 'zootoss-onboarded-v1';
  const touch = isTouchUI;
  let done = false;
  try { done = localStorage.getItem(KEY) === '1'; } catch { /* storage diblokir: tampilkan saja */ }
  const STEPS = [
    { title: 'Welcome to Zoo Toss!', text: touch
        ? 'Use the <b>joystick</b> to walk to the <b>pink Throw Pad</b>. Swipe the screen to look around.'
        : 'Walk to the <b>pink Throw Pad</b> with <b>WASD</b>. Drag the mouse to look around.' },
    { title: 'Time your throw', text: touch
        ? 'Tap <b>Throw</b> when the needle is in the <b>green</b>. Green = longest throw.'
        : 'Press <b>Space</b> when the needle is in the <b>green</b>. Green = longest throw.' },
    { title: 'Watch it fly!', text: 'The farther it lands, the wilder the zone and the rarer the animals.' },
    { title: 'Nice catch!', text: 'Animals go to your <b>Pen</b> and earn cash every second. ' + (D.zoneFood
      ? 'Rare animals only bite on <b>their zone\'s food</b>: pick it in your <b>Food Bag</b>.'
      : 'Better food in your <b>Food Bag</b> catches rarer animals.'), next: true },
  ];
  let step = -1;
  const el = document.querySelector('#onboarding');

  function show(i) {
    step = i;
    const st = STEPS[i];
    document.querySelector('#onboard-title').textContent = st.title;
    document.querySelector('#onboard-text').innerHTML = st.text;
    document.querySelector('#onboard-next').classList.toggle('hidden', !st.next);
    document.querySelector('#onboard-skip').classList.toggle('hidden', !!st.next);
    document.querySelector('#onboard-dots').innerHTML = STEPS.map((_, j) => `<i class="${j <= i ? 'is-on' : ''}"></i>`).join('');
    el.classList.remove('hidden');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    world.setPadMarker(i === 0);
  }
  function finish() {
    done = true;
    try { localStorage.setItem(KEY, '1'); } catch { /* abaikan */ }
    el.classList.add('hidden');
    world.setPadMarker(false);
  }
  document.querySelector('#onboard-skip').onclick = () => { sfx.playPop(); finish(); };
  document.querySelector('#onboard-next').onclick = () => { sfx.playPop(); finish(); };

  if (!done) show(0);
  return {
    tick(onPad) {
      if (done) return;
      if (step === 0 && onPad) show(1);
      else if (step === 1 && !onPad) show(0); // keluar dari pad sebelum melempar → kembali ke langkah 1
    },
    onThrow() { if (!done && step <= 1) show(2); },
    onCatch() { if (!done && step === 2) show(3); },
  };
})();

// Tick loop for distance, wind, zone info & stamina
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

  // HP: berdiri di area → otomatis masuk & terkunci di area itu
  if (isTouchUI && !activeArea && !cineMode && !world.isThrowing && !anyModalOpen() && world.currentStation) {
    enterArea(world.currentStation.id);
  }

  // Panel lempar hanya muncul saat berdiri di pad pink (dan selama lemparan berjalan)
  const onPad = world.currentStation?.id === 'throw' || world.isThrowing;
  throwPanel.classList.toggle('hidden', !onPad);
  onboarding.tick(onPad);

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

// Tombol AUTO dihapus dari panel lempar; save lama yang masih AUTO: ON dimatikan supaya tidak melempar sendiri
state.autoThrow = false;

// Modal helpers — hanya satu panel terbuka; tutup dengan X, klik latar, atau Esc
const MODALS = ['shop', 'plot', 'quests', 'index', 'rank', 'food', 'menu', 'changelog'];
const anyModalOpen = () => MODALS.some(id => !document.querySelector(`#modal-${id}`).classList.contains('hidden'))
  || !document.querySelector('#modal-confirm').classList.contains('hidden');

function syncModalState() {
  const open = anyModalOpen();
  world.setInputBlocked(open);
  // Camera lock: lepas kursor selama menu terbuka, kunci lagi setelah ditutup
  if (camLock) world.setCameraLock(!open);
  syncCamLockUI();
}

function openModal(id) {
  sfx.playPop();
  MODALS.forEach(other => other !== id && closeModal(other, true));
  if (id === 'food') renderFoodBagModal();
  const m = document.querySelector(`#modal-${id}`);
  if (m) m.classList.remove('hidden');
  syncModalState();
}

function closeModal(id, silent = false) {
  const m = document.querySelector(`#modal-${id}`);
  if (m) m.classList.add('hidden');
  if (!silent) syncModalState();
}
const toggleModal = (id, onOpen) => {
  if (!document.querySelector(`#modal-${id}`).classList.contains('hidden')) { closeModal(id); return; }
  onOpen?.();
  openModal(id);
};

MODALS.forEach(id => {
  const btnClose = document.querySelector(`#btn-close-${id}`);
  if (btnClose) btnClose.onclick = () => closeModal(id);
  // klik di latar gelap juga menutup
  document.querySelector(`#modal-${id}`).addEventListener('click', (e) => { if (e.target.id === `modal-${id}`) closeModal(id); });
});

// ---------- Camera lock (L) ----------
let camLock = false;
function syncCamLockUI() {
  const locked = camLock && !anyModalOpen();
  document.querySelector('.zt-root').classList.toggle('is-camlock', camLock);
  document.querySelector('#btn-toggle-camlock').classList.toggle('is-on', camLock);
  document.querySelector('#camlock-crosshair').classList.toggle('hidden', !locked || world.isThrowing);
  document.querySelector('#camlock-hint').classList.toggle('hidden', !locked || world.isThrowing);
}
function setCamLock(on) {
  camLock = on;
  world.setCameraLock(on && !anyModalOpen());
  syncCamLockUI();
}
document.querySelector('#btn-toggle-camlock').onclick = () => { sfx.playPop(); setCamLock(!camLock); };
// Esc dari browser melepas pointer lock -> anggap camera lock dimatikan (kecuali sengaja dilepas karena menu terbuka)
document.addEventListener('pointerlockchange', () => {
  if (!document.pointerLockElement && camLock && !anyModalOpen()) setCamLock(false);
});

// ---------- Hotkey ----------
// Space Throw · F Food Bag · Q Quests · I Index · R Rank · M Sound · L Camera lock · Esc tutup menu
// Di stasiun: E latihan · T toko · P kandang. WASD/panah/Shift diurus robloxSeamlessWorld.js.
const STATION_KEYS = { KeyE: ['gym', () => togglePullUp()], KeyT: ['shop', () => toggleModal('shop')], KeyP: ['plot', () => toggleModal('plot')] };
const MENU_KEYS = {
  KeyF: () => toggleModal('food'),
  KeyQ: () => toggleModal('quests', renderQuestsModal),
  KeyI: () => toggleModal('index', () => { indexHasNew = false; updateDots(); renderIndexModal(); }),
  KeyR: () => toggleModal('rank', updateRankModal),
  KeyC: () => toggleModal('changelog', renderChangelogModal),
  KeyM: () => toggleSound(),
  KeyL: () => { sfx.playPop(); setCamLock(!camLock); },
};
window.addEventListener('keydown', (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '')) return;
  if (e.key === 'Escape') {
    if (confirmResolve) { confirmResolve(false); return; }
    if (cineMode && !anyModalOpen()) { exitCinematic(); return; }
    MODALS.forEach(id => closeModal(id, true));
    syncModalState();
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'Space') {
    // Jangan biarkan Space "mengklik" ulang tombol yang terakhir difokus
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (!e.repeat && !anyModalOpen()) triggerThrow();
    return;
  }
  if (e.repeat || confirmResolve) return;
  if (cineMode === 'biome') return;                          // selama View Biome hanya Esc
  if (cineMode === 'training' && e.code !== 'KeyE') return;  // selama latihan hanya E (berhenti) / Esc
  if (MENU_KEYS[e.code]) { MENU_KEYS[e.code](); return; }
  const st = STATION_KEYS[e.code];
  if (st && world.currentStation?.id === st[0]) st[1]();
});

document.querySelector('#btn-open-quests').onclick = () => { renderQuestsModal(); openModal('quests'); };
document.querySelector('#btn-open-index').onclick = () => { indexHasNew = false; updateDots(); renderIndexModal(); openModal('index'); };
document.querySelector('#btn-open-rank').onclick = () => { updateRankModal(); openModal('rank'); };
document.querySelector('#btn-open-changelog').onclick = () => { renderChangelogModal(); openModal('changelog'); };

// ---------- Ganti difficulty (Easy = testing dev, Hard = demo) ----------
// Tiap mode punya save sendiri (gameState.js), jadi berpindah mode = muat ulang dengan save mode itu.
async function switchMode(mode) {
  if (mode === MODE) return;
  const ok = await confirmDialog({
    title: `Switch to ${mode === 'easy' ? 'Easy' : 'Hard'}?`,
    html: `${mode === 'easy' ? 'Fast progress for <b>dev testing</b>.' : 'Slower, real pace for the <b>demo</b>.'}<br>
      Each mode keeps its own save. The game will reload.`,
    okLabel: 'Switch',
    okClass: 'zt-btn--primary',
  });
  if (!ok) return;
  const url = new URL(location.href);
  url.searchParams.set('mode', mode);
  location.href = url.toString();
}
document.querySelector('#btn-mode').onclick = () => { sfx.playPop(); switchMode(MODE === 'easy' ? 'hard' : 'easy'); };
document.querySelectorAll('[data-mode]').forEach(b => { b.onclick = () => { sfx.playPop(); switchMode(b.dataset.mode); }; });

// ---------- Menu HP ----------
function renderMobileMenu() {
  const z = zoneOfDistance(0);
  document.querySelector('#mmenu-zone').textContent = document.querySelector('#hud-zone-name').textContent || z.name;
  document.querySelector('#mmenu-zone-swatch').style.background = document.querySelector('#hud-zone-swatch').style.background;
  const mult = state.getRebirthMultiplier();
  document.querySelector('#mmenu-rb-count').textContent = `${state.rebirthCount}x`;
  document.querySelector('#mmenu-rb-desc').textContent = `Income & Power ×${+mult.toFixed(2)} · keeps animals, food & Index`;
  document.querySelector('#mmenu-rb-next').textContent = `Next: ×${+(mult + D.rebirthBonus).toFixed(2)} for $${formatNum(state.rebirthCost)}`;
  const rb = document.querySelector('#mmenu-rebirth');
  rb.classList.toggle('is-short', !state.canRebirth());
  document.querySelector('#mmenu-sound').textContent = `Sound: ${sfx.enabled ? 'On' : 'Off'}`;
  document.querySelector('#mmenu-wallet').textContent = document.querySelector('#wallet-btn-text').textContent;
  document.querySelector('[data-mm="changelog"]').classList.toggle('zt-dot', changelogUnseen());
  document.querySelectorAll('[data-mm="quests"], [data-mm="index"]').forEach(b =>
    b.classList.toggle('zt-dot', document.querySelector(`#btn-open-${b.dataset.mm}`).classList.contains('zt-dot')));
}
document.querySelector('#btn-mobile-menu').onclick = () => { renderMobileMenu(); openModal('menu'); };
document.querySelector('#mmenu-rebirth').onclick = () => document.querySelector('#btn-shop-rebirth').click();
document.querySelectorAll('[data-mm]').forEach(b => {
  b.onclick = () => {
    const id = b.dataset.mm;
    if (id === 'sound') { toggleSound(); renderMobileMenu(); return; }
    if (id === 'wallet') { closeModal('menu'); document.querySelector('#btn-connect-wallet').click(); return; }
    document.querySelector(`#btn-open-${id}`).click(); // membuka modal tujuan (menu tertutup otomatis)
  };
});

function toggleSound() {
  sfx.enabled = !sfx.enabled;
  document.querySelector('#sound-icon').innerHTML = sfx.enabled ? SPEAKER_ON : SPEAKER_OFF;
}
document.querySelector('#btn-toggle-sound').onclick = () => toggleSound();
document.querySelector('#btn-food-bag').onclick = () => openModal('food');

// Web3 (Base Sepolia testnet, USDC) — logika dari tim (web3Manager.js), tampilan versi art direction
document.querySelector('#btn-connect-wallet').onclick = async () => {
  sfx.playPop();
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

// Mobile MetaMask Guidance Handlers
window.addEventListener('web3:showMobileModal', (e) => {
  const url = e.detail?.url || window.location.href;
  const modalEl = document.querySelector('#modal-metamask-mobile');
  const inputEl = document.querySelector('#mobile-mm-url');
  if (inputEl) inputEl.value = url;
  if (modalEl) modalEl.classList.remove('hidden');
  syncModalState();
});

document.querySelector('#btn-close-mobile-mm').onclick = () => {
  document.querySelector('#modal-metamask-mobile').classList.add('hidden');
  syncModalState();
};

document.querySelector('#btn-copy-mm-url').onclick = () => {
  const inputEl = document.querySelector('#mobile-mm-url');
  if (inputEl) {
    inputEl.select();
    navigator.clipboard?.writeText(inputEl.value);
    showNotice('URL COPIED! PASTE IN METAMASK BROWSER');
    document.querySelector('#btn-copy-mm-url').textContent = 'Copied!';
    setTimeout(() => {
      document.querySelector('#btn-copy-mm-url').textContent = 'Copy URL';
    }, 2000);
  }
};

document.querySelector('#btn-launch-mm-app').onclick = () => {
  web3Manager.openMetaMaskDeepLink();
};

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

// 1. TELUR AJAIB (GACHA CS2 EGG ROULETTE)
let isGachaSpinning = false;
let currentGachaOutcome = null;

function setupGachaRoulette(targetZone) {
  const track = document.querySelector('#gacha-track');
  track.innerHTML = '';
  track.style.transition = 'none';
  track.style.transform = 'translateX(0px)';
  document.querySelector('#gacha-result').classList.add('hidden');
  document.querySelector('#btn-gacha-spin').classList.add('hidden');
  document.querySelector('#btn-gacha-close').classList.remove('hidden');

  // Ambil hewan-hewan dari targetZone (atau gabungan zone hingga biome terjauh)
  const availableAnimals = targetZone.animals;
  const pool = [];

  // CS2 style ribbon: buat ~60-70 kartu items berurutan
  // Index 50 adalah target item pemenang
  const winnerIndex = 48;
  // Peluang pemenang: telur ajaib menargetkan hewan paling langka (rarity tertinggi di zone)
  const sortedByRarity = [...availableAnimals].sort((a, b) => {
    return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
  });
  // 65% kemungkinan dapat Epic / Legendary / Mythic dari biome tersebut
  let winningAnimal = sortedByRarity[0];
  const roll = Math.random();
  if (roll < 0.60) {
    winningAnimal = sortedByRarity[0]; // Tier paling atas (Mythic/Legendary/Epic)
  } else if (roll < 0.90 && sortedByRarity.length > 1) {
    winningAnimal = sortedByRarity[1];
  } else {
    winningAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
  }

  // Mutasi acak untuk pemenang
  const mutRoll = Math.random() * 100;
  let winMutation = 'Normal';
  if (mutRoll < 2.0) winMutation = 'Rainbow';
  else if (mutRoll < 8.0) winMutation = 'Emerald';
  else if (mutRoll < 22.0) winMutation = 'Diamond';
  else if (mutRoll < 50.0) winMutation = 'Gold';

  currentGachaOutcome = {
    ...winningAnimal,
    mutation: winMutation,
    zoneName: targetZone.name
  };

  for (let i = 0; i < 60; i++) {
    const itemData = (i === winnerIndex)
      ? currentGachaOutcome
      : availableAnimals[Math.floor(Math.random() * availableAnimals.length)];

    const card = document.createElement('div');
    card.className = `zt-gacha-item zt-gacha-rarity--${itemData.rarity}`;
    card.id = `gacha-item-${i}`;
    card.innerHTML = `
      <img src="${getAnimalThumb(itemData.id, itemData.color)}" class="zt-gacha-item__thumb" alt="${itemData.name}">
      <div class="zt-gacha-item__name">${itemData.name}</div>
      ${itemData.mutation && itemData.mutation !== 'Normal' ? `<span class="zt-mut" style="font-size:9px; padding:0 4px">${itemData.mutation}</span>` : `<span class="zt-tag" style="font-size:9px; padding:0 4px">${itemData.rarity}</span>`}
      <div class="zt-gacha-item__bar"></div>
    `;
    track.appendChild(card);
  }

  return { winnerIndex, outcome: currentGachaOutcome };
}

function spinCS2Egg() {
  if (isGachaSpinning) return;
  const farZone = state.getFarthestZone();
  const eggCost = Math.max(250, Math.round(500 * (state.maxReachedZoneIndex + 1) * D.foodCostMul));

  if (state.money < eggCost) {
    showNotice(`NOT ENOUGH CASH FOR EGG ($${formatNum(eggCost)})`);
    return;
  }
  state.money -= eggCost;
  state.save();
  updateUI();

  // Buka CS2 Overlay
  closeModal('shop');
  const overlay = document.querySelector('#gacha-overlay');
  overlay.classList.remove('hidden');
  document.querySelector('#gacha-biome-title').textContent = `BIOME: ${farZone.name.toUpperCase()} · ${zoneRange(farZone)}`;

  const { winnerIndex, outcome } = setupGachaRoulette(farZone);
  isGachaSpinning = true;
  sfx.playPop();

  // CS2 Deceleration Spin
  // Card width 124px + 12px gap = 136px per item
  const itemWidth = 136;
  const containerWidth = document.querySelector('.zt-gacha-roulette-container').offsetWidth || 600;
  // Center needle di 50% lebar kontainer
  const centerOffset = containerWidth / 2 - 62;
  // Jitter sedikit di dalam kartu agar terasa fisik CS2 asli
  const jitter = Math.floor(Math.random() * 40 - 20);
  const targetX = -(winnerIndex * itemWidth - centerOffset + jitter);

  const track = document.querySelector('#gacha-track');
  // 5 detik spin dengan cubic bezier CS:GO / CS2 case unboxing
  setTimeout(() => {
    track.style.transition = 'transform 4.8s cubic-bezier(0.12, 0.8, 0.2, 1)';
    track.style.transform = `translateX(${targetX}px)`;
  }, 50);

  // Sound ticking effects saat roulette berputar
  let ticks = 0;
  const tickInterval = setInterval(() => {
    ticks++;
    if (ticks % 3 === 0) sfx.playPop();
    if (ticks > 24) clearInterval(tickInterval);
  }, 180);

  setTimeout(() => {
    isGachaSpinning = false;
    clearInterval(tickInterval);
    sfx.playCatch(outcome.rarity, outcome.mutation);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    const winCard = document.querySelector(`#gacha-item-${winnerIndex}`);
    if (winCard) winCard.classList.add('is-selected');

    const resultBox = document.querySelector('#gacha-result');
    resultBox.classList.remove('hidden');
    document.querySelector('#gacha-result-name').textContent = `🎉 UNLOCKED: ${outcome.name} [${outcome.rarity}${outcome.mutation !== 'Normal' ? ' · ' + outcome.mutation : ''}]`;
    document.querySelector('#gacha-result-desc').textContent = `From ${outcome.zoneName}! Adds +$${formatNum(state.incomeOf(outcome))}/s to your pen!`;

    // Berikan reward ke inventory
    const res = state.addAnimal(outcome);
    updateUI();
    showNotice(`UNBOXED ${outcome.name.toUpperCase()}!`);

    document.querySelector('#btn-gacha-spin').classList.remove('hidden');
  }, 5000);
}

document.querySelector('#btn-shop-open-egg').onclick = () => spinCS2Egg();
document.querySelector('#btn-gacha-spin').onclick = () => spinCS2Egg();
document.querySelector('#btn-gacha-close').onclick = () => {
  if (isGachaSpinning) return;
  document.querySelector('#gacha-overlay').classList.add('hidden');
  syncModalState();
};

// 2. MAKANAN AJAIB (1, 5, 10 PCS)
function buyMagicFood(qty, cost) {
  if (state.money >= cost) {
    state.money -= cost;
    state.addMagicFood(qty);
    sfx.playLevelUp();
    showNotice(`BOUGHT ${qty}X MAGIC FOOD! (+3.5X BIOME LUCK)`);
    updateUI();
  } else {
    showNotice(`NOT ENOUGH CASH! NEED $${formatNum(cost)}`);
  }
}
document.querySelector('#btn-buy-magic-1').onclick = () => buyMagicFood(1, 100);
document.querySelector('#btn-buy-magic-5').onclick = () => buyMagicFood(5, 450);
document.querySelector('#btn-buy-magic-10').onclick = () => buyMagicFood(10, 850);

// 3. LEVEL POWER (% DARI POWER SAAT INI)
function buyPowerPercent(pct) {
  const res = state.buyPowerPercent(pct);
  if (res.success) {
    sfx.playLevelUp();
    showNotice(`POWER BOOSTED +${formatNum(res.gained)} (+${pct}%)!`);
    updateUI();
  } else {
    showNotice(`NEED $${formatNum(res.cost)} CASH!`);
  }
}
document.querySelector('#btn-buy-power-pct5').onclick = () => buyPowerPercent(5);
document.querySelector('#btn-buy-power-pct10').onclick = () => buyPowerPercent(10);

// 4. INSTANT CASH (% CONVERSION DARI POWER)
function buyCashWithPower(pct) {
  const res = state.buyCashWithPowerPercent(pct);
  if (res.success) {
    sfx.playCoins();
    showNotice(`CONVERTED ${pct}% POWER TO +$${formatNum(res.cashGain)} CASH!`);
    updateUI();
  } else {
    showNotice(res.reason || 'POWER TOO LOW!');
  }
}
document.querySelector('#btn-buy-cash-pct5').onclick = () => buyCashWithPower(5);
document.querySelector('#btn-buy-cash-pct10').onclick = () => buyCashWithPower(10);

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
      html: `You'll lose your cash and Power, but keep your animals, food and Index.<br><b>+${Math.round(D.rebirthBonus * 100)}% income and Power forever.</b>`,
      okLabel: 'Rebirth',
      okClass: 'zt-btn--accent',
    });
    if (ok) {
      state.doRebirth();
      sfx.playLevelUp();
      updateUI();
      renderMobileMenu();
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
      <button id="btn-view-biome" class="zt-btn zt-btn--primary zt-btn--sm zt-zoneinfo__view">View Biome</button>
    </div>
    <div class="zt-zoneinfo__fx" style="margin-top:-8px">${z.gimmick}</div>
    <div class="zt-grid">${cards}</div>
    <div>
      <div class="flex justify-between"><span class="zt-title" style="font-size:14px">${z.name} ${found} / ${z.animals.length}</span></div>
      <div class="zt-bar"><i style="width:${(found / z.animals.length) * 100}%"></i></div>
    </div>
  `;
  document.querySelector('#btn-view-biome').onclick = () => { sfx.playPop(); startBiomeView(z); };
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
    updateCineInfo();
  }
  const cps = state.getCurrentCps();
  if (cps > 0) {
    state.money += cps;
    state.totalEarned += cps;
    setStat('#hud-money', `$${formatNum(state.money)}`);
    if (!document.querySelector('#modal-food').classList.contains('hidden')) renderFoodBagModal(); // harga ikut berubah saat uang cukup
  }
  updateDots();
}, 1000);

updateUI();
