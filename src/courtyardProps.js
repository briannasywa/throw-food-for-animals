// Zoo Toss — bangunan halaman (courtyard): pull-up bar, toko, dan kandang hewan.
// Semua dari kotak voxel, warna dari palette.json (core + Shared). Kotak statis digabung lewat ChunkBatcher
// (vertex color) supaya tiap bangunan hanya 2–3 draw call. Bagian yang bergerak (koin toko) dibuat terpisah.
import * as THREE from 'three';
import { ChunkBatcher } from './chunkBatcher.js';

const C = {
  ink: '#1B2233', cream: '#FFF4DC', panel: '#F2D9A6', orange: '#FF7A1A', orangeD: '#D95F00',
  pink: '#FF3D7F', yellow: '#FFC21A', yellowD: '#E0A000', green: '#3CCB5A', greenD: '#2FA84F', grass: '#7AD15A',
  blue: '#2F8CFF', red: '#E8384F', wood: '#8B5A2B', woodD: '#6B4423', woodL: '#B07A45',
  steel: '#8A94A6', steelL: '#D7DEE8', rubber: '#2B3242', hay: '#FFE29A', hayD: '#E8C46E', white: '#FFFFFF',
};

// Tinggi palang pull-up (dihitung dari ukuran Zookeeper skala 0.3: bahu ±1.77, lengan ±0.59)
export const PULLUP = { barY: 3.95, barZ: 0.32, hangY: 1.62, topY: 2.12 };

/* ------------------------------------------------------------------ */
/* Pull-up bar / area latihan. Titik (0,0,0) = posisi pemain saat latihan. */
export function buildGym() {
  const group = new THREE.Group();
  const b = new ChunkBatcher(1000);
  const box = (c, w, h, d, x, y, z) => b.box('solid', c, w, h, d, x, y, z);

  // Matras karet dengan bingkai oranye
  box(C.rubber, 11, 0.2, 11, 0, 0.1, 0);
  box(C.orange, 11.6, 0.24, 0.5, 0, 0.12, 5.6);
  box(C.orange, 11.6, 0.24, 0.5, 0, 0.12, -5.6);
  box(C.orange, 0.5, 0.24, 11.6, 5.6, 0.12, 0);
  box(C.orange, 0.5, 0.24, 11.6, -5.6, 0.12, 0);

  // Dua tiang baja + kaki penyangga + cincin oranye
  const z = PULLUP.barZ;
  for (const sx of [-1, 1]) {
    const x = sx * 2.3;
    box(C.steel, 0.45, 5.6, 0.45, x, 3.0, z);
    box(C.ink, 1.2, 0.35, 1.8, x, 0.38, z);          // kaki
    box(C.orange, 0.55, 0.35, 0.55, x, 1.3, z);      // cincin
    box(C.orange, 0.55, 0.35, 0.55, x, 3.1, z);
    box(C.steelL, 0.6, 0.3, 0.6, x, 5.85, z);        // tutup atas
  }
  // Palang + pegangan hitam di posisi tangan
  box(C.steelL, 4.4, 0.2, 0.2, 0, PULLUP.barY, z);
  box(C.ink, 0.5, 0.26, 0.26, -0.55, PULLUP.barY, z);
  box(C.ink, 0.5, 0.26, 0.26, 0.55, PULLUP.barY, z);

  // Papan tanda di atas: oranye dengan ikon dumbel putih
  // (bawah papan di 6.0, di atas topi saat posisi paling atas ±5.4)
  const sy = 6.75;
  box(C.orange, 4.6, 1.3, 0.3, 0, sy, z);
  box(C.ink, 4.8, 0.2, 0.36, 0, sy - 0.7, z);
  box(C.white, 1.6, 0.22, 0.12, 0, sy, z + 0.18);
  for (const sx of [-1, 1]) {
    box(C.white, 0.3, 0.8, 0.12, sx * 0.85, sy, z + 0.18);
    box(C.white, 0.25, 0.55, 0.12, sx * 1.15, sy, z + 0.18);
  }

  // Rak dumbel (kanan)
  box(C.ink, 0.25, 1.6, 0.25, 4.0, 0.9, -1.6);
  box(C.ink, 0.25, 1.6, 0.25, 4.0, 0.9, 1.6);
  box(C.ink, 0.25, 0.25, 3.5, 4.0, 1.15, 0);
  box(C.ink, 0.25, 0.25, 3.5, 4.0, 0.55, 0);
  [-1.1, 0, 1.1].forEach((dz, i) => {
    const col = [C.blue, C.pink, C.orange][i];
    box(C.steelL, 0.9, 0.14, 0.14, 4.0, 1.38, dz);
    box(col, 0.22, 0.45, 0.45, 3.65, 1.38, dz);
    box(col, 0.22, 0.45, 0.45, 4.35, 1.38, dz);
  });

  // Bangku latihan (belakang)
  box(C.ink, 0.3, 0.7, 0.3, -1.2, 0.45, -3.6);
  box(C.ink, 0.3, 0.7, 0.3, 1.2, 0.45, -3.6);
  box(C.pink, 3.2, 0.35, 1.1, 0, 0.95, -3.6);

  // Kettlebell & ember kapur (kiri)
  [[-4.0, 1.2, C.yellow], [-4.0, -0.3, C.green], [-4.2, -1.8, C.red]].forEach(([x, zz, col]) => {
    box(col, 0.8, 0.7, 0.8, x, 0.55, zz);
    box(C.ink, 0.5, 0.18, 0.16, x, 1.05, zz);
  });
  box(C.white, 0.9, 0.8, 0.9, -4.1, 0.6, 3.0);
  box(C.steelL, 1.0, 0.12, 1.0, -4.1, 1.06, 3.0);

  b.build(group, 'gym-static');

  // Tetes keringat (aktif saat latihan)
  const sweat = new THREE.Group();
  const sweatMat = new THREE.MeshBasicMaterial({ color: 0x9BEBFF });
  for (let i = 0; i < 6; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), sweatMat);
    d.userData.phase = Math.random();
    sweat.add(d);
  }
  sweat.visible = false;
  group.add(sweat);
  return { group, sweat };
}

