// Zoo Toss — penggabung kotak statis per potongan (chunk) sepanjang Z.
// Kenapa: lintasan ±5.000 unit. Kalau satu zona = satu mesh, bounding sphere-nya raksasa sehingga frustum culling
// tidak pernah membuangnya, dan seluruh zona ikut digambar (juga di shadow map). Dengan potongan pendek,
// hanya potongan di sekitar kamera (dalam far clip) yang digambar.
// Warna disimpan sebagai vertex color → satu potongan cukup 1 mesh per lapisan, berapa pun jumlah warnanya.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Lapisan: solid = tebing & dekorasi (memberi bayangan), track = lantai lintasan (hanya menerima bayangan),
// glow = bagian bercahaya (tanpa cahaya/bayangan; warna > 1 supaya ikut bloom di PC)
const LAYERS = {
  solid: () => new THREE.MeshLambertMaterial({ vertexColors: true }),
  track: () => new THREE.MeshLambertMaterial({ vertexColors: true }),
  glow: () => new THREE.MeshBasicMaterial({ vertexColors: true }),
};

const tmpColor = new THREE.Color();

export class ChunkBatcher {
  constructor(chunkSize = 100) {
    this.size = chunkSize;
    this.bins = new Map(); // "layer|chunk" -> BoxGeometry[]
  }

  /** Tambah kotak. color = hex/string palet; intensity > 1 hanya untuk lapisan glow (kekuatan pendar). */
  box(layer, color, w, h, d, x, y, z, intensity = 1) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y, z);
    g.deleteAttribute('uv'); // tidak pakai tekstur; atribut harus sama semua supaya bisa digabung
    tmpColor.set(color).multiplyScalar(intensity); // Color.set mengubah sRGB → linear (ruang kerja three)
    const n = g.attributes.position.count;
    const c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { c[i * 3] = tmpColor.r; c[i * 3 + 1] = tmpColor.g; c[i * 3 + 2] = tmpColor.b; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const key = `${layer}|${Math.floor(z / this.size)}`;
    let bin = this.bins.get(key);
    if (!bin) this.bins.set(key, (bin = []));
    bin.push(g);
  }

  /** Kotak panjang (lintasan, curb) dipotong mengikuti batas chunk supaya tetap bisa di-cull. */
  longBox(layer, color, w, h, x, y, z0, z1, intensity = 1) {
    for (let a = z0; a < z1 - 0.01;) {
      const b = Math.min(z1, (Math.floor(a / this.size) + 1) * this.size);
      this.box(layer, color, w, h, b - a, x, y, (a + b) / 2, intensity);
      a = b;
    }
  }

  /** Gabungkan semua potongan dan tambahkan ke scene. Mengembalikan group-nya. */
  build(scene, name = 'static-chunks') {
    const mats = Object.fromEntries(Object.entries(LAYERS).map(([k, f]) => [k, f()]));
    const group = new THREE.Group();
    group.name = name;
    for (const [key, geos] of this.bins) {
      const layer = key.split('|')[0];
      const geo = mergeGeometries(geos);
      geos.forEach(g => g.dispose());
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, mats[layer]);
      mesh.castShadow = layer === 'solid';
      mesh.receiveShadow = layer !== 'glow';
      mesh.matrixAutoUpdate = false; // statis
      mesh.updateMatrix();
      group.add(mesh);
    }
    this.bins.clear();
    scene.add(group);
    return group;
  }
}
