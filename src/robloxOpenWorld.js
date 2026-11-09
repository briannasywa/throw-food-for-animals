import * as THREE from 'three';
import { ZONES, MUTATION_DATA, RARITY_COLORS } from './gameData.js';

export class RobloxOpenWorld {
  constructor(container) {
    this.container = container;
    
    // Player Character state
    this.playerPos = new THREE.Vector3(0, 0, 5);
    this.playerRot = 0; // Yaw in radians
    this.playerVelocity = new THREE.Vector3();
    this.isGrounded = true;
    this.moveSpeed = 16.0;
    this.stamina = 100;
    this.maxStamina = 100;
    this.staminaExhausted = false;

    // Wind Dynamics & Difficulty factors
    this.windSpeed = 0; // -10 to +10 (meters/sec)
    this.windDirection = 1; // 1 = Tail wind (boosts throw), -1 = Head wind (resists throw)
    this.windChangeTimer = 0;

    // Movement Key States (WASD / Arrows)
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false,
      space: false
    };

    // Camera Orbit / Third-person settings
    this.cameraDistance = 18;
    this.cameraPitch = 0.35;
    this.cameraYaw = 0;
    this.isRightMouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;

    // Throwing Simulation State
    this.isThrowing = false;
    this.throwProgress = 0;
    this.maxDistance = 100;
    this.currentDistance = 0;
    this.targetZone = ZONES[0];
    this.foodItem = null;
    this.caughtAnimal = null;
    this.onFinishCallback = null;

    // Training state
    this.isTraining = false;

    // Interactive Zone triggers in Open World
    this.worldZones = [
      { name: 'Throw Line', pos: new THREE.Vector3(0, 0, 10), radius: 6, color: '#f59e0b', desc: 'Tekan [SPASI] untuk Lempar' },
      { name: 'Pull-Up Gym', pos: new THREE.Vector3(-18, 0, 12), radius: 6, color: '#3b82f6', desc: 'Tekan [E] untuk Mulai Pull-up' },
      { name: 'Master NPC Stand', pos: new THREE.Vector3(18, 0, 12), radius: 6, color: '#eab308', desc: 'Toko & Jual Hewan' },
      { name: 'Player Plot', pos: new THREE.Vector3(-35, 0, 30), radius: 15, color: '#10b981', desc: 'Kandang Hewan & Idle Tycoon' },
    ];

    this.initScene();
    this.buildOpenWorld();
    this.buildRobloxAvatar();
    this.buildInteractiveStations();
    this.buildBiomeGates();
    this.buildFoodProjectile();
    this.setupInputListeners();

