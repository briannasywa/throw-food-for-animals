// Zoo Toss — tebing voxel bertingkat di kiri-kanan lintasan, bertema per zona.
// Warna dari art-direction/palette.json (biome + Shared.cliff). Semua kotak satu zona digabung per bahan
// (mergeGeometries) supaya ribuan blok tetap hanya beberapa draw call.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// rock = badan tebing, dark = teras paling belakang, cap = lapisan atas, band = garis lapisan batu,
// deco = jenis hiasan di atas teras, glow = warna hiasan yang berpendar (bloom)
const THEMES = {
  lobby:     { rock: '#9C8F84', dark: '#7A6F66', cap: '#7AD15A', band: '#B3A699', deco: 'tree', leaf: '#3CCB5A', trunk: '#8B5A2B', heightMul: 0.85 },
  farm:      { rock: '#B3A08A', dark: '#93806C', cap: '#A3E38A', band: '#FFE29A', deco: 'hay', leaf: '#8EE06A', trunk: '#8B5A2B', heightMul: 0.7 },
  jungle:    { rock: '#7A6F66', dark: '#5E5650', cap: '#13703A', band: '#2FA84F', deco: 'jungle', leaf: '#13703A', trunk: '#6B4423', flower: '#FF9A3D', heightMul: 1.15 },
  toxic:     { rock: '#5B4A6B', dark: '#3A2F4F', cap: '#2C2340', band: '#4A3B5C', deco: 'slime', glow: '#8CFF3A', glowStrength: 0.35, trunk: '#5B4A6B', heightMul: 1.0 },
  lava:      { rock: '#3B2A2A', dark: '#2A1D1D', cap: '#4A3434', band: '#2A1D1D', deco: 'lava', glow: '#FF5A1F', ember: '#FFB33A', heightMul: 1.35 },
  glow_sea:  { rock: '#1F3A6B', dark: '#17305A', cap: '#2A4A80', band: '#17305A', deco: 'coral', glow: '#3FF0FF', coral: '#FF5FD2', heightMul: 1.0 },
  christmas: { rock: '#9C8F84', dark: '#7A6F66', cap: '#F2E6D8', band: '#E3D2C0', deco: 'pine', leaf: '#1E8C4E', trunk: '#8B5A2B', candy: '#E8384F', heightMul: 0.95 },
  frost:     { rock: '#7FD3FF', dark: '#5FB5E6', cap: '#F2F7FF', band: '#A9DDF7', deco: 'ice', ice: '#CFEFFF', heightMul: 1.25 },
  galaxy:    { rock: '#2A1B4F', dark: '#1E1440', cap: '#3A2A66', band: '#B57BFF', deco: 'crystal', glow: '#FFF27A', nebula: '#B57BFF', heightMul: 1.5 },
};

// Teras: jarak dari tepi lintasan, lebar, langkah blok sepanjang Z, tinggi min–maks
const TIERS = [
  { inner: 15, width: 8,  step: 8,  hMin: 5,  hMax: 8 },
  { inner: 23, width: 10, step: 12, hMin: 11, hMax: 17 },
  { inner: 33, width: 16, step: 16, hMin: 20, hMax: 32 },
];

