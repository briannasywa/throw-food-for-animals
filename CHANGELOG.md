# Changelog

Every update merged into `main` must add an entry here (see [CONTRIBUTING.md](CONTRIBUTING.md)). The game reads this file and shows it in the **Changelog** menu.

Format (newest on top):

```
## 0.5.0 — 2026-12-01
### Added
- Short, player-facing sentence.
### Changed
- …
### Fixed
- …
```

Use only the sections you need: `Added`, `Changed`, `Fixed`, `Removed`. Bump the version in `package.json` to match the top entry.

## 0.10.2 — 2026-11-25
### Fixed
- The Pen said "1 / 2 pets equipped" (and blocked a pet slot) after an equipped animal had been sold. Old saves are cleaned up on load.

## 0.10.1 — 2026-11-25
### Changed
- The Inventory is now a bag button in the bottom-right corner (PC and phones), with the slot count under it. It is no longer in the top menu or the phone Menu.
- The Food Bag shows only what matters: which rarities a food catches and in which zone.
- The throw meter panel and the Throw button are the same height.
- In Quests, the button lines up with the progress bar.

## 0.10.0 — 2026-11-25
### Added
- Sell animals from the Inventory: each card has a Sell button, and Sell All sells everything in the Inventory after a confirmation that shows the total and warns about rare animals. Animals in your Pen are never sold this way.
### Removed
- Sell All Animals in the Shop. Selling now happens only in the Inventory.

## 0.9.0 — 2026-11-25
### Added
- My Pen shows an empty box for every free slot. Click it to pick an animal from your Inventory.
### Changed
- Animals in the Pen have two actions: Equip (follows you, max 2) and Discard (moves it back to the Inventory). Discard is greyed out with "Inventory full" when there is no room. Selling moves to the Inventory in the next update; until then use Sell All in the Shop.
### Fixed
- Big equipped animals no longer squeeze against you or each other: how far they walk behind you now depends on their size.

## 0.8.0 — 2026-11-25
### Added
- Inventory (B, or Menu → Inventory on phones): when your Pen is full, new catches go here instead of being sold. It starts with 5 slots. Animals in the Inventory do not earn cash.
- Expand Inventory in the Shop: 5 → 10 → 15 → 20 slots.
### Changed
- A catch is only sold automatically when both the Pen and the Inventory are full.
### Fixed
- On laptop screens the top-right buttons no longer cover the cash and Power panel; they wrap to a second row instead.

## 0.7.0 — 2026-11-25
### Added
- All 18 foods have their own voxel look, in the air, on the ground and in the Food Bag (carrot, apple, drumstick, burger, sushi roll, pearl in a shell, candy, ice gem, cake slice and their Enhanced versions).
- The throw panel shows where your throw will land: "GOOD ≈ 60–75 m · Farm / MAX ≈ 100 m · Jungle". Green means your food can land in its own zone, red means it would miss.
### Fixed
- Food now lands upright instead of tilted.

## 0.6.0 — 2026-11-25
### Added
- Every zone now has its own food: a Basic food for Common and Rare animals, and a new Enhanced food for Epic and Legendary ones (Golden Carrot, Honey Apple, Prime Steak, Mega Burger, Magma Roll, Black Pearl, Gingerbread Star, Frost Crystal, Nebula Cake).
- The Food Bag is grouped by zone and shows which rarities each food can catch.
### Changed
- Food only works in its own zone. If it lands in another zone, nobody eats it and the throw is wasted (the food stays in your bag). Applies to Easy and Hard.
- Food no longer has Luck numbers; Basic or Enhanced decides the rarity.

## 0.5.1 — 2026-11-25
### Changed
- Distances are now real: 1 m on screen is 1 m in the world, so zone limits are smaller numbers (Galaxy starts at 2,831 m) but a long throw now looks as far as it reads. Power needed per zone is about the same.
- Long throws feel faster: the camera widens and wind lines rush past the food.
- Rocket Throw quest now asks for 170 m.
### Fixed
- A MAX throw now always lands farther than a GOOD one, and GOOD farther than POOR. Wind used to change distance by up to ±33%, enough to flip them; it is now ±10% and each meter grade has its own distance range.
- The throw meter needle moves at the same speed on every screen (it used to run faster on high refresh rate displays).

