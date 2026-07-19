# Project Redbox — 14-Day Playable Alpha Sprint

## Day 1 — Wed 7/15

* [x] **0:00–0:10 — Create Phaser + TypeScript project** — Game launches locally
* [x] **0:10–0:35 — Player movement** — WASD moves placeholder player
* [x] **0:35–0:50 — Camera/play area** — Player stays within arena
* [ ] **0:50–1:00 — Git commit** — `v0.0.1 - Player movement`

## Day 2 — Thu 7/16

* [x] **0:00–0:10 — Warm-up/test** — Yesterday's build works
* [x] **0:10–0:35 — Enemy** — Placeholder enemy spawns and chases player
* [x] **0:35–0:50 — Multiple enemies** — Continuous timed spawning
* [ ] **0:50–1:00 — Commit** — `v0.0.2 - Enemy spawning`

## Day 3 — Fri 7/17

* [x] **0:00–0:10 — Test** — Movement + spawning
* [x] **0:10–0:35 — Auto-target** — Find nearest enemy
* [x] **0:35–0:50 — Rifle** — Player automatically fires
* [ ] **0:50–1:00 — Commit** — `v0.0.3 - Pew pew`

## Day 4 — Sat 7/18

* [x] **0:00–0:15 — Damage** — Bullets damage enemies
* [x] **0:15–0:35 — Death** — Enemies can die
* [x] **0:35–0:50 — Feedback** — Hit flash + tiny screen shake
* [ ] **0:50–1:00 — Commit** — `v0.0.4 - Things die`

## Day 5 — Sun 7/19

* [x] **0:00–0:20 — Player HP** — Enemies damage player
* [x]**0:20–0:40 — Death** — Player can die
* [x] **0:40–0:50 — Restart** — Game-over + restart button
* [ ] **0:50–1:00 — Commit** — `v0.0.5 - You can die`

## Day 6 — Mon 7/20

* [x] **0:00–0:20 — XP drops** — Dead enemies drop XP
* [x] **0:20–0:40 — Collection** — Player collects XP
* [x] **0:40–0:50 — XP bar** — Basic HUD
* [x] **0:50–1:00 — Commit** — `v0.0.6 - XP`

## Day 7 — Tue 7/21

* [x] **0:00–0:20 — Leveling** — XP triggers level-up
* [x] **0:20–0:45 — Upgrade UI** — Set Level updgrades (slight randomness)
* [x] **0:45–0:50 — Resume** — Combat continues
* [x] **0:50–1:00 — Commit** — `v0.1.0 - Core loop`

## Day 8 — Wed 7/22

* [x] **0:00–0:15 — Rifle cleanup** — Tune basic gun
* [x] **0:15–0:35 — Scattergun** — Add spread weapon
* [x] **0:35–0:50 — Cannon** — Add slow explosive projectile
* [x] **0:50–1:00 — Commit** — `v0.2.0 - Arsenal`

## Day 9 — Thu 7/23

* [x] **0:00–0:15 — Loot drops** — Enemies have drop chance
* [x] **0:15–0:35 — Weapon pickups** — Loot changes weapon
* [x] **0:35–0:50 — RED BOX** — Rare drop visual + special sound placeholder
* [x] **0:50–1:00 — Commit** — `v0.3.0 - RED BOX`

## Day 10 — Fri 7/24

* [x] **0:00–0:20 — Run timer** — Add 10-minute run clock
* [x] **0:20–0:40 — Difficulty curve** — Spawn rate/HP increase over time
* [x] **0:40–0:50 — Elite** — Tough enemy variant
* [x] **0:50–1:00 — Commit** — `v0.4.0 - The run`

## Day 11 — Sat 7/25

* [x] **0:00–0:15 — Boss warning** — `WARNING: WYRM DETECTED`
* [x] **0:15–0:40 — Wyrm** — Placeholder boss enters
* [x] **0:40–0:50 — Slam attack** — Shadow → impact → damage
* [x] **0:50–1:00 — Commit** — `v0.5.0 - THE WYRM`

## Day 12 — Sun 7/26

* [x] **0:00–0:20 — Boss fight** — HP + attack tuning
* [x] **0:20–0:35 — Boss death** — Wyrm explodes/dies
* [x] **0:35–0:50 — Guaranteed rare** — Boss drops RED BOX
* [x] **0:50–1:00 — Commit** — `v0.6.0 - Boss complete`

