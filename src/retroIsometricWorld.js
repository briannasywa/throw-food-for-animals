import * as THREE from 'three';
import { ZONES, MUTATION_DATA, RARITY_COLORS } from './gameData.js';
import { buildVoxelAnimal } from './animalModels.js';

export class RetroIsometricWorld {
  constructor(container) {
    this.container = container;

    // Player Voxel Avatar State
    this.playerPos = new THREE.Vector3(0, 0, 5);
    this.playerRot = 0;
    this.moveSpeed = 16.0;
    this.stamina = 100;
    this.maxStamina = 100;

    // Environmental Wind
    this.windSpeed = 2;
    this.windDirection = 1;
    this.windChangeTimer = 0;

    // Keyboard Input
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

    // Interactive Stations
    this.worldZones = [
      { name: 'THROW LINE', pos: new THREE.Vector3(0, 0, 10), radius: 6, color: '#feae34', desc: '[SPACE] TO THROW' },
      { name: 'PULL-UP GYM', pos: new THREE.Vector3(-18, 0, 12), radius: 6, color: '#0099db', desc: '[E] TO TRAIN' },
      { name: 'SHOP BOOTH', pos: new THREE.Vector3(18, 0, 12), radius: 6, color: '# fee761', desc: 'SELL & UPGRADE' },
      { name: 'ANIMAL PEN', pos: new THREE.Vector3(-35, 0, 30), radius: 15, color: '#63c74d', desc: 'IDLE INCOME' },
    ];

    this.initIsometricScene();
    this.buildVoxelTerrain();
    this.buildCrossyAvatar();
    this.buildVoxelStations();
    this.buildBiomeGates();
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

  initIsometricScene() {
    this.width = this.container.clientWidth || 800;
    this.height = Math.max(420, this.container.clientHeight || 460);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x181425); // Deep 8-bit dark background

    // TRUE ORTHOGRAPHIC ISOMETRIC CAMERA (Crossy Road Style)
    const aspect = this.width / this.height;
    const d = 26; // Frustum scale
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -1000, 2000);

    // True Isometric 30-degree / 45-degree angle
    this.camera.position.set(50, 60, 50);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(1); // Crisp pixelated look
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Sharp hard voxel shadows

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting (Warm directional sunlight for clear voxel edge definition)
    const ambient = new THREE.AmbientLight(0xc0cbdc, 0.65);
    this.scene.add(ambient);