## 0.5.0 — 2026-11-24
### Added
- 32 new animals to catch, 4 in every zone from Farm to Galaxy, for example Farm Goat, Jungle Zebra, Ghost Owl, Glow Shark, Walrus and Giant Moon Griffin. Zones now have 8 animals, two per rarity.
### Changed
- Index now counts 68 animals.
- Legendary Bait and the Mystery Egg can give either animal of the top rarity in a zone.

## 0.4.3 — 2026-11-24
### Added
- Animal roadmap for the next updates (v2, v3 and v4 ideas per zone) in `docs/animal-roadmap.md`.
### Fixed
- Animals no longer stand on the food while eating: they stop in front of it, lower their head and chew.

## 0.4.2 — 2026-11-24
### Changed
- Hard mode: Mystery Egg, Magic Food and Boost Power now cost more as you reach farther zones, so Hard still takes about 2–3 hours to reach Galaxy.
### Fixed
- Hard mode: buying Power and trading it back for cash no longer makes free money.

## 0.4.1 — 2026-11-24
### Changed
- Abyss Serpent now sways its long neck and swishes its tail as it swims.

## 0.4.0 — 2026-11-24
### Added
- Changelog menu: see what changed in every update. A dot marks updates you have not seen yet.
- Hard mode: each zone has its own food. Rare and better animals only bite on that zone's food (Carrot in Lobby, Apple in Farm … Galaxy food in Galaxy).
- Mystery Egg in the shop: a spin that unlocks a rare animal from the farthest zone you have reached.
- Magic Food: charges that give your next throws 3.5× Luck.
- Shop: buy Power with cash, or trade some Power for instant cash.
- Phones: help for connecting MetaMask on mobile.
### Changed
- Hard mode is much slower: reaching Galaxy now takes about 2–3 hours. Animal income grows 4× per zone instead of about 30×, pull-ups are slower, and zone food prices follow each zone's income.
- Farm and Jungle animals now use the zone name, for example Farm Chick and Jungle Monkey.
- The throw meter keeps its normal speed in Hard mode.

## 0.3.0 — 2026-11-21
### Added
- Difficulty: Easy (for testing) and Hard (for the demo), each with its own save. Switch it from the top bar, or from the Menu on phones.
- Phones: joystick to walk, swipe to look, pinch to zoom. The throw pad, gym, pen and shop lock the camera on that area until you press Exit.
- Phones: simple top bar (cash, Power, income) with a Menu that holds Quests, Index, Rank, Rebirth and settings.
- Camera lock (L): the camera follows the mouse. Every menu has a keyboard shortcut.
- Food Bag (F): shows your equipped food and opens your food inventory.
- First-visit tutorial.
- Index: View Biome flies the camera through any zone you have reached.
- New gym with a cinematic pull-up camera, a new shop, and a bigger pen that grows when you expand it. Pen animals walk around.
- Taller, zone-themed cliffs along the track.
### Changed
- You can only throw from the pink throw pad.
- Simpler throw panel: just the meter and Throw (Space).
- Lighter graphics on laptops and phones: shorter view distance and simpler cliffs on small screens.
### Fixed
- Keyboard movement and inverted mouse look.
- Mobile buttons no longer slip under the browser toolbar.

## 0.2.0 — 2026-11-21
### Added
- New name: Zoo Toss.
- 36 original voxel animals across 9 zones, and a Zookeeper character.
- Shop items paid in USDC on Base Sepolia: +100 Power and Legendary Bait.
### Changed
- New look: sunny lighting, zone colors from the art direction palette, and a chunky voxel UI.
- Diorama camera with easier controls, plus eating and training animations.
### Fixed
- Wallet address checksum for the shop contract.

## 0.1.0 — 2026-11-09
### Added
- First playable version: throw food, catch animals, earn cash from your pen.
- 9 biomes from Lobby to Galaxy, map UI and in-world action spots.