/* ------------------------------------------------------------------ */
/* Toko: kios kayu dengan tenda garis oranye-krem, menghadap +Z. */
export function buildShop() {
  const group = new THREE.Group();
  const b = new ChunkBatcher(1000);
  const box = (c, w, h, d, x, y, z) => b.box('solid', c, w, h, d, x, y, z);
  const glow = (c, w, h, d, x, y, z) => b.box('glow', c, w, h, d, x, y, z, 1.5);

  // Lantai papan
  box(C.woodL, 14, 0.4, 10, 0, 0.2, 0);
  for (let i = -3; i <= 3; i++) box(C.wood, 0.12, 0.42, 10, i * 2, 0.21, 0);

  // Dinding belakang & samping, tiang sudut
  box(C.wood, 12, 6, 0.6, 0, 3.4, -3.8);
  box(C.woodD, 12, 0.5, 0.65, 0, 1.2, -3.8);
  box(C.woodD, 12, 0.5, 0.65, 0, 3.6, -3.8);
  box(C.wood, 0.6, 6, 7.6, -6, 3.4, 0);
  box(C.wood, 0.6, 6, 7.6, 6, 3.4, 0);
  for (const sx of [-1, 1]) box(C.woodD, 0.8, 6.8, 0.8, sx * 6.2, 3.4, 3.9);

  // Rak di dinding belakang berisi barang warna-warni
  [1.9, 3.4].forEach((y, row) => {
    box(C.woodD, 10.5, 0.25, 1.1, 0, y, -3.2);
    for (let i = 0; i < 7; i++) {
      const col = [C.orange, C.green, C.pink, C.yellow, C.blue, C.red, C.hay][(i + row * 3) % 7];
      box(col, 0.8, 0.9, 0.8, -4.2 + i * 1.4, y + 0.58, -3.2);
    }
  });

  // Meja konter depan
  box(C.wood, 11, 2.2, 1.6, 0, 1.5, 2.6);
  box(C.cream, 11.6, 0.3, 2.0, 0, 2.75, 2.6);
  box(C.orange, 11.02, 0.4, 1.62, 0, 1.0, 2.6);
  // Barang di konter: tumpukan koin, peti buah, karung
  box(C.yellow, 0.9, 0.25, 0.9, -3.8, 3.03, 2.5);
  box(C.yellow, 0.8, 0.25, 0.8, -3.75, 3.28, 2.55);
  box(C.yellowD, 0.7, 0.25, 0.7, -3.8, 3.53, 2.5);
  box(C.woodL, 2.0, 0.8, 1.2, 0, 3.3, 2.5);
  for (let i = 0; i < 4; i++) box(i % 2 ? C.green : C.orange, 0.42, 0.42, 0.42, -0.65 + i * 0.43, 3.85, 2.5);
  box(C.hay, 1.1, 1.3, 1.0, 3.6, 3.55, 2.5);
  box(C.hayD, 0.6, 0.3, 0.6, 3.6, 4.3, 2.5);

  // Tenda bergaris (oranye / krem) dua tingkat + tepi berumbai
  for (let i = 0; i < 7; i++) {
    const col = i % 2 ? C.cream : C.orange;
    const x = -6 + 1 + i * (12 / 7) + 0.86 - 1;
    box(col, 12 / 7, 0.45, 3.4, x, 6.9, 2.6);
    box(col, 12 / 7, 0.45, 1.8, x, 6.45, 4.9);
    box(col, 12 / 7 - 0.5, 0.7, 0.3, x, 5.95, 5.85); // rumbai
  }
  // Atap
  box(C.orangeD, 13.4, 0.9, 7.6, 0, 7.6, -0.2);
  box(C.cream, 13.6, 0.3, 7.8, 0, 8.15, -0.2);

  // Papan nama di atap dengan ikon koin
  box(C.ink, 7.4, 2.4, 0.5, 0, 9.6, 0.6);
  box(C.yellow, 7.0, 2.0, 0.55, 0, 9.6, 0.6);
  box(C.yellowD, 1.6, 1.6, 0.6, 0, 9.6, 0.62);
  box(C.yellow, 1.1, 1.1, 0.65, 0, 9.6, 0.64);
  box(C.yellowD, 0.3, 0.8, 0.7, 0, 9.6, 0.66);
  for (const sx of [-1, 1]) box(C.ink, 0.35, 1.2, 0.35, sx * 3.0, 8.6, 0.6);

  // Lentera bercahaya di sudut tenda
  for (const sx of [-1, 1]) {
    box(C.ink, 0.1, 0.6, 0.1, sx * 5.4, 5.95, 5.4);
    glow(C.yellow, 0.55, 0.65, 0.55, sx * 5.4, 5.35, 5.4);
    box(C.ink, 0.7, 0.15, 0.7, sx * 5.4, 5.0, 5.4);
  }

  // Tong & peti di samping kios
  for (const [x, z] of [[7.6, 2.8], [7.8, 1.2]]) {
    box(C.wood, 1.4, 1.8, 1.4, x, 0.9, z);
    box(C.ink, 1.5, 0.18, 1.5, x, 0.5, z);
    box(C.ink, 1.5, 0.18, 1.5, x, 1.4, z);
  }
  box(C.woodL, 1.6, 1.2, 1.6, -7.8, 0.6, 2.8);
  box(C.green, 0.5, 0.5, 0.5, -8.1, 1.45, 2.6);
  box(C.orange, 0.5, 0.5, 0.5, -7.5, 1.45, 3.0);

  b.build(group, 'shop-static');

  // Koin berputar di atas papan nama
  const coin = new THREE.Group();
  const coinMat = new THREE.MeshLambertMaterial({ color: C.yellow, emissive: C.yellow, emissiveIntensity: 0.35 });
  const coinEdge = new THREE.MeshLambertMaterial({ color: C.yellowD });
  coin.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.35), coinMat));
  const inner = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.45), coinEdge);
  coin.add(inner);
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.5), coinMat);
  coin.add(mark);
  coin.position.set(0, 12, 0.6);
  coin.traverse(o => { if (o.isMesh) o.castShadow = true; });
  group.add(coin);
  return { group, coin };
}