## Day 13 — Mon 7/27

* [x] **0:00–0:15 — Dadbod splash** — `DADBOD STUDIOS PRESENTS`
* [x] **0:15–0:30 — Title screen** — `PROJECT REDBOX — BEGIN DROP`
* [x] **0:30–0:45 — Results** — Kills / Level / Rares / Time
* [x] **0:45–1:00 — Full playtest** — Fix only game-breaking bugs

## Day 14 — Tue 7/28

* [x] **0:00–0:15 — Production build** — Build HTML5 version
* [x] **0:15–0:30 — itch.io page** — Create project + description
* [x] **0:30–0:40 — Upload** — Browser build goes live
* [x] **0:40–0:50 — Test live version** — Play from itch.io
* [x] **0:50–1:00 — Send to Jeff** — 🚀 Dadbod Studios has shipped a game

# Project Redbox — 14-Day Progression Sprint
## Goal: v0.10.0 — THE HUNTER

> Turn Project Redbox from a complete arcade-style run into the foundation
> of a persistent sci-fi action RPG.

---

## Day 15 — Wed 7/29
### CLEAN HOUSE

* [ ] **Code audit** — Identify remaining oversized files and duplicated logic
* [ ] **Run state** — Create a dedicated `RunState` for kills, rares, time, etc.
* [ ] **Player data** — Separate permanent player data from temporary run data
* [ ] **Regression test** — Full run from BEGIN DROP → Wyrm → Results
* [ ] **Commit** — `v0.6.1 - Clean house`

---

## Day 16 — Thu 7/30
### ITEM FOUNDATION

* [x] **Item model** — Create base `Item` / `WeaponItem` types
* [x] **Unique IDs** — Every dropped weapon becomes an individual item
* [x] **Weapon stats** — Add randomized base stats:
  * Attack
  * Speed
  * Critical Chance
  * Critical Damage
* [x] **Rarity tiers** — Common / Uncommon / Rare
* [x] **Commit** — `v0.7.0 - Items are real`

---

## Day 17 — Fri 7/31
### RANDOMIZED WEAPONS

* [x] **Weapon generator** — Generate randomized weapon stats on drop
* [x] **Rifle rolls** — Different rifles can actually be better or worse
* [x] **Scattergun rolls**
* [x] **Cannon rolls**
* [x] **Greatsword rolls**
* [x] **Item names** — Generate simple names based on weapon + rarity
* [x] **Commit** — `v0.7.1 - Random loot`

---

## Day 18 — Sat 8/1
### INVENTORY

* [x] **Inventory data** — Player can own multiple items
* [x] **Inventory screen** — Press `I` to open
* [x] **Item list** — Display collected weapons
* [x] **Stats panel** — Show selected weapon stats
* [x] **Pause combat** — Game pauses while inventory is open
* [x] **Commit** — `v0.7.2 - The backpack`

---

## Day 19 — Sun 8/2
### EQUIPMENT

* [x] **Equip weapon** — Select weapon from inventory
* [x] **Equipped slot** — Clearly show current weapon
* [x] **Stat comparison** — Green/red comparison against equipped weapon
* [x] **WeaponSystem integration** — Equipped item's stats affect combat
* [x] **Drop replacement removed** — Picking up loot no longer destroys your current weapon
* [x] **Commit** — `v0.7.3 - Gear up`

---

## Day 20 — Mon 8/3
### THE LOOT CHASE

* [ ] **Rare affixes** — Rare weapons roll one special modifier
* [ ] **Example affixes:**
  * Heavy — +Attack / -Speed
  * Rapid — +Speed / -Attack
  * Deadeye — +Critical Chance
  * Brutal — +Critical Damage
* [ ] **RED BOX excitement** — Rare item reveal shows rolled stats
* [ ] **Boss loot** — Wyrm generates a guaranteed Rare weapon
* [ ] **Commit** — `v0.8.0 - The loot chase`

---

## Day 21 — Tue 8/4
### MAG FOUNDATION

* [ ] **Create MAG data model**
* [ ] **MAG stats:**
  * Power
  * Defense
  * Dexterity
  * Energy
