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


# Project Redbox
# Sprint 2 Roadmap
## v0.11.0 → v0.12.0
### **THE HUNT CONTINUES**

**Sprint Theme:** Polish the core experience. Teach the player, improve readability, deepen combat, and make every run more satisfying without expanding scope into large new systems.

---

# Day 29 — Wed 8/12
## WELCOME HUNTER

* [x] First-run tutorial overlays
* [x] Hunter Hub onboarding
* [x] Equip workflow tutorial
* [x] MAG feeding tutorial
* [x] Tutorial persistence
* [x] Skip tutorial option
* [ ] Commit — `v0.11.0 - Welcome Hunter`

---

# Day 30 — Thu 8/13
## FIRST ART PASS

* [x] Select a cohesive free sprite pack
* [x] Replace Hunter placeholder sprite
* [x] Replace enemy placeholder sprites
* [x] Add elite visual variants
* [x] Replace Wyrm placeholder sprite
* [x] Improve projectile sprites
* [x] Improve Red Box sprite
* [x] Improve loot pickup sprites
* [x] Ensure consistent sprite scaling
* [ ] Commit — `v0.11.1 - First Art Pass`

---

# Day 31 — Fri 8/14
## COMBAT POLISH

* [x] Tune weapon combo timing
* [x] Improve hit-stop
* [x] Improve impact feedback
* [x] Improve enemy hit reactions
* [x] Improve combo UI
* [x] Improve weapon feel
* [x] Commit — `v0.11.2 - Combat Polish`

---

# Day 32 — Sat 8/15
## WEAPON IDENTITY

* [x] Rifle finisher identity
* [x] Scattergun finisher identity
* [x] Cannon finisher identity
* [x] Photon Lance finisher identity
* [x] Greatsword polish
* [x] Balance combo finishers
* [ ] Commit — `v0.11.3 - Weapon Identity`

---

# Day 33 — Sun 8/16
## ENEMY PERSONALITY

* [x] Improve Fast enemy behavior
* [x] Improve Tank enemy behavior
* [x] Improve Elite encounters
* [x] Tune encounter pacing
* [x] Improve spawn composition
* [x] Commit — `v0.11.4 - Enemy Identity`

---

# Day 34 — Mon 8/17
## CORE EVOLUTION

* [x] Rename MAG system to Core
* [x] First Core evolution stage
* [x] Better Core progression display
* [x] Evolution milestones
* [x] Core evolution bonuses
* [x] Improve Core feeding feedback
* [x] Update UI and terminology
* [x] Preserve save compatibility where possible
* [x] Commit — `v0.11.5 - Core Evolution`

---

## Day 35 — Mon 8/17
### THE WASTES

* [ ] Design first biome layout
* [ ] Create distinct combat zones
* [ ] Add environmental obstacles and cover
* [ ] Add visual landmarks
* [ ] Improve enemy spawn regions
* [ ] Build Wyrm arena approach
* [ ] Tune exploration flow
* [ ] Commit — `v0.11.5 - The Wastes`

---

---

# Day 36 — Wed 8/19
## LOOT CHASE

* [x] Expand affix pool
* [x] Improve affix balance
* [x] Improve loot tables
* [x] Improve rarity presentation
* [x] Tune Red Box excitement
* [x] Commit — `v0.11.7 - Loot Chase`

---

# Day 37 — Thu 8/20
## BALANCE PASS

* [x] Multi-run playtest
* [x] Enemy scaling tuning
* [x] Wyrm tuning
* [x] Weapon balance
* [x] MAG balance
* [x] Fix meaningful gameplay bugs
* [x] Commit — `v0.11.8 - Balance Pass`

---

# Day 38 — Fri 8/21
## THE HUNT CONTINUES

* [x] Fresh-save playtest
* [x] Complete five consecutive drops
* [x] Verify progression loop
* [x] Production build
* [x] Upload new itch.io build
* [x] Test live build
* [x] Send build to Jeff
* [x] Commit — `v0.12.0 - THE HUNT CONTINUES`


