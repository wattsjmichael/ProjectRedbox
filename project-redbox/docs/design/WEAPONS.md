# Weapons

**Last Updated:** 2026-08-03  
**Status:** Five weapon families implemented

## Shared Rules

Weapons are `WeaponItem` records with category, internal `weaponType`, rarity, attack, speed multiplier, critical chance, critical-damage multiplier, optional prefix/suffix, and behavior modifiers. Generated values vary around the bases below; rarity multiplies rolled stats by 1.00/1.15/1.35 for common/uncommon/rare. `speed` is a rate modifier applied to configured combo cadence, not a documented rounds-per-second value.

All weapons use three intentional presses. The third step is a finisher; inputs can buffer for 100–160 ms depending on weapon. Exact timing lives in `src/weapons/WeaponComboConfig.ts`.

## Verified Weapon Reference

| Name | ID | Category | Base attack | Base speed | Crit chance | Crit damage | Base cadence | Finisher |
|---|---|---|---:|---:|---:|---:|---:|---|
| Rifle | `rifle` | precision projectile | 10 | 1.20 | 8% | 1.50× | 260 ms | Piercing Round |
| Scattergun | `scattergun` | spread projectile | 16 | 0.80 | 6% | 1.60× | 500 ms | Devastating Blast |
| Cannon | `cannon` | heavy projectile | 25 | 0.55 | 4% | 1.80× | 760 ms | Explosive Shell |
| Photon Lance | `photonLance` | photon projectile | 30 | 0.90 | 12% | 2.00× | 480 ms | Photon Chain |
| Greatsword | `greatsword` | timed melee | 22 | 0.70 | 10% | 1.75× | 700 ms | Rhythm Finisher |

These are generation bases, not guaranteed item-card values.

## Rifle

Accurate line-control weapon. Shots use 500 speed and a configured 1200 maximum range. Combo damage is 1.00×/1.05×/1.20×. The finisher continues through targets. Strengths: precision, alignment, reliability. Weaknesses: limited crowd width and light impact outside the finisher. Status: **Implemented**.

## Scattergun

Close-range crowd clearer firing 5/6/10 pellets across progressively wider spreads, at projectile speed 450. Combo damage is 1.00×/1.08×/1.30×. The finisher adds strong knockback presentation. Strengths: groups and close range. Weaknesses: spread and lower effectiveness at distance. Status: **Implemented**.

## Cannon

Slow industrial burst weapon. Projectiles use speed 250; combo damage is 1.00×/1.08×/1.35×. The finisher explodes in a 105-unit radius. Strengths: burst and area damage. Weaknesses: long 760 ms cadence and 650 ms finisher recovery. Status: **Implemented**.

## Photon Lance

Fast cyan energy weapon. Normal shots travel at 720 and can hit two targets. Combo damage is 1.00×/1.10×/1.30×. The finisher chains to three nearby targets within 230 units. Strengths: clustered enemies and rapid precision. Weaknesses: depends on target spacing for chain value. Status: **Implemented**.

## Greatsword

Timing-mastery melee weapon with distinct sweet spots rather than generic projectile behavior. Step ranges are 95/115/145 and arcs are 65°/85°/120°. Base step damage factors are 1/2/4; well-timed later steps use 1/3/6. Strengths: burst, arcs, skill expression. Weaknesses: melee risk and timing commitment. Status: **Implemented**.

## Randomized Stats and Affixes

Uncommon weapons receive a prefix; rare weapons receive a prefix and suffix. Global tradeoffs include Heavy (+attack, −speed), Rapid (+speed, −attack), and Brutal (+critical damage, slight speed loss). Family-specific affixes alter pierce, range, pellet count/spread/recoil, explosion/knockback, photon chains, or Greatsword sweet-spot width. See [`LOOT.md`](LOOT.md).

## Future Design Notes

**Planned:** expand affix variety and balance testing without erasing weapon identities. New weapons should use configuration-driven combo/finisher behavior rather than expanding core switch logic.

