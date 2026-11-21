import * as THREE from 'three';
import { ZONES, MUTATION_DATA, SKY_COLOR } from './gameData.js';
import { createAnimal, tickAnimal, createZookeeper, animateAnimal } from './voxelAnimals.js';

export class RobloxSeamlessWorld {
  constructor(container) {
    this.container = container;

    // Player Avatar
    this.playerPos = new THREE.Vector3(0, 0, 5);
    this.playerRot = 0;
    this.moveSpeed = 18.0;
    this.stamina = 100;
    this.maxStamina = 100;

    // Environmental Wind
    this.windSpeed = 2;
    this.windDirection = 1;
    this.windChangeTimer = 0;

    // Key inputs
    this.keys = { w: false, a: false, s: false, d: false, shift: false, space: false };

    // Throw State
    this.isThrowing = false;
    this.throwProgress = 0;
    this.maxDistance = 100;
    this.currentDistance = 0;
    this.targetZone = ZONES[0];
    this.foodItem = null;
    this.caughtAnimal = null;
    this.onFinishCallback = null;
    this.isTraining = false;

    // Interactive In-World Trigger Stations
    this.worldStations = [
      { id: 'throw', name: 'Garis Lempar', pos: new THREE.Vector3(0, 0, 10), radius: 7, actionKey: 'SPACE', actionLabel: 'LEMPAR MAKANAN', desc: 'Tekan [SPASI] atau klik tombol' },
      { id: 'gym', name: 'Gym Pull-Up', pos: new THREE.Vector3(-18, 0, 12), radius: 6, actionKey: 'E', actionLabel: 'LATIHAN PULL-UP', desc: 'Tekan [E] untuk auto-train power' },
      { id: 'shop', name: 'Master NPC Booth', pos: new THREE.Vector3(18, 0, 12), radius: 6, actionKey: 'T', actionLabel: 'BUKA TOKO / JUAL', desc: 'Beli makanan & upgrade' },
      { id: 'plot', name: 'Kandang Plot Hewan', pos: new THREE.Vector3(-35, 0, 32), radius: 16, actionKey: 'P', actionLabel: 'KELOLA HEWAN', desc: 'Pasang & lihat hewan 3D' },
    ];

    // Hewan voxel yang dianimasikan tiap frame
    this.guardians = [];
    this.plotAnimalObjs = [];
    this.petObjs = [];

    this.initScene();
    this.buildSeamlessTrack();
    this.buildCharacter();
    this.buildInWorldStations();
    this.buildFoodProjectile();
    this.setupInputs();

    this.lastTime = performance.now();
    this.animate = (time) => {
      this.reqId = requestAnimationFrame(this.animate);
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;
      this.update(dt);
      this.render();
    };
    this.reqId = requestAnimationFrame(this.animate);
  }