    this.sun = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sun.position.set(80, 140, 60);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 1024;
    this.sun.shadow.mapSize.height = 1024;
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 400;
    const shadowD = 60;
    this.sun.shadow.camera.left = -shadowD;
    this.sun.shadow.camera.right = shadowD;
    this.sun.shadow.camera.top = shadowD;
    this.sun.shadow.camera.bottom = -shadowD;
    this.scene.add(this.sun);
  }

  buildVoxelTerrain() {
    // Crossy Road style Checkerboard Grass Ground
    const groundGeo = new THREE.PlaneGeometry(300, 2800);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x38734a });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, 0, 1400);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Main Runway Track (Voxel Cobblestone)
    const trackGeo = new THREE.BoxGeometry(18, 0.4, 2600);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0x5a6988 });
    this.track = new THREE.Mesh(trackGeo, trackMat);
    this.track.position.set(0, 0.2, 1400);
    this.track.receiveShadow = true;
    this.scene.add(this.track);

    // Voxel Stud Rails (Crossy style curb)
    const curbGeo = new THREE.BoxGeometry(1.2, 0.8, 2600);
    const curbMat = new THREE.MeshLambertMaterial({ color: 0xfeae34 });
    const curbL = new THREE.Mesh(curbGeo, curbMat);
    curbL.position.set(-9.6, 0.4, 1400);
    const curbR = new THREE.Mesh(curbGeo, curbMat);
    curbR.position.set(9.6, 0.4, 1400);
    this.scene.add(curbL, curbR);

    // Distance Milestone Posts
    for (let z = 100; z <= 2400; z += 200) {
      const postGeo = new THREE.BoxGeometry(1.2, 8, 1.2);
      const postMat = new THREE.MeshLambertMaterial({ color: 0x0099db });
      const pL = new THREE.Mesh(postGeo, postMat);
      pL.position.set(-11, 4, z);
      const pR = pL.clone();
      pR.position.x = 11;

      const cross = new THREE.Mesh(new THREE.BoxGeometry(24, 1.6, 0.8), new THREE.MeshLambertMaterial({ color: 0x262b44 }));
      cross.position.set(0, 7.5, z);
      this.scene.add(pL, pR, cross);
    }
  }

  // Crossy Road Voxel Character
  buildCrossyAvatar() {
    this.avatar = new THREE.Group();
    this.avatar.position.copy(this.playerPos);

    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfeae34 }); // Voxel Skin
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x0099db }); // Classic Blue
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x63c74d }); // Green Pants

    // Head
    this.head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), skinMat);
    this.head.position.set(0, 4.4, 0);
    this.head.castShadow = true;

    // Voxel Eyes (2 dark cubes)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x181425 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.1), eyeMat);
    eyeL.position.set(-0.4, 4.5, 0.85);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.4;
    this.avatar.add(eyeL, eyeR);

    // Torso
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.4), shirtMat);
    this.torso.position.set(0, 2.7, 0);
    this.torso.castShadow = true;

    // Limbs with Joints
    const limbGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
    limbGeo.translate(0, -0.9, 0);

    this.armL = new THREE.Mesh(limbGeo, skinMat);
    this.armL.position.set(-1.5, 3.5, 0);
    this.armL.castShadow = true;

    this.armR = new THREE.Mesh(limbGeo, skinMat);
    this.armR.position.set(1.5, 3.5, 0);
    this.armR.castShadow = true;

    this.legL = new THREE.Mesh(limbGeo, pantsMat);
    this.legL.position.set(-0.6, 1.8, 0);
    this.legL.castShadow = true;

    this.legR = new THREE.Mesh(limbGeo, pantsMat);
    this.legR.position.set(0.6, 1.8, 0);
    this.legR.castShadow = true;

    this.avatar.add(this.head, this.torso, this.armL, this.armR, this.legL, this.legR);
    this.scene.add(this.avatar);

    // Equipped Companion Pets Group
    this.petCompanionsGroup = new THREE.Group();
    this.scene.add(this.petCompanionsGroup);
  }

  buildVoxelStations() {
    // Throw Pad
    const pad = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 8), new THREE.MeshLambertMaterial({ color: 0xfeae34 }));
    pad.position.set(0, 0.15, 10);
    this.scene.add(pad);

    // Gym Station
    this.gymStation = new THREE.Group();
    this.gymStation.position.set(-18, 0, 12);
    const gymFloor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 12), new THREE.MeshLambertMaterial({ color: 0x262b44 }));
    gymFloor.position.y = 0.15;
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8, 0.6), new THREE.MeshLambertMaterial({ color: 0x8b9bb4 }));
    p1.position.set(-2.5, 4, 0);
    const p2 = p1.clone();
    p2.position.x = 2.5;
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xc0cbdc }));
    topBar.position.set(0, 7.8, 0);
    this.gymStation.add(gymFloor, p1, p2, topBar);
    this.scene.add(this.gymStation);

    // Shop Booth
    this.shopStation = new THREE.Group();
    this.shopStation.position.set(18, 0, 12);
    const shopBase = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 6), new THREE.MeshLambertMaterial({ color: 0x733e39 }));
    shopBase.position.y = 2.5;
    const shopRoof = new THREE.Mesh(new THREE.BoxGeometry(9, 1.5, 7), new THREE.MeshLambertMaterial({ color: 0xe43b44 }));
    shopRoof.position.y = 5.7;
    this.shopStation.add(shopBase, shopRoof);
    this.scene.add(this.shopStation);

    // Animal Plot
    this.plotStation = new THREE.Group();
    this.plotStation.position.set(-35, 0, 30);
    const plotFloor = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 26), new THREE.MeshLambertMaterial({ color: 0x1e4832 }));
    plotFloor.position.y = 0.15;
    this.plotStation.add(plotFloor);
    this.plotAnimalsGroup = new THREE.Group();
    this.plotStation.add(this.plotAnimalsGroup);
    this.scene.add(this.plotStation);
  }

  buildBiomeGates() {
    this.biomeGates = new THREE.Group();
    ZONES.forEach((zone) => {
      const zPos = Math.max(50, zone.minDist / 18);
      const gateMat = new THREE.MeshLambertMaterial({ color: zone.groundColor });
      const pL = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), gateMat);
      pL.position.set(-13, 8, zPos);
      const pR = pL.clone();
      pR.position.x = 13;
      const top = new THREE.Mesh(new THREE.BoxGeometry(29, 3, 3), gateMat);
      top.position.set(0, 16, zPos);

      const statue = this.createVoxelAnimalMesh(zone.animals[0]);
      statue.scale.set(1.4, 1.4, 1.4);
      statue.position.set(18, 2, zPos);

      this.biomeGates.add(pL, pR, top, statue);
    });
    this.scene.add(this.biomeGates);
  }

  createVoxelAnimalMesh(animalConfig) {
    // Gunakan procedural voxel builder anatomis & sangar
    const animalId = animalConfig?.id || 'rabbit';
    const rarity = animalConfig?.rarity || 'Common';
    const mutation = animalConfig?.mutation || 'Normal';
    return buildVoxelAnimal(animalId, rarity, mutation);
  }

  buildFoodProjectile() {
    this.foodGroup = new THREE.Group();
    const bun = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), new THREE.MeshLambertMaterial({ color: 0xfeae34 }));
    const meat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 1.5), new THREE.MeshLambertMaterial({ color: 0x733e39 }));
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
        if (this.currentNearbyStation?.name === 'THROW LINE') {
          window.dispatchEvent(new CustomEvent('retro:throw'));
        }
      }
      if (k === 'e') {
        if (this.currentNearbyStation?.name === 'PULL-UP GYM') {
          window.dispatchEvent(new CustomEvent('retro:pullup'));
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

    this.maxDistance = Math.max(40, Math.floor(power * timingFactor * staminaFactor * windEffect * 42));
    this.stamina = Math.max(0, this.stamina - 25);

    this.targetZone = ZONES[0];
    for (let i = ZONES.length - 1; i >= 0; i--) {
      if (this.maxDistance >= ZONES[i].minDist) {
        this.targetZone = ZONES[i];
        break;
      }
    }

    this.caughtAnimal = this.rollAnimal(this.targetZone, food.luckBonus);
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
    while (this.plotAnimalsGroup.children.length > 0) {
      this.plotAnimalsGroup.remove(this.plotAnimalsGroup.children[0]);
    }

    inventory.forEach((item, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = -8 + col * 7.5;
      const z = -8 + row * 7.5;

      const mesh = this.createVoxelAnimalMesh(item);
      mesh.scale.set(0.8, 0.8, 0.8);
      mesh.position.set(x, 0.5, z);
      this.plotAnimalsGroup.add(mesh);
    });
  }

  updateEquippedPets(inventory, equippedUids) {
    while (this.petCompanionsGroup.children.length > 0) {
      this.petCompanionsGroup.remove(this.petCompanionsGroup.children[0]);
    }

    equippedUids.forEach((uid) => {
      const pet = inventory.find(p => p.uid === uid);
      if (pet) {
        const mesh = this.createVoxelAnimalMesh(pet);
        mesh.scale.set(0.4, 0.4, 0.4);
        this.petCompanionsGroup.add(mesh);
      }
    });
  }

  setTrainingMode(active) {
    this.isTraining = active;
    if (active) this.avatar.position.set(-18, 0, 12);
  }

  update(dt) {
    const time = performance.now() * 0.005;

    // Wind updates
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

    // True Isometric Diagonal Movement
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

        // Voxel leg wobble
        const legAngle = Math.sin(time * (isSprinting ? 18 : 10)) * 0.6;
        this.legL.rotation.x = legAngle;
        this.legR.rotation.x = -legAngle;
        this.armL.rotation.x = -legAngle;
        this.armR.rotation.x = legAngle;
      } else {
        this.legL.rotation.x = 0;
        this.legR.rotation.x = 0;
        this.armL.rotation.x = 0;
        this.armR.rotation.x = 0;
      }

      this.avatar.position.x = Math.max(-100, Math.min(100, this.avatar.position.x));
      this.avatar.position.z = Math.max(-10, Math.min(2500, this.avatar.position.z));
    }

    // Pull-up
    if (this.isTraining) {
      this.avatar.position.y = (Math.sin(time * 3) + 1) * 1.1;
      this.armL.rotation.x = Math.PI - 0.2;
      this.armR.rotation.x = Math.PI - 0.2;
    } else {
      this.avatar.position.y = 0;
    }

    // Floating Pet Companion Lerp
    if (this.petCompanionsGroup.children.length > 0) {
      this.petCompanionsGroup.children.forEach((pet, i) => {
        const ang = this.avatar.rotation.y + Math.PI + (i === 0 ? -0.6 : 0.6);
        const tx = this.avatar.position.x + Math.sin(ang) * 3;
        const tz = this.avatar.position.z + Math.cos(ang) * 3;
        const ty = 1.2 + Math.sin(time * 3 + i) * 0.3;
        pet.position.lerp(new THREE.Vector3(tx, ty, tz), dt * 6);
        pet.rotation.y = this.avatar.rotation.y;
      });
    }

    // Throwing Simulation
    if (this.isThrowing) {
      this.throwProgress += dt / 2.0;
      this.currentDistance = Math.floor(this.maxDistance * Math.min(1, this.throwProgress));

      const targetZ = Math.min(2500, this.maxDistance / 18);
      const currZ = this.avatar.position.z + targetZ * this.throwProgress;
      const currY = 2 + Math.sin(Math.min(1, this.throwProgress) * Math.PI) * 35;

      this.foodGroup.position.set(0, currY, currZ);
      this.foodGroup.rotation.x += dt * 8;

      // Isometric Camera follows along runway
      this.camera.position.set(currZ * 0.05 + 50, 60, currZ + 50);
      this.camera.lookAt(0, 0, currZ);

      if (this.throwProgress >= 1) {
        this.isThrowing = false;
        this.foodGroup.position.y = -60;
        if (this.onFinishCallback) {
          this.onFinishCallback(this.caughtAnimal, this.maxDistance);
        }
      }
    } else {
      // Smooth Isometric follow
      const targetCam = new THREE.Vector3(
        this.avatar.position.x + 50,
        60,
        this.avatar.position.z + 50
      );
      this.camera.position.lerp(targetCam, dt * 6);
      this.camera.lookAt(this.avatar.position.x, 0, this.avatar.position.z);
    }

    this.detectStation();
  }

  detectStation() {
    let closest = null;
    let minDist = Infinity;
    for (const st of this.worldZones) {
      const d = this.avatar.position.distanceTo(st.pos);
      if (d < st.radius && d < minDist) {
        minDist = d;
        closest = st;
      }
    }
    this.currentNearbyStation = closest;
    const pElem = document.querySelector('#station-prompt');
    const pTitle = document.querySelector('#station-title');
    const pDesc = document.querySelector('#station-desc');
    if (pElem && pTitle && pDesc) {
      if (closest && !this.isThrowing) {
        pElem.classList.remove('hidden');
        pTitle.textContent = closest.name;
        pDesc.textContent = closest.desc;
      } else {
        pElem.classList.add('hidden');
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

