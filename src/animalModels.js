import * as THREE from 'three';

export function buildVoxelAnimal(animalId, rarity, mutation = 'Normal') {
  const root = new THREE.Group();

  const createBox = (w, h, d, colorHex, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const mat = new THREE.MeshLambertMaterial({ color: colorHex });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    if (rx || ry || rz) mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  switch (animalId) {
    // ---------------- LOBBY ----------------
    case 'rabbit': {
      const body = createBox(1.2, 1.0, 1.4, 0xffffff, 0, 0.5, 0);
      const head = createBox(0.9, 0.9, 0.9, 0xffffff, 0, 1.2, 0.6);
      const earL = createBox(0.2, 1.0, 0.3, 0xf472b6, -0.25, 2.0, 0.5);
      const earR = createBox(0.2, 1.0, 0.3, 0xf472b6, 0.25, 2.0, 0.5);
      root.add(body, head, earL, earR);
      break;
    }
    case 'dog': {
      const body = createBox(1.4, 1.2, 2.0, 0xb45309, 0, 0.6, 0);
      const head = createBox(1.0, 1.0, 1.0, 0xb45309, 0, 1.3, 0.8);
      const snout = createBox(0.6, 0.5, 0.6, 0x181425, 0, 1.1, 1.3);
      const tail = createBox(0.3, 0.8, 0.3, 0xb45309, 0, 1.0, -1.0, 0.4);
      root.add(body, head, snout, tail);
      break;
    }
    case 'cat': {
      const body = createBox(1.2, 1.0, 1.8, 0xf59e0b, 0, 0.5, 0);
      const head = createBox(0.9, 0.9, 0.9, 0xf59e0b, 0, 1.2, 0.8);
      const earL = createBox(0.25, 0.4, 0.25, 0x181425, -0.3, 1.8, 0.7);
      const earR = createBox(0.25, 0.4, 0.25, 0x181425, 0.3, 1.8, 0.7);
      root.add(body, head, earL, earR);
      break;
    }
    case 'golden_retriever': {
      const body = createBox(1.8, 1.4, 2.4, 0xfef08a, 0, 0.8, 0);
      const head = createBox(1.2, 1.2, 1.2, 0xfef08a, 0, 1.6, 1.0);
      const crown = createBox(0.8, 0.4, 0.8, 0xf59e0b, 0, 2.4, 0.9);
      root.add(body, head, crown);
      break;
    }

    // ---------------- FARM ----------------
    case 'chicken': {
      const body = createBox(1.0, 1.2, 1.2, 0xffffff, 0, 0.7, 0);
      const head = createBox(0.7, 0.7, 0.7, 0xffffff, 0, 1.4, 0.5);
      const beak = createBox(0.3, 0.25, 0.4, 0xf59e0b, 0, 1.3, 0.9);
      const comb = createBox(0.2, 0.4, 0.6, 0xef4444, 0, 1.8, 0.5);
      root.add(body, head, beak, comb);
      break;
    }
    case 'pig': {
      const body = createBox(1.6, 1.3, 2.2, 0xf472b6, 0, 0.7, 0);
      const head = createBox(1.1, 1.1, 1.0, 0xf472b6, 0, 1.2, 1.0);
      const snout = createBox(0.6, 0.4, 0.3, 0xec4899, 0, 1.1, 1.6);
      root.add(body, head, snout);
      break;
    }
    case 'sheep': {
      const body = createBox(1.8, 1.6, 2.4, 0xf1f5f9, 0, 0.9, 0);
      const woolH = createBox(2.0, 1.8, 2.6, 0xffffff, 0, 1.0, 0);
      const head = createBox(1.0, 1.0, 1.1, 0x181425, 0, 1.4, 1.3);
      root.add(body, woolH, head);
      break;
    }
    case 'cow': {
      const body = createBox(2.2, 1.8, 3.2, 0xffffff, 0, 1.6, 0);
      const spot = createBox(2.25, 1.85, 1.0, 0x181425, 0, 1.6, 0.2);
      const head = createBox(1.2, 1.2, 1.5, 0xffffff, 0, 2.6, 1.6);
      const hornL = createBox(0.25, 0.6, 0.25, 0xd4d4d8, -0.6, 3.4, 1.4);
      const hornR = createBox(0.25, 0.6, 0.25, 0xd4d4d8, 0.6, 3.4, 1.4);
      root.add(body, spot, head, hornL, hornR);
      break;
    }

    // ---------------- JUNGLE ----------------
    case 'monkey': {
      const body = createBox(1.2, 1.4, 1.2, 0x78350f, 0, 0.8, 0);
      const head = createBox(1.0, 1.0, 1.0, 0x78350f, 0, 1.8, 0.2);
      const face = createBox(0.7, 0.6, 0.2, 0xfde047, 0, 1.7, 0.7);
      const tail = createBox(0.3, 1.6, 0.3, 0x78350f, 0, 1.2, -0.8, -0.4);
      root.add(body, head, face, tail);
      break;
    }
    case 'parrot': {
      const body = createBox(0.9, 1.4, 1.1, 0xef4444, 0, 0.8, 0);
      const wingL = createBox(0.2, 1.2, 1.4, 0x22c55e, -0.5, 0.8, 0);
      const wingR = createBox(0.2, 1.2, 1.4, 0x22c55e, 0.5, 0.8, 0);
      const beak = createBox(0.3, 0.4, 0.5, 0xf59e0b, 0, 1.3, 0.7);
      root.add(body, wingL, wingR, beak);
      break;
    }
    case 'snake': {
      const coil = createBox(2.0, 0.5, 2.0, 0x22c55e, 0, 0.3, 0);
      const neck = createBox(0.7, 1.8, 0.7, 0x16a34a, 0, 1.2, 0.5);
      const head = createBox(0.9, 0.6, 1.2, 0x22c55e, 0, 2.1, 0.8);
      root.add(coil, neck, head);
      break;
    }
    case 'gorilla': {
      // SANGAR: Pundak raksasa kekar
      const torso = createBox(3.0, 2.6, 2.0, 0x334155, 0, 1.8, 0);
      const backSilver = createBox(2.4, 1.8, 0.3, 0x94a3b8, 0, 1.9, -1.0);
      const head = createBox(1.5, 1.5, 1.5, 0x1e293b, 0, 3.2, 0.4);
      const armL = createBox(0.9, 2.4, 0.9, 0x334155, -1.8, 1.2, 0.4);
      const armR = createBox(0.9, 2.4, 0.9, 0x334155, 1.8, 1.2, 0.4);
      root.add(torso, backSilver, head, armL, armR);
      break;
    }

    // ---------------- TOXIC ----------------
    case 'mutant_rat': {
      const body = createBox(1.4, 1.0, 2.0, 0x6366f1, 0, 0.5, 0);
      const toxicTumor = createBox(0.7, 0.7, 0.7, 0x84cc16, 0.4, 1.1, -0.3); // Radioaktif hijau
      const head = createBox(0.9, 0.8, 1.1, 0x4338ca, 0, 0.9, 1.0);
      root.add(body, toxicTumor, head);
      break;
    }
    case 'toxic_slime': {
      const core = createBox(2.2, 1.8, 2.2, 0x22c55e, 0, 0.9, 0);
      const eyeL = createBox(0.4, 0.4, 0.2, 0xfacc15, -0.5, 1.1, 1.15);
      const eyeR = createBox(0.4, 0.4, 0.2, 0xfacc15, 0.5, 1.1, 1.15);
      root.add(core, eyeL, eyeR);
      break;
    }
    case 'mutant_bat': {
      const body = createBox(1.2, 1.5, 1.2, 0x4338ca, 0, 1.2, 0);
      const wingL = createBox(2.8, 0.2, 1.6, 0x84cc16, -1.8, 1.4, 0);
      const wingR = createBox(2.8, 0.2, 1.6, 0x84cc16, 1.8, 1.4, 0);
      const head = createBox(0.8, 0.8, 0.8, 0x312e81, 0, 2.0, 0.3);
      root.add(body, wingL, wingR, head);
      break;
    }
    case 'radioactive_spider': {
      // SANGAR: Laba-laba 8 kaki neon
      const body = createBox(2.0, 1.2, 2.4, 0xa855f7, 0, 1.2, 0);
      const bioSac = createBox(1.8, 1.6, 2.0, 0x84cc16, 0, 1.6, -1.6);
      for (let i = -1; i <= 1; i += 0.6) {
        const legL = createBox(1.8, 0.3, 0.3, 0x1e1b4b, -1.6, 0.8, i, 0, 0, 0.5);
        const legR = createBox(1.8, 0.3, 0.3, 0x1e1b4b, 1.6, 0.8, i, 0, 0, -0.5);
        root.add(legL, legR);
      }
      root.add(body, bioSac);
      break;
    }

    // ---------------- LAVA ----------------
    case 'magma_snail': {
      const body = createBox(1.4, 0.6, 2.4, 0xea580c, 0, 0.3, 0);
      const shell = createBox(2.0, 1.8, 2.0, 0x7c2d12, 0, 1.3, -0.3);
      root.add(body, shell);
      break;
    }
    case 'fire_lizard': {
      const body = createBox(1.6, 0.8, 2.8, 0xd97706, 0, 0.5, 0);
      const dorsal = createBox(0.3, 0.8, 2.0, 0xf97316, 0, 1.1, 0);
      const head = createBox(1.0, 0.8, 1.2, 0xea580c, 0, 0.8, 1.5);
      root.add(body, dorsal, head);
      break;
    }
    case 'hell_hound': {
      // SANGAR: Serigala berkepala 3 magma
      const body = createBox(2.2, 1.8, 3.4, 0x991b1b, 0, 1.4, 0);
      const headMid = createBox(1.0, 1.0, 1.2, 0x7c2d12, 0, 2.4, 1.6);
      const headL = createBox(0.9, 0.9, 1.1, 0x7c2d12, -1.0, 2.2, 1.4, 0, -0.3, 0);
      const headR = createBox(0.9, 0.9, 1.1, 0x7c2d12, 1.0, 2.2, 1.4, 0, 0.3, 0);
      root.add(body, headMid, headL, headR);
      break;
    }
    case 'volcano_golem': {
      // SANGAR: Raksasa batu lahar
      const torso = createBox(3.4, 3.2, 2.4, 0x431407, 0, 2.6, 0);
      const magmaCore = createBox(1.8, 1.8, 2.5, 0xf97316, 0, 2.6, 0);
      const shoulderL = createBox(1.6, 1.6, 1.6, 0x261715, -2.4, 3.2, 0);
      const shoulderR = createBox(1.6, 1.6, 1.6, 0x261715, 2.4, 3.2, 0);
      root.add(torso, magmaCore, shoulderL, shoulderR);
      break;
    }

    // ---------------- GLOW SEA ----------------
    case 'anglerfish': {
      const body = createBox(1.8, 1.8, 2.4, 0x0284c7, 0, 1.2, 0);
      const jaw = createBox(1.6, 0.6, 1.4, 0x0369a1, 0, 0.5, 0.8);
      const lure = createBox(0.2, 1.2, 0.8, 0x06b6d4, 0, 2.4, 0.6);
      const light = createBox(0.5, 0.5, 0.5, 0x22d3ee, 0, 2.8, 1.2);
      root.add(body, jaw, lure, light);
      break;
    }
    case 'glow_jellyfish': {
      const cap = createBox(2.4, 1.4, 2.4, 0x06b6d4, 0, 2.0, 0);
      for (let i = -0.8; i <= 0.8; i += 0.8) {
        const tentacle = createBox(0.3, 2.2, 0.3, 0x67e8f9, i, 0.6, 0);
        root.add(tentacle);
      }
      root.add(cap);
      break;
    }
    case 'giant_squid': {
      const head = createBox(2.2, 2.0, 3.6, 0x38bdf8, 0, 1.5, 0);
      const tentBigL = createBox(0.5, 0.5, 4.0, 0x0284c7, -1.0, 1.0, 2.6);
      const tentBigR = createBox(0.5, 0.5, 4.0, 0x0284c7, 1.0, 1.0, 2.6);
      root.add(head, tentBigL, tentBigR);
      break;
    }
    case 'leviathan': {
      // SANGAR: Monster laut naga air bertanduk
      const body = createBox(3.0, 2.4, 6.0, 0x0ea5e9, 0, 1.8, 0);
      const head = createBox(2.2, 2.0, 2.6, 0x0284c7, 0, 2.2, 3.2);
      const finL = createBox(3.2, 0.3, 2.0, 0x06b6d4, -2.8, 1.8, 0.5);
      const finR = createBox(3.2, 0.3, 2.0, 0x06b6d4, 2.8, 1.8, 0.5);
      root.add(body, head, finL, finR);
      break;
    }

    // ---------------- CHRISTMAS ----------------
    case 'gingerbread_man': {
      const torso = createBox(1.4, 1.8, 0.6, 0xb45309, 0, 1.4, 0);
      const head = createBox(1.2, 1.2, 0.6, 0xb45309, 0, 2.6, 0);
      const icing = createBox(1.0, 0.2, 0.65, 0xffffff, 0, 1.4, 0);
      root.add(torso, head, icing);
      break;
    }
    case 'snow_reindeer': {
      const body = createBox(1.8, 1.6, 2.8, 0xd97706, 0, 1.6, 0);
      const nose = createBox(0.4, 0.4, 0.4, 0xef4444, 0, 2.6, 1.9); // Hidung merah Rudolph
      const hornL = createBox(0.2, 1.6, 0.2, 0xfef08a, -0.4, 3.6, 1.2);
      const hornR = createBox(0.2, 1.6, 0.2, 0xfef08a, 0.4, 3.6, 1.2);
      root.add(body, nose, hornL, hornR);
      break;
    }
    case 'nutcracker': {
      const body = createBox(1.6, 2.2, 1.0, 0xbe123c, 0, 1.6, 0);
      const hat = createBox(1.2, 1.8, 1.0, 0x181425, 0, 3.4, 0);
      root.add(body, hat);
      break;
    }
    case 'santa_yeti': {
      // SANGAR: Yeti salju raksasa berotot pakai topi santa
      const torso = createBox(3.2, 3.0, 2.2, 0xffffff, 0, 2.2, 0);
      const santaHat = createBox(1.6, 1.4, 1.6, 0xe11d48, 0, 4.4, 0);
      const pompom = createBox(0.6, 0.6, 0.6, 0xffffff, 0, 5.2, 0);
      const fistL = createBox(1.2, 1.6, 1.2, 0xe2e8f0, -2.2, 1.2, 0.4);
      const fistR = createBox(1.2, 1.6, 1.2, 0xe2e8f0, 2.2, 1.2, 0.4);
      root.add(torso, santaHat, pompom, fistL, fistR);
      break;
    }

    // ---------------- FROST ----------------
    case 'ice_golem': {
      const torso = createBox(2.2, 2.0, 1.8, 0x7dd3fc, 0, 1.6, 0);
      const head = createBox(1.2, 1.2, 1.2, 0x38bdf8, 0, 2.8, 0);
      root.add(torso, head);
      break;
    }
    case 'frost_wolf': {
      const body = createBox(1.8, 1.4, 3.0, 0xe0f2fe, 0, 1.2, 0);
      const iceMane = createBox(2.2, 1.8, 1.6, 0x38bdf8, 0, 1.8, 1.0);
      root.add(body, iceMane);
      break;
    }
    case 'mammoth_frost': {
      // SANGAR: Mammoth es purba bergading kristal
      const body = createBox(3.4, 3.0, 4.6, 0x38bdf8, 0, 2.6, 0);
      const tuskL = createBox(0.4, 0.4, 3.4, 0xe0f2fe, -1.4, 2.8, 3.2, -0.3, -0.2, 0);
      const tuskR = createBox(0.4, 0.4, 3.4, 0xe0f2fe, 1.4, 2.8, 3.2, -0.3, 0.2, 0);
      root.add(body, tuskL, tuskR);
      break;
    }
    case 'frost_wyrm': {
      // SUPER SANGAR: Naga es raksasa
      const body = createBox(3.0, 2.4, 5.4, 0x0284c7, 0, 2.2, 0);
      const wingL = createBox(4.4, 0.3, 2.4, 0x38bdf8, -3.4, 3.2, 0, 0, 0, 0.3);
      const wingR = createBox(4.4, 0.3, 2.4, 0x38bdf8, 3.4, 3.2, 0, 0, 0, -0.3);
      root.add(body, wingL, wingR);
      break;
    }

    // ---------------- GALAXY ----------------
    case 'star_cat': {
      const body = createBox(1.4, 1.2, 2.0, 0xa855f7, 0, 0.8, 0);
      const crystal = createBox(0.4, 1.2, 0.4, 0x22d3ee, 0, 2.2, 0.6);
      root.add(body, crystal);
      break;
    }
    case 'void_whale': {
      const body = createBox(3.4, 2.2, 6.0, 0x1e1035, 0, 2.0, 0);
      const wings = createBox(6.4, 0.3, 2.2, 0x38bdf8, 0, 2.2, 0.5);
      root.add(body, wings);
      break;
    }
    case 'phoenix_sun': {
      const body = createBox(2.2, 2.0, 2.8, 0xf59e0b, 0, 2.2, 0);
      const wingL = createBox(4.2, 0.4, 2.2, 0xef4444, -3.0, 2.6, 0.2);
      const wingR = createBox(4.2, 0.4, 2.2, 0xef4444, 3.0, 2.6, 0.2);
      root.add(body, wingL, wingR);
      break;
    }
    case 'cosmic_dragon':
    default: {
      // PALING SANGAR: Naga Astral Galaksi bersayap kosmik
      const body = createBox(3.4, 2.8, 5.6, 0x0d0714, 0, 2.4, 0);
      const head = createBox(2.2, 2.0, 2.8, 0x581c87, 0, 4.6, 3.0);
      const hornL = createBox(0.6, 2.4, 0.6, 0xfef08a, -0.9, 6.2, 2.6, -0.4, 0, -0.2);
      const hornR = createBox(0.6, 2.4, 0.6, 0xfef08a, 0.9, 6.2, 2.6, -0.4, 0, 0.2);
      const wingL = createBox(5.2, 0.4, 2.8, 0xec4899, -3.8, 3.8, 0, 0, 0, 0.3);
      const wingR = createBox(5.2, 0.4, 2.8, 0xec4899, 3.8, 3.8, 0, 0, 0, -0.3);
      root.add(body, head, hornL, hornR, wingL, wingR);
      break;
    }
  }

  // Mutasi Gimmick
  if (mutation !== 'Normal') {
    let auraColor = 0xf59e0b;
    if (mutation === 'Diamond') auraColor = 0x06b6d4;
    else if (mutation === 'Emerald') auraColor = 0x10b981;
    else if (mutation === 'Rainbow') auraColor = 0xec4899;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.18, 8, 16),
      new THREE.MeshBasicMaterial({ color: auraColor })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 4.8, 0);
    root.add(ring);
  }

  return root;
}