// angka acak tetap (sama setiap kali dimuat), supaya bentuk tebing tidak berubah-ubah
const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function buildZoneCliffs(scene, zone, startZ, endZ) {
  const t = THEMES[zone.id] || THEMES.lobby;
  const parts = {}; // nama bahan -> daftar geometri
  const box = (mat, w, h, d, x, y, z) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y, z);
    (parts[mat] ||= []).push(g);
  };
  const seed = zone.minDist * 0.37 + 1;
  const lengthZ = endZ - startZ;

  for (const side of [-1, 1]) {
    TIERS.forEach((tier, ti) => {
      const n = Math.ceil(lengthZ / tier.step);
      for (let i = 0; i < n; i++) {
        const k = seed + side * 1000 + ti * 100 + i;
        const z0 = startZ + i * tier.step;
        const d = Math.min(tier.step, endZ - z0);
        if (d <= 0.5) continue;
        const zc = z0 + d / 2;
        const h = (tier.hMin + rnd(k) * (tier.hMax - tier.hMin)) * t.heightMul;
        const jx = (rnd(k + 0.5) - 0.5) * 2;           // tepi teras sedikit maju-mundur, tidak lurus
        const w = tier.width + Math.abs(jx);
        const xc = side * (tier.inner + jx + w / 2);
        const rock = ti === 2 ? 'dark' : 'rock';

        box(rock, w, h, d, xc, h / 2, zc);
        // lapisan atas (rumput/salju/kerak) sedikit lebih lebar → terlihat seperti tepi voxel
        box('cap', w + 0.6, 1.2, d + 0.2, xc, h + 0.6, zc);
        // garis lapisan batu di muka tebing yang menghadap lintasan
        if (ti > 0 && rnd(k + 1.3) > 0.35) {
          box('band', 0.4, 1.0, d * 0.9, side * (tier.inner + jx) - side * 0.15, h * (0.35 + rnd(k + 2) * 0.3), zc);
        }
        // batu pecahan di kaki teras pertama
        if (ti === 0 && rnd(k + 3.1) > 0.6) {
          const s = 1.6 + rnd(k + 4) * 1.6;
          box('rock', s, s * 0.8, s, side * (tier.inner - 0.9), s * 0.4, zc + (rnd(k + 5) - 0.5) * d * 0.6);
        }

        addDeco(box, t, side, tier, ti, k, xc, h + 1.2, zc, d, w);
      }
    });
  }

  const mats = {
    rock: new THREE.MeshLambertMaterial({ color: t.rock }),
    dark: new THREE.MeshLambertMaterial({ color: t.dark }),
    cap: new THREE.MeshLambertMaterial({ color: t.cap }),
    band: new THREE.MeshLambertMaterial({ color: t.band }),
    leaf: new THREE.MeshLambertMaterial({ color: t.leaf || '#3CCB5A' }),
    trunk: new THREE.MeshLambertMaterial({ color: t.trunk || '#8B5A2B' }),
    accent: new THREE.MeshLambertMaterial({ color: t.flower || t.coral || t.candy || t.ember || t.nebula || t.ice || '#FF3D7F' }),
    ice: new THREE.MeshLambertMaterial({ color: t.ice || '#CFEFFF', transparent: true, opacity: 0.85 }),
    glow: new THREE.MeshLambertMaterial({ color: t.glow || '#FFFFFF', emissive: t.glow || '#000000', emissiveIntensity: t.glow ? (t.glowStrength ?? 0.7) : 0 }),
  };
  const group = new THREE.Group();
  group.name = `cliffs-${zone.id}`;
  for (const [name, geos] of Object.entries(parts)) {
    const mesh = new THREE.Mesh(mergeGeometries(geos), mats[name]);
    mesh.castShadow = name !== 'glow';
    mesh.receiveShadow = true;
    group.add(mesh);
    geos.forEach(g => g.dispose());
  }
  scene.add(group);
  return group;
}

