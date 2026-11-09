import * as THREE from 'three';
import { ZONES, MUTATION_DATA, RARITY_COLORS } from './gameData.js';

export class Roblox3DSimulator {
  constructor(container) {
    this.container = container;
    
    this.isThrowing = false;
    this.throwProgress = 0;
    this.maxDistance = 100;
    this.currentDistance = 0;
    this.targetZone = ZONES[0];
    this.foodItem = null;
    this.caughtAnimal = null;
    this.onFinishCallback = null;
    this.isTraining = false;

    this.initScene();
    this.buildWorld();
    this.buildRobloxCharacter();
    this.buildPullUpRig();
    this.buildFoodProjectile();
    this.buildZoneBiomes();

    this.onResize = () => this.handleResize();
    window.addEventListener('resize', this.onResize);

    this.lastTime = performance.now();
    this.animate = (time) => {
      this.reqId = requestAnimationFrame(this.animate);
      const dt = (time - this.lastTime) / 1000;
      this.lastTime = time;
      this.update(dt);
      this.render();
    };
    this.reqId = requestAnimationFrame(this.animate);
  }

  initScene() {
    this.width = this.container.clientWidth || 800;
    this.height = Math.max(380, this.container.clientHeight || 420);

    // Three Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#38bdf8'); // Roblox daytime sky blue
    this.scene.fog = new THREE.FogExp2('#38bdf8', 0.0035);

    // Camera (Follow camera / isometric Roblox style)
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 2000);
    this.defaultCamOffset = new THREE.Vector3(-14, 12, 22);
    this.camera.position.set(-14, 12, 22);
    this.camera.lookAt(0, 4, 0);