# Project Redbox
# Sprint 3 Roadmap
## v0.13.0 → v0.14.0
### **BUILD YOUR HUNTER**

**Sprint Theme:** Turn persistent progression into a real character-building experience. Add Hunter levels, armor, visual equipment identity, sound, and a lightweight local profile flow.

---

# Day 39 — Sat 8/22
## HUNTER PROFILES

* [ ] Add Hunter profile selection screen
* [ ] Create new Hunter
* [ ] Continue existing Hunter
* [ ] Hunter name entry
* [ ] Display Hunter level, equipped weapon, armor, and Core
* [ ] Add profile deletion confirmation
* [ ] Support multiple local Hunter profiles
* [ ] Preserve existing save through migration
* [ ] Commit — `v0.13.0 - Choose Your Hunter`

> For this sprint, “login” means a polished local Hunter profile screen. Real accounts and cloud saves belong in a later infrastructure sprint.

---

# Day 40 — Sun 8/23
## HUNTER LEVELS

* [ ] Add persistent Hunter XP
* [ ] Add persistent Hunter level
* [ ] Award Hunter XP after completed drops
* [ ] Award bonus XP for Wyrm defeats
* [ ] Display XP gained on results screen
* [ ] Show Hunter level in Hub and profile screen
* [ ] Create level curve configuration
* [ ] Migrate existing saves safely
* [ ] Commit — `v0.13.1 - Level Up`

---

# Day 41 — Mon 8/24
## LEVEL REWARDS

* [ ] Define early Hunter level milestones
* [ ] Add small permanent stat growth
* [ ] Unlock armor slot through progression
* [ ] Unlock harder drop scaling gradually
* [ ] Add level-up presentation
* [ ] Show next-level reward preview
* [ ] Prevent Hunter levels from replacing equipment progression
* [ ] Commit — `v0.13.2 - Growing Stronger`

---

# Day 42 — Tue 8/25
## ARMOR FOUNDATION

* [ ] Create Armor item data model
* [ ] Add armor rarity
* [ ] Add Defense stat
* [ ] Add secondary armor stats
* [ ] Add armor affix support
* [ ] Add equipped armor slot
* [ ] Save and load equipped armor
* [ ] Add starter armor
* [ ] Commit — `v0.13.3 - Suit Up`

---

# Day 43 — Wed 8/26
## ARMOR LOOT

* [ ] Add armor to loot tables
* [ ] Add armor drops from normal enemies
* [ ] Add guaranteed armor opportunities
* [ ] Add rare armor from Red Boxes
* [ ] Add boss armor drops
* [ ] Balance weapon versus armor drop frequency
* [ ] Add armor names and descriptions
* [ ] Confirm full-inventory behavior
* [ ] Commit — `v0.13.4 - Armor Hunt`

---

# Day 44 — Thu 8/27
## ARMOR EQUIPMENT

* [ ] Display armor in Hunter Hub
* [ ] Add armor selection and Equip action
* [ ] Compare selected armor with equipped armor
* [ ] Clearly display Defense changes
* [ ] Prevent equipped armor from being fed to the Core
* [ ] Show armor in Recent Finds
* [ ] Add armor feeding values
* [ ] Verify persistence across multiple drops
* [ ] Commit — `v0.13.5 - Armored Hunter`

---

# Day 45 — Fri 8/28
## DRESS THE HUNTER

* [ ] Visually change Hunter based on equipped armor
* [ ] Create temporary armor appearance variants
* [ ] Preserve Hunter readability at gameplay size
* [ ] Show equipped armor on profile screen
* [ ] Show equipped armor in Hunter Hub
* [ ] Keep visuals separate from collision
* [ ] Track temporary armor art
* [ ] Commit — `v0.13.6 - Dress for the Drop`

---

# Day 46 — Sat 8/29
## WEAPON VISUAL IDENTITY

* [ ] Visually display equipped weapon on the Hunter
* [ ] Distinct Rifle appearance
* [ ] Distinct Scattergun appearance
* [ ] Distinct Cannon appearance
* [ ] Distinct Photon Lance appearance
* [ ] Distinct Greatsword appearance
* [ ] Match attack origin to visible weapon
* [ ] Preserve aiming and combo behavior
* [ ] Commit — `v0.13.7 - Armed and Ready`

