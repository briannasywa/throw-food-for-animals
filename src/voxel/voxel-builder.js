// ZOO TOSS — voxel-builder.js
// Membangun hewan voxel dari data JSON (lihat voxel-spec.md).
// Dipakai di prototype (Vite + Three.js) dan di preview.html.
//
// Cara pakai (engineer):
//   import { buildAnimal, animateAnimal } from './voxel-builder.js';
//   import farm from './animals/farm.json';
//   const spec = farm.animals.find(a => a.id === 'pastel_sheep');
//   const animal = buildAnimal(spec);           // { group, parts, stats }
//   animal.group.scale.setScalar(0.25);         // 1 voxel = 0.25 unit dunia
//   scene.add(animal.group);
//   // di loop render:
//   animateAnimal(animal, clock.getElapsedTime());
//
// Performa: tiap part digabung jadi 1 mesh (1 draw call), dengan warna per balok (vertex color).
// Geometri di-cache per id hewan, jadi 10 salinan hewan yang sama memakai geometri yang sama.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const sharedMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
// Glow (emissive) per balok tanpa draw call tambahan: atribut vertex `glow` (0..1)
// menambahkan warna balok itu sendiri sebagai cahaya. Diatur lewat field `glow` di data hewan.
sharedMaterial.onBeforeCompile = (shader) => {
  shader.vertexShader = 'attribute float glow;\nvarying float vGlow;\n' +
    shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vGlow = glow;');
  shader.fragmentShader = 'varying float vGlow;\n' +
    shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * vGlow;');
};
const geometryCache = new Map(); // id hewan -> [{ name, geometry, pivot, anim }]

function boxGeometry(box, pivot, colors, glowMap = {}) {
  const [x, y, z, w, h, d, colorKey] = box;
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(x - pivot[0], y - pivot[1], z - pivot[2]);
  const hex = colors[colorKey] ?? colorKey; // boleh langsung hex
  const color = new THREE.Color(hex);       // dikonversi ke ruang warna linear oleh Three.js
  const count = geo.attributes.position.count;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = color.r;
    arr[i * 3 + 1] = color.g;
    arr[i * 3 + 2] = color.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  geo.setAttribute('glow', new THREE.BufferAttribute(new Float32Array(count).fill(glowMap[colorKey] || 0), 1));
  return geo;
}

function buildGeometries(spec) {
  if (geometryCache.has(spec.id)) return geometryCache.get(spec.id);
  const parts = spec.parts.map((part) => {
    const pivot = part.pivot || [0, 0, 0];
    const geos = part.boxes.map((b) => boxGeometry(b, pivot, spec.colors, spec.glow));
    const geometry = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    geometry.computeBoundingSphere();
    return { name: part.name, geometry, pivot, anim: part.anim || null };
  });
  geometryCache.set(spec.id, parts);
  return parts;
}

export function buildAnimal(spec, { material = sharedMaterial, castShadow = true } = {}) {
  const group = new THREE.Group(); // dipindah/diputar oleh game
  group.name = spec.id;
  const rig = new THREE.Group();   // dipantulkan oleh animasi
  rig.name = 'rig';
  group.add(rig);
  const parts = {};
  let triangles = 0;
  for (const p of buildGeometries(spec)) {
    const mesh = new THREE.Mesh(p.geometry, material);
    mesh.name = p.name;
    mesh.position.set(p.pivot[0], p.pivot[1], p.pivot[2]);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    mesh.userData.anim = p.anim;
    rig.add(mesh);
    parts[p.name] = mesh;
    triangles += (p.geometry.index ? p.geometry.index.count : p.geometry.attributes.position.count) / 3;
  }
  group.userData.spec = spec;
  return { group, rig, parts, stats: { triangles, drawCalls: Object.keys(parts).length } };
}

// Gerakan idle sederhana. speed: 1 = jalan santai.
const ANIM = {
  legFL: (m, t) => { m.rotation.x = Math.sin(t * 6) * 0.35; },
  legBR: (m, t) => { m.rotation.x = Math.sin(t * 6) * 0.35; },
  legFR: (m, t) => { m.rotation.x = -Math.sin(t * 6) * 0.35; },
  legBL: (m, t) => { m.rotation.x = -Math.sin(t * 6) * 0.35; },
  legL: (m, t) => { m.rotation.x = Math.sin(t * 8) * 0.4; },
  legR: (m, t) => { m.rotation.x = -Math.sin(t * 8) * 0.4; },
  // lengan (kerangka upright): berayun berlawanan dengan kaki di sisi yang sama
  armL: (m, t) => { m.rotation.x = -Math.sin(t * 8) * 0.5; },
  armR: (m, t) => { m.rotation.x = Math.sin(t * 8) * 0.5; },
  // badan jeli (kerangka blob): memipih-memanjang, pivot part harus di tanah
  // tentakel dua kelompok (A/B) bergoyang berlawanan
  tentacleA: (m, t) => { m.rotation.x = Math.sin(t * 5) * 0.18; m.rotation.z = Math.cos(t * 5) * 0.12; },
  tentacleB: (m, t) => { m.rotation.x = -Math.sin(t * 5) * 0.18; m.rotation.z = -Math.cos(t * 5) * 0.12; },
  // sirip lebar (pari): kepakan pelan naik-turun
  finL: (m, t) => { m.rotation.z = Math.sin(t * 3) * 0.35; },
  finR: (m, t) => { m.rotation.z = -Math.sin(t * 3) * 0.35; },
  squish: (m, t) => { const s = Math.sin(t * 5) * 0.07; m.scale.set(1 - s * 0.5, 1 + s, 1 - s * 0.5); },
  wingL: (m, t) => { m.rotation.z = -Math.abs(Math.sin(t * 9)) * 0.6; },
  wingR: (m, t) => { m.rotation.z = Math.abs(Math.sin(t * 9)) * 0.6; },
  tail: (m, t) => { m.rotation.y = Math.sin(t * 7) * 0.45; },
  head: (m, t) => { m.rotation.x = Math.sin(t * 2.5) * 0.08; },
};

export function animateAnimal(animal, t, { walking = true } = {}) {
  const phase = (animal.group.id % 7) * 0.9; // supaya tiap salinan tidak bergerak serempak
  const tt = t + phase;
  for (const mesh of Object.values(animal.parts)) {
    const fn = ANIM[mesh.userData.anim];
    if (!fn) continue;
    if (!walking && /^(leg|arm)/.test(mesh.userData.anim)) { mesh.rotation.x = 0; continue; }
    fn(mesh, tt);
  }
  // seluruh badan sedikit memantul saat berjalan (kaki tetap menyentuh tanah secara visual)
  animal.rig.position.y = walking ? Math.abs(Math.sin(tt * 6)) * 0.2 : 0;
}