    // Renderer (Pixelated / sharp Roblox look)
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear container and append
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting (Roblox classic sunny light)
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambient);

    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    this.sunLight.position.set(30, 60, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 250;
    this.sunLight.shadow.camera.left = -50;
    this.sunLight.shadow.camera.right = 50;
    this.sunLight.shadow.camera.top = 50;
    this.sunLight.shadow.camera.bottom = -50;
    this.scene.add(this.sunLight);
  }

  handleResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = Math.max(380, this.container.clientHeight || 420);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  // Base Plate & Roblox Throw Track with studs
  buildWorld() {
    // Huge Baseplate with classic Roblox grass green
    const groundGeo = new THREE.PlaneGeometry(160, 2600);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, 0, 1200);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Main Throwing Track (Stone runway with stud lines)
    const trackGeo = new THREE.BoxGeometry(16, 0.4, 2600);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    this.track = new THREE.Mesh(trackGeo, trackMat);
    this.track.position.set(0, 0.2, 1200);
    this.track.receiveShadow = true;
    this.scene.add(this.track);

    // Decorative 3D Roblox Stud Cylinders along the track surface
    const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 8);
    const studMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
    const studInstanced = new THREE.InstancedMesh(studGeo, studMat, 400);
    const dummy = new THREE.Object3D();
    let studIndex = 0;
    for (let z = 10; z < 2000; z += 15) {
      for (let x of [-5, -2.5, 0, 2.5, 5]) {
        if (studIndex < 400) {
          dummy.position.set(x, 0.45, z);
          dummy.updateMatrix();
          studInstanced.setMatrixAt(studIndex++, dummy.matrix);
        }
      }
    }
    this.scene.add(studInstanced);

    // Track Side Borders (Yellow / Black Roblox hazard stripes)
    const borderGeo = new THREE.BoxGeometry(0.8, 0.8, 2000);
    const borderMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const leftBorder = new THREE.Mesh(borderGeo, borderMat);
    leftBorder.position.set(-8.4, 0.4, 950);
    const rightBorder = new THREE.Mesh(borderGeo, borderMat);
    rightBorder.position.set(8.4, 0.4, 950);
    this.scene.add(leftBorder, rightBorder);

    // Distance Milestone Posts along the track
    this.milePosts = new THREE.Group();
    for (let z = 50; z <= 1800; z += 100) {
      const postGeo = new THREE.BoxGeometry(1, 6, 1);
      const postMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
      const postL = new THREE.Mesh(postGeo, postMat);
      postL.position.set(-9.5, 3, z);
      postL.castShadow = true;

      const postR = postL.clone();
      postR.position.x = 9.5;

      // Banner crossbar
      const barGeo = new THREE.BoxGeometry(20, 1.2, 0.5);
      const barMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 5.5, z);

      this.milePosts.add(postL, postR, bar);
    }
    this.scene.add(this.milePosts);

    // Base Plot Area for player's home
    const plotGeo = new THREE.BoxGeometry(30, 0.5, 30);
    const plotMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const plot = new THREE.Mesh(plotGeo, plotMat);
    plot.position.set(-25, 0.25, 5);
    plot.receiveShadow = true;
    this.scene.add(plot);

    // Group for 3D Animals currently in Plot
    this.plotAnimalsGroup = new THREE.Group();
    this.scene.add(this.plotAnimalsGroup);

    // Base Fence
    this.createFence(-25, 5, 28, 28);
  }

  updatePlotAnimals(inventory) {
    // Clear old 3D animal meshes in base
    while (this.plotAnimalsGroup.children.length > 0) {
      const obj = this.plotAnimalsGroup.children[0];
      this.plotAnimalsGroup.remove(obj);
    }

    // Grid layout inside 30x30 plot at (-25, 5)
    inventory.forEach((item, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = -30 + col * 5.5;
      const z = -2 + row * 5.5;

      const mesh = this.createVoxelAnimalMesh(item);
      mesh.scale.set(0.8, 0.8, 0.8);
      mesh.position.set(x, 0.5, z);
      
      // Floating name badge over animal
      if (item.mutation !== 'Normal') {
        const auraGeo = new THREE.RingGeometry(1.2, 1.8, 16);
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

  createFence(cx, cz, w, d) {
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
    const postGeo = new THREE.BoxGeometry(0.6, 2.5, 0.6);
    const railGeoH = new THREE.BoxGeometry(w, 0.4, 0.4);

    const fenceGroup = new THREE.Group();
    // North rail
    const railN = new THREE.Mesh(railGeoH, fenceMat);
    railN.position.set(cx, 1.5, cz - d / 2);
    // South rail
    const railS = railN.clone();
    railS.position.z = cz + d / 2;
    fenceGroup.add(railN, railS);

    this.scene.add(fenceGroup);
  }

  // Authentic Roblox R6 Blocky Avatar
  buildRobloxCharacter() {
    this.character = new THREE.Group();
    this.character.position.set(0, 0, 0);

    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfde047 }); // Roblox Classic Bright Yellow Skin
    const torsoMat = new THREE.MeshLambertMaterial({ color: 0x2563eb }); // Classic Blue Shirt
    const legMat = new THREE.MeshLambertMaterial({ color: 0x16a34a }); // Classic Green Pants

    // Head (1.2 x 1.2 x 1.2) + Stud hat/cap
    const headGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    this.charHead = new THREE.Mesh(headGeo, skinMat);
    this.charHead.position.set(0, 5.2, 0);
    this.charHead.castShadow = true;

    // Classic Roblox Stud on top of head
    const topStudGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
    const topStud = new THREE.Mesh(topStudGeo, skinMat);
    topStud.position.set(0, 0.8, 0);
    this.charHead.add(topStud);

    // Roblox Face Smiley Eyes & Mouth (Decal proxy blocks)
    const eyeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.05);
    const faceMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeL = new THREE.Mesh(eyeGeo, faceMat);
    eyeL.position.set(-0.35, 5.3, 0.72);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.35;
    const mouthGeo = new THREE.BoxGeometry(0.6, 0.15, 0.05);
    const mouth = new THREE.Mesh(mouthGeo, faceMat);
    mouth.position.set(0, 4.9, 0.72);
    this.character.add(eyeL, eyeR, mouth);

    // Torso (2.0 x 2.2 x 1.0)
    const torsoGeo = new THREE.BoxGeometry(2.2, 2.4, 1.2);
    this.charTorso = new THREE.Mesh(torsoGeo, torsoMat);
    this.charTorso.position.set(0, 3.3, 0);
    this.charTorso.castShadow = true;

    // Left Arm (1.0 x 2.2 x 1.0)
    const armGeo = new THREE.BoxGeometry(1.1, 2.4, 1.1);
    this.charArmL = new THREE.Mesh(armGeo, skinMat);
    this.charArmL.position.set(-1.7, 3.3, 0);
    this.charArmL.castShadow = true;

    // Right Arm (Throwing / Pulling arm)
    this.charArmR = new THREE.Mesh(armGeo, skinMat);
    this.charArmR.position.set(1.7, 3.3, 0);
    this.charArmR.castShadow = true;

    // Left Leg (1.0 x 2.2 x 1.0)
    const legGeo = new THREE.BoxGeometry(1.05, 2.2, 1.1);
    this.charLegL = new THREE.Mesh(legGeo, legMat);
    this.charLegL.position.set(-0.6, 1.1, 0);
    this.charLegL.castShadow = true;

    // Right Leg
    this.charLegR = new THREE.Mesh(legGeo, legMat);
    this.charLegR.position.set(0.6, 1.1, 0);
    this.charLegR.castShadow = true;

    this.character.add(this.charHead, this.charTorso, this.charArmL, this.charArmR, this.charLegL, this.charLegR);
    this.scene.add(this.character);
  }

  // Classic Roblox Pull-Up Training Bar
  buildPullUpRig() {
    this.pullUpRig = new THREE.Group();
    this.pullUpRig.position.set(-6, 0, 2);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const barMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

    // Left & Right Stand Poles
    const poleGeo = new THREE.CylinderGeometry(0.25, 0.25, 8.5, 12);
    const poleL = new THREE.Mesh(poleGeo, metalMat);
    poleL.position.set(-2, 4.25, 0);
    poleL.castShadow = true;

    const poleR = poleL.clone();
    poleR.position.x = 2;

    // Top Pull-up Bar
    const barGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 12);
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 8.2, 0);

    // Neon "TRAIN POWER" Billboard on top
    const signGeo = new THREE.BoxGeometry(5.5, 1.2, 0.3);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 9.3, 0);

    this.pullUpRig.add(poleL, poleR, bar, sign);
    this.scene.add(this.pullUpRig);
  }

  // Flying Blocky Food Object
  buildFoodProjectile() {
    this.foodGroup = new THREE.Group();
    
    // Voxel-style food model (Cube burger/meat with multiple pixel layers)
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
    this.foodGroup.position.set(0, -50, 0); // Hide initially
    this.scene.add(this.foodGroup);

    // Glow Aura on Food
    const glowGeo = new THREE.SphereGeometry(1.6, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true, transparent: true, opacity: 0.6 });
    this.foodGlow = new THREE.Mesh(glowGeo, glowMat);
    this.foodGroup.add(this.foodGlow);
  }

  // Generate 3D Voxel Animals & Biome Portals
  buildZoneBiomes() {
    this.biomeGates = new THREE.Group();

    ZONES.forEach((zone, index) => {
      const zPos = Math.max(30, (zone.minDist / 20)); // Scaled distance along Z
      
      // Giant Archway Portal for Zone Entrance
      const archMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(zone.bgGradient[1]) });
      const archPillarGeo = new THREE.BoxGeometry(3, 18, 3);
      const pillarL = new THREE.Mesh(archPillarGeo, archMat);
      pillarL.position.set(-14, 9, zPos);
      const pillarR = pillarL.clone();
      pillarR.position.x = 14;

      const archTopGeo = new THREE.BoxGeometry(32, 4, 4);
      const archTop = new THREE.Mesh(archTopGeo, archMat);
      archTop.position.set(0, 18, zPos);

      // 3D Voxel Animal Monument beside the archway
      const animalStatue = this.createVoxelAnimalMesh(zone.animals[0]);
      animalStatue.scale.set(1.5, 1.5, 1.5);
      animalStatue.position.set(18, 2, zPos);

      this.biomeGates.add(pillarL, pillarR, archTop, animalStatue);
    });

    this.scene.add(this.biomeGates);
  }

  createVoxelAnimalMesh(animalConfig) {
    const group = new THREE.Group();
    const color = new THREE.Color(RARITY_COLORS[animalConfig?.rarity || 'Common'] || '#38bdf8');
    const mat = new THREE.MeshLambertMaterial({ color });

    // Blocky Body
    const bodyGeo = new THREE.BoxGeometry(2.5, 2, 3);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = 2;
    body.castShadow = true;

    // Blocky Head
    const headGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.set(0, 3.2, 1.6);
    head.castShadow = true;

    // Blocky Legs (4 legs)
    const legGeo = new THREE.BoxGeometry(0.7, 1.5, 0.7);
    const legFL = new THREE.Mesh(legGeo, mat);
    legFL.position.set(-0.8, 0.75, 1);
    const legFR = legFL.clone();
    legFR.position.x = 0.8;
    const legBL = legFL.clone();
    legBL.position.z = -1;
    const legBR = legFR.clone();
    legBR.position.z = -1;

    group.add(body, head, legFL, legFR, legBL, legBR);
    return group;
  }

  startThrow({ food, power, timingScore, onFinish }) {
    this.isThrowing = true;
    this.throwProgress = 0;
    this.foodItem = food;
    this.onFinishCallback = onFinish;

    // Formula distance
    const timingFactor = Math.pow(Math.max(1, timingScore) / 20, 1.35);
    this.maxDistance = Math.max(50, Math.floor(power * timingFactor * 45));

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

    // Initial position of projectile at player's hand
    this.foodGroup.position.set(1.7, 4.5, 0);
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
      // Move character to pull-up bar
      this.character.position.set(-6, 0, 2);
    } else {
      // Stand ready on throwing line
      this.character.position.set(0, 0, 0);
      this.charArmL.rotation.set(0, 0, 0);
      this.charArmR.rotation.set(0, 0, 0);
    }
  }

  update(dt) {
    const time = performance.now() * 0.005;

    // Character Animation
    if (this.isTraining) {
      // Pull-Up Motion (Smooth sine bobbing)
      const pullUpDelta = (Math.sin(time * 3) + 1) * 0.5; // 0 to 1
      this.character.position.y = pullUpDelta * 2.2;
      this.charArmL.rotation.x = Math.PI - 0.2;
      this.charArmR.rotation.x = Math.PI - 0.2;
    } else if (!this.isThrowing) {
      // Idle ready pose (Roblox classic idle breathing)
      this.character.position.y = 0;
      this.charArmR.rotation.x = Math.sin(time) * 0.1;
      this.charArmL.rotation.x = -Math.sin(time) * 0.1;
      this.charHead.rotation.y = Math.sin(time * 0.5) * 0.15;
    }

    // Flight & Camera Tracking Animation
    if (this.isThrowing) {
      this.throwProgress += dt / 2.0; // 2 seconds flight time
      this.currentDistance = Math.floor(this.maxDistance * Math.min(1, this.throwProgress));

      // 3D Parabolic flight trajectory
      const targetZ = Math.min(1800, this.maxDistance / 20);
      const currZ = targetZ * this.throwProgress;
      const arcHeight = 35 + (this.maxDistance * 0.002);
      const currY = 2 + Math.sin(Math.min(1, this.throwProgress) * Math.PI) * arcHeight;

      this.foodGroup.position.set(0, currY, currZ);
      this.foodGroup.rotation.x += dt * 10;
      this.foodGroup.rotation.y += dt * 8;

      // Dynamic Roblox Camera Chase
      this.camera.position.set(
        -12,
        Math.max(10, currY + 8),
        Math.max(20, currZ - 20)
      );
      this.camera.lookAt(0, currY, currZ + 8);

      // Finished throw
      if (this.throwProgress >= 1) {
        this.isThrowing = false;
        this.foodGroup.position.y = -50; // Hide
        if (this.onFinishCallback) {
          this.onFinishCallback(this.caughtAnimal, this.maxDistance, this.targetZone);
        }
      }
    } else {
      // Smoothly return camera to default player view
      const targetCamPos = this.isTraining
        ? new THREE.Vector3(-18, 10, 18)
        : new THREE.Vector3(-14, 12, 22);

      this.camera.position.lerp(targetCamPos, dt * 4);
      const lookTarget = this.isTraining ? new THREE.Vector3(-6, 4, 2) : new THREE.Vector3(0, 4, 10);
      this.camera.lookAt(lookTarget);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    if (this.reqId) cancelAnimationFrame(this.reqId);
    this.renderer.dispose();
  }
}

