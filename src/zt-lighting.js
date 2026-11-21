// ZOO TOSS — zt-lighting.js  (lighting-spec.md v2, Preset A "Sunny Day" dipilih Art Director)
// Modul Three.js untuk prototype (Vite). Mengatur renderer, langit, kabut, cahaya, bayangan, dan bloom opsional.
//
// Cara pakai (engineer):
//   import { setupLighting, createBloom } from './zt-lighting.js';
//   const lighting = setupLighting({ renderer, scene, preset: 'sunnyDay' });   // quality: 'auto' | 'high' | 'low'
//   const bloom = lighting.quality === 'high' ? createBloom(renderer, scene, camera) : null;
//   // di loop render:
//   lighting.update(player.position);            // bayangan & matahari ikut pemain/kamera
//   bloom ? bloom.render() : renderer.render(scene, camera);
//   // saat ukuran layar berubah: bloom?.setSize(w, h)
//   // ganti preset (misalnya untuk screenshot thumbnail): lighting.setPreset('goldenHour')

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const PRESETS = {
  // Preset A — siang cerah, warna setia ke palet (DIPAKAI)
  sunnyDay: {
    background: '#7CCBFF',
    // Disesuaikan ke prototype: kamera ortografis ±122 unit dari titik fokus, tanah yang terlihat di layar
    // ada di kedalaman ±90–155 unit. Kabut mulai 150 → hanya tepi atas layar (sisi jauh) yang sedikit memudar;
    // zona yang dilewati makanan (+Z) justru lebih dekat ke kamera, jadi selalu jelas. (aslinya 160 / 520)
    fog: { color: '#C7E4FF', near: 150, far: 400 },
    // pantulan tanah krem netral (bukan hijau), supaya sisi depan/wajah tidak kehijauan
    hemi: { sky: '#D6ECFF', ground: '#D8CFA8', intensity: 1.5 },
    // ~jam 2 siang. Azimut 0° = arah +Z (sisi kamera/depan hewan). 30° = depan-samping, supaya wajah hewan & pemain terkena sinar.
    // Kalau kamera prototype menghadap arah lain, putar azimut supaya matahari tetap di sisi kamera.
    // Disesuaikan ke prototype (kamera orbit perspektif versi tim): kamera default di belakang pemain,
    // sedikit ke +X (yaw 0.25) = azimut ±166°. Matahari 30° dari kamera = 135°, supaya sisi yang
    // menghadap kamera tetap terang. (aslinya 30°)
    sun: { color: '#FFF7E6', intensity: 2.3, elevationDeg: 45, azimuthDeg: 135 },
    canvasFilter: 'saturate(1.1) contrast(1.03)',      // pengganti ColorCorrection (+saturasi), murah
    bloom: { strength: 0.55, radius: 0.35, threshold: 1.05 }, // > 1: hanya bahan emissive yang berpendar, bukan benda putih yang terang
  },
  // Preset B — senja hangat (cadangan untuk screenshot/thumbnail)
  goldenHour: {
    background: '#F2B48A',
    fog: { color: '#FFD6B2', near: 140, far: 480 },
    hemi: { sky: '#FFD6B2', ground: '#8F7A6A', intensity: 1.0 },
    sun: { color: '#FFC48C', intensity: 2.1, elevationDeg: 18, azimuthDeg: 70 },
    canvasFilter: 'saturate(1.05) contrast(1.06)',
    bloom: { strength: 0.8, radius: 0.45, threshold: 1.0 },
  },
};

const QUALITY = {
  high: { pixelRatio: 2, shadowMap: 2048, shadowArea: 70, bloom: true },
  low: { pixelRatio: 1.5, shadowMap: 1024, shadowArea: 50, bloom: false },
};

// Layar kecil / sentuh (HP): pandangan dipendekkan. Kabut dan far clip dikali VIEW_SCALE,
// jadi tebing & lintasan yang jauh tidak digambar sama sekali (lebih ringan, layar kecil tidak butuh jarak pandang jauh).
const COMPACT_VIEW_SCALE = 0.65;
function detectCompact() {
  return matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 600;
}

function detectQuality() {
  const touch = matchMedia('(pointer: coarse)').matches;
  const weakCpu = (navigator.hardwareConcurrency || 4) <= 4;
  return touch || weakCpu ? 'low' : 'high';
}

export function setupLighting({ renderer, scene, preset = 'sunnyDay', quality = 'auto', compact = 'auto' }) {
  const q = quality === 'auto' ? detectQuality() : quality;
  const isCompact = compact === 'auto' ? detectCompact() : compact;
  const viewScale = isCompact ? COMPACT_VIEW_SCALE : 1;
  const Q = QUALITY[q];

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;        // warna tetap sama dengan palet
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q.pixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // three r18x: PCFSoftShadowMap sudah dihapus (otomatis jadi PCF), jadi langsung PCF

  const hemi = new THREE.HemisphereLight();
  const sun = new THREE.DirectionalLight();
  sun.castShadow = true;
  sun.shadow.mapSize.set(Q.shadowMap, Q.shadowMap);
  const s = Q.shadowArea;
  Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 300 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(hemi, sun, sun.target);

  const sunOffset = new THREE.Vector3();
  let current = null;

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) { console.warn('[zt-lighting] Preset tidak dikenal:', name); return; }
    current = name;
    scene.background = new THREE.Color(p.background);
    scene.fog = new THREE.Fog(p.fog.color, p.fog.near * viewScale, p.fog.far * viewScale);
    // Far clip kamera = sedikit di belakang titik kabut penuh: di baliknya semua sudah berwarna kabut, jadi tidak perlu digambar
    api.viewFar = p.fog.far * viewScale + 30;
    api.onViewChange?.(api.viewFar);
    hemi.color.set(p.hemi.sky);
    hemi.groundColor.set(p.hemi.ground);
    hemi.intensity = p.hemi.intensity;
    sun.color.set(p.sun.color);
    sun.intensity = p.sun.intensity;
    const el = THREE.MathUtils.degToRad(p.sun.elevationDeg);
    const az = THREE.MathUtils.degToRad(p.sun.azimuthDeg);
    sunOffset.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(120);
    renderer.domElement.style.filter = p.canvasFilter;
    if (api.bloomPass) Object.assign(api.bloomPass, p.bloom);
  }

  // Matahari dan kotak bayangan mengikuti titik fokus (pemain/kamera), karena lintasan lempar sangat panjang.
  function update(focus) {
    if (!focus) return;
    sun.target.position.copy(focus);
    sun.position.copy(focus).add(sunOffset);
  }

  const api = { quality: q, compact: isCompact, viewFar: 0, onViewChange: null, hemi, sun, setPreset, update, get preset() { return current; }, bloomPass: null };
  setPreset(preset);
  update(new THREE.Vector3());
  return api;
}

// Bloom: membuat bagian bercahaya (lava, karang glow, lendir Toxic, garis lempar) berpendar.
// Hanya untuk kualitas 'high' (PC). Di HP dimatikan supaya ringan; bahan emissive tetap terlihat terang.
export function createBloom(renderer, scene, camera, lighting) {
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const p = PRESETS[lighting?.preset || 'sunnyDay'].bloom;
  const bloomPass = new UnrealBloomPass(size, p.strength, p.radius, p.threshold);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  if (lighting) lighting.bloomPass = bloomPass;
  return {
    composer,
    bloomPass,
    render: () => composer.render(),
    setSize: (w, h) => { composer.setSize(w, h); bloomPass.setSize(w, h); },
  };
}
