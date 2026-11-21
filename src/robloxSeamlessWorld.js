import * as THREE from 'three';
import { ZONES, MUTATION_DATA, SKY_COLOR } from './gameData.js';
// Hewan & Zookeeper dari voxel art-direction (voxelAnimals.js). tickAnimal juga menganimasikan cincin mutasi.
import { buildVoxelAnimal, buildPlayerZookeeper, tickAnimal as animateAnimal } from './voxelAnimals.js';
import { setupLighting, createBloom } from './zt-lighting.js';
import { buildZoneCliffs } from './zoneCliffs.js';
import { ChunkBatcher } from './chunkBatcher.js';
import { buildGym, buildShop, buildPen, PULLUP } from './courtyardProps.js';

export class RobloxSeamlessWorld {
  constructor(container) {
    this.container = container;

    // Player Avatar starting position
    this.playerPos = new THREE.Vector3(0, 0, 0);
    this.playerRot = 0;
    this.moveSpeed = 18.0;
    this.stamina = 100;
    this.maxStamina = 100;

    // Environmental Wind
    this.windSpeed = 2;
    this.windDirection = 1;
    this.windChangeTimer = 0;

    // Key inputs (WASD & Arrow Keys)
    this.keys = { w: false, a: false, s: false, d: false, shift: false };
    this.inputBlocked = false;  // true saat modal terbuka
    this.cameraLocked = false;  // camera lock (Pointer Lock) — toggle dari main.js

    // Camera orbit & zoom controls (Right mouse drag or Left mouse drag)
    this.cameraOrbit = {
      yaw: 0.25,        // horizontal rotation around player (radians)
      pitch: 0.65,      // vertical angle (radians)
      distance: 45,     // zoom distance
      targetDistance: 45,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0
    };

    // Throw State & Stages: 'idle' | 'flight' | 'attract' | 'eating' | 'catch'
    this.isThrowing = false;
    this.throwStage = 'idle';
    this.throwProgress = 0;
    this.flightDuration = 2.0; // Dynamic duration based on distance
    this.maxDistance = 100;
    this.currentDistance = 0;
    this.targetZone = ZONES[0];
    this.foodItem = null;
    this.caughtAnimal = null;
    this.onFinishCallback = null;
    this.isTraining = false;

    // Attract and eating stages state
    this.attractAnimalMesh = null;
    this.attractTimer = 0;
    this.attractDuration = 2.5;
    this.eatingTimer = 0;
    this.eatingDuration = 2.2; // Extended eating animation
    this.landingPos = new THREE.Vector3();
    this.animalSpawnPos = new THREE.Vector3();

    // Dedicated Village/Courtyard Behind the Throw Line (-Z Area)
    this.worldStations = [
      { id: 'throw', name: 'Throw Line', pos: new THREE.Vector3(0, 0, 10), radius: 7, actionKey: 'SPACE', actionLabel: 'THROW FOOD', desc: 'Press Space or tap to throw' },
      { id: 'plot', name: 'Animal Pen', pos: new THREE.Vector3(0, 0, -42), radius: 18, actionKey: 'P', actionLabel: 'MANAGE PEN', desc: 'Equip and view your animals' },
      { id: 'gym', name: 'Training Grounds', pos: new THREE.Vector3(-24, 0, -22), radius: 8, actionKey: 'E', actionLabel: 'TRAIN PULL-UPS', desc: 'Auto-train your Power' },
      { id: 'shop', name: 'Shop Booth', pos: new THREE.Vector3(24, 0, -22), radius: 8, actionKey: 'T', actionLabel: 'OPEN SHOP', desc: 'Upgrades, pen slots and selling' },
    ];

    this.throwPoseTimer = 0;

    this.initScene();
    this.buildSeamlessTrack();
    this.buildCourtyardHub();
    this.buildCharacter();
    this.buildInWorldStations();
    this.buildFoodProjectile();
    this.setupInputs();
    this.setupCameraMouseControls();

    this.lastTime = performance.now();
    this.animate = (time) => {
      this.reqId = requestAnimationFrame(this.animate);
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;
      this.renderer.info.reset();
      this.update(dt, time * 0.001);
      this.render();
    };
    this.reqId = requestAnimationFrame(this.animate);
  }

  initScene() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();

