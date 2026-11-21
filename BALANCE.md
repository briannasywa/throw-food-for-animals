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
| `distPerPower` | Throw distance (m) per 1 Power | 10 | **2** |
| `meterSpeedMul` | Meter needle speed | 1× | **1.25×** (harder to hit green) |
| `pullUpRateMul` | Power per second from pull-ups | 1× | **0.35×** |
| `pullUpCostStart` | First pull-up upgrade price | $50 | **$150** |
| `pullUpCostGrowth` | Next upgrade price × | 1.8 | **2.0** |
| `incomeMul` | $/s from animals in the pen | 1× | **0.3×** |
| `sellSeconds` | Sell price = $/s × seconds | 25 | **10** |
| `foodCostMul` | Food price | 1× | **5×** |
| `slotCostStart` | First Expand Pen (+2 slots) | $200 | **$1,000** |
| `slotCostGrowth` | Next Expand Pen × | 2.5 | **3** |
| `rebirthCostStart` | First Rebirth | $50K | **$1M** |
| `rebirthCostGrowth` | Next Rebirth × | 3.5 | **5** |
| `rebirthBonus` | Income & Power bonus per rebirth | +50% | **+25%** |
| `questRewardMul` | Quest cash rewards | 1× | **0.3×** |
| `petBonusPerCps` | Equipped pet bonus per $1/s of that pet's income | 0.05% | **0.01%** |
| `petBonusCap` | Maximum total pet bonus | none | **+100%** |

The pet bonus had no cap. Equipping a Jungle elephant (18,000 $/s) gave about +900% to income **and** pull-up Power, which is why progress jumped. Hard caps it at +100%.

## 2. Formulas (the same in both modes)

| What | Formula | Where |
|---|---|---|
| Throw distance | `Power × distPerPower × (0.5 + timing/20 × 1.5) × wind`, minimum 15 m | `main.js` → `triggerThrow` |
| Timing | Needle 0–20. POOR < 55%, GOOD 55–90%, MAX ≥ 90% → ×0.5 … ×2.0 | `main.js` |
| Wind | `1 + speed × 0.03 × direction`, speed 0–11 m/s, changes every 5 s (55% tailwind) | `robloxSeamlessWorld.js` |
| Pull-up | `floor(1 + level^1.4 × 2) × pullUpRateMul × rebirth × pet`, minimum 1/s | `gameState.js` |
| Income/s | `Σ floor(baseCps × mutation) × incomeMul × rebirth × pet` | `gameState.js` |
| Rebirth bonus | `1 + rebirths × rebirthBonus` | `gameState.js` |
| Catch odds | Animal weight; Legendary/Mythic weight × food Luck, Epic × √Luck | `robloxSeamlessWorld.js` → `determineCatch` |
| Mutation | Normal 85%, Gold 10%, Diamond 3.5%, Emerald 1.2%, Rainbow 0.3% | `determineCatch` |
| Legendary Bait (USDC) | Guaranteed top animal in the zone; mutations: Rainbow 2%, Emerald 6%, Diamond 12%, Gold 25% | `determineCatch` |
| Starting values | Power 10, 4 pen slots, 2 pets max, Carrot | `gameState.js` |
| Web3 | +100 Power (0.10 USDC), Legendary Bait ×5 (0.50 USDC) | `main.js` |

## 3. Power needed to reach each zone

Distance = Power × `distPerPower` × timing (GOOD ≈ ×1.4, MAX = ×2.0), with no wind.

| Zone (start) | Easy · GOOD | Easy · MAX | Hard · GOOD | Hard · MAX |
|---|---|---|---|---|
| Farm (301 m) | 22 | 16 | 108 | 76 |
| Jungle (1,001 m) | 72 | 51 | 358 | 251 |
| Toxic (2,501 m) | 179 | 126 | 894 | 626 |
| Lava (5,001 m) | 358 | 251 | 1,787 | 1,251 |
| Glow Sea (9,001 m) | 643 | 451 | 3,215 | 2,251 |
| Christmas (15,001 m) | 1,072 | 751 | 5,358 | 3,751 |
| Frost (23,001 m) | 1,643 | 1,151 | 8,215 | 5,751 |
| Galaxy (34,001 m) | 2,429 | 1,701 | 12,144 | 8,501 |

Pull-up Power per second by level (before rebirth and pet bonus):

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Easy | 3 | 6 | 10 | 14 | 20 | 25 | 31 | 37 |
| Hard | 1 | 2 | 3 | 4 | 7 | 8 | 10 | 12 |

**Rough pace with no pets and no rebirth:**
- **Easy:** Farm in seconds, Jungle in about 20 s of pull-ups, Toxic in under a minute.
- **Hard:** Farm in about 1.5 minutes, Jungle in about 5 minutes (after upgrading pull-ups to level 3), Lava in about 20 minutes.

These are estimates that have not been playtested yet.

## 4. Values that stay the same in both modes

### Zones (`gameData.js`)

| Zone | Distance | Animals: base $/s (Common → Legendary/Mythic) |
|---|---|---|
| Lobby | 0–300 m | 3 · 6 · 15 · 35 |
| Farm | 301–1,000 | 50 · 120 · 260 · 800 |
| Jungle | 1,001–2,500 | 1.2K · 2.8K · 6.5K · 18K |
| Toxic | 2,501–5,000 | 35K · 80K · 200K · 600K |
| Lava | 5,001–9,000 | 1.2M · 3M · 8M · 25M |
| Glow Sea | 9,001–15,000 | 45M · 120M · 300M · 900M |
| Christmas | 15,001–23,000 | 1.5B · 4B · 10B · 30B |
| Frost | 23,001–34,000 | 50B · 140B · 400B · 1.2T |
| Galaxy | 34,001–60,000 | 5T · 15T · 50T · 200T (Mythic) |

Catch weights: 45/30/18/7 in most zones (Lobby 50/35/12/3, Galaxy 40/35/18/7).

### Food (base price × `foodCostMul`)

| Food | Base price | Hard price | Luck |
|---|---|---|---|
| Carrot | $0 | $0 | ×1 |
| Apple | $100 | $500 | ×1.5 |
| Meat | $800 | $4K | ×2.2 |
| Burger | $5K | $25K | ×3.5 |
| Lava Roll | $50K | $250K | ×5.5 |
| Pearl | $500K | $2.5M | ×9 |
| Candy | $5M | $25M | ×14 |
| Ice Gem | $50M | $250M | ×22 |
| Galaxy | $500M | $2.5B | ×35 |

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
| Hard Training | +50 Power from pull-ups | $500 | $150 |
| Jungle Hunter | 5 catches | $1,200 | $360 |
| Rocket Throw | One throw ≥ 2,000 m | $3,500 | $1,050 |
| Golden Touch | 1 mutated catch | $8,000 | $2,400 |

### Notes for next tuning

- Animal income still jumps about 20–40× per zone. If Hard still feels fast after the first jump, lower `incomeMul` or raise `distPerPower` difficulty further, rather than changing the zone data.
- Zone gimmicks (e.g. "Radioactive: mutation chance up to 3×") are text only right now; the code does not apply them.