/* ------------------------------------------------------------------ */
/* Kandang: ukuran ikut jumlah slot. Titik (0,0,0) = tengah sisi depan (gerbang), kandang memanjang ke −Z. */
export function penSize(slots) {
  return {
    w: Math.min(56, 18 + slots * 2.5),
    d: Math.min(40, 16 + slots * 1.5),
  };
}

export function buildPen(slots) {
  const { w, d } = penSize(slots);
  const group = new THREE.Group();
  const b = new ChunkBatcher(1000);
  const box = (c, bw, bh, bd, x, y, z) => b.box('solid', c, bw, bh, bd, x, y, z);
  const zc = -d / 2;

  // Lantai rumput + petak rumput terang + jalan tanah dari gerbang
  box(C.green, w, 0.3, d, 0, 0.15, zc);
  const rnd = (n) => { const x = Math.sin(n * 91.7 + 13.1) * 43758.5; return x - Math.floor(x); };
  const patches = Math.round((w * d) / 40);
  for (let i = 0; i < patches; i++) {
    const s = 1.2 + rnd(i) * 1.6;
    box(rnd(i + 0.3) > 0.5 ? C.grass : C.greenD, s, 0.08, s, (rnd(i + 0.6) - 0.5) * (w - 3), 0.33, zc + (rnd(i + 0.9) - 0.5) * (d - 3));
  }
  box(C.panel, 4, 0.08, 6, 0, 0.34, -3);

  // Pagar: tiang tiap ±3 unit + dua palang, gerbang terbuka 6 unit di depan
  const post = (x, z) => { box(C.wood, 0.5, 2.3, 0.5, x, 1.15, z); box(C.woodL, 0.6, 0.2, 0.6, x, 2.35, z); };
  const railX = (x0, x1, z) => {
    if (x1 - x0 < 0.2) return;
    box(C.woodL, x1 - x0, 0.25, 0.25, (x0 + x1) / 2, 0.95, z);
    box(C.woodL, x1 - x0, 0.25, 0.25, (x0 + x1) / 2, 1.75, z);
  };
  const railZ = (z0, z1, x) => {
    box(C.woodL, 0.25, 0.25, z1 - z0, x, 0.95, (z0 + z1) / 2);
    box(C.woodL, 0.25, 0.25, z1 - z0, x, 1.75, (z0 + z1) / 2);
  };
  const hw = w / 2;
  const nx = Math.max(2, Math.round(w / 3));
  for (let i = 0; i <= nx; i++) {
    const x = -hw + (w / nx) * i;
    post(x, -d);
    if (Math.abs(x) > 3.2) post(x, 0);
  }
  const nz = Math.max(2, Math.round(d / 3));
  for (let i = 1; i < nz; i++) { post(-hw, -(d / nz) * i); post(hw, -(d / nz) * i); }
  railX(-hw, hw, -d);
  railX(-hw, -3, 0);
  railX(3, hw, 0);
  railZ(-d, 0, -hw);
  railZ(-d, 0, hw);

  // Gerbang: dua tiang tinggi + papan lengkung oranye dengan ikon telapak
  for (const sx of [-1, 1]) {
    box(C.woodD, 0.8, 4.4, 0.8, sx * 3.2, 2.2, 0);
    box(C.orange, 1.0, 0.4, 1.0, sx * 3.2, 4.5, 0);
  }
  box(C.orange, 7.6, 1.4, 0.4, 0, 4.9, 0);
  box(C.ink, 7.8, 0.2, 0.46, 0, 4.15, 0);
  box(C.cream, 0.7, 0.6, 0.1, 0, 4.75, 0.25);                // telapak
  [[-0.5, 5.25], [-0.17, 5.4], [0.17, 5.4], [0.5, 5.25]].forEach(([x, y]) => box(C.cream, 0.28, 0.28, 0.1, x, y, 0.25));

  // Kandang kecil / shelter di pojok kanan belakang
  const sx = hw - 4.2, sz = -d + 3.6;
  box(C.wood, 5.4, 3.2, 4.4, sx, 1.75, sz);
  box(C.woodD, 1.8, 2.2, 0.1, sx, 1.4, sz + 2.21);           // pintu
  box(C.orange, 6.4, 0.6, 5.4, sx, 3.65, sz);
  box(C.orangeD, 5.2, 0.6, 4.4, sx, 4.25, sz);
  box(C.orange, 3.6, 0.6, 3.2, sx, 4.85, sz);

  // Palung air (kiri belakang), jerami, mangkuk makan
  box(C.woodD, 4.6, 1.0, 1.6, -hw + 3.4, 0.6, -d + 1.8);
  box(C.blue, 4.0, 0.15, 1.1, -hw + 3.4, 1.05, -d + 1.8);
  box(C.hay, 2.2, 1.4, 1.6, -hw + 2.2, 0.9, -d / 2);
  box(C.hayD, 2.2, 0.2, 0.2, -hw + 2.2, 0.9, -d / 2 + 0.81);
  box(C.hay, 1.8, 1.2, 1.4, -hw + 2.0, 2.2, -d / 2 + 0.1);
  for (const [x, z, col] of [[hw - 3, -d / 2, C.pink], [hw - 3, -d / 2 + 2, C.blue]]) {
    box(col, 1.2, 0.4, 1.2, x, 0.5, z);
    box(C.orange, 0.8, 0.12, 0.8, x, 0.74, z);
  }

  b.build(group, 'pen-static');
  // Area jalan hewan (lokal): di dalam pagar, menjauhi shelter & palung
  const bounds = { minX: -hw + 1.8, maxX: hw - 1.8, minZ: -d + 2.2, maxZ: -1.6 };
  return { group, w, d, bounds, shelter: { x: sx, z: sz, r: 3.6 } };
}
