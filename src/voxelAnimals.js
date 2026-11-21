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
