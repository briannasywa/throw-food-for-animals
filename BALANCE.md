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
| `distPerPower` | Throw distance (m) per 1 Power | 10 | **1.5** |
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
| `zoneFood` | Rare and above need **that zone's food** | off | **on** |
| `zoneFoodLuck` | Luck when the zone's food is used | food's own Luck | **×3** (fixed) |
| `rarityWeightMul` | Base catch weight × per rarity (Rare / Epic / Legendary·Mythic) | 1 / 1 / 1 | **0.5 / 0.3 / 0.15** |
| `luckExp` | Weight × Luck^exp per rarity (Rare / Epic / Legendary·Mythic) | 0 / 0.5 / 1 | **0.5 / 1 / 1.5** |

**Why Hard compresses income:** the original animal income jumps about 30× per zone while the Power needed only grows about 1.6× per zone. Every new zone paid for many pull-up upgrades at once, so multipliers alone could not slow the game (Hard reached Galaxy in about 30 minutes in simulation). Hard now sets each zone's lowest animal to `3 × 4^zone` $/s; the ratio between rarities inside a zone is unchanged. Food prices follow the same scale.

The pet bonus had no cap. Equipping a Jungle elephant (18,000 $/s) gave about +900% to income **and** pull-up Power, which is why progress jumped. Hard caps it at +50%.

### Zone food (Hard only)

Each zone has one food, in the same order as the zones:

| Zone | Lobby | Farm | Jungle | Toxic | Lava | Glow Sea | Christmas | Frost | Galaxy |
|---|---|---|---|---|---|---|---|---|---|
| Food | Carrot | Apple | Meat | Burger | Lava Roll | Pearl | Candy | Ice Gem | Galaxy |

- With the zone's food: Rare and above can drop, with Luck ×3 and the exponents above.
- With any other food (even a more expensive one): only the zone's lowest animal (Common; Rare in Galaxy, which has no Common). The catch card then says which food to use.
- Legendary Bait (USDC) still guarantees the top animal anywhere.

Catch odds in Hard with the zone's food (20,000 simulated throws):

| Zone | Common | Rare | Epic | Legendary / Mythic |
|---|---|---|---|---|
| Farm, Jungle, … (45/30/18/7) | 49% | 28% | 17% | 6% |
| Galaxy (Rare 40 / Epic 35 / Legendary 18 / Mythic 7) | — | 44% | 34% | 16% / 6% |
| Lobby (Carrot) | 86% | 11% | 3% | — |

In Easy the old rule stays: any food works everywhere, and a more expensive food means more Luck.

## 2. Formulas (the same in both modes)

| What | Formula | Where |
|---|---|---|
| Throw distance | `Power × distPerPower × (0.5 + timing/20 × 1.5) × wind`, minimum 15 m | `main.js` → `triggerThrow` |
| Timing | Needle 0–20. POOR < 55%, GOOD 55–90%, MAX ≥ 90% → ×0.5 … ×2.0 | `main.js` |
| Wind | `1 + speed × 0.03 × direction`, speed 0–11 m/s, changes every 5 s (55% tailwind) | `robloxSeamlessWorld.js` |
| Pull-up | `floor(1 + level^1.4 × 2) × pullUpRateMul × rebirth × pet`, minimum 1/s | `gameState.js` |
| Income/s | `Σ floor(baseCps × mutation) × incomeMul × rebirth × pet` | `gameState.js` |
| Rebirth bonus | `1 + rebirths × rebirthBonus` | `gameState.js` |
| Catch odds | Weight × `rarityWeightMul` × Luck^`luckExp`; Hard: Rare+ only with the zone's food | `robloxSeamlessWorld.js` → `determineCatch` |
| Mutation | Normal 85%, Gold 10%, Diamond 3.5%, Emerald 1.2%, Rainbow 0.3% | `determineCatch` |
| Legendary Bait (USDC) | Guaranteed top animal in the zone; mutations: Rainbow 2%, Emerald 6%, Diamond 12%, Gold 25% | `determineCatch` |
| Starting values | Power 10, 4 pen slots, 2 pets max, Carrot | `gameState.js` |
| Web3 | +100 Power (0.10 USDC), Legendary Bait ×5 (0.50 USDC) | `main.js` |

