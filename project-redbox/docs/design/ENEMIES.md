# Enemies

**Last Updated:** 2026-08-03  
**Status:** Basic, Fast, Tank, Elite, and Wyrm implemented

## Architecture

Enemy roles share `EnemyType`, stat/config tables, and a small state model (`spawn`, `pursue`, `telegraph`, `attack`, `recover`). The encounter system uses weighted compositions and spawn costs. Elites remain a standalone type in current code; applying elite as a modifier to every archetype is **planned**, not complete.

## Verified Base Stats

| Type | Health | Speed | Contact damage | Size | Spawn cost | Role |
|---|---:|---:|---:|---:|---:|---|
| Basic | 3 | 80 | 10 | 24 | 1 | Relentless direct pressure |
| Fast | 2 | 92 | 8 | 20 | 2 | Offset approach and committed dash |
| Tank | 14 | 42 | 18 | 42 | 3 | Telegraphing space controller |
| Elite | 10 | 105 | 20 | 36 | 4 | High-pressure standalone threat |
| Wyrm | 75 | 45 | 30 | 100 | 8 | Boss |

Base health and damage are multiplied by `DropScalingSystem`; Drop Tier 2 adds 15% regular health/10% damage and 20% Wyrm health/10% damage before progression multipliers.

## Behavior and Rewards

### Basic

Pursues directly with predictable attack timing and 420 ms recovery. It establishes readable pressure in groups. **Implemented.**

### Fast

Flanks through offset movement, telegraphs for 380 ms, commits to a mostly locked dash, then has an 850 ms recovery. Low health makes the recovery punishable. **Implemented.**

### Tank

Moves and turns slowly, prefers roughly 105 units, telegraphs its heavy area attack for 900 ms, and recovers for 1300 ms. It controls space rather than merely absorbing damage. **Implemented.**

### Elite

Uses a distinctive aura/presentation and more aggressive timing. Existing Elite rewards and Red Box logic remain part of the loot pipeline. Archetype-specific elite modifiers are **planned**. **Implemented, structurally limited.**

### Wyrm

Spawns only after the final Wastes approach/arena trigger. It has dedicated slam behavior, boss UI, scaled health/damage, and a guaranteed rare reward path on defeat. Its arena and mechanics are implemented; final art/audio polish remains in progress.

## Encounter Composition and Scaling

The Wastes draws from Pressure Pack, Flank Pack, Anchor Pack, Disruption Pack, Mixed Assault, and Elite Escort definitions. Complexity unlocks by zone. Gates use zone ownership and living counts rather than a global enemy count. Progression scaling considers Core level, equipped-weapon rarity/attack, completed bosses, and selected drop tier.

## Planned Archetype Work

More archetypes, elite traits, and bosses are future scope. They should add movement/attack decisions before raw stat inflation and must preserve telegraph readability.

## Reusable Enemy Design Template

```markdown
### Name / Internal ID
- Status:
- Combat role and desired player response:
- Silhouette/readability:
- Preferred range and movement pattern:
- Telegraph, attack, and recovery:
- Base health/speed/damage/spawn cost:
- Elite compatibility:
- Encounter partners and caps:
- Reward behavior:
- Performance and cleanup risks:
```