// Hiasan di atas teras, sesuai tema zona
function addDeco(box, t, side, tier, ti, k, xc, top, zc, d, w) {
  const r = rnd(k + 7.7);
  const ox = xc + (rnd(k + 8) - 0.5) * (w - 3);
  const oz = zc + (rnd(k + 9) - 0.5) * (d - 3);
  switch (t.deco) {
    case 'tree':
    case 'jungle':
      if (r > (t.deco === 'jungle' ? 0.25 : 0.45)) {
        const s = 0.8 + rnd(k + 10) * 0.6;
        box('trunk', 1.2 * s, 4 * s, 1.2 * s, ox, top + 2 * s, oz);
        box('leaf', 5 * s, 3 * s, 5 * s, ox, top + 5 * s, oz);
        box('leaf', 3 * s, 2.4 * s, 3 * s, ox, top + 7.4 * s, oz);
        if (t.deco === 'jungle' && rnd(k + 11) > 0.5) box('accent', 1, 1, 1, ox + 2.4 * s, top + 5.5 * s, oz);
      }
      // sulur hijau menjuntai di muka tebing (Jungle)
      if (t.deco === 'jungle' && ti > 0 && rnd(k + 12) > 0.4) {
        const len = 3 + rnd(k + 13) * 5;
        box('leaf', 0.6, len, 1.4, side * (tier.inner) - side * 0.2, top - 1.2 - len / 2, zc + (rnd(k + 14) - 0.5) * d * 0.6);
      }
      break;
    case 'hay':
      if (r > 0.55) {
        box('band', 3, 2, 2.2, ox, top + 1, oz);
        if (rnd(k + 10) > 0.5) box('band', 2.2, 1.6, 2, ox + 0.4, top + 2.8, oz);
      } else if (r > 0.3) {
        box('leaf', 2.4, 1.4, 2.4, ox, top + 0.7, oz);
      }
      break;
    case 'slime':
      // kolam lendir di atas + tetesan lendir menuruni muka tebing
      if (r > 0.7) box('glow', Math.min(w - 3, 3), 0.25, Math.min(d - 3, 3), ox, top + 0.13, oz);
      if (ti < 2 && rnd(k + 10) > 0.7) {
        const len = 2 + rnd(k + 11) * 4;
        box('glow', 0.35, len, 1.2, side * tier.inner - side * 0.2, top - 1.2 - len / 2, zc);
      }
      if (rnd(k + 12) > 0.75) { // pohon mati
        box('trunk', 0.9, 6, 0.9, ox, top + 3, oz);
        box('trunk', 2.6, 0.7, 0.7, ox + 1, top + 5, oz);
      }
      break;
    case 'lava':
      // retakan lava menyala di muka tebing + kolam lava di atas
      if (ti < 2 && r > 0.35) {
        const len = 3 + rnd(k + 10) * (top - 3);
        box('glow', 0.35, Math.max(1, len), 0.8, side * tier.inner - side * 0.2, Math.max(0.5, top - 1.2 - len / 2), zc + (rnd(k + 11) - 0.5) * d * 0.5);
      }
      if (rnd(k + 12) > 0.6) box('glow', Math.min(w - 2, 4), 0.25, Math.min(d - 2, 4), ox, top + 0.13, oz);
      if (rnd(k + 13) > 0.8) box('accent', 1.2, 1.2, 1.2, ox, top + 0.6, oz);
      break;
    case 'coral':
      if (r > 0.35) {
        const h = 2 + rnd(k + 10) * 3;
        box(rnd(k + 11) > 0.5 ? 'glow' : 'accent', 0.9, h, 0.9, ox, top + h / 2, oz);
        box('accent', 0.8, h * 0.6, 0.8, ox + 1.1, top + h * 0.3, oz + 0.4);
      }
      break;
    case 'pine':
      if (r > 0.4) {
        const s = 0.8 + rnd(k + 10) * 0.5;
        box('trunk', 1, 2 * s, 1, ox, top + s, oz);
        box('leaf', 4.4 * s, 2 * s, 4.4 * s, ox, top + 2.8 * s, oz);
        box('leaf', 3 * s, 2 * s, 3 * s, ox, top + 4.6 * s, oz);
        box('cap', 1.6 * s, 1.4 * s, 1.6 * s, ox, top + 6.2 * s, oz); // salju di pucuk
      } else if (r > 0.25) {
        box('accent', 0.6, 3, 0.6, ox, top + 1.5, oz); // permen tongkat
        box('cap', 0.6, 0.6, 0.6, ox, top + 2.2, oz);
      }
      break;
    case 'ice':
      if (r > 0.35) {
        const h = 3 + rnd(k + 10) * 6;
        box('ice', 1.4, h, 1.4, ox, top + h / 2, oz);
        box('ice', 1, h * 0.6, 1, ox + 1.3, top + h * 0.3, oz - 0.6);
      }
      break;
    case 'crystal':
      if (r > 0.4) {
        const h = 2 + rnd(k + 10) * 5;
        box('glow', 1, h, 1, ox, top + h / 2, oz);
        box('accent', 0.8, h * 0.7, 0.8, ox + 1, top + h * 0.35, oz + 0.5);
      }
      // bintang kecil melayang di atas tebing
      if (rnd(k + 11) > 0.7) box('glow', 0.6, 0.6, 0.6, ox, top + 8 + rnd(k + 12) * 8, oz);
      break;
  }
}
