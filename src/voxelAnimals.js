// Zoo Toss — jembatan antara data voxel art-direction dan game.
// Semua hewan & karakter dibangun dari src/voxel/*.json lewat voxel-builder.js.
import * as THREE from 'three';
import { buildAnimal, animateAnimal } from './voxel/voxel-builder.js';
import lobby from './voxel/animals/lobby.json';
import farm from './voxel/animals/farm.json';
import jungle from './voxel/animals/jungle.json';
import toxic from './voxel/animals/toxic.json';
import lava from './voxel/animals/lava.json';
import glowSea from './voxel/animals/glow_sea.json';
import christmas from './voxel/animals/christmas.json';
import frost from './voxel/animals/frost.json';
import galaxy from './voxel/animals/galaxy.json';
import zookeeperSpec from './voxel/characters/zookeeper.json';

export { animateAnimal, zookeeperSpec };

export const ANIMAL_SPECS = {};
for (const zone of [lobby, farm, jungle, toxic, lava, glowSea, christmas, frost, galaxy]) {
  for (const a of zone.animals) ANIMAL_SPECS[a.id] = a;
}

// Warna mutasi dari palette.json -> mutation
const MUTATION_RING = { Gold: '#FFD54A', Diamond: '#9BEBFF', Emerald: '#2EE59D', Rainbow: '#FF4B4B' };
const ringGeo = new THREE.TorusGeometry(1, 0.12, 6, 20);
const ringMats = {};
function ringMaterial(mutation) {
  if (mutation === 'Rainbow') {
    // materi sendiri per hewan rainbow karena warnanya dianimasikan
    const c = new THREE.Color(MUTATION_RING.Rainbow);
    return new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 });
  }
  if (!ringMats[mutation]) {
    const c = new THREE.Color(MUTATION_RING[mutation]);
    ringMats[mutation] = new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 });
  }
  return ringMats[mutation];
}

const heightCache = new Map();
export function specHeight(spec) {
  if (heightCache.has(spec.id)) return heightCache.get(spec.id);
  let top = 0;
  for (const p of spec.parts) for (const b of p.boxes) top = Math.max(top, b[1] + b[4] / 2);
  heightCache.set(spec.id, top);
  return top;
}

/**
 * Membuat hewan voxel untuk game.
 * @returns {{group: THREE.Group, rig, parts, ring?: THREE.Mesh}} — panggil tickAnimal(animal, t) tiap frame.
 */
export function createAnimal(id, { mutation = 'Normal', scale = 0.45 } = {}) {
  const spec = ANIMAL_SPECS[id] || ANIMAL_SPECS.rabbit;
  const animal = buildAnimal(spec);
  animal.group.scale.setScalar(scale);
  if (mutation && mutation !== 'Normal' && MUTATION_RING[mutation]) {
    // cincin mutasi melayang di atas kepala (pengganti aura lama), warna dari palet mutasi
    const ring = new THREE.Mesh(ringGeo, ringMaterial(mutation));
    ring.rotation.x = Math.PI / 2;
    ring.scale.setScalar(2.2);
    ring.position.y = specHeight(spec) + 1.5;
    ring.castShadow = false;
    animal.group.add(ring);
    animal.ring = ring;
    animal.ringY = ring.position.y;
    animal.rainbow = mutation === 'Rainbow';
  }
  return animal;
}

const HEAD_PARTS = ['head', 'headL', 'headC', 'headR'];
const eatCache = new Map();
/**
 * Geometri pose makan per hewan (satuan spec, sumbu depan = +z):
 *  - dip   : sudut kepala menunduk (rad) supaya moncong turun ke makanan di tanah
 *  - reach : jarak moncong dari pusat badan setelah menunduk → hewan berhenti sejauh ini DI DEPAN makanan
 * Hewan tanpa part kepala (ikan, jeli, dll.) mencondongkan seluruh badan.
 */
