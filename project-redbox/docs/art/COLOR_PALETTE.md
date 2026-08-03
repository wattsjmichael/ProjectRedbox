# Color Palette

**Last Updated:** 2026-08-03  
**Status:** Current values audited; recommendations do not change production colors

## Current Verified Colors

| Name | Hex | RGB | Current use / concern |
|---|---|---:|---|
| Redbox Red | `#E50914` | 229, 9, 20 | Primary titles, buttons, progress and brand accent; reserve for priority. |
| Canvas Navy | `#111827` | 17, 24, 39 | Phaser background. Ensure gray text meets contrast. |
| Panel Blue-Black | `#111720` | 17, 23, 32 | Dark UI/environment panels. |
| Raised Panel | `#202731` | 32, 39, 49 | Secondary buttons and surfaces. |
| White | `#FFFFFF` | 255, 255, 255 | Primary labels and critical data. |
| Mid Gray | `#999999` | 153, 153, 153 | Supporting text; avoid at tiny sizes on textured floors. |
| Dim Gray | `#777777` | 119, 119, 119 | Low-priority text; contrast risk at embed scale. |
| Threat Red | `#FF4444` | 255, 68, 68 | Enemies, warnings, damage emphasis. |
| Cyan | `#55D8EE` | 85, 216, 238 | Powered systems, Core/photon language, selection. |
| Amber | `#FFAA00` | 255, 170, 0 | Warnings/impact/loot accents. |
| Reward Gold | `#FFDD55` | 255, 221, 85 | Reward or finisher emphasis. |

## Recommended Working Palette

Use Redbox Red for brand, locked gates, danger, and rare-box identity; cyan/blue-white for powered/open/selected states; amber for caution and heavy impact; neutral blue-black/metal grays for most surfaces. Recommendations are constraints on future assets, not a request to recolor the current game.

## Proposed Rare-Loot Colors

- **Common:** steel gray/white; low glow.
- **Uncommon:** controlled cyan; moderate accent.
- **Rare:** saturated Redbox red with white-hot center and pulse.

This framework is **proposed** visually; current rarity UI should be audited before adding more tiers.

## Semantic Groups

- **Health/damage:** white health data, red damage/threat, avoid identical red treatment for every warning.
- **XP/progression:** cyan or white fill with restrained reward gold for milestones.
- **Boss:** dark red and white hierarchy; boss health must contrast with arena red warnings.
- **Background:** navy, charcoal, dirty metal, muted brown; keep saturation below entities/loot.
- **UI neutrals:** white for primary, `#AAAAAA`/`#999999` for secondary, `#777777` only for truly optional text.

## Contrast Rules

Never rely on hue alone for selected/equipped, locked/open, elite/base, or rarity states. Pair color with outline, shape, label, motion, or scale. Test at the actual 1280×720 canvas and reduced itch/Steam embeds.