    const aspect = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.5, 3000);
    this.camera.position.set(20, 35, -35);
    this.camera.lookAt(0, 2, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Setup Art Direction Lighting (Sunny Day Preset A)
    this.lighting = setupLighting({
      renderer: this.renderer,
      scene: this.scene,
      preset: 'sunnyDay',
      quality: 'auto'
    });
    // Bloom hanya di PC (kualitas 'high'): aksen zona yang emissive jadi berpendar
    // Far clip mengikuti kabut (lihat zt-lighting.js): 430 di PC/laptop, ±290 di HP
    const applyFar = (far) => { this.camera.far = far; this.camera.updateProjectionMatrix(); };
    applyFar(this.lighting.viewFar);
    this.lighting.onViewChange = applyFar;
    // Statistik render dihitung per frame (bloom memanggil render beberapa kali); dipakai overlay dev
    this.renderer.info.autoReset = false;

    this.bloom = this.lighting.quality === 'high'
      ? createBloom(this.renderer, this.scene, this.camera, this.lighting)
      : null;

    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.bloom?.setSize(this.width, this.height);
    });
  }

  setupCameraMouseControls() {
    const dom = this.renderer.domElement;
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    dom.addEventListener('mousedown', (e) => {
      // Camera lock aktif tapi pointer belum terkunci (mis. habis menutup menu): klik layar untuk mengunci lagi
      if (this.cameraLocked) {
        if (document.pointerLockElement !== dom) this.setCameraLock(true);
        return;
      }
      if (e.button === 2 || e.button === 0) {
        this.cameraOrbit.isDragging = true;
        this.cameraOrbit.lastMouseX = e.clientX;
        this.cameraOrbit.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isThrowing) return;
      let dx, dy;
      if (this.cameraLocked && document.pointerLockElement === dom) {
        dx = e.movementX; dy = e.movementY;
      } else if (this.cameraLocked) {
        // Pointer lock ditolak browser: tetap ikuti gerakan mouse (kursor masih terlihat)
        if (this.inputBlocked) return;
        dx = e.movementX; dy = e.movementY;
      } else {
        if (!this.cameraOrbit.isDragging) return;
        dx = e.clientX - this.cameraOrbit.lastMouseX;
        dy = e.clientY - this.cameraOrbit.lastMouseY;
        this.cameraOrbit.lastMouseX = e.clientX;
        this.cameraOrbit.lastMouseY = e.clientY;
      }

      // geser mouse ke kanan → pandangan berputar ke kanan (sebelumnya terbalik)
      this.cameraOrbit.yaw += dx * 0.008;
      this.cameraOrbit.pitch = Math.max(0.15, Math.min(1.4, this.cameraOrbit.pitch + dy * 0.006));
    });

    window.addEventListener('mouseup', () => {
      this.cameraOrbit.isDragging = false;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.05;
      this.cameraOrbit.targetDistance = Math.max(
        12,
        Math.min(95, this.cameraOrbit.targetDistance + zoomDelta)
      );
    }, { passive: false });
  }

  buildCourtyardHub() {
    this.hubGroup = new THREE.Group();

    const plazaMat = new THREE.MeshLambertMaterial({ color: 0xF2D9A6 });
    const plazaFloor = new THREE.Mesh(new THREE.BoxGeometry(84, 0.4, 65), plazaMat);
    plazaFloor.position.set(0, -0.05, -42.5);
    plazaFloor.receiveShadow = true;

    const grassBorderMat = new THREE.MeshLambertMaterial({ color: 0x7AD15A });
    const grassBorder = new THREE.Mesh(new THREE.BoxGeometry(94, 0.3, 75), grassBorderMat);
    grassBorder.position.set(0, -0.15, -42.5);
    grassBorder.receiveShadow = true;

    const cliffMat = new THREE.MeshLambertMaterial({ color: 0x9C8F84 });
    const backCliff = new THREE.Mesh(new THREE.BoxGeometry(100, 16, 12), cliffMat);
    backCliff.position.set(0, 8, -78);
    backCliff.castShadow = true;
    backCliff.receiveShadow = true;

    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    const fenceL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 65), fenceMat);
    fenceL.position.set(-42, 1.5, -42.5);
    const fenceR = fenceL.clone();
    fenceR.position.x = 42;

    this.hubGroup.add(plazaFloor, grassBorder, backCliff, fenceL, fenceR);
    this.scene.add(this.hubGroup);
  }

  buildSeamlessTrack() {
    const trackWidth = 24;
    const stripeWidth = 2.4;
    // Semua kotak statis lintasan + tebing digabung per potongan 100 unit (lihat chunkBatcher.js),
    // supaya hanya potongan di dalam far clip yang digambar.
    const batcher = new ChunkBatcher(100);
    const lite = this.lighting.quality === 'low';

    ZONES.forEach((zone) => {
      const startZ = Math.max(0, zone.minDist / 12);
      const endZ = zone.maxDist / 12;
      const lengthZ = endZ - startZ;
      const centerZ = startZ + lengthZ / 2;

      // 1. Tanah dasar: satu bidang per zona (2 segitiga; zona jauh tetap di-cull oleh far clip)
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(360, lengthZ), new THREE.MeshLambertMaterial({ color: zone.stripes[0] }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -0.05, centerZ);
      ground.receiveShadow = true;
      this.scene.add(ground);

      // 2. Lintasan kotak-kotak (garis selang-seling)
      const numStripes = Math.floor(trackWidth / stripeWidth);
      for (let s = 0; s < numStripes; s++) {
        batcher.longBox('track', zone.stripes[s % 2], stripeWidth, 0.35,
          -trackWidth / 2 + stripeWidth / 2 + s * stripeWidth, 0.15, startZ, endZ);
      }

      // 3. Curb aksen (palette.json); aksen bercahaya (Toxic, Lava, Glow Sea, Galaxy) masuk lapisan glow
      for (const side of [-1, 1]) {
        batcher.longBox(zone.accentGlow ? 'glow' : 'track', zone.accent, 1.2, 0.7,
          side * (trackWidth / 2 + 0.6), 0.35, startZ, endZ, zone.accentGlow ? 1.6 : 1);
      }

      // 4. Tebing voxel bertingkat bertema zona (zoneCliffs.js)
      buildZoneCliffs(batcher, zone, startZ, endZ, { lite });
    });

    this.staticChunks = batcher.build(this.scene, 'track-and-cliffs');
  }

  createVoxelBoulder(colorHex, size = 3) {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: colorHex });
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.8, size), mat);
    b1.castShadow = true;
    b1.receiveShadow = true;
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.7, size * 0.5, size * 0.7), mat);
    b2.position.set(size * 0.2, size * 0.6, -size * 0.1);
    b2.castShadow = true;
    group.add(b1, b2);
    return group;
  }

  createVoxelTree(trunkColor, leafColor) {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshLambertMaterial({ color: trunkColor });
    const leafMat = new THREE.MeshLambertMaterial({ color: leafColor });

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6, 1.6), trunkMat);
    trunk.position.y = 3;
    trunk.castShadow = true;

    const leaf1 = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.5, 5.5), leafMat);
    leaf1.position.y = 7;
    leaf1.castShadow = true;

    const leaf2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3, 3.5), leafMat);
    leaf2.position.y = 9.5;
    leaf2.castShadow = true;

    group.add(trunk, leaf1, leaf2);
    return group;
  }

  buildCharacter() {
    this.avatar = new THREE.Group();
    this.avatar.position.copy(this.playerPos);

    this.zookeeper = buildPlayerZookeeper();
    this.avatar.add(this.zookeeper.group);

    this.parts = this.zookeeper.parts || {};
    this.scene.add(this.avatar);

    this.petCompanionsGroup = new THREE.Group();
    this.scene.add(this.petCompanionsGroup);
  }

  buildInWorldStations() {
    // 1. Throw Pad (Z = 10)
    // Garis lempar: Pop Pink (palette core.accent), sedikit bercahaya
    const pad = new THREE.Mesh(new THREE.BoxGeometry(12, 0.35, 8), new THREE.MeshLambertMaterial({ color: 0xFF3D7F, emissive: 0xFF3D7F, emissiveIntensity: 0.5 }));
    pad.position.set(0, 0.18, 10);
    pad.receiveShadow = true;
    this.scene.add(pad);

    // Panah penunjuk di atas pad (dipakai onboarding); Pop Pink, memantul naik-turun
    this.padMarker = new THREE.Group();
    const markMat = new THREE.MeshLambertMaterial({ color: 0xFF3D7F, emissive: 0xFF3D7F, emissiveIntensity: 0.6 });
    const outline = new THREE.MeshLambertMaterial({ color: 0x1B2233 });
    [[2.4, 0], [1.6, -0.8], [0.8, -1.6]].forEach(([w, y]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, w), markMat);
      b.position.y = y;
      this.padMarker.add(b);
    });
    const stem = new THREE.Mesh(new THREE.BoxGeometry(1, 2.4, 1), markMat);
    stem.position.y = 1.6;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), outline);
    cap.position.y = 2.9;
    this.padMarker.add(stem, cap);
    this.padMarker.position.set(0, 7, 10);
    this.padMarker.visible = false;
    this.scene.add(this.padMarker);

    // 2. Area latihan pull-up (-24, 0, -22) — courtyardProps.js
    const gym = buildGym();
    this.gymGroup = gym.group;
    this.gymGroup.position.set(-24, 0, -22);
    this.gymSweatParticles = gym.sweat;
    this.scene.add(this.gymGroup);

    // 3. Toko (24, 0, -22), menghadap +Z
    const shop = buildShop();
    this.shopGroup = shop.group;
    this.shopGroup.position.set(24, 0, -22);
    this.shopCoin = shop.coin;
    this.scene.add(this.shopGroup);

    // 4. Kandang: gerbang di z = -29, memanjang ke belakang; ukuran ikut slot (setPenSize)
    this.plotGroup = new THREE.Group();
    this.plotGroup.position.set(0, 0, -29);
    this.plotAnimals = new THREE.Group();
    this.plotGroup.add(this.plotAnimals);
    this.penAnimals = new Map(); // uid -> { mesh, target, wait }
    this.scene.add(this.plotGroup);
    this.setPenSize(4);
  }

  buildFoodProjectile() {
    this.foodGroup = new THREE.Group();
    this.foodMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshLambertMaterial({ color: 0xFF7A1A })
    );
    this.foodMesh.castShadow = true;
    this.foodGroup.add(this.foodMesh);
    this.foodGroup.position.set(0, -60, 0);
    this.scene.add(this.foodGroup);

    // Eating heart particles
    this.eatHeartsGroup = new THREE.Group();
    const heartMat = new THREE.MeshBasicMaterial({ color: 0xFF3D7F });
    for (let i = 0; i < 4; i++) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), heartMat);
      this.eatHeartsGroup.add(h);
    }
    this.eatHeartsGroup.position.set(0, -50, 0);
    this.scene.add(this.eatHeartsGroup);

    this.lureEmoji = new THREE.Group();
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.8), heartMat);
    b1.position.set(0, 0.4, 0);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), heartMat);
    b2.position.set(0, -1.2, 0);
    this.lureEmoji.add(b1, b2);
    this.lureEmoji.position.set(0, -50, 0);
    this.scene.add(this.lureEmoji);
  }

  setupInputs() {
    // Gerak saja (WASD / panah / Shift). Hotkey menu & aksi stasiun diurus main.js.
    // Pakai e.code supaya tetap jalan di layout keyboard apa pun dan saat Caps Lock aktif.
    const MOVE = { KeyW: 'w', ArrowUp: 'w', KeyS: 's', ArrowDown: 's', KeyA: 'a', ArrowLeft: 'a', KeyD: 'd', ArrowRight: 'd' };
    const typing = (e) => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '');
    window.addEventListener('keydown', (e) => {
      if (typing(e)) return;
      if (e.code.startsWith('Arrow')) e.preventDefault();
      if (this.inputBlocked) return;
      if (MOVE[e.code]) this.keys[MOVE[e.code]] = true;
      if (e.key === 'Shift') this.keys.shift = true;
    });
    window.addEventListener('keyup', (e) => {
      if (MOVE[e.code]) this.keys[MOVE[e.code]] = false;
      if (e.key === 'Shift') this.keys.shift = false;
    });
    // Alt-Tab / klik di luar jendela: lepas semua tombol supaya karakter tidak jalan sendiri
    window.addEventListener('blur', () => this.releaseKeys());
  }

  /** Onboarding: tampilkan / sembunyikan panah di atas pad lempar. */
  setPadMarker(visible) {
    if (this.padMarker) this.padMarker.visible = visible;
  }

  releaseKeys() {
    for (const k in this.keys) this.keys[k] = false;
  }

  /** Dipanggil main.js: true saat modal terbuka (WASD tidak menggerakkan karakter). */
  setInputBlocked(blocked) {
    this.inputBlocked = blocked;
    if (blocked) this.releaseKeys();
  }

  /** Camera lock: kamera mengikuti gerakan mouse tanpa drag (Pointer Lock), karakter menghadap arah kamera. */
  setCameraLock(on) {
    this.cameraLocked = on;
    this.cameraOrbit.isDragging = false;
    const dom = this.renderer.domElement;
    if (on) {
      if (document.pointerLockElement !== dom) {
        try { dom.requestPointerLock()?.catch?.(() => {}); } catch { /* butuh gestur pengguna; klik layar untuk mengunci lagi */ }
      }
    } else if (document.pointerLockElement === dom) {
      document.exitPointerLock();
    }
  }

  throwFood(distance, targetZone, foodItem, onFinish) {
    if (this.isThrowing) return;
    this.isThrowing = true;
    this.throwStage = 'flight';
    this.throwProgress = 0;
    this.maxDistance = distance;
    this.targetZone = targetZone;
    this.foodItem = foodItem;
    this.onFinishCallback = onFinish;

    // Immersion flight speed scaling:
    // Close zones (0-1000m) take ~2.0s, far zones (up to 30,000m+) smoothly scale up to 4.5s
    const distFactor = Math.min(1, Math.max(0, (distance - 300) / 15000));
    this.flightDuration = 2.0 + distFactor * 2.5;

    if (this.foodMesh && foodItem && foodItem.color) {
      this.foodMesh.material.color.set(foodItem.color);
    }

    this.caughtAnimal = this.determineCatch(targetZone, foodItem);

    const targetZ = Math.min(4800, this.maxDistance / 12);
    this.landingPos.set(0, 0.5, 10 + targetZ);

    this.avatar.position.set(0, 0, 10);
    this.avatar.rotation.y = 0;
    this.throwPoseTimer = 0.45; // pose melempar Zookeeper

    if (this.attractAnimalMesh) {
      this.scene.remove(this.attractAnimalMesh);
      this.attractAnimalMesh = null;
    }
  }

  determineCatch(zone, food) {
    const animals = zone.animals;

    // Web3 Perk: Legendary Bait guarantees Legendary (or Mythic in Galaxy zone)
    if (food && food.isLegendaryBait) {
      const topAnimal = animals.find(a => a.rarity === 'Legendary' || a.rarity === 'Mythic') || animals[animals.length - 1];
      const mutRoll = Math.random() * 100;
      let mutation = 'Normal';
      if (mutRoll < 2.0) mutation = 'Rainbow';
      else if (mutRoll < 8.0) mutation = 'Emerald';
      else if (mutRoll < 20.0) mutation = 'Diamond';
      else if (mutRoll < 45.0) mutation = 'Gold';

      return {
        id: topAnimal.id,
        name: topAnimal.name,
        rarity: topAnimal.rarity,
        baseCps: topAnimal.baseCps,
        color: topAnimal.color,
        zoneName: zone.name,
        mutation
      };
    }

    const luck = (food ? food.luckBonus : 1.0);
    const weights = animals.map(a => {
      let w = a.weight;
      if (a.rarity === 'Legendary' || a.rarity === 'Mythic') w *= luck;
      if (a.rarity === 'Epic') w *= Math.sqrt(luck);
      return w;
    });

    const totalWeight = weights.reduce((acc, v) => acc + v, 0);
    let rand = Math.random() * totalWeight;
    let chosen = animals[0];

    for (let i = 0; i < animals.length; i++) {
      if (rand < weights[i]) {
        chosen = animals[i];
        break;
      }
      rand -= weights[i];
    }

    const mutRoll = Math.random() * 100;
    let mutation = 'Normal';
    if (mutRoll < 0.3) mutation = 'Rainbow';
    else if (mutRoll < 1.5) mutation = 'Emerald';
    else if (mutRoll < 5.0) mutation = 'Diamond';
    else if (mutRoll < 15.0) mutation = 'Gold';

    return {
      id: chosen.id,
      name: chosen.name,
      rarity: chosen.rarity,
      baseCps: chosen.baseCps,
      color: chosen.color,
      zoneName: zone.name,
      mutation
    };
  }

  /** Bangun ulang kandang saat jumlah slot berubah (Expand Pen); hewan tetap di tempat, dijepit ke batas baru. */
  setPenSize(slots) {
    if (this.penSlots === slots) return;
    this.penSlots = slots;
    if (this.penStatic) this.plotGroup.remove(this.penStatic);
    const pen = buildPen(slots);
    this.penStatic = pen.group;
    this.penBounds = pen.bounds;
    this.penShelter = pen.shelter;
    this.plotGroup.add(this.penStatic);
    // Titik & jangkauan prompt "MANAGE PEN" mengikuti ukuran kandang
    const st = this.worldStations.find(s => s.id === 'plot');
    st.pos.set(0, 0, this.plotGroup.position.z - pen.d / 2);
    st.radius = Math.max(pen.w, pen.d) / 2 + 2;
    for (const a of this.penAnimals.values()) {
      this.clampToPen(a.mesh.position);
      a.target = this.randomPenPoint();
    }
  }

  randomPenPoint() {
    const b = this.penBounds;
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Vector3(b.minX + Math.random() * (b.maxX - b.minX), 0.3, b.minZ + Math.random() * (b.maxZ - b.minZ));
      if (Math.hypot(p.x - this.penShelter.x, p.z - this.penShelter.z) > this.penShelter.r) return p;
    }
    return new THREE.Vector3(0, 0.3, (b.minZ + b.maxZ) / 2);
  }

  clampToPen(v) {
    const b = this.penBounds;
    v.x = Math.max(b.minX, Math.min(b.maxX, v.x));
    v.z = Math.max(b.minZ, Math.min(b.maxZ, v.z));
  }

  /** Hewan di kandang: hanya yang baru ditambah / yang hilang dihapus, supaya jalan-jalannya tidak ter-reset. */
  updatePlotAnimals(inventory) {
    const keep = new Set(inventory.map(it => it.uid));
    for (const [uid, a] of this.penAnimals) {
      if (!keep.has(uid)) { this.plotAnimals.remove(a.mesh); this.penAnimals.delete(uid); }
    }
    inventory.forEach((item) => {
      if (this.penAnimals.has(item.uid)) return;
      const mesh = buildVoxelAnimal(item.id, item.rarity, item.mutation);
      mesh.scale.set(0.5, 0.5, 0.5);
      mesh.position.copy(this.randomPenPoint());
      mesh.rotation.y = Math.random() * Math.PI * 2;
      this.plotAnimals.add(mesh);
      this.penAnimals.set(item.uid, { mesh, target: this.randomPenPoint(), wait: Math.random() * 3, phase: Math.random() * 10 });
    });
  }

  /** Hewan kandang berjalan ke titik acak, berhenti sebentar, lalu lanjut. */
  tickPenAnimals(dt, secTime) {
    for (const a of this.penAnimals.values()) {
      const m = a.mesh;
      const inst = m.userData.animalInstance;
      if (a.wait > 0) {
        a.wait -= dt;
        if (inst) animateAnimal(inst, secTime + a.phase, { walking: false });
        continue;
      }
      const dx = a.target.x - m.position.x;
      const dz = a.target.z - m.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.3) {
        a.wait = 1.2 + Math.random() * 3.5;
        a.target = this.randomPenPoint();
        continue;
      }
      const step = Math.min(dist, 2.4 * dt);
      m.position.x += (dx / dist) * step;
      m.position.z += (dz / dist) * step;
      // belok halus ke arah jalan
      const want = Math.atan2(dx, dz);
      let diff = want - m.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      m.rotation.y += diff * Math.min(1, dt * 6);
      if (inst) animateAnimal(inst, (secTime + a.phase) * 1.6, { walking: true });
    }
  }

  updateEquippedPets(inventory, equippedUids) {
    // Simpan posisi lama supaya pet tidak "teleport" setiap UI di-refresh
    const prevPos = this.petCompanionsGroup.children.map(p => p.position.clone());
    while (this.petCompanionsGroup.children.length > 0) {
      this.petCompanionsGroup.remove(this.petCompanionsGroup.children[0]);
    }

    equippedUids.forEach((uid) => {
      const pet = inventory.find(p => p.uid === uid);
      if (pet) {
        const mesh = buildVoxelAnimal(pet.id, pet.rarity, pet.mutation);
        mesh.scale.set(0.35, 0.35, 0.35);
        const prev = prevPos[this.petCompanionsGroup.children.length];
        mesh.position.copy(prev || this.avatar.position);
        this.petCompanionsGroup.add(mesh);
      }
    });
  }

  setTrainingMode(active) {
    this.isTraining = active;
    this.trainTime = 0;
    if (active) {
      // Berdiri di bawah palang, menghadap +Z (arah kamera sinematik mulai)
      this.avatar.position.set(-24, PULLUP.hangY, -22);
      this.avatar.rotation.y = 0;
      this.releaseKeys();
    } else {
      this.avatar.position.y = 0;
      this.avatar.position.z = -22 + 2.5; // turun & mundur sedikit dari palang
      if (this.parts.armR) { this.parts.armR.rotation.set(0, 0, 0); this.parts.armL.rotation.set(0, 0, 0); }
      if (this.parts.legR) { this.parts.legR.rotation.set(0, 0, 0); this.parts.legL.rotation.set(0, 0, 0); }
    }
    if (this.gymSweatParticles) this.gymSweatParticles.visible = active;
  }

  /** View Biome dari Index: kamera terbang pelan menyusuri zona (tanpa memindahkan pemain). */
  startBiomeView(zone) {
    const z0 = Math.max(0, zone.minDist / 12);
    const z1 = zone.maxDist / 12;
    this.biomeView = { z0: z0 + 8, z1: Math.min(z1 - 30, z0 + 320), t: 0, focus: new THREE.Vector3() };
    this.releaseKeys();
  }

  stopBiomeView() {
    this.biomeView = null;
  }

  update(dt, secTime) {
    const time = performance.now() * 0.005;

    this.cameraOrbit.distance += (this.cameraOrbit.targetDistance - this.cameraOrbit.distance) * (dt * 8);

    if (this.lighting && this.lighting.update) {
      const focusTarget = this.isThrowing ? this.foodGroup.position : this.avatar.position;
      this.lighting.update(focusTarget);
    }

    // Wind dynamics
    this.windChangeTimer += dt;
    if (this.windChangeTimer >= 5.0) {
      this.windChangeTimer = 0;
      this.windSpeed = Math.floor(Math.random() * 12);
      this.windDirection = Math.random() > 0.45 ? 1 : -1;
    }

    // Stamina
    const isMoving = this.keys.w || this.keys.s || this.keys.a || this.keys.d;
    const isSprinting = this.keys.shift && isMoving && this.stamina > 5;
    if (isSprinting) this.stamina = Math.max(0, this.stamina - dt * 25);
    else this.stamina = Math.min(this.maxStamina, this.stamina + dt * 15);

    const speed = isSprinting ? this.moveSpeed * 1.8 : this.moveSpeed;

    // Arah gerak relatif ke layar. Kamera ada di (sin yaw, -cos yaw) dari pemain, jadi:
    //   maju  (W) = (-sin yaw, +cos yaw)   → menjauhi kamera
    //   kanan (D) = (-cos yaw, -sin yaw)   → kanan layar (di yaw 0 itu −X, bukan +X)
    // Versi sebelumnya memakai (+cos, +sin) untuk kanan, sehingga A/D terbalik.
    if (!this.isTraining && !this.isThrowing && !this.biomeView) {
      let inputX = (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0);
      let inputZ = (this.keys.w ? 1 : 0) - (this.keys.s ? 1 : 0);
      const cosYaw = Math.cos(this.cameraOrbit.yaw);
      const sinYaw = Math.sin(this.cameraOrbit.yaw);
      // Camera lock: karakter selalu menghadap arah kamera (A/D jadi langkah samping)
      if (this.cameraLocked) this.avatar.rotation.y = Math.atan2(-sinYaw, cosYaw);

      if (inputX !== 0 || inputZ !== 0) {
        const len = Math.hypot(inputX, inputZ);
        inputX /= len;
        inputZ /= len;

        const worldDx = -inputX * cosYaw - inputZ * sinYaw;
        const worldDz = -inputX * sinYaw + inputZ * cosYaw;

        this.avatar.position.x += worldDx * speed * dt;
        this.avatar.position.z += worldDz * speed * dt;
        if (!this.cameraLocked) this.avatar.rotation.y = Math.atan2(worldDx, worldDz);

        if (this.zookeeper) {
          animateAnimal(this.zookeeper.instance, secTime * 2.5, { walking: true });
        }
      } else {
        if (this.zookeeper) {
          animateAnimal(this.zookeeper.instance, secTime, { walking: false });
        }
      }

      this.avatar.position.x = Math.max(-50, Math.min(50, this.avatar.position.x));
      this.avatar.position.z = Math.max(-70, Math.min(5000, this.avatar.position.z));
    }

    // Pose melempar Zookeeper: lengan kanan diayun ke atas sebentar
    if (this.throwPoseTimer > 0 && this.parts.armR) {
      this.throwPoseTimer -= dt;
      this.parts.armR.rotation.x = -2.5;
    }

    // Latihan pull-up: 1 repetisi = 2,6 dtk (naik 1 dtk, tahan, turun 1 dtk, tahan di bawah)
    if (this.isTraining) {
      this.trainTime += dt;
      const p = (this.trainTime % 2.6) / 2.6;
      const ease = (x) => x * x * (3 - 2 * x);
      const lift = p < 0.38 ? ease(p / 0.38) : p < 0.5 ? 1 : p < 0.88 ? 1 - ease((p - 0.5) / 0.38) : 0;
      this.avatar.position.set(-24, PULLUP.hangY + (PULLUP.topY - PULLUP.hangY) * lift, -22 - 0.12 * (1 - lift));
      this.avatar.rotation.y = 0;
      // Lengan: lurus ke atas saat menggantung, ditekuk ke depan saat naik (tangan tetap di palang)
      const arm = (0.3 + lift * 0.85) - Math.PI;
      if (this.parts.armR && this.parts.armL) {
        this.parts.armR.rotation.set(arm, 0, -0.12);
        this.parts.armL.rotation.set(arm, 0, 0.12);
      }
      // Kaki sedikit ditekuk & berayun pelan
      if (this.parts.legR && this.parts.legL) {
        this.parts.legR.rotation.x = 0.25 + lift * 0.35;
        this.parts.legL.rotation.x = 0.25 + lift * 0.35 + Math.sin(this.trainTime * 2) * 0.05;
      }
      // Tetes keringat jatuh dari kepala
      if (this.gymSweatParticles) {
        const headY = this.avatar.position.y + 2.9;
        this.gymSweatParticles.children.forEach((drop) => {
          drop.userData.phase += dt * 0.7;
          if (drop.userData.phase > 1) { drop.userData.phase = 0; drop.userData.x = (Math.random() - 0.5) * 1.4; drop.userData.z = (Math.random() - 0.5) * 0.8; }
          const ph = drop.userData.phase;
          drop.position.set(drop.userData.x || 0, headY - ph * 3, (drop.userData.z || 0) - 0.1);
          drop.visible = ph < 0.9;
        });
      }
    } else if (!this.isThrowing) {
      this.avatar.position.y = 0;
    }

    // Pet Companions: berjalan di tanah di belakang pemain (kaki bergerak hanya saat pemain bergerak)
    if (this.petCompanionsGroup.children.length > 0) {
      const petWalking = isMoving && !this.isTraining && !this.isThrowing;
      this.petCompanionsGroup.children.forEach((pet, i) => {
        const ang = this.avatar.rotation.y + Math.PI + (i === 0 ? -0.6 : 0.6);
        const tx = this.avatar.position.x + Math.sin(ang) * 3;
        const tz = this.avatar.position.z + Math.cos(ang) * 3;
        pet.position.lerp(new THREE.Vector3(tx, 0, tz), dt * 6);
        pet.rotation.y = this.avatar.rotation.y;

        if (pet.userData && pet.userData.animalInstance) {
          animateAnimal(pet.userData.animalInstance, secTime + i, { walking: petWalking });
        }
      });
    }

    // Patung penjaga zona

    // Hewan kandang berkeliling
    this.tickPenAnimals(dt, secTime);
    if (this.shopCoin) {
      this.shopCoin.rotation.y = secTime * 1.8;
      this.shopCoin.position.y = 12 + Math.sin(secTime * 2) * 0.25;
    }

    // THROWING LOGIC
    if (this.isThrowing) {
      if (this.throwStage === 'flight') {
        // Slow immersive flight speed for far zones
        this.throwProgress += dt / this.flightDuration;
        this.currentDistance = Math.floor(this.maxDistance * Math.min(1, this.throwProgress));

        const targetZ = this.landingPos.z;
        const currZ = 10 + (targetZ - 10) * this.throwProgress;
        const arcY = 2 + Math.sin(Math.min(1, this.throwProgress) * Math.PI) * 35;

        this.foodGroup.position.set(0, arcY, currZ);
        this.foodGroup.rotation.x += dt * 8;
        this.foodGroup.rotation.y += dt * 6;

        // FPV & Dynamic Chase Camera
        if (this.throwProgress < 0.35) {
          const fpPos = new THREE.Vector3(0, 4.2, 10.8);
          this.camera.position.lerp(fpPos, dt * 12);
          this.camera.lookAt(0, arcY + 2, currZ + 25);
        } else {
          const chaseCam = new THREE.Vector3(0, arcY + 12, currZ - 18);
          this.camera.position.lerp(chaseCam, dt * 7);
          this.camera.lookAt(0, arcY, currZ + 15);
        }

        // When food lands on ground -> Stage Attract
        if (this.throwProgress >= 1) {
          this.throwStage = 'attract';
          this.attractTimer = 0;
          this.foodGroup.position.copy(this.landingPos);

          const sideX = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 4);
          this.animalSpawnPos.set(
            sideX,
            1.5,
            this.landingPos.z + (Math.random() * 6 - 3)
          );

          this.attractAnimalMesh = buildVoxelAnimal(
            this.caughtAnimal.id,
            this.caughtAnimal.rarity,
            this.caughtAnimal.mutation
          );
          this.attractAnimalMesh.position.copy(this.animalSpawnPos);
          this.attractAnimalMesh.scale.set(0.65, 0.65, 0.65);
          this.scene.add(this.attractAnimalMesh);

          this.lureEmoji.position.set(this.landingPos.x, this.landingPos.y + 4.5, this.landingPos.z);
        }
      } else if (this.throwStage === 'attract') {
        // ANIMAL APPROACH GIMMICK
        this.attractTimer += dt;
        const progress = Math.min(1, this.attractTimer / this.attractDuration);

        if (this.attractAnimalMesh) {
          this.attractAnimalMesh.position.lerpVectors(this.animalSpawnPos, this.landingPos, progress);
          const dir = new THREE.Vector3().subVectors(this.landingPos, this.animalSpawnPos).normalize();
          this.attractAnimalMesh.rotation.y = Math.atan2(dir.x, dir.z);

          if (this.attractAnimalMesh.userData?.animalInstance) {
            animateAnimal(this.attractAnimalMesh.userData.animalInstance, secTime * 3, { walking: true });
          }
          this.attractAnimalMesh.position.y = 0.3 + Math.abs(Math.sin(this.attractTimer * 8)) * 1.2;
        }

        this.lureEmoji.position.y = this.landingPos.y + 4.5 + Math.sin(time * 6) * 0.4;
        this.lureEmoji.rotation.y += dt * 4;

        const camFocusPos = new THREE.Vector3(
          this.landingPos.x + 8,
          this.landingPos.y + 6,
          this.landingPos.z - 10
        );
        this.camera.position.lerp(camFocusPos, dt * 6);
        this.camera.lookAt(this.landingPos.x, this.landingPos.y + 1.5, this.landingPos.z);

        // When animal arrives at food -> Transition to EXTENDED EATING GIMMICK
        if (progress >= 1) {
          this.throwStage = 'eating';
          this.eatingTimer = 0;
          this.lureEmoji.position.set(0, -50, 0); // Hide lure alert
        }
      } else if (this.throwStage === 'eating') {
        // EXTENDED EATING ANIMATION GIMMICK
        this.eatingTimer += dt;
        const eatProgress = Math.min(1, this.eatingTimer / this.eatingDuration);

        // Animal eating head bob and happy wiggles
        if (this.attractAnimalMesh) {
          const munch = Math.sin(this.eatingTimer * 12);
          this.attractAnimalMesh.position.y = 0.3 + Math.abs(munch) * 0.35;
          this.attractAnimalMesh.rotation.z = Math.sin(this.eatingTimer * 8) * 0.12;
        }

        // Food shrinks as it gets eaten
        if (this.foodMesh) {
          const remainingScale = Math.max(0.1, 1 - eatProgress);
          this.foodMesh.scale.set(remainingScale, remainingScale, remainingScale);
        }

        // Joyful heart particles bursting around animal
        this.eatHeartsGroup.position.set(this.landingPos.x, this.landingPos.y + 2.5, this.landingPos.z);
        this.eatHeartsGroup.children.forEach((h, i) => {
          const a = this.eatingTimer * 4 + i * (Math.PI / 2);
          h.position.set(Math.cos(a) * 2.2, Math.sin(this.eatingTimer * 6 + i) * 1.2 + 1, Math.sin(a) * 2.2);
          h.rotation.y += dt * 5;
        });

        // Close-up eating camera
        const camEatPos = new THREE.Vector3(
          this.landingPos.x + 6,
          this.landingPos.y + 4.5,
          this.landingPos.z - 7
        );
        this.camera.position.lerp(camEatPos, dt * 6);
        this.camera.lookAt(this.landingPos.x, this.landingPos.y + 1.2, this.landingPos.z);

        if (eatProgress >= 1) {
          this.throwStage = 'idle';
          this.isThrowing = false;
          this.foodGroup.position.set(0, -60, 0);
          this.foodMesh.scale.set(1, 1, 1);
          this.eatHeartsGroup.position.set(0, -50, 0);

          if (this.attractAnimalMesh) {
            this.scene.remove(this.attractAnimalMesh);
            this.attractAnimalMesh = null;
          }

          if (this.onFinishCallback) {
            this.onFinishCallback(this.caughtAnimal, this.maxDistance);
          }
        }
      }
    } else if (this.biomeView) {
      // View Biome: dolly pelan menyusuri zona, sedikit bergoyang ke kiri-kanan
      const bv = this.biomeView;
      bv.t += dt;
      const span = Math.max(40, bv.z1 - bv.z0);
      const z = bv.z0 + ((bv.t * 9) % span);
      const camPos = new THREE.Vector3(Math.sin(bv.t * 0.25) * 7, 15 + Math.sin(bv.t * 0.18) * 4, z);
      if (bv.t < 0.05 || (bv.t * 9) % span < 9 * dt * 1.5) this.camera.position.copy(camPos); // potong langsung saat mulai / ulang
      else this.camera.position.lerp(camPos, dt * 4);
      bv.focus.set(Math.sin(bv.t * 0.25 + 1) * 4, 3, z + 38);
      this.camera.lookAt(bv.focus);
      this.lighting?.update(bv.focus);
    } else if (this.isTraining) {
      // Sinematik latihan: kamera rendah berputar pelan di depan pemain, lalu mendekat
      const t = this.trainTime;
      const ang = Math.sin(t * 0.22) * 1.1;          // menyapu ±63° di depan pemain
      const r = 11 - Math.min(1, t / 6) * 2.5;        // perlahan mendekat (11 → 8.5)
      const ax = this.avatar.position.x, az = -22;
      const camPos = new THREE.Vector3(ax + Math.sin(ang) * r, 2.6 + Math.sin(t * 0.3) * 0.6, az + Math.cos(ang) * r);
      this.camera.position.lerp(camPos, dt * 2.5);
      this.camera.lookAt(ax, 3.2, az);
    } else {
      // FREELY ADJUSTABLE ORBIT & POV ZOOM CAMERA
      const r = this.cameraOrbit.distance;
      const pitch = this.cameraOrbit.pitch;
      const yaw = this.cameraOrbit.yaw;

      const camOffsetX = r * Math.sin(yaw) * Math.cos(pitch);
      const camOffsetY = r * Math.sin(pitch);
      const camOffsetZ = -r * Math.cos(yaw) * Math.cos(pitch);

      const targetCamPos = new THREE.Vector3(
        this.avatar.position.x + camOffsetX,
        this.avatar.position.y + camOffsetY + 2,
        this.avatar.position.z + camOffsetZ
      );

      this.camera.position.lerp(targetCamPos, dt * 8);
      this.camera.lookAt(this.avatar.position.x, this.avatar.position.y + 2.5, this.avatar.position.z);
    }

    if (this.padMarker?.visible) {
      this.padMarker.position.y = 7 + Math.abs(Math.sin(secTime * 3)) * 1.5;
      this.padMarker.rotation.y = secTime * 1.5;
    }

    this.detectProximityStation();
  }

  detectProximityStation() {
    let closest = null;
    let minDist = Infinity;
    const ap = this.avatar.position;
    for (const st of this.worldStations) {
      const d = ap.distanceTo(st.pos);
      // Pad lempar: hanya di atas area pink (12 × 8), bukan lingkaran di sekitarnya
      const inside = st.id === 'throw'
        ? Math.abs(ap.x - st.pos.x) <= 6.3 && Math.abs(ap.z - st.pos.z) <= 4.3
        : d < st.radius;
      if (inside && d < minDist) {
        minDist = d;
        closest = st;
      }
    }
    this.currentStation = closest;
    const promptModal = document.querySelector('#context-action-bar');
    const promptKey = document.querySelector('#context-key');
    const promptAction = document.querySelector('#context-action');
    const promptDesc = document.querySelector('#context-desc');

    if (promptModal && promptKey && promptAction && promptDesc) {
      // Pad lempar tidak butuh prompt: panel lempar (meter + Throw) sendiri yang muncul di sana
      if (closest && closest.id !== 'throw' && !this.isThrowing) {
        promptModal.classList.remove('hidden');
        promptKey.textContent = closest.actionKey;
        promptAction.textContent = closest.actionLabel;
        promptDesc.textContent = closest.desc;
      } else {
        promptModal.classList.add('hidden');
      }
    }
  }

  render() {
    if (this.bloom) this.bloom.render();
    else this.renderer.render(this.scene, this.camera);
  }
}