## 3. Power needed to reach each zone

Distance = Power × `distPerPower` × timing (GOOD ≈ ×1.4, MAX = ×2.0), with no wind.

| Zone (start) | Easy · GOOD | Easy · MAX | Hard · GOOD | Hard · MAX |
|---|---|---|---|---|
| Farm (301 m) | 22 | 16 | 144 | 101 |
| Jungle (1,001 m) | 72 | 51 | 477 | 334 |
| Toxic (2,501 m) | 179 | 126 | 1,191 | 834 |
| Lava (5,001 m) | 358 | 251 | 2,382 | 1,667 |
| Glow Sea (9,001 m) | 643 | 451 | 4,287 | 3,001 |
| Christmas (15,001 m) | 1,072 | 751 | 7,144 | 5,001 |
| Frost (23,001 m) | 1,643 | 1,151 | 10,953 | 7,667 |
| Galaxy (34,001 m) | 2,429 | 1,701 | 16,191 | 11,334 |

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
| Lobby | 0–300 m | 3 · 6 · 15 · 35 | 3 · 6 · 15 · 35 |
| Farm | 301–1,000 | 50 · 120 · 260 · 800 | 12 · 29 · 62 · 192 |
| Jungle | 1,001–2,500 | 1.2K · 2.8K · 6.5K · 18K | 48 · 112 · 260 · 720 |
| Toxic | 2,501–5,000 | 35K · 80K · 200K · 600K | 192 · 439 · 1.1K · 3.3K |
| Lava | 5,001–9,000 | 1.2M · 3M · 8M · 25M | 768 · 1.9K · 5.1K · 16K |
| Glow Sea | 9,001–15,000 | 45M · 120M · 300M · 900M | 3.1K · 8.2K · 20K · 61K |
| Christmas | 15,001–23,000 | 1.5B · 4B · 10B · 30B | 12K · 33K · 82K · 246K |
| Frost | 23,001–34,000 | 50B · 140B · 400B · 1.2T | 49K · 138K · 393K · 1.2M |
| Galaxy | 34,001–60,000 | 5T · 15T · 50T · 200T (Mythic) | 197K · 590K · 2M · 7.9M (Mythic) |

Catch weights per rarity: 45/30/18/7 in most zones (Lobby 50/35/12/3, Galaxy 40/35/18/7).

**v2 animals (0.5.0):** Farm to Galaxy now have 8 animals, two per rarity. Each rarity's weight is split 55% (v1 animal) / 45% (v2 animal), so the odds per rarity did not change. A v2 animal earns 1.25× the v1 animal of the same rarity (Hard compression applies on top). The table above lists the v1 animals; v2 incomes are in `src/gameData.js` (`set: 'v2'`). Simulated Hard time to Galaxy stays about 2.1–2.3 hours.

### Food (Easy: base price; Hard: zone income × `foodCostSeconds`)

| Food | Base price | Hard price | Luck (Easy) |
|---|---|---|---|
| Carrot | $0 | $0 | ×1 |
| Apple | $100 | $2.4K | ×1.5 |
| Meat | $800 | $9.6K | ×2.2 |
| Burger | $5K | $38K | ×3.5 |
| Lava Roll | $50K | $154K | ×5.5 |
| Pearl | $500K | $614K | ×9 |
| Candy | $5M | $2.5M | ×14 |
| Ice Gem | $50M | $9.8M | ×22 |
| Galaxy | $500M | $39M | ×35 |

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
| Rocket Throw | One throw ≥ 2,000 m | $3,500 | $700 |
| Golden Touch | 1 mutated catch | $8,000 | $1,600 |

### Notes for next tuning

- Animal income still jumps about 20–40× per zone. If Hard still feels fast after the first jump, lower `incomeMul` or raise `distPerPower` difficulty further, rather than changing the zone data.
- Zone gimmicks (e.g. "Radioactive: mutation chance up to 3×") are text only right now; the code does not apply them.