---

# Day 47 — Sun 8/30
## RARITY APPEARANCE

* [ ] Add subtle visual differences by weapon rarity
* [ ] Add subtle visual differences by armor rarity
* [ ] Add controlled energy accents
* [ ] Improve equipment icons
* [ ] Add rare-item glow without excessive noise
* [ ] Keep silhouettes consistent within item families
* [ ] Confirm visuals remain readable in combat
* [ ] Commit — `v0.13.8 - Look Rare`

---

# Day 48 — Mon 8/31
## SOUND FOUNDATION

* [ ] Add AudioManager
* [ ] Add master volume control
* [ ] Add music volume control
* [ ] Add effects volume control
* [ ] Add mute option
* [ ] Save audio settings
* [ ] Handle browser autoplay restrictions
* [ ] Add temporary licensed or original sound assets
* [ ] Create audio credits documentation
* [ ] Commit — `v0.13.9 - Make Some Noise`

---

# Day 49 — Tue 9/1
## COMBAT AUDIO

* [ ] Rifle combo sounds
* [ ] Scattergun combo sounds
* [ ] Cannon combo sounds
* [ ] Photon Lance combo sounds
* [ ] Greatsword swing and impact sounds
* [ ] Distinct finisher sounds
* [ ] Enemy hit and death sounds
* [ ] Player damage sound
* [ ] Prevent excessive overlapping audio
* [ ] Commit — `v0.13.10 - Weapons Online`

---

# Day 50 — Wed 9/2
## WORLD AUDIO

* [ ] The Wastes ambient loop
* [ ] Gate locked sound
* [ ] Gate unlock sound
* [ ] Red Box drop sound
* [ ] Red Box reveal sound
* [ ] Core feeding sound
* [ ] Core level-up sound
* [ ] Hunter level-up sound
* [ ] Wyrm arrival and death sounds
* [ ] Hunter Hub ambience
* [ ] Commit — `v0.13.11 - Hear the Wastes`

---

# Day 51 — Thu 9/3
## CHARACTER POLISH

* [ ] Improve profile-screen presentation
* [ ] Improve Hunter level display
* [ ] Improve armor comparison
* [ ] Improve weapon and armor silhouettes
* [ ] Improve equipment-change feedback
* [ ] Improve level-up feedback
* [ ] Test audio mix during crowded combat
* [ ] Fix meaningful character-progression bugs
* [ ] Commit — `v0.13.12 - This Is My Hunter`

---

# Day 52 — Fri 9/4
## SHIP YOUR HUNTER

* [ ] Fresh-profile playtest
* [ ] Create and name a new Hunter
* [ ] Complete first drop
* [ ] Gain persistent Hunter XP
* [ ] Level up
* [ ] Find and equip armor
* [ ] Confirm armor changes appearance
* [ ] Equip multiple weapon types
* [ ] Confirm weapon appearance changes
* [ ] Feed unwanted equipment to Core
* [ ] Complete five-drop progression test
* [ ] Confirm sound settings persist
* [ ] Confirm old save migration
* [ ] Production build
* [ ] Upload to itch.io
* [ ] Test live build
* [ ] Send build to Jeff
* [ ] Commit — `v0.14.0 - BUILD YOUR HUNTER`

---

# Sprint Guardrails

This sprint should not add:

* Online multiplayer
* Email/password authentication
* Cloud saves
* Full character classes
* Skill trees
* Multiple armor slots
* Cosmetic transmog
* Armor crafting
* A new biome
* A new boss
* Large animation systems

For the first armor pass, use one equipped suit slot instead of separate helmet, chest, gloves, boots, and pants slots.

The character loop becomes:

```text
Choose Hunter
↓
Enter Drop
↓
Earn Hunter XP
↓
Find Weapons and Armor
↓
Return to Hub
↓
Equip a New Look
↓
Grow Stronger
↓
Start Another Drop