    // Start Animation Loop
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
    this.width = this.container.clientWidth || 800;
    this.height = Math.max(420, this.container.clientHeight || 460);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#38bdf8');
    this.scene.fog = new THREE.FogExp2('#38bdf8', 0.0022);

    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 3000);
    this.camera.position.set(0, 15, 25);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Sunlight and Sky ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambient);

    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    this.sunLight.position.set(60, 120, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 400;
    this.sunLight.shadow.camera.left = -100;
    this.sunLight.shadow.camera.right = 100;
    this.sunLight.shadow.camera.top = 100;
    this.sunLight.shadow.camera.bottom = -100;
    this.scene.add(this.sunLight);
  }

  buildOpenWorld() {
    // Massive Open World Grass Baseplate
    const groundGeo = new THREE.PlaneGeometry(350, 3000);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, 0, 1400);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Main Throwing Runway Track (Stone Studded)
    const trackGeo = new THREE.BoxGeometry(20, 0.4, 2800);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    this.track = new THREE.Mesh(trackGeo, trackMat);
    this.track.position.set(0, 0.2, 1410);
    this.track.receiveShadow = true;
    this.scene.add(this.track);

    // Left & Right Hazard Curbs
    const curbGeo = new THREE.BoxGeometry(1.2, 0.8, 2800);
    const curbMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const curbL = new THREE.Mesh(curbGeo, curbMat);
    curbL.position.set(-10.6, 0.4, 1410);
    const curbR = new THREE.Mesh(curbGeo, curbMat);
    curbR.position.set(10.6, 0.4, 1410);
    this.scene.add(curbL, curbR);

    // Decorative Studs on the Main Runway (InstancedMesh)
    const studGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.16, 8);
    const studMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
    const studInstanced = new THREE.InstancedMesh(studGeo, studMat, 500);
    const dummy = new THREE.Object3D();
    let studIndex = 0;
    for (let z = 15; z < 2500; z += 20) {
      for (let x of [-7, -3.5, 0, 3.5, 7]) {
        if (studIndex < 500) {
          dummy.position.set(x, 0.45, z);
          dummy.updateMatrix();
          studInstanced.setMatrixAt(studIndex++, dummy.matrix);
        }
      }
    }
    this.scene.add(studInstanced);

    // Distance Milestone Banners along the track
    for (let z = 100; z <= 2400; z += 200) {
      const postGeo = new THREE.BoxGeometry(1.4, 10, 1.4);
      const postMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
      const pL = new THREE.Mesh(postGeo, postMat);
      pL.position.set(-12, 5, z);
      const pR = pL.clone();
      pR.position.x = 12;

      const crossGeo = new THREE.BoxGeometry(26, 2, 0.8);
      const crossMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const cross = new THREE.Mesh(crossGeo, crossMat);
      cross.position.set(0, 9, z);

      this.scene.add(pL, pR, cross);
    }
  }

  // Authentic Roblox R6 Avatar with Animated Limbs
  buildRobloxAvatar() {
    this.avatar = new THREE.Group();
    this.avatar.position.copy(this.playerPos);

    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfde047 }); // Classic Roblox Yellow Skin
    const torsoMat = new THREE.MeshLambertMaterial({ color: 0x2563eb }); // Classic Blue Shirt
    const legMat = new THREE.MeshLambertMaterial({ color: 0x16a34a }); // Classic Green Pants

    // Head with Top Stud & Face
    const headGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    this.charHead = new THREE.Mesh(headGeo, skinMat);
    this.charHead.position.set(0, 5.2, 0);
    this.charHead.castShadow = true;

    const topStudGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
    const topStud = new THREE.Mesh(topStudGeo, skinMat);
    topStud.position.set(0, 0.82, 0);
    this.charHead.add(topStud);

    // Eyes & Smile
    const faceMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.05);
    const eyeL = new THREE.Mesh(eyeGeo, faceMat);
    eyeL.position.set(-0.35, 5.3, 0.72);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.35;
    const mouthGeo = new THREE.BoxGeometry(0.6, 0.15, 0.05);
    const mouth = new THREE.Mesh(mouthGeo, faceMat);
    mouth.position.set(0, 4.9, 0.72);
    this.avatar.add(eyeL, eyeR, mouth);

    // Torso (2.2 x 2.4 x 1.2)
    const torsoGeo = new THREE.BoxGeometry(2.2, 2.4, 1.2);
    this.charTorso = new THREE.Mesh(torsoGeo, torsoMat);
    this.charTorso.position.set(0, 3.3, 0);
    this.charTorso.castShadow = true;

    // Limbs with Pivot Points for Realistic Running Animation
    const limbGeo = new THREE.BoxGeometry(1.05, 2.4, 1.05);
    limbGeo.translate(0, -1.2, 0); // Translate origin to shoulder / hip joint

    // Left Arm
    this.armL = new THREE.Mesh(limbGeo, skinMat);
    this.armL.position.set(-1.65, 4.4, 0);
    this.armL.castShadow = true;

    // Right Arm
    this.armR = new THREE.Mesh(limbGeo, skinMat);
    this.armR.position.set(1.65, 4.4, 0);
    this.armR.castShadow = true;

    // Left Leg
    this.legL = new THREE.Mesh(limbGeo, legMat);
    this.legL.position.set(-0.55, 2.2, 0);
    this.legL.castShadow = true;

    // Right Leg
    this.legR = new THREE.Mesh(limbGeo, legMat);
    this.legR.position.set(0.55, 2.2, 0);
    this.legR.castShadow = true;

    this.avatar.add(this.charHead, this.charTorso, this.armL, this.armR, this.legL, this.legR);
    this.scene.add(this.avatar);

    // Group for Pet Companions floating behind the player
    this.petCompanionsGroup = new THREE.Group();
    this.scene.add(this.petCompanionsGroup);
  }

  // Interactive Open World Stations
  buildInteractiveStations() {
    // 1. Throw Start Line Pad
    const padGeo = new THREE.CylinderGeometry(5, 5, 0.4, 24);
    const padMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const throwPad = new THREE.Mesh(padGeo, padMat);
    throwPad.position.set(0, 0.25, 10);
    this.scene.add(throwPad);

    // 2. Outdoor Gym with Pull-Up Bars
    this.gymStation = new THREE.Group();
    this.gymStation.position.set(-18, 0, 12);
    const gymFloor = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 14), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    gymFloor.position.y = 0.15;
    this.gymStation.add(gymFloor);

    // Multi-tier Pull-up Bars
    const barMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 8), poleMat);
    p1.position.set(-3, 4.5, 0);
    const p2 = p1.clone();
    p2.position.x = 3;
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 6.2, 12), barMat);
    topBar.rotation.z = Math.PI / 2;
    topBar.position.set(0, 8.8, 0);

    // Gym Signboard
    const gymSign = new THREE.Mesh(new THREE.BoxGeometry(7, 1.4, 0.3), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
    gymSign.position.set(0, 10, 0);
    this.gymStation.add(p1, p2, topBar, gymSign);
    this.scene.add(this.gymStation);

    // 3. Master Game NPC Booth
    this.npcStation = new THREE.Group();
    this.npcStation.position.set(18, 0, 12);
    const npcBooth = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 8), new THREE.MeshLambertMaterial({ color: 0x78350f }));
    npcBooth.position.y = 3;
    const npcRoof = new THREE.Mesh(new THREE.ConeGeometry(8, 3, 4), new THREE.MeshLambertMaterial({ color: 0xd97706 }));
    npcRoof.rotation.y = Math.PI / 4;
    npcRoof.position.y = 7.5;

    // NPC Wizard Character
    const wizardMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 1.5), new THREE.MeshLambertMaterial({ color: 0x6366f1 }));
    wizardMesh.position.set(0, 2, 4.5);
    const wizardHat = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 8), new THREE.MeshLambertMaterial({ color: 0x4338ca }));
    wizardHat.position.set(0, 4.8, 4.5);
    this.npcStation.add(npcBooth, npcRoof, wizardMesh, wizardHat);
    this.scene.add(this.npcStation);

    // 4. Animal Plot Pen
    this.plotStation = new THREE.Group();
    this.plotStation.position.set(-35, 0, 30);
    const plotPad = new THREE.Mesh(new THREE.BoxGeometry(28, 0.4, 28), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    plotPad.position.y = 0.2;
    this.plotStation.add(plotPad);
    this.plotAnimalsGroup = new THREE.Group();
    this.plotStation.add(this.plotAnimalsGroup);
    this.scene.add(this.plotStation);
  }

  buildBiomeGates() {
    this.biomeGates = new THREE.Group();

    ZONES.forEach((zone) => {
      const zPos = Math.max(50, zone.minDist / 18);
      const gateMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(zone.bgGradient[1]) });
      const pL = new THREE.Mesh(new THREE.BoxGeometry(4, 22, 4), gateMat);
      pL.position.set(-15, 11, zPos);
      const pR = pL.clone();
      pR.position.x = 15;

      const arch = new THREE.Mesh(new THREE.BoxGeometry(34, 5, 5), gateMat);
      arch.position.set(0, 22, zPos);

      // Animal Monument beside gate
      const statue = this.createVoxelAnimalMesh(zone.animals[0]);
      statue.scale.set(1.8, 1.8, 1.8);
      statue.position.set(20, 2, zPos);

      this.biomeGates.add(pL, pR, arch, statue);
    });

    this.scene.add(this.biomeGates);
  }

  createVoxelAnimalMesh(animalConfig) {
    const group = new THREE.Group();
    const color = new THREE.Color(RARITY_COLORS[animalConfig?.rarity || 'Common'] || '#38bdf8');
    const mat = new THREE.MeshLambertMaterial({ color });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 3), mat);
    body.position.y = 2;
    body.castShadow = true;

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), mat);
    head.position.set(0, 3.2, 1.6);
    head.castShadow = true;

    const legGeo = new THREE.BoxGeometry(0.7, 1.5, 0.7);
    const l1 = new THREE.Mesh(legGeo, mat);
    l1.position.set(-0.8, 0.75, 1);
    const l2 = l1.clone();
    l2.position.x = 0.8;
    const l3 = l1.clone();
    l3.position.z = -1;
    const l4 = l2.clone();
    l4.position.z = -1;

    group.add(body, head, l1, l2, l3, l4);
    return group;
  }

  updateEquippedPetCompanions(inventory, equippedUids) {
    while (this.petCompanionsGroup.children.length > 0) {
      this.petCompanionsGroup.remove(this.petCompanionsGroup.children[0]);
    }

    equippedUids.forEach((uid, index) => {
      const petData = inventory.find(p => p.uid === uid);
      if (petData) {
        const petMesh = this.createVoxelAnimalMesh(petData);
        petMesh.scale.set(0.45, 0.45, 0.45);
        this.petCompanionsGroup.add(petMesh);
      }
    });
  }

  updatePlotAnimals(inventory) {
    while (this.plotAnimalsGroup.children.length > 0) {
      this.plotAnimalsGroup.remove(this.plotAnimalsGroup.children[0]);
    }

    inventory.forEach((item, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = -8 + col * 7.5;
      const z = -8 + row * 7.5;

      const mesh = this.createVoxelAnimalMesh(item);
      mesh.scale.set(0.85, 0.85, 0.85);
      mesh.position.set(x, 0.5, z);

      if (item.mutation !== 'Normal') {
        const auraGeo = new THREE.RingGeometry(1.4, 2.0, 16);
        const auraMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(MUTATION_DATA[item.mutation]?.color || '#ffffff'),
          side: THREE.DoubleSide
        });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        aura.rotation.x = -Math.PI / 2;
        aura.position.set(x, 0.55, z);
        this.plotAnimalsGroup.add(aura);
      }

      this.plotAnimalsGroup.add(mesh);
    });
  }

  buildFoodProjectile() {
    this.foodGroup = new THREE.Group();
    const breadMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const pattyMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });
    const greensMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });

    const topBun = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), breadMat);
    topBun.position.y = 0.5;
    const patty = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.7), pattyMat);
    const greens = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1.8), greensMat);
    greens.position.y = 0.2;
    const botBun = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.6), breadMat);
    botBun.position.y = -0.3;

    this.foodGroup.add(topBun, greens, patty, botBun);
    this.foodGroup.position.set(0, -60, 0);
    this.scene.add(this.foodGroup);
  }

  setupInputListeners() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.keys.w = true;
      if (key === 's' || key === 'arrowdown') this.keys.s = true;
      if (key === 'a' || key === 'arrowleft') this.keys.a = true;
      if (key === 'd' || key === 'arrowright') this.keys.d = true;
      if (key === 'shift') this.keys.shift = true;
      if (key === ' ') {
        this.keys.space = true;
        // Space shortcut: If in Throw Area, throw food!
        if (this.currentNearbyStation?.name === 'Throw Line') {
          window.dispatchEvent(new CustomEvent('roblox:triggerThrow'));
        }
      }
      if (key === 'e') {
        // E shortcut: If in Gym, toggle pull-up
        if (this.currentNearbyStation?.name === 'Pull-Up Gym') {
          window.dispatchEvent(new CustomEvent('roblox:togglePullup'));
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.keys.w = false;
      if (key === 's' || key === 'arrowdown') this.keys.s = false;
      if (key === 'a' || key === 'arrowleft') this.keys.a = false;
      if (key === 'd' || key === 'arrowright') this.keys.d = false;
      if (key === 'shift') this.keys.shift = false;
      if (key === ' ') this.keys.space = false;
    });

    // Mouse camera rotation (Right click drag or Click Drag)
    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      if (e.button === 2 || e.button === 0) {
        this.isRightMouseDown = true;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isRightMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isRightMouseDown) {
        const dx = e.clientX - this.mouseX;
        const dy = e.clientY - this.mouseY;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        this.cameraYaw -= dx * 0.006;
        this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch + dy * 0.005));
      }
    });

    // Prevent context menu
    dom.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  startThrow({ food, power, timingScore, onFinish }) {
    this.isThrowing = true;
    this.throwProgress = 0;
    this.foodItem = food;
    this.onFinishCallback = onFinish;

    // Harder Formula: Distance influenced by Power, Timing, Wind and Stamina!
    const timingFactor = Math.pow(Math.max(1, timingScore) / 20, 1.4);
    const staminaFactor = 0.5 + (this.stamina / this.maxStamina) * 0.5; // Up to 50% penalty if out of breath!
    const windEffect = 1 + (this.windSpeed * this.windDirection * 0.03); // Wind boosts or hinders distance!

    this.maxDistance = Math.max(40, Math.floor(power * timingFactor * staminaFactor * windEffect * 42));

    // Exhaust stamina after a throw
    this.stamina = Math.max(0, this.stamina - 25);

    // Zone detection
    this.targetZone = ZONES[0];
    for (let i = ZONES.length - 1; i >= 0; i--) {
      if (this.maxDistance >= ZONES[i].minDist) {
        this.targetZone = ZONES[i];
        break;
      }
    }

    // Animal roll
    this.caughtAnimal = this.rollAnimal(this.targetZone, food.luckBonus);

    // Initial food position from character hands
    this.foodGroup.position.set(this.avatar.position.x + 1.5, 4.5, this.avatar.position.z);
  }

  rollAnimal(zone, luckBonus) {
    const totalWeight = zone.animals.reduce((acc, a) => acc + a.weight, 0);
    let chosen = zone.animals[0];
    const sorted = [...zone.animals].reverse();
    for (const an of sorted) {
      const adjustedThreshold = (an.weight * luckBonus);
      if (Math.random() * 100 < (adjustedThreshold / totalWeight) * 100) {
        chosen = an;
        break;
      }
    }

    let mutation = 'Normal';
    const mutRoll = Math.random() * 100;
    const effLuck = Math.min(3, Math.sqrt(luckBonus));
    if (mutRoll < (MUTATION_DATA.Rainbow.chance * effLuck)) {
      mutation = 'Rainbow';
    } else if (mutRoll < (MUTATION_DATA.Emerald.chance * effLuck)) {
      mutation = 'Emerald';
    } else if (mutRoll < (MUTATION_DATA.Diamond.chance * effLuck)) {
      mutation = 'Diamond';
    } else if (mutRoll < (MUTATION_DATA.Gold.chance * effLuck)) {
      mutation = 'Gold';
    }

    return {
      id: chosen.id,
      name: chosen.name,
      icon: chosen.icon,
      rarity: chosen.rarity,
      baseCps: chosen.baseCps,
      zoneName: zone.name,
      mutation
    };
  }

  setTrainingMode(active) {
    this.isTraining = active;
    if (active) {
      // Teleport character to gym pull-up bar
      this.avatar.position.set(-18, 0, 12);
    } else {
      this.armL.rotation.set(0, 0, 0);
      this.armR.rotation.set(0, 0, 0);
    }
  }

  update(dt) {
    const time = performance.now() * 0.005;

    // 1. Dynamic Wind Updates (Harder Mechanic)
    this.windChangeTimer += dt;
    if (this.windChangeTimer >= 5.0) {
      this.windChangeTimer = 0;
      this.windSpeed = Math.floor(Math.random() * 12); // 0 to 12 m/s
      this.windDirection = Math.random() > 0.45 ? 1 : -1; // Tailwind or Headwind
    }

    // 2. Stamina Recovery & Sprinting
    const isMoving = this.keys.w || this.keys.s || this.keys.a || this.keys.d;
    const isSprinting = this.keys.shift && isMoving && this.stamina > 5;
    
    if (isSprinting) {
      this.stamina = Math.max(0, this.stamina - dt * 25);
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + dt * 15);
    }

    const currentSpeed = (isSprinting ? this.moveSpeed * 1.8 : this.moveSpeed);

    // 3. Open World Player Movement (Free Walking & Rotating)
    if (!this.isTraining && !this.isThrowing) {
      const moveZ = (this.keys.s ? 1 : 0) - (this.keys.w ? 1 : 0);
      const moveX = (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0);

      if (moveX !== 0 || moveZ !== 0) {
        // Compute movement vector relative to camera yaw
        const inputVec = new THREE.Vector3(moveX, 0, moveZ).normalize();
        inputVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

        this.avatar.position.x += inputVec.x * currentSpeed * dt;
        this.avatar.position.z += inputVec.z * currentSpeed * dt;

        // Smoothly rotate character toward movement direction
        const targetRot = Math.atan2(inputVec.x, inputVec.z);
        this.avatar.rotation.y = targetRot;

        // Realistic R6 Limbs Walking / Running Animation
        const animSpeed = isSprinting ? 18 : 10;
        const legAngle = Math.sin(time * animSpeed) * 0.65;
        this.legL.rotation.x = legAngle;
        this.legR.rotation.x = -legAngle;
        this.armL.rotation.x = -legAngle;
        this.armR.rotation.x = legAngle;
      } else {
        // Idle pose
        this.legL.rotation.x = 0;
        this.legR.rotation.x = 0;
        this.armL.rotation.x = Math.sin(time) * 0.08;
        this.armR.rotation.x = -Math.sin(time) * 0.08;
      }

      // Constrain player inside world boundaries
      this.avatar.position.x = Math.max(-120, Math.min(120, this.avatar.position.x));
      this.avatar.position.z = Math.max(-10, Math.min(2700, this.avatar.position.z));
    }

    // Animate Equipped Pet Companions floating behind the player
    if (this.petCompanionsGroup.children.length > 0) {
      this.petCompanionsGroup.children.forEach((petMesh, i) => {
        const offsetAngle = this.avatar.rotation.y + Math.PI + (i === 0 ? -0.7 : 0.7);
        const targetX = this.avatar.position.x + Math.sin(offsetAngle) * 3.5;
        const targetZ = this.avatar.position.z + Math.cos(offsetAngle) * 3.5;
        const targetY = 1.6 + Math.sin(time * 3 + i) * 0.4;

        petMesh.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), dt * 6);
        petMesh.rotation.y = this.avatar.rotation.y;
      });
    }

    // 4. Training Animation (Pull-up bobbing)
    if (this.isTraining) {
      const pullUpDelta = (Math.sin(time * 3) + 1) * 0.5;
      this.avatar.position.y = pullUpDelta * 2.2;
      this.armL.rotation.x = Math.PI - 0.2;
      this.armR.rotation.x = Math.PI - 0.2;
    } else {
      this.avatar.position.y = 0;
    }

    // 5. Detect Nearby Interactive Stations
    this.detectNearbyStation();

    // 6. Throw Flight Trajectory & Dynamic Chase Camera
    if (this.isThrowing) {
      this.throwProgress += dt / 2.2;
      this.currentDistance = Math.floor(this.maxDistance * Math.min(1, this.throwProgress));

      const targetZ = Math.min(2600, this.maxDistance / 18);
      const currZ = this.avatar.position.z + targetZ * this.throwProgress;
      const arcHeight = 40 + (this.maxDistance * 0.002);
      const currY = 2 + Math.sin(Math.min(1, this.throwProgress) * Math.PI) * arcHeight;

      this.foodGroup.position.set(0, currY, currZ);
      this.foodGroup.rotation.x += dt * 10;
      this.foodGroup.rotation.y += dt * 8;

      // Third-person chase camera tracking food
      this.camera.position.set(
        -14,
        Math.max(12, currY + 9),
        Math.max(this.avatar.position.z + 15, currZ - 22)
      );
      this.camera.lookAt(0, currY, currZ + 8);

      if (this.throwProgress >= 1) {
        this.isThrowing = false;
        this.foodGroup.position.y = -60;
        if (this.onFinishCallback) {
          this.onFinishCallback(this.caughtAnimal, this.maxDistance, this.targetZone);
        }
      }
    } else {
      // Third Person Follow Camera centered on player
      const camOffset = new THREE.Vector3(
        Math.sin(this.cameraYaw) * this.cameraDistance,
        this.cameraPitch * 25 + 6,
        Math.cos(this.cameraYaw) * this.cameraDistance
      );

      const targetCamPos = this.avatar.position.clone().add(camOffset);
      this.camera.position.lerp(targetCamPos, dt * 8);
      this.camera.lookAt(this.avatar.position.x, this.avatar.position.y + 4.5, this.avatar.position.z);
    }
  }

  detectNearbyStation() {
    let closest = null;
    let minDist = Infinity;

    for (const station of this.worldZones) {
      const dist = this.avatar.position.distanceTo(station.pos);
      if (dist < station.radius && dist < minDist) {
        minDist = dist;
        closest = station;
      }
    }

    this.currentNearbyStation = closest;
    const promptElem = document.querySelector('#world-interaction-prompt');
    const promptText = document.querySelector('#prompt-station-desc');
    const stationTitle = document.querySelector('#prompt-station-title');

    if (promptElem && promptText && stationTitle) {
      if (closest && !this.isThrowing) {
        promptElem.classList.remove('hidden');
        stationTitle.textContent = closest.name;
        promptText.textContent = closest.desc;
      } else {
        promptElem.classList.add('hidden');
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

