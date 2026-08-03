# Core Companion System

**Last Updated:** 2026-08-03  
**Status:** Implemented foundation; document filename retained for requested/legacy discovery

The player-facing and runtime system is named **Core**, not MAG. Legacy save migration still recognizes old `mag` fields so existing progress is not lost.

## Current Role

The Core is an autonomous support module that follows the Hunter and develops by processing salvaged equipment. It supplements the Hunter; it is not a class, weapon replacement, or separate protagonist.

## Feeding

Players select unequipped equipment in the Hunter Bay or backpack and feed it to the Core. Common/uncommon/rare items grant 10/20/40 progress and 1/2/4 stat points. Armor currently feeds Defense. Weapons map as follows:

- Rifle → Dexterity
- Scattergun and Greatsword → Power
- Cannon → Defense
- Photon Lance → Energy

Armor can increase Core feed progress through an `Integrated` modifier. Equipped items cannot be consumed. The interface previews the item, progress, and stat gain, then reports level/evolution results.

## Saved Data

Each Hunter profile stores Core ID/name, level, experience, stage, and Power/Defense/Dexterity/Energy. Profile summaries store compact Core level/stage data. Browser reloads and consecutive drops preserve the full state.

## Gameplay Effects

- Power: +2% attack multiplier per point.
- Defense: 1% independent damage reduction per point, capped at 50% before combined defense cap.
- Dexterity: +0.5 percentage points critical chance per point.
- Energy: +2% multiplier per point for rare-weapon damage.

## Evolution

The Core starts **Dormant**. At level 10 it automatically becomes **Awakened**, persists that stage, and activates **Salvage Field** (+15% pickup radius). The same temporary concept sprite currently gains stronger glow/pulse/particles rather than a separate animation set.

## Current UI and Visual

Core level, progress, stats, stage, next evolution, feed preview, and evolution bonus appear in the Hunter Bay. A small temporary Core sprite follows the Hunter with bob/sway/glow. Contextual first-run onboarding teaches feeding.

## Current Limitations

Only two stages and one evolution bonus exist. There are no active Core abilities, personalities, branching trees, or weapon-specific builds. The sprite is temporary AI concept art under `public/assets/sprites/temp-ai/core/`.

## Long-Term Possibilities

**Proposed:** additional original stages, visual forms, carefully bounded support abilities, and more feeding decisions. These are not committed features and should not overshadow weapons, armor, or Hunter identity.

## Naming Decision Needed

“Core” is the current public-facing working name. Before commercial launch, confirm that it is distinctive, searchable, and appropriate for branding. “MAG” should remain limited to historical/internal inspiration and legacy migration compatibility; do not market the system with borrowed franchise terminology.

