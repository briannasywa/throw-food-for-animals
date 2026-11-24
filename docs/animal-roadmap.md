# Zoo Toss — Animal roadmap v2, v3 & v4

Status:
- **v2:** in the game since 0.5.0 (`src/gameData.js`, `set: 'v2'`).
- **v3 and v4:** ideas only. Do not generate until the team asks.

The art team keeps the master copy of this list outside this repo (art-direction/voxel/animal-roadmap.md); update both when it changes.

Rules:
- v1 = the 36 existing animals (4 per zone). v2 and v3 each add 4 per zone: 3 regular + 1 Giant (boss/top rarity). Zone grows 4 → 8 → 12.
- No two similar animals in the **same zone** (v1 included). The same species in **different zones** is fine (e.g. Rabbit in Lobby and Space Bunny in Galaxy).
- Frost is no longer all dragons.
- Name prefix follows the zone name (Farm / Jungle replace the old "Pastel" / "Sunset" prefixes). **Colors stay as before** (pastel palette for Farm, sunset palette for Jungle).
- Source: ideas inspired by the shapes seen in Creator Store pack previews (TheAngelGaming1). Those packs do not name their animals; names are ours. `*` = our own idea, not from the packs.
- Design every animal from scratch as original voxel data. Do not copy or convert the Roblox models (Creator Store assets may not be used outside Roblox).

## Roadmap

| Zone | v2 | v3 |
|---|---|---|
| Farm | Farm Goat, Farm Duck, Farm Llama, **Giant Farm Turkey** | Farm Hedgehog*, Farm Bee*, Farm Raccoon*, **Giant Farm Cow** |
| Jungle | Jungle Flamingo, Jungle Zebra, Jungle Tiger, **Giant Jungle Buffalo** | Jungle Sloth*, Jungle Snake, Jungle Giraffe, **Giant Jungle Hippo** |
| Toxic | Ghost Owl, Sludge Worm*, Cyclops Imp, **Giant Cauldron Witch** | Franken Cube, Toxic Snail*, Shroomling*, **Giant Toxic Scorpion** |
| Lava | Cinder Boar, Hellhound Pup, Lava Stego, **Giant Obsidian Ape** | Ember Hatchling, Lava Mole, Lava Beetle*, **Giant Magma T-Rex*** |
| Glow Sea | Glow Jelly, Glow Pufferfish, Glow Shark, **Giant Glow Anglerfish*** | Glow Seahorse, Glow Seal, Glow Dolphin, **Giant Glow Turtle** |
| Christmas | Elf Penguin, Ribbon Fox, Candy Hamster, **Giant Gingerbread Bear** | Holly Sprite, Snowman Buddy, Nutcracker Bot*, **Giant Present Mimic*** |
| Frost | Snow Owl*, Walrus*, Crystal Drake, **Giant Blizzard Hydra** | Snow Leopard*, Arctic Ermine*, Frost Moth*, **Giant Glacier Golem** |
| Galaxy | Space Axolotl*, Robo Alien, Star Unicorn, **Giant Moon Griffin** | Meteor Armadillo*, Comet Narwhal, Orbit Chameleon*, **Giant Void Gorilla** |

## Reserve (kept for later versions, nothing deleted)

**v4 candidates** (decided: kept for v4, v2/v3 stay as they are): only similar to an animal in another zone, which is fine.
**Same zone**: too similar to an animal already in that zone; only use as a swap for it.

| Zone | v4 candidates | Same zone (would clash with) |
|---|---|---|
| Farm | Farm Mouse, Farm Bunny | Farm Piglet (Giant Farm Pig), Farm Bull (Giant Farm Cow), Farm Lamb (Farm Sheep), Farm Pony (Farm Donkey), Farm Rooster (Farm Chick) |
| Jungle | Jungle Frog, Jungle Crab, Jungle Spider | Jungle Orangutan (Jungle Monkey), Tiger Cub (Jungle Tiger), Toucan (Jungle Parrot) |
| Toxic | Candy Corn Chick | Zombie Cat, Bat Cat (Mummy Cat), Ghost Panda, Toxic Bat Dragon (Giant Bat Bear), Venom Spider (Giant Toxic Scorpion) |
| Lava | Magma Penguin, Lava Rooster, Magma Tortoise | — |
| Glow Sea | Glow Narwhal, Giant Glow Whale, Glow Diver Bot | Glow Eel (Abyss Serpent), Glow Octopus (Glow Squid), Giant Glow Crab (Glow Hermit Crab) |
| Christmas | Snow Bunny, Snow Lamb | Polar Bear (Giant Gingerbread Bear), Snowman Pup (Snowman Buddy) |
| Frost | — | Ice Drake, Frost Wyvern, Snow Wyvern, Shadow Frost Drake, Frost Serpent (kept out so Frost is not all dragons), Ice Sparrow (Snow Owl) |
| Galaxy | Space Bunny, Comet Fox, Nebula Bat, Shadow Stag, Giant Cosmo Bear | Star Pony, Stardust Pegasus (Star Unicorn), Galaxy Lion (Nebula Cat) |

## Notes for later
- Adding animals is a game-logic change: `src/gameData.js` needs income, catch weight and rarity for 8, then 12, animals per zone, which shifts rare-catch odds. Tune when v2 starts (see `BALANCE.md`).
- v1 names were renamed too: Farm Chick, Farm Sheep, Farm Donkey, Giant Farm Pig, Jungle Monkey, Jungle Parrot, Jungle Croc, Giant Jungle Elephant. Internal ids (`pastel_chick`, `sunset_monkey`, ...) stay the same so saves and models keep working.
