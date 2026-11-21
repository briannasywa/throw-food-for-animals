import * as THREE from 'three';
import { buildAnimal, animateAnimal } from './voxel/voxel-builder.js';

// Import all 9 biome animal JSON specs
import lobbyData from './voxel/animals/lobby.json';
import farmData from './voxel/animals/farm.json';
import jungleData from './voxel/animals/jungle.json';
import toxicData from './voxel/animals/toxic.json';
import lavaData from './voxel/animals/lava.json';
import glowSeaData from './voxel/animals/glow_sea.json';
import christmasData from './voxel/animals/christmas.json';
import frostData from './voxel/animals/frost.json';
import galaxyData from './voxel/animals/galaxy.json';
import zookeeperSpec from './voxel/characters/zookeeper.json';

// Build lookup map for all animal specs
const ANIMAL_SPECS = new Map();
const allBiomeData = [
  lobbyData, farmData, jungleData,
  toxicData, lavaData, glowSeaData,
  christmasData, frostData, galaxyData
];

allBiomeData.forEach(biome => {
  if (biome && biome.animals) {
    biome.animals.forEach(spec => {
      ANIMAL_SPECS.set(spec.id, spec);
    });
  }
});

// Backward compatibility map for legacy IDs
const LEGACY_ID_MAP = {
  dog: 'puppy',
  chicken: 'pastel_chick',
  pig: 'pastel_sheep',
  sheep: 'pastel_donkey',
  cow: 'giant_pastel_pig',
  monkey: 'sunset_monkey',
  parrot: 'sunset_parrot',
  snake: 'sunset_croc',
  gorilla: 'giant_sunset_elephant',
  mutant_rat: 'toxic_bunny',
  toxic_slime: 'slime_frog',
  mutant_bat: 'mummy_cat',
  radioactive_spider: 'giant_bat_bear',
  magma_snail: 'lava_raptor',
  fire_lizard: 'magma_ankylo',
  hell_hound: 'lava_trike',
  volcano_golem: 'volcano_brachio',
  anglerfish: 'glow_squid',
  glow_jellyfish: 'glow_hermit_crab',
  giant_squid: 'glow_manta',
  leviathan: 'abyss_serpent',
  gingerbread_man: 'gingerbread_kitty',
  snow_reindeer: 'candy_reindeer',
  nutcracker: 'peppermint_dragon',
  santa_yeti: 'giant_yeti',
  ice_golem: 'frost_whelp',
  mammoth_frost: 'ice_mammoth',
  star_cat: 'nebula_cat',
  void_whale: 'astral_whale',
  phoenix_sun: 'star_phoenix'
};

/**
 * Builds a voxel animal instance using art-direction voxel builder.
 * Returns a THREE.Group with animate helper attached.
 */
export function buildVoxelAnimal(animalId, rarity, mutation = 'Normal') {
  const targetId = LEGACY_ID_MAP[animalId] || animalId;
  const spec = ANIMAL_SPECS.get(targetId);

  let instance;
  if (spec) {
    instance = buildAnimal(spec);
  } else {
    // Fallback if not found
    const fallbackSpec = ANIMAL_SPECS.get('rabbit') || lobbyData.animals[0];
    instance = buildAnimal(fallbackSpec);
  }

  const root = instance.group;
  // Standard scale: 1 voxel is ~0.25 in world units
  root.scale.setScalar(0.25);
  root.castShadow = true;
  root.receiveShadow = true;

  // Attach metadata and anim handle
  root.userData = {
    animalInstance: instance,
    animalId: targetId,
    mutation: mutation,
    rarity: rarity
  };

  // Mutation visual treatments
  if (mutation === 'Gold') {
    applyColorOverlay(root, 0xFFD54A, 0.4);
  } else if (mutation === 'Diamond') {
    applyColorOverlay(root, 0x9BEBFF, 0.4);
  } else if (mutation === 'Emerald') {
    applyColorOverlay(root, 0x2EE59D, 0.4);
  } else if (mutation === 'Rainbow') {
    root.userData.isRainbow = true;
  }

  return root;
}

function applyColorOverlay(group, colorHex, factor) {
  group.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.color.lerp(new THREE.Color(colorHex), factor);
    }
  });
}

/**
 * Builds the player Zookeeper character from voxel data.
 */
export function buildPlayerZookeeper() {
  const instance = buildAnimal(zookeeperSpec);
  const root = instance.group;
  root.scale.setScalar(0.3); // Scale to fit diorama proportions
  return {
    group: root,
    parts: instance.parts,
    instance: instance
  };
}

export { animateAnimal };
