# Zoo Toss — Balance & Difficulty

All numbers that drive progress (Power, zones, money). The **Easy** column is the original prototype (fast, for dev testing). **Hard** is the demo preset with much lower rates.

## Choosing the mode

| How | Result |
|---|---|
| `?mode=easy` in the URL | Easy mode (remembered on that device) |
| `?mode=hard` in the URL | Hard mode (remembered on that device) |
| Never chosen | **Hard** (the safe default for demos) |

- Each mode has its **own save**. The old save (`ZooToss_SaveData_v1`) is now the Easy save, and Hard starts fresh (`ZooToss_SaveData_v1_hard`).
- In Easy mode a red **EASY MODE · DEV** badge sits in the corner, so a demo never runs on Easy by accident.
- The dev overlay (backtick key `` ` ``, dev server only) shows the active mode.
- Edit the numbers in [`src/difficulty.js`](src/difficulty.js).

## 1. Values that change per mode (`src/difficulty.js`)

| Attribute | Used for | Easy | Hard |
|---|---|---|---|
| `distPerPower` | Throw distance (m) per 1 Power | 10/12 ≈ 0.83 | **1.5/12 = 0.125** |
| `meterSpeedMul` | Meter needle speed | 1× | 1× |
| `pullUpRateMul` | Power per second from pull-ups | 1× | **0.08×** |
| `pullUpCostStart` | First pull-up upgrade price | $50 | **$250** |
| `pullUpCostGrowth` | Next upgrade price × | 1.8 | **3.0** |
| `incomeMul` | $/s from animals in the pen | 1× | **0.2×** |
| `sellSeconds` | Sell price = $/s × seconds | 25 | **6** |
| `foodCostMul` | Food price × (used when `foodCostSeconds` is off) | 1× | 8× (unused) |
| `slotCostStart` | First Expand Pen (+2 slots) | $200 | **$2,000** |
| `slotCostGrowth` | Next Expand Pen × | 2.5 | **3.5** |
| `rebirthCostStart` | First Rebirth | $50K | **$3M** |
| `rebirthCostGrowth` | Next Rebirth × | 3.5 | **6** |
| `rebirthBonus` | Income & Power bonus per rebirth | +50% | **+20%** |
| `questRewardMul` | Quest cash rewards | 1× | **0.2×** |
| `petBonusPerCps` | Equipped pet bonus per $1/s of that pet's income | 0.05% | **0.005%** |
| `petBonusCap` | Maximum total pet bonus | none | **+50%** |
| `zoneIncomeGrowth` | Animal income growth per zone | off (~30× per zone) | **4× per zone** |
| `foodCostSeconds` | Zone food price = that zone's lowest animal $/s (after `incomeMul`) × seconds | off | **1,000 s** |
| `powerBuyCostMul` | Boost Power % price × | 1 | **500** |
| `powerSellCashMul` | Instant Cash (Power → cash) × | 1 | **0.2** (no buy-low/sell-high loop) |
| `eggCostSeconds` | Mystery Egg = farthest zone's top animal $/s (after `incomeMul`) × seconds | off ($500 × zone × `foodCostMul`) | **3,000 s** |
| `magicFoodSeconds` | Magic Food, per piece = farthest zone's lowest animal $/s × seconds | off ($100) | **60 s** |

**Why Hard compresses income:** the original animal income jumps about 30× per zone while the Power needed only grows about 1.6× per zone. Every new zone paid for many pull-up upgrades at once, so multipliers alone could not slow the game (Hard reached Galaxy in about 30 minutes in simulation). Hard now sets each zone's lowest animal to `3 × 4^zone` $/s; the ratio between rarities inside a zone is unchanged. Food prices follow the same scale.

The pet bonus had no cap. Equipping a Jungle elephant (18,000 $/s) gave about +900% to income **and** pull-up Power, which is why progress jumped. Hard caps it at +50%.

### Zone food: Basic & Enhanced (0.6.0, both modes)

Every zone has two foods. Food is bought once and used forever.

| Zone | Basic | Enhanced |
|---|---|---|
| Lobby | Carrot (Common–Rare) | Golden Carrot (Epic) |
| Farm | Apple (Common–Rare) | Honey Apple (Epic–Legendary) |
| Jungle | Meat | Prime Steak |
| Toxic | Burger | Mega Burger |
| Lava | Lava Roll | Magma Roll |
| Glow Sea | Pearl | Black Pearl |
| Christmas | Candy | Gingerbread Star |
| Frost | Ice Gem | Frost Crystal |
| Galaxy | Galaxy (Rare–Epic) | Nebula Cake (Legendary–Mythic) |

- **Basic** catches only the two lowest rarities of its zone, **Enhanced** only the rest (`foodRarities` in `gameData.js`).
- Inside those rarities the animals' own catch weights decide. Example, Farm: Apple → Common 60% / Rare 40%; Honey Apple → Epic 72% / Legendary 28%.
- **Wrong zone = failed throw:** if the food lands in another zone, no animal comes. The food is not lost; only that throw is wasted. The catch card says which zone the food is for.
- **Magic Food** (team feature) makes the top rarity allowed by the food 3.5× more likely.
- **Legendary Bait** (USDC) still works in any zone.
- The old Hard-only rule (zone food unlocks Rare+, Luck ×3) and food Luck values are gone.

## 2. Formulas (the same in both modes)

| What | Formula | Where |
|---|---|---|
| Throw distance | `Power × distPerPower × meter × wind`, minimum 1 m. 1 world unit = 1 m. | `main.js` → `triggerThrow` |
| Meter | Needle 0–20, separate bands: POOR < 55% → ×0.5–0.9, GOOD 55–90% → ×1.2–1.5, MAX ≥ 90% → ×2.0. Needle speed is per second, not per frame. | `main.js` → `meterMultiplier` |
| Wind | `1 + speed/11 × 0.10 × direction` (max ±10%), speed 0–11 m/s, changes every 5 s (55% tailwind). With these bands MAX always beats GOOD and GOOD always beats POOR, whatever the wind. | `main.js`, `robloxSeamlessWorld.js` |
| Pull-up | `floor(1 + level^1.4 × 2) × pullUpRateMul × rebirth × pet`, minimum 1/s | `gameState.js` |
| Income/s | `Σ floor(baseCps × mutation) × incomeMul × rebirth × pet` | `gameState.js` |
| Rebirth bonus | `1 + rebirths × rebirthBonus` | `gameState.js` |
| Catch odds | Food must match the landing zone (else no catch). Basic = 2 lowest rarities, Enhanced = the rest; animal weights decide inside | `robloxSeamlessWorld.js` → `determineCatch` |
| Mutation | Normal 85%, Gold 10%, Diamond 3.5%, Emerald 1.2%, Rainbow 0.3% | `determineCatch` |
| Legendary Bait (USDC) | Guaranteed top animal in the zone; mutations: Rainbow 2%, Emerald 6%, Diamond 12%, Gold 25% | `determineCatch` |
| Starting values | Power 10, 4 pen slots, 2 pets max, Carrot | `gameState.js` |
| Web3 | +100 Power (0.10 USDC), Legendary Bait ×5 (0.50 USDC) | `main.js` |

## 3. Power needed to reach each zone

Distance = Power × `distPerPower` × meter (GOOD ≈ ×1.35 middle of the band, MAX = ×2.0), with no wind.

| Zone (start) | Easy · GOOD | Easy · MAX | Hard · GOOD | Hard · MAX |
|---|---|---|---|---|
| Farm (26 m) | 24 | 16 | 155 | 104 |
| Jungle (86 m) | 77 | 52 | 510 | 344 |
| Toxic (211 m) | 188 | 127 | 1,251 | 844 |
| Lava (421 m) | 375 | 253 | 2,495 | 1,684 |
| Glow Sea (751 m) | 668 | 451 | 4,451 | 3,004 |
| Christmas (1,251 m) | 1,112 | 751 | 7,414 | 5,004 |
| Frost (1,921 m) | 1,708 | 1,153 | 11,384 | 7,684 |
| Galaxy (2,831 m) | 2,517 | 1,699 | 16,777 | 11,324 |

Pull-up Power per second by level (before rebirth and pet bonus):

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Easy | 3 | 6 | 10 | 14 | 20 | 25 | 31 | 37 |
| Hard | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 |

**Time to reach Galaxy (simulation, 7 runs):** the player trains about 40 s, throws 3 times, repeats, and buys upgrades, zone food and pen space as soon as they can afford them.

| Mode | Timing | Galaxy reached |
|---|---|---|
| Easy | GOOD | about 4 minutes |
| Hard | GOOD | **2.2–2.7 hours** |
| Hard | mostly MAX | **1.7–2.0 hours** |
| Hard + buying Power and Eggs whenever affordable | GOOD | **2.1–2.3 hours** (with the old team prices: about 40 minutes) |

Hard milestones (GOOD, typical run): Farm 5 min, Jungle 15 min, Toxic 26 min, Lava 37 min, Glow Sea 1 h, Christmas 1.5 h, Frost 2 h, Galaxy 2.5 h. A less efficient player will take longer. Simulation script assumptions are rough; this has not been playtested yet.

## 4. Values that stay the same in both modes

### Zones (`gameData.js`)

| Zone | Distance | Easy: base $/s (Common → Legendary/Mythic) | Hard: base $/s (`zoneIncomeGrowth` 4) |
|---|---|---|---|
| Lobby | 0–25 m | 3 · 6 · 15 · 35 | 3 · 6 · 15 · 35 |
| Farm | 26–85 | 50 · 120 · 260 · 800 | 12 · 29 · 62 · 192 |
| Jungle | 86–210 | 1.2K · 2.8K · 6.5K · 18K | 48 · 112 · 260 · 720 |
| Toxic | 211–420 | 35K · 80K · 200K · 600K | 192 · 439 · 1.1K · 3.3K |
| Lava | 421–750 | 1.2M · 3M · 8M · 25M | 768 · 1.9K · 5.1K · 16K |
| Glow Sea | 751–1,250 | 45M · 120M · 300M · 900M | 3.1K · 8.2K · 20K · 61K |
| Christmas | 1,251–1,920 | 1.5B · 4B · 10B · 30B | 12K · 33K · 82K · 246K |
| Frost | 1,921–2,830 | 50B · 140B · 400B · 1.2T | 49K · 138K · 393K · 1.2M |
| Galaxy | 2,831–5,000 | 5T · 15T · 50T · 200T (Mythic) | 197K · 590K · 2M · 7.9M (Mythic) |

Catch weights per rarity: 45/30/18/7 in most zones (Lobby 50/35/12/3, Galaxy 40/35/18/7).

**v2 animals (0.5.0):** Farm to Galaxy now have 8 animals, two per rarity. Each rarity's weight is split 55% (v1 animal) / 45% (v2 animal), so the odds per rarity did not change. A v2 animal earns 1.25× the v1 animal of the same rarity (Hard compression applies on top). The table above lists the v1 animals; v2 incomes are in `src/gameData.js` (`set: 'v2'`). Simulated Hard time to Galaxy stays about 2.1–2.3 hours.

### Food prices (Easy: base price; Hard: income × `foodCostSeconds`)

Hard price = income of the cheapest animal that food can catch (after `incomeMul`) × 1,000 s. Carrot is free.

| Zone | Basic · Easy | Basic · Hard | Enhanced · Easy | Enhanced · Hard |
|---|---|---|---|---|
| Lobby | Carrot $0 | $0 | Golden Carrot $500 | $7K |
| Farm | Apple $100 | $2.4K | Honey Apple $1K | $12.4K |
| Jungle | Meat $800 | $9.6K | Prime Steak $8K | $52K |
| Toxic | Burger $5K | $38K | Mega Burger $50K | $219K |
| Lava | Lava Roll $50K | $154K | Magma Roll $500K | $1M |
| Glow Sea | Pearl $500K | $614K | Black Pearl $5M | $4.1M |
| Christmas | Candy $5M | $2.5M | Gingerbread Star $50M | $16.4M |
| Frost | Ice Gem $50M | $9.8M | Frost Crystal $500M | $79M |
| Galaxy | Galaxy $500M | $39M | Nebula Cake $5B | $393M |

### Mutations

| Mutation | Chance | Income × |
|---|---|---|
| Normal | 85% | 1 |
| Gold | 10% | 1.8 |
| Diamond | 3.5% | 3.5 |
| Emerald | 1.2% | 6 |
| Rainbow | 0.3% | 12 |

### Quests (reward × `questRewardMul`)

| Quest | Target | Easy | Hard |
|---|---|---|---|
| Hard Training | +50 Power from pull-ups | $500 | $100 |
| Jungle Hunter | 5 catches | $1,200 | $240 |
| Rocket Throw | One throw ≥ 170 m | $3,500 | $700 |
| Golden Touch | 1 mutated catch | $8,000 | $1,600 |

### Notes for next tuning

- Animal income still jumps about 20–40× per zone. If Hard still feels fast after the first jump, lower `incomeMul` or raise `distPerPower` difficulty further, rather than changing the zone data.
- Zone gimmicks (e.g. "Radioactive: mutation chance up to 3×") are text only right now; the code does not apply them.

## Distance scale (0.5.1)

- **Now:** 1 world unit = 1 m, so the number on screen matches what you see. Zone limits were divided by 12 (Galaxy now starts at 2,831 m) and `distPerPower` too, so the Power needed per zone stays the same. Long throws get a speed effect: the camera widens (FOV up to +16°) and wind lines rush past the food.
- **Before:** 1 unit = 12 m. An 800 m throw only flew about 67 units, which felt close.
- **Backup plan (b), not built:** keep the old meter numbers and stretch the world 12× instead (track about 60 km long). Rejected for now: much longer flights, a much longer track to build and render, and far-clip/fog would need rework.
