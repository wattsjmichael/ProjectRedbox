# Project Redbox — Living GDD

**Last Updated:** 2026-08-03  
**Status:** In progress

## High Concept

Project Redbox is a top-down dark science-fiction action roguelite by Dadbod Studios. A Hunter enters a hostile industrial zone, fights through gated encounters, finds randomized equipment, develops a support Core, defeats the Wyrm, and returns to the Hunter Bay with persistent gains.

## Player Fantasy

Become a stronger Hunter through deliberate combat decisions and exciting salvage—not through an overwhelming web of systems. Every rare drop should invite an immediate tactical or progression choice.

## Design Pillars

1. Loot defines the build.
2. Rare drops should feel exciting.
3. Combat should be readable and immediate.
4. Progression should be meaningful without becoming overwhelming.
5. The atmosphere should feel dark, strange, and nostalgic.
6. Every run should create a story worth sharing.

## Core Gameplay Loop

Choose a local Hunter profile, prepare equipment and Core in the Hunter Bay, select an unlocked drop tier, enter The Wastes, clear three combat zones, approach and fight the Wyrm, then return with inventory, Hunter XP, Core growth, and lifetime statistics preserved. Death also returns the player to the Bay.

## Current Run Structure

**Implemented:** The Wastes uses a 4800×4200 world, an entry, Salvage Yard, Reactor Trench, Extraction Pit, a final approach, and a dedicated Wyrm arena. Zone-owned enemies must be cleared before gates open. The rendered game is 1280×720.

## Combat

**Implemented:** WASD or arrow-key movement, mouse aiming, distinct-press attacks, input-buffered three-step combos, critical hits, enemy contact/telegraphed attacks, hit feedback, and weapon-specific finishers. Holding attack does not autofire. See [`WEAPONS.md`](WEAPONS.md).

## Loot and Equipment

**Implemented:** Common, uncommon, and rare randomized weapons; prefix/suffix affixes; normal weapon drops; conspicuous Red Boxes; inventory comparison/equip/feed actions; one equipped weapon and one equipped suit. Armor drops are **not yet implemented**. See [`LOOT.md`](LOOT.md).

## Core System

**Implemented:** An autonomous support module follows the Hunter. Feeding equipment grants progress and one of four stats. It evolves from Dormant to Awakened at level 10 and gains a pickup-radius bonus. See [`MAG.md`](MAG.md).

## Enemies and Bosses

**Implemented:** Basic pressure enemies, flanking Fast enemies, area-controlling Tanks, standalone Elite encounters, and the Wyrm boss. Spawn compositions escalate through The Wastes. See [`ENEMIES.md`](ENEMIES.md).

## Progression

**Implemented:** Run XP/level state, persistent Hunter XP/levels and small milestone rewards, two selectable drop tiers, inventory/equipment, Core growth, tutorial state, lifetime statistics, and isolated browser-local Hunter profiles. See [`PROGRESSION.md`](PROGRESSION.md).

## Failure and Completion

Player health reaching zero produces **Drop Failed** and returns to the Hunter Bay. Defeating the Wyrm completes the drop, records rewards/statistics, and returns to the Bay. Run encounter state resets; profile progression persists.

## Controls

- Move: WASD or arrow keys.
- Aim/attack: mouse pointer and distinct left clicks.
- Backpack: `I`.
- Developer-only keys exist for encounter/art testing and are not player features.
- **Planned:** controller support and remapping.

## UI, Audio, and Visual Direction

The interface uses hard rectangular panels, red/cyan accents, compact status readouts, combat HUD, inventory, combo timing, boss health, results overlays, profile selection, and contextual onboarding. Audio production is incomplete; code contains future-facing hooks. Visuals target crisp top-down retro-console science fiction; many sprites and biome textures are temporary. See [`../art/STYLE_GUIDE.md`](../art/STYLE_GUIDE.md) and [`../art/UI.md`](../art/UI.md).

## Target Platform and Scope

**Current:** browser production build through Vite; localStorage profiles.  
**Planned:** public browser deployment, Steam Coming Soon page, demo, controller and Steam Deck testing.  
**Proposed:** later console releases.

## Non-Goals

No online accounts, cloud backend, classes, skill trees, crafting economy, multiplayer, or live-service architecture are part of the current game.