  initScene() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SKY_COLOR); // Exact Sky Blue (#70c5ff) from image
    this.scene.fog = new THREE.Fog(SKY_COLOR, 120, 450);

    const aspect = this.width / this.height;
    const d = 28;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -1000, 2500);
    this.camera.position.set(65, 80, 65);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambient);

    this.sun = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sun.position.set(80, 160, 60);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 1024;
    this.sun.shadow.mapSize.height = 1024;
    this.scene.add(this.sun);

    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      const asp = this.width / this.height;
      this.camera.left = -d * asp;
      this.camera.right = d * asp;
      this.camera.top = d;
      this.camera.bottom = -d;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  // Build the 9 Distinct Biome Zones with Exact Color Stripes from the User Image
  buildSeamlessTrack() {
    const trackWidth = 24;
    const stripeWidth = 2.4;

    ZONES.forEach((zone, zIdx) => {
      const startZ = Math.max(0, zone.minDist / 12);
      const endZ = zone.maxDist / 12;
      const lengthZ = endZ - startZ;
      const centerZ = startZ + lengthZ / 2;

      // 1. Surrounding Ground for this Biome
      const groundMat = new THREE.MeshLambertMaterial({ color: zone.stripes[0] });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, lengthZ), groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -0.05, centerZ);
      ground.receiveShadow = true;
      this.scene.add(ground);

      // 2. Striped Main Runway (Alternate color vertical lines matching user image!)
      const numStripes = Math.floor(trackWidth / stripeWidth);
      for (let s = 0; s < numStripes; s++) {
        const color = zone.stripes[s % 2];
        const stripeMat = new THREE.MeshLambertMaterial({ color });
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(stripeWidth, 0.35, lengthZ), stripeMat);
        stripe.position.set(-trackWidth / 2 + stripeWidth / 2 + (s * stripeWidth), 0.15, centerZ);
        stripe.receiveShadow = true;
        this.scene.add(stripe);
      }

      // 3. Colored Accent Bottom Curb (Matching pink, orange, lime, cyan, yellow borders in image)
      const curbMat = new THREE.MeshLambertMaterial({ color: zone.accent });
      const curbL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, lengthZ), curbMat);
      curbL.position.set(-trackWidth / 2 - 0.6, 0.35, centerZ);
      const curbR = curbL.clone();
      curbR.position.x = trackWidth / 2 + 0.6;
      this.scene.add(curbL, curbR);

      // 4. Biome Entrance Archway Monument & Giant Voxel Guardian
      const archMat = new THREE.MeshLambertMaterial({ color: zone.accent });
      const pL = new THREE.Mesh(new THREE.BoxGeometry(3, 18, 3), archMat);
      pL.position.set(-trackWidth / 2 - 2, 9, startZ);
      const pR = pL.clone();
      pR.position.x = trackWidth / 2 + 2;

      const topArch = new THREE.Mesh(new THREE.BoxGeometry(trackWidth + 8, 3.5, 3.5), archMat);
      topArch.position.set(0, 18, startZ);

      // Zone Animal Statue
      const guardian = createAnimal(zone.animals[zone.animals.length - 1].id, { scale: 0.9 });
      guardian.group.position.set(trackWidth / 2 + 8, 0, startZ + 8);
      guardian.group.rotation.y = Math.PI / 4; // menghadap kamera
      this.guardians.push(guardian);

      this.scene.add(pL, pR, topArch, guardian.group);
    });
  }

  buildCharacter() {
    this.avatar = new THREE.Group();
    this.avatar.position.copy(this.playerPos);

    // Karakter pemain original: Zookeeper (art-direction/voxel/characters/zookeeper.json).
    // Tinggi ±10.9 voxel; skala 0.48 → ±5.2 unit, sama dengan tinggi avatar lama.
    this.keeper = createZookeeper(0.48);
    this.throwPoseTimer = 0;
    this.avatar.add(this.keeper.group);
    this.scene.add(this.avatar);

    this.petCompanionsGroup = new THREE.Group();
    this.scene.add(this.petCompanionsGroup);
  }

  buildInWorldStations() {
    // 1. Throw Pad (Garis Lempar)
    const pad = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 10), new THREE.MeshLambertMaterial({ color: 0xec4899 }));
    pad.position.set(0, 0.16, 10);
    this.scene.add(pad);

    // 2. Gym Pull-Up Stand
    this.gymGroup = new THREE.Group();
    this.gymGroup.position.set(-18, 0, 12);
    const gymFloor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 12), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    gymFloor.position.y = 0.15;
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8, 0.6), new THREE.MeshLambertMaterial({ color: 0x64748b }));
    p1.position.set(-2.5, 4, 0);
    const p2 = p1.clone();
    p2.position.x = 2.5;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    bar.position.set(0, 7.8, 0);
    this.gymGroup.add(gymFloor, p1, p2, bar);
    this.scene.add(this.gymGroup);

    // 3. Master NPC Booth
    this.shopGroup = new THREE.Group();
    this.shopGroup.position.set(18, 0, 12);
    const shopBase = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 6), new THREE.MeshLambertMaterial({ color: 0x78350f }));
    shopBase.position.y = 2.5;
    const shopRoof = new THREE.Mesh(new THREE.BoxGeometry(9, 1.5, 7), new THREE.MeshLambertMaterial({ color: 0xf97316 }));
    shopRoof.position.y = 5.7;
    this.shopGroup.add(shopBase, shopRoof);
    this.scene.add(this.shopGroup);

    // 4. Animal Pen Plot
    this.plotGroup = new THREE.Group();
    this.plotGroup.position.set(-35, 0, 32);
    const plotFloor = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 26), new THREE.MeshLambertMaterial({ color: 0x166534 }));
    plotFloor.position.y = 0.15;
    this.plotAnimals = new THREE.Group();
    this.plotGroup.add(plotFloor, this.plotAnimals);
    this.scene.add(this.plotGroup);
  }

  buildFoodProjectile() {
    this.foodGroup = new THREE.Group();
    const bun = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
    const meat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.7), new THREE.MeshLambertMaterial({ color: 0x7c2d12 }));
    bun.position.y = 0.4;
    this.foodGroup.add(bun, meat);
    this.foodGroup.position.set(0, -60, 0);
    this.scene.add(this.foodGroup);
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = true;
      if (k === 's' || k === 'arrowdown') this.keys.s = true;
      if (k === 'a' || k === 'arrowleft') this.keys.a = true;
      if (k === 'd' || k === 'arrowright') this.keys.d = true;
      if (k === 'shift') this.keys.shift = true;
      if (k === ' ') {
        if (this.currentStation?.id === 'throw') {
          window.dispatchEvent(new CustomEvent('roblox:throw'));
        }
      }
      if (k === 'e') {
        if (this.currentStation?.id === 'gym') {
          window.dispatchEvent(new CustomEvent('roblox:pullup'));
        }
      }
      if (k === 't') {
        if (this.currentStation?.id === 'shop') {
          window.dispatchEvent(new CustomEvent('roblox:shop'));
        }
      }
      if (k === 'p') {
        if (this.currentStation?.id === 'plot') {
          window.dispatchEvent(new CustomEvent('roblox:plot'));
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = false;
      if (k === 's' || k === 'arrowdown') this.keys.s = false;
      if (k === 'a' || k === 'arrowleft') this.keys.a = false;
      if (k === 'd' || k === 'arrowright') this.keys.d = false;
      if (k === 'shift') this.keys.shift = false;
    });
  }

  startThrow({ food, power, timingScore, onFinish }) {
    this.isThrowing = true;
    this.throwProgress = 0;
    this.foodItem = food;
    this.onFinishCallback = onFinish;

    const timingFactor = Math.pow(Math.max(1, timingScore) / 20, 1.4);
    const staminaFactor = 0.5 + (this.stamina / this.maxStamina) * 0.5;
    const windEffect = 1 + (this.windSpeed * this.windDirection * 0.03);

    this.maxDistance = Math.max(50, Math.floor(power * timingFactor * staminaFactor * windEffect * 42));
    this.stamina = Math.max(0, this.stamina - 25);

    this.targetZone = ZONES[0];
    for (let i = ZONES.length - 1; i >= 0; i--) {
      if (this.maxDistance >= ZONES[i].minDist) {
        this.targetZone = ZONES[i];
        break;
      }
    }

    this.caughtAnimal = this.rollAnimal(this.targetZone, food.luckBonus);
    this.throwPoseTimer = 0.45;
    this.foodGroup.position.set(this.avatar.position.x + 1.2, 3.5, this.avatar.position.z);
  }

  rollAnimal(zone, luckBonus) {
    const totalWeight = zone.animals.reduce((acc, a) => acc + a.weight, 0);
    let chosen = zone.animals[0];
    const sorted = [...zone.animals].reverse();
    for (const an of sorted) {
      const adjusted = an.weight * luckBonus;
      if (Math.random() * 100 < (adjusted / totalWeight) * 100) {
        chosen = an;
        break;
      }
    }

    let mutation = 'Normal';
    const mutRoll = Math.random() * 100;
    const effLuck = Math.min(3, Math.sqrt(luckBonus));
    if (mutRoll < (MUTATION_DATA.Rainbow.chance * effLuck)) mutation = 'Rainbow';
    else if (mutRoll < (MUTATION_DATA.Emerald.chance * effLuck)) mutation = 'Emerald';
    else if (mutRoll < (MUTATION_DATA.Diamond.chance * effLuck)) mutation = 'Diamond';
    else if (mutRoll < (MUTATION_DATA.Gold.chance * effLuck)) mutation = 'Gold';

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

  updatePlotAnimals(inventory) {
    while (this.plotAnimals.children.length > 0) {
      this.plotAnimals.remove(this.plotAnimals.children[0]);
    }
    this.plotAnimalObjs = [];

    inventory.forEach((item, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = -8 + col * 7.5;
      const z = -8 + row * 7.5;

      const animal = createAnimal(item.id, { mutation: item.mutation, scale: 0.45 });
      animal.group.position.set(x, 0.3, z);
      animal.group.rotation.y = Math.PI / 4; // menghadap kamera
      this.plotAnimals.add(animal.group);
      this.plotAnimalObjs.push(animal);
    });
  }

  updateEquippedPets(inventory, equippedUids) {
    // Simpan posisi lama supaya pet tidak "teleport" setiap UI di-refresh
    const prevPos = this.petObjs.map(p => p.group.position.clone());
    while (this.petCompanionsGroup.children.length > 0) {
      this.petCompanionsGroup.remove(this.petCompanionsGroup.children[0]);
    }
    this.petObjs = [];

    equippedUids.forEach((uid) => {
      const pet = inventory.find(p => p.uid === uid);
      if (pet) {
        const animal = createAnimal(pet.id, { mutation: pet.mutation, scale: 0.3 });
        const prev = prevPos[this.petObjs.length];
        if (prev) animal.group.position.copy(prev);
        else animal.group.position.copy(this.avatar.position);
        this.petCompanionsGroup.add(animal.group);
        this.petObjs.push(animal);
      }
    });
  }

  setTrainingMode(active) {
    this.isTraining = active;
    if (active) this.avatar.position.set(-18, 0, 12);
  }

  update(dt) {
    const time = performance.now() * 0.005;

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

    // Player Walk
    if (!this.isTraining && !this.isThrowing) {
      let dx = (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0);
      let dz = (this.keys.s ? 1 : 0) - (this.keys.w ? 1 : 0);

      if (dx !== 0 || dz !== 0) {
        const len = Math.hypot(dx, dz);
        dx /= len;
        dz /= len;

        this.avatar.position.x += dx * speed * dt;
        this.avatar.position.z += dz * speed * dt;
        this.avatar.rotation.y = Math.atan2(dx, dz);
      }

      this.avatar.position.x = Math.max(-120, Math.min(120, this.avatar.position.x));
      this.avatar.position.z = Math.max(-10, Math.min(5000, this.avatar.position.z));
    }

    // Animasi Zookeeper: jalan (lengan & kaki berayun otomatis), lari lebih cepat
    const walking = isMoving && !this.isTraining && !this.isThrowing;
    this.walkClock = (this.walkClock || 0) + dt * (isSprinting ? 1.8 : 1);
    animateAnimal(this.keeper, this.walkClock, { walking });
    if (this.throwPoseTimer > 0) {
      // Pose melempar: lengan kanan diayun ke atas
      this.throwPoseTimer -= dt;
      this.keeper.parts.armR.rotation.x = -2.5;
    }

    // Pull-up Training
    if (this.isTraining) {
      this.avatar.position.y = (Math.sin(time * 3) + 1) * 1.1;
      this.keeper.parts.armL.rotation.x = Math.PI - 0.2;
      this.keeper.parts.armR.rotation.x = Math.PI - 0.2;
    } else {
      this.avatar.position.y = 0;
    }

    // Floating Pet Companions
    if (this.petObjs.length > 0) {
      this.petObjs.forEach((petObj, i) => {
        const pet = petObj.group;
        const ang = this.avatar.rotation.y + Math.PI + (i === 0 ? -0.6 : 0.6);
        const tx = this.avatar.position.x + Math.sin(ang) * 3;
        const tz = this.avatar.position.z + Math.cos(ang) * 3;
        const ty = 0;
        pet.position.lerp(new THREE.Vector3(tx, ty, tz), dt * 6);
        pet.rotation.y = this.avatar.rotation.y;
      });
    }

    // Throwing Flight
    if (this.isThrowing) {
      this.throwProgress += dt / 2.2;
      this.currentDistance = Math.floor(this.maxDistance * Math.min(1, this.throwProgress));

      const targetZ = Math.min(4800, this.maxDistance / 12);
      const currZ = this.avatar.position.z + targetZ * this.throwProgress;
      const currY = 2 + Math.sin(Math.min(1, this.throwProgress) * Math.PI) * 45;

      this.foodGroup.position.set(0, currY, currZ);
      this.foodGroup.rotation.x += dt * 8;

      this.camera.position.set(currZ * 0.05 + 65, 80, currZ + 65);
      this.camera.lookAt(0, 0, currZ);

      if (this.throwProgress >= 1) {
        this.isThrowing = false;
        this.foodGroup.position.y = -60;
        if (this.onFinishCallback) {
          this.onFinishCallback(this.caughtAnimal, this.maxDistance);
        }
      }
    } else {
      // Follow Player
      const targetCam = new THREE.Vector3(
        this.avatar.position.x + 65,
        80,
        this.avatar.position.z + 65
      );
      this.camera.position.lerp(targetCam, dt * 6);
      this.camera.lookAt(this.avatar.position.x, 0, this.avatar.position.z);
    }

    // Animasi hewan voxel
    const t = performance.now() / 1000;
    this.guardians.forEach(a => tickAnimal(a, t, { walking: false }));
    this.plotAnimalObjs.forEach(a => tickAnimal(a, t, { walking: false }));
    this.petObjs.forEach(a => tickAnimal(a, t, { walking: isMoving && !this.isTraining }));

    this.detectProximityStation();
  }

  detectProximityStation() {
    let closest = null;
    let minDist = Infinity;
    for (const st of this.worldStations) {
      const d = this.avatar.position.distanceTo(st.pos);
      if (d < st.radius && d < minDist) {
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
      if (closest && !this.isThrowing) {
        promptModal.classList.remove('hidden');
        promptKey.textContent = `[${closest.actionKey}]`;
        promptAction.textContent = closest.actionLabel;
        promptDesc.textContent = `${closest.name} • ${closest.desc}`;
      } else {
        promptModal.classList.add('hidden');
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
