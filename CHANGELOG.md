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
