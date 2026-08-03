# Loot

**Last Updated:** 2026-08-03  
**Status:** Weapon loot and Red Boxes implemented; armor drops planned

## Emotional Goal

> Players should immediately recognize when something rare has dropped and feel compelled to reach it.

## Current Drop Pipeline

Regular enemy death rolls a 5% Red Box chance and a 20% normal weapon-drop chance. Weapon type is selected from a weighted table: Rifle 22, Scattergun 20, Cannon 18, Photon Lance 20, Greatsword 20. Generated rarity is common 70%, uncommon 25%, rare 5% before any applicable tier reward multiplier. All five weapon families are present in the table.

## Normal Weapon Drops

Normal drops use a quieter temporary pickup sprite. Collection reveals a generated `WeaponItem`, supports inventory ownership, and feeds the comparison/equip workflow. Inventory capacity is currently 30 shared weapon/armor items.

## Rare Red Boxes

Red Boxes have a dedicated red sprite, glow/pulse/reveal presentation, rare-item generation, and stronger feedback. Wyrm defeat guarantees valuable rare equipment through the boss reward flow. The reveal remains intentionally short so it does not interrupt combat for long.

## Randomized Weapons

Generation randomizes attack (±20%), speed (±10%), critical chance (±25%), and critical damage (±15%) around family bases, then applies rarity multipliers. Uncommon items gain one prefix; rare items gain a prefix and suffix. Names are composed from those definitions, such as `Heavy Rifle of Precision`.

Affixes include broad tradeoffs and weapon-identity modifiers: extra pierce/range, pellets/spread/recoil, explosion radius/knockback, photon links/range, and Greatsword timing. Definitions are centralized in `src/items/WeaponAffixes.ts`.

## Pickup, Comparison, and Decisions

The Hunter Bay and inventory interfaces show item name, rarity, primary stats, affixes, selected/equipped state, and concise better/worse/similar comparison. Players can equip owned gear or feed unwanted equipment to the Core. Equipped weapon and armor are protected from feeding.

## Armor and Other Loot

Armor is a real inventory category with rarity, defense, secondary stats, affixes, and equipped persistence, but **world armor generation/drops are not implemented**. XP pickups are implemented for in-run leveling. No currency pickup economy, crafting, or additional rarity tiers exist.

## Current Limitations

- Temporary sprites and incomplete final audio/VFX.
- Only three rarities: common, uncommon, rare.
- No armor drop table or full armor content pipeline.
- Affix pool and balance need broader playtesting.
- No loot filters, stash, vendors, crafting, or item locking.

## Proposed Rarity Framework

**Proposed only:** preserve common/uncommon/rare through initial release validation before considering additional tiers. Any future tier must have a distinct visual language, bounded affix budget, and drop source—not just larger numbers.

