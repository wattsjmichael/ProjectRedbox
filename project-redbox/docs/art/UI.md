# UI Inventory and Priorities

**Last Updated:** 2026-08-03  
**Status:** Implemented foundation with ongoing polish

## Combat HUD

| Component | Purpose / information | Status | Readability concerns / next improvement |
|---|---|---|---|
| Health | Current/max HP and bar | Implemented | Keep above world art and readable during damage flashes. |
| XP | Current run XP/next level | Implemented | Distinguish run progression from persistent Hunter XP. |
| Kill counter and timer | Run performance/context | Implemented | Keep compact; do not expose planned random hostile counts. |
| Weapon display | Equipped weapon and combat state | Implemented | Preserve long affix-name readability. |
| Combo/Chain | Three steps, reset timing, finisher readiness | Implemented | Must never sit beneath the Hunter or compete with crosshair. |
| Greatsword timing | Sweet-spot rhythm feedback | Implemented | Clarify success/failure without large tutorial copy. |
| Boss health | Wyrm identity and remaining health | Implemented | Keep above arena visuals and visible through effects. |
| Level-up | In-run/Hunter reward presentation | Implemented | Maintain screen-space depth; aggregate multiple rewards. |
| Drop failed | Death state and Return to Hunter Bay | Implemented | Cursor must remain visible across the full overlay. |

## Loot and Inventory

| Component | Purpose / information | Status | Concerns / next improvement |
|---|---|---|---|
| Pickup/rare message | Announces equipment and exceptional finds | Implemented | Avoid overlapping zone/gate messages; rare state should dominate. |
| Backpack grid | Shared weapon/armor inventory, paging, selection | Implemented | Keep equipped and selected states unmistakable. |
| Item detail/comparison | Stats, affixes, better/worse/similar | Implemented | Avoid raw-number overload and clipped long names. |
| Equip / Feed Core | Primary item decisions | Implemented | Disabled/equipped protection and double-click safety must remain clear. |
| Recent Finds | Previous run’s collected equipment | Implemented | Preserve obvious recency without duplicating the whole inventory. |

## Hunter Bay and Profiles

Hunter Bay displays Hunter identity, currency placeholder, lifetime stats, equipped weapon/armor, Core level/stats/progress/evolution, persistent Hunter XP/next reward, drop-tier selector, inventory, and Start Next Drop/Return to Title. Profile selection shows isolated local Hunters, equipped summaries, Core, levels, delete/reset confirmations, and corruption state. These are **implemented**; density and hierarchy remain an active polish concern.

## Tutorial

Contextual Hub overlays teach welcome, equip, Core feeding, and starting a drop. They dim the scene, focus the relevant action, support skip confirmation, and persist per profile. There is no separate tutorial level.

## Results

Drop completion/failure information includes kills, time, progression, rewards, and recent finds before/within the Hunter Bay flow. Results presentation is implemented but should stay concise rather than becoming a character sheet.

## UI Priority List

1. Prevent overlap/depth/cursor regressions at 1280×720 and embedded scale.
2. Clarify run XP versus persistent Hunter XP.
3. Polish inventory/armor comparison and long-name layout.
4. Consolidate notification priority so loot, gate, and level messages do not collide.
5. Add final controller focus/navigation only when controller scope is confirmed.
6. Replace temporary icons/art without changing functional hit regions.

