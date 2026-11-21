// Zoo Toss — pratinjau hewan voxel untuk UI (kartu Pen, Index, kartu tangkapan).
// Satu renderer kecil di luar layar merender tiap hewan sekali, lalu hasilnya disimpan sebagai gambar (data URL).
import * as THREE from 'three';
import { buildAnimal } from './voxel/voxel-builder.js';
import { ANIMAL_SPECS } from './voxelAnimals.js';

const SIZE = 160;
let renderer, scene, camera, silhouetteMat;
const cache = new Map();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(SIZE, SIZE);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  scene = new THREE.Scene();
  // sama dengan Preset A "Sunny Day" (tanpa kabut/bayangan)
  scene.add(new THREE.HemisphereLight('#D6ECFF', '#D8CFA8', 1.5));
  const sun = new THREE.DirectionalLight('#FFF7E6', 2.3);
  sun.position.set(0.5, 1, 1.2);
  scene.add(sun);
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  silhouetteMat = new THREE.MeshBasicMaterial({ color: '#3A4256' }); // palette.json -> functional.silhouette
}

/** @returns {string} data URL PNG. silhouette=true untuk hewan yang belum didapat di Index. */
export function getAnimalThumb(id, { silhouette = false } = {}) {
  const key = `${id}|${silhouette ? 's' : 'c'}`;
  if (cache.has(key)) return cache.get(key);
  const spec = ANIMAL_SPECS[id];
  if (!spec) return '';
  if (!renderer) init();

  const animal = buildAnimal(spec, { material: silhouette ? silhouetteMat : undefined, castShadow: false });
  const g = animal.group;
  g.rotation.y = -Math.PI / 5; // 3/4 dari depan
  scene.add(g);
  const box = new THREE.Box3().setFromObject(g);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const half = Math.max(size.x, size.y, size.z) * 0.68;
  camera.left = -half; camera.right = half; camera.top = half; camera.bottom = -half;
  camera.position.set(center.x + 6, center.y + 4, center.z + 10);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  scene.remove(g);
  cache.set(key, url);
  return url;
}