export function eatingGeometry(spec) {
  if (eatCache.has(spec.id)) return eatCache.get(spec.id);
  const head = spec.parts.find(p => HEAD_PARTS.includes(p.name));
  let geo;
  if (head) {
    const [, py, pz] = head.pivot;
    // titik moncong = kotak kepala paling depan, sedikit di bawah tengahnya
    let mz = -Infinity, my = py;
    for (const b of head.boxes) { const f = b[2] + b[5] / 2; if (f > mz) { mz = f; my = b[1] - b[4] / 4; } }
    const dz = mz - pz, dy = my - py;
    const R = Math.hypot(dz, dy) || 1, phi = Math.atan2(dy, dz);
    const groundY = 0.8;
    const k = Math.max(-1, Math.min(1, (groundY - py) / R));
    const need = Math.max(0.25, Math.min(1.3, phi - Math.asin(k)));
    // kepala menunduk maks ~40°, sisanya badan ikut condong (hewan tegak tidak terlihat "patah leher")
    const dip = Math.min(need, 0.7);
    const lean = Math.min(need - dip, 0.35);
    const yh = py + R * Math.sin(phi - dip), zh = pz + R * Math.cos(phi - dip); // moncong setelah kepala menunduk
    geo = { dip, lean, reach: yh * Math.sin(lean) + zh * Math.cos(lean), headPart: true };
  } else {
    let front = 0;
    for (const p of spec.parts) for (const b of p.boxes) front = Math.max(front, b[2] + b[5] / 2);
    geo = { dip: 0.22, lean: 0, reach: front * 0.9, headPart: false };
  }
  eatCache.set(spec.id, geo);
  return geo;
}

/**
 * Pose makan: kaki diam di tanah, kepala menunduk ke makanan lalu mengangguk mengunyah.
 * t = waktu makan (detik), mulai 0. geo = eatingGeometry(spec).
 */
export function poseEating(animal, t, geo) {
  animateAnimal(animal, t, { walking: false }); // ekor, sayap, rahang tetap bergerak; kaki & pantulan berhenti
  const down = Math.min(1, t / 0.35);           // menunduk perlahan di awal
  const chew = Math.max(0, Math.sin(t * 11));   // gigitan cepat
  if (geo.headPart) {
    HEAD_PARTS.forEach((n, i) => { const h = animal.parts[n]; if (h) h.rotation.x = down * geo.dip - chew * 0.12 + i * 0.03; });
    animal.rig.rotation.x = down * geo.lean;
  } else {
    animal.rig.rotation.x = down * geo.dip + chew * 0.05;
  }
  if (animal.parts.jaw) animal.parts.jaw.rotation.x = chew * 0.35;
}

/** Kembalikan pose normal setelah makan. */
export function resetPose(animal) {
  animal.rig.rotation.x = 0;
  HEAD_PARTS.forEach(n => { if (animal.parts[n]) animal.parts[n].rotation.x = 0; });
}

export function tickAnimal(animal, t, opts) {
  animateAnimal(animal, t, opts);
  if (animal.ring) {
    animal.ring.position.y = animal.ringY + Math.sin(t * 3) * 0.3;
    animal.ring.rotation.z = t * 1.5;
    if (animal.rainbow) {
      animal.ring.material.color.setHSL((t * 0.25) % 1, 0.9, 0.6);
      animal.ring.material.emissive.copy(animal.ring.material.color);
    }
  }
}

export function createZookeeper(scale) {
  const keeper = buildAnimal(zookeeperSpec);
  keeper.group.scale.setScalar(scale);
  return keeper;
}

// --- Antarmuka yang dipakai robloxSeamlessWorld.js (nama sama dengan animalModels.js milik tim) ---

/** Group hewan siap pakai; animasi lewat animateAnimal(group.userData.animalInstance, t). */
export function buildVoxelAnimal(id, rarity, mutation = 'Normal') {
  const animal = createAnimal(id, { mutation, scale: 0.25 });
  animal.group.userData = { animalInstance: animal, animalId: id, mutation, rarity };
  return animal.group;
}

export function buildPlayerZookeeper(scale = 0.3) {
  const keeper = createZookeeper(scale);
  return { group: keeper.group, parts: keeper.parts, instance: keeper };
}