* [ ] **MAG level**
* [ ] **MAG displayed in inventory/menu**
* [ ] **Starter MAG assigned to player**
* [ ] **Commit** — `v0.8.1 - Meet your MAG`

---

## Day 22 — Wed 8/5
### FEED THE MAG

* [ ] **Feed action** — Inventory items can be fed to MAG
* [ ] **Weapon type affects MAG growth**
* [ ] **MAG gains XP/stats**
* [ ] **Fed item is destroyed**
* [ ] **Feeding animation/UI feedback**
* [ ] **Commit** — `v0.8.2 - Feed the little bastard`

---

## Day 23 — Thu 8/6
### MAG → PLAYER

* [ ] **MAG Power** increases player Attack
* [ ] **MAG Defense** increases player Defense
* [ ] **MAG Dexterity** improves Critical Chance
* [ ] **MAG Energy** improves special/rare weapon effectiveness
* [ ] **Character stats screen** — Show final calculated stats
* [ ] **Commit** — `v0.8.3 - Growing stronger`

---

## Day 24 — Fri 8/7
### PERSISTENCE

* [ ] **Local save system** — Use browser local storage
* [ ] **Save inventory**
* [ ] **Save equipped weapon**
* [ ] **Save MAG**
* [ ] **Save permanent player progression**
* [ ] **Load save when game launches**
* [ ] **Commit** — `v0.9.0 - Remember me`

---

## Day 25 — Sat 8/8
### BETWEEN RUNS

* [ ] **Results → Hunter screen**
* [ ] **Review loot from completed run**
* [ ] **Equip new gear**
* [ ] **Feed unwanted gear to MAG**
* [ ] **Start next drop when ready**
* [ ] **Commit** — `v0.9.1 - Between drops`

---

## Day 26 — Sun 8/9
### THE SECOND DROP

* [ ] **New run retains equipped gear**
* [ ] **MAG bonuses carry forward**
* [ ] **Inventory persists**
* [ ] **Enemies scale appropriately**
* [ ] **Wyrm scales with player progression**
* [ ] **Full two-run playtest**
* [ ] **Commit** — `v0.9.2 - Again we go`

---

## Day 27 — Mon 8/10
### MAKE IT FEEL GOOD

* [ ] **Loot pickup feedback**
* [ ] **Rare drop feedback**
* [ ] **Greatsword impact tuning**
* [ ] **Gun impact tuning**
* [ ] **Wyrm fight tuning**
* [ ] **Inventory usability pass**
* [ ] **MAG feeding usability pass**
* [ ] **Fix only meaningful bugs**
* [ ] **Commit** — `v0.9.5 - Feel pass`

---

## Day 28 — Tue 8/11
### SHIP THE HUNTER

* [ ] **Fresh-save playtest**
* [ ] **Complete Drop #1**
* [ ] **Collect randomized loot**
* [ ] **Defeat Wyrm**
* [ ] **Feed MAG**
* [ ] **Equip new weapon**
* [ ] **Complete Drop #2 with persistent progression**
* [ ] **Production build**
* [ ] **Upload to itch.io**
* [ ] **Test live build**
* [ ] **Send updated build to Jeff**
* [ ] **Commit** — `v0.10.0 - THE HUNTER`

---

# v0.10.0 PLAYER LOOP

DADBOD STUDIOS
      ↓
PROJECT REDBOX
      ↓
BEGIN DROP
      ↓
EXPLORE
      ↓
FIGHT
      ↓
RANDOMIZED LOOT
      ↓
BUILD YOUR HUNTER
      ↓
CLEAR 5 ZONES
      ↓
THE WYRM
      ↓
RED BOX
      ↓
RESULTS
      ↓
INVENTORY
   ↙       ↘
EQUIP     FEED MAG
   ↘       ↙
PERMANENT PROGRESSION
      ↓
BEGIN ANOTHER DROP
      ↓
GET STRONGER
      ↓
FIND BETTER SHIT
      ↓
REPEAT

---

# NOT THIS SPRINT

* [ ] Multiplayer
* [ ] Accounts / cloud saves
* [ ] Backend database
* [ ] PS5 port
* [ ] Final sprites
* [ ] Final animations
* [ ] Large content expansion
* [ ] Monetization

Those come after the persistent progression loop proves itself.
