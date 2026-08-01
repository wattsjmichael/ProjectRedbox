# Project Redbox Temporary Asset Log

## wastes_floor_salvage_temp_v1.png

- Category: Environment floor
- Purpose: Temporary Salvage Yard floor treatment for The Wastes
- Date added: 2026-07-31
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Strict top-down tileable dirty metal plates, cracked concrete, contaminated soil, and restrained orange salvage markings
- Replacement priority: High before commercial release
- Gameplay notes: Loaded as a reusable tiled floor beneath all gameplay objects. Muted through tint and alpha to protect enemy, projectile, telegraph, and loot readability. Live 1280x720 crowd testing remains manual.

## wastes_floor_reactor_temp_v1.png

- Category: Environment floor
- Purpose: Temporary Reactor Trench floor treatment for The Wastes
- Date added: 2026-07-31
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Strict top-down dark metal channels with sparse cyan conduits and muted industrial hazard bands
- Replacement priority: High before commercial release
- Gameplay notes: Loaded as a reusable tiled floor and kept below collision/debug layers. Cyan accents are restrained to avoid competing with Hunter projectiles. Live 1280x720 crowd testing remains manual.

## wastes_floor_extraction_temp_v1.png

- Category: Environment floor
- Purpose: Temporary Extraction Pit, Wyrm approach, and boss-arena floor treatment
- Date added: 2026-07-31
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Strict top-down heavy industrial plating with excavation damage, embedded soil, and worn red warning markings
- Replacement priority: High before commercial release
- Gameplay notes: Reused with separate tinting for the Extraction Pit, final approach, and Wyrm arena. The arena adds a sparse containment boundary and crater treatment. Live 1280x720 boss-readability testing remains manual.

## redbox_sprite_atlas.png

- Category: Rejected multi-category gameplay atlas
- Purpose: Previous Day 30 First Art Pass
- Date added: 2026-07-27
- AI-generated: Yes
- Status: Rejected
- Prompt summary: Cohesive dark sci-fi atlas covering the Hunter, enemies, Wyrm, projectiles, and loot
- Replacement priority: Removed from production loading; replace one approved category at a time
- Gameplay notes: Did not match the Art Bible. The rendering read as modern, detailed sci-fi illustration rather than chunky late-1990s console gameplay art. Removed from the working tree after audit; recoverable from commit `7098145`.

## hunter_temp_v2_gameplay.png

- Category: Hunter
- Purpose: Day 31 visual-language proof of concept
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Rejected
- Prompt summary: Chunky high-three-quarter retro sci-fi Hunter with broad armor, oversized rifle, and restrained cyan accents, generated on chroma key and locally background-removed
- Replacement priority: Removed from production loading
- Gameplay notes: Rejected because the high three-quarter camera does not match the strict top-down Project Redbox perspective. Superseded by `hunter_temp_v3_gameplay.png`.

## enemy_basic_temp_v2_gameplay.png

- Category: Basic enemy
- Purpose: Day 31 enemy-faction visual-language proof of concept
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Rejected
- Prompt summary: Chunky high-three-quarter biomechanical industrial alien with four obvious limbs, front claws, and one orange-red energy eye, generated on chroma key and locally background-removed
- Replacement priority: Removed from production loading
- Gameplay notes: Rejected because the high three-quarter camera does not match the strict top-down Project Redbox perspective. Superseded by `enemy_basic_temp_v3_gameplay.png`.

## hunter_temp_v3_gameplay.png

- Category: Hunter
- Purpose: Strict top-down visual-language proof
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Near-orthographic overhead armored Hunter with a chunky PSOne-era silhouette, clean early-online-RPG sci-fi shapes, oversized rifle, and controlled cyan accents
- Replacement priority: Critical before commercial release
- Gameplay notes: Configured at 91×64 with a torso-centered rotation origin. Helmet crown, armored back, shoulder mass, boots, and rifle direction are visible; face and chest are not presented to the camera. Static 1280×720 review passed. Live rotation and firing-origin review remains manual.

## enemy_basic_temp_v3_gameplay.png

- Category: Basic enemy
- Purpose: Strict top-down enemy visual-language proof
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Near-orthographic overhead biomechanical enemy with a simple shell, four chunky limbs, forward claws, and one orange-red eye
- Replacement priority: Critical before commercial release
- Gameplay notes: Configured at 64×49. The shell, claw direction, and orange eye remain readable at actual scale and oppose the Hunter silhouette and accent color. Live pursuit-facing and collision review remains manual.

## day31-hunter-enemy-proof-1280x720.png

- Category: Art review capture
- Purpose: Static actual-resolution readability check
- Date added: 2026-07-28
- AI-generated: No; composed from the two AI-generated proof assets
- Status: Experimental
- Prompt summary: N/A
- Replacement priority: Remove after visual-direction approval
- Gameplay notes: Updated to show the strict top-down v3 Hunter and Basic enemy at configured display sizes. This is a scale/readability reference, not a live gameplay screenshot.

## enemy_elite_temp_v1_gameplay.png

- Category: Elite enemy
- Purpose: Temporary gameplay sprite derived from the approved Basic enemy language
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Strict overhead upgraded shell-and-claw enemy with broader armor, enlarged claws, blade shoulders, and an enlarged orange-red core
- Replacement priority: Critical before commercial release
- Gameplay notes: Configured at 82×60, approximately 20% larger than the Basic enemy. It retains the faction silhouette while the larger core, shoulder blades, existing engine aura, and scale pulse distinguish it during combat. Static crowded-scale review passed; live aura and hit-reaction testing remains manual.

## wyrm_temp_v1_gameplay.png

- Category: Wyrm boss
- Purpose: Temporary boss gameplay sprite
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Strict overhead elongated biomechanical horror with segmented armor, exposed cables and tissue, stabilizer claws, crushing head jaws, and concentrated red sensors
- Replacement priority: Critical before commercial release
- Gameplay notes: Configured at 180×93. The long silhouette, asymmetric machinery, head jaws, and red sensor cluster make its facing and boss status readable without obscuring the arena. Static 1280×720 review passed; spawn scale, slam squash, collisions, and death effects require live testing.

## day31-enemy-family-1280x720.png

- Category: Art review capture
- Purpose: Static actual-resolution enemy-family readability check
- Date added: 2026-07-28
- AI-generated: No; composed from the temporary gameplay sprites
- Status: Experimental
- Prompt summary: N/A
- Replacement priority: Remove after temporary art approval
- Gameplay notes: Shows the Hunter, Basic enemies, Elite enemies, and Wyrm together at configured 1280×720 display sizes. This is a scale/readability reference, not a live gameplay screenshot.

## projectile_rifle_temp_v1_gameplay.png

- Category: Rifle projectile
- Purpose: Temporary precise ranged-projectile sprite
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Small hard-edged blue-white energy bolt with a cyan core and dark rear collar
- Replacement priority: Medium before commercial release
- Gameplay notes: Configured at 18×8. The narrow cyan silhouette remains distinct from other weapon families while using the existing projectile hitbox and speed.

## projectile_scatter_temp_v1_gameplay.png

- Category: Scattergun projectile
- Purpose: Temporary pellet sprite
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Short broad amber energy fragment with a pale impact tip and gunmetal collar
- Replacement priority: Medium before commercial release
- Gameplay notes: Configured at 12×8. Its short orange silhouette remains readable in spreads without increasing pellet count or visual noise.

## projectile_cannon_temp_v1_gameplay.png

- Category: Cannon projectile
- Purpose: Temporary heavy-projectile sprite
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Chunky overhead gunmetal cannon shell with a broad armored nose and orange-red core
- Replacement priority: Medium before commercial release
- Gameplay notes: Configured at 32×18. It reads substantially heavier than Rifle and Scattergun rounds while retaining the existing collision rectangle.

## projectile_photon_temp_v1_gameplay.png

- Category: Photon Lance beam
- Purpose: Temporary stretchable energy-beam texture
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Straight horizontal cyan photon blade with a blue-white core, compact origin collar, and sharp tip
- Replacement priority: Medium before commercial release
- Gameplay notes: Stretched to the existing beam length and weapon-specific width. The existing white beam core and line collision remain unchanged.

## loot_weapon_temp_v1_gameplay.png

- Category: Common weapon loot
- Purpose: Temporary normal weapon-drop container
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Quiet top-down gunmetal alien weapon capsule with cut corners and a pale blue-white slot
- Replacement priority: High before commercial release
- Gameplay notes: Configured at 32×22. It stays visible against the arena while remaining much quieter than the Red Box. Weapon category and collection behavior remain data-driven.

## core_silhouette_sheet_v1.png

- Category: Core concept exploration
- Purpose: Gate 1 silhouette review for the signature Core design
- Date added: 2026-07-30
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Sixteen strict top-down, solid-black support-module silhouettes exploring asymmetric chassis, stabilizers, clamps, prongs, and negative-space cutouts
- Replacement priority: Retain as design documentation until the Core direction is approved
- Gameplay notes: The top-right silhouette was selected as the strongest candidate because its crescent opening, swept rear stabilizers, and clear facing remain distinctive without color or internal detail.

## core_dormant_candidate_v1_chroma.png

- Category: Core source art
- Purpose: Chroma-key source retained for reproducibility of the Dormant Core candidate
- Date added: 2026-07-30
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Finished Dormant Core constrained to the selected crescent-jaw silhouette on a flat green removal background
- Replacement priority: Remove after the transparent derivative and visual direction are approved
- Gameplay notes: Source only; do not load this file in Phaser.

## core_dormant_candidate_v1.png

- Category: Core
- Purpose: First Dormant Core visual candidate derived from the approved silhouette exploration
- Date added: 2026-07-30
- AI-generated: Yes
- Status: Accepted temporary
- Prompt summary: Strict overhead crescent-chassis support module with swept stabilizers, dark gunmetal armor, and one controlled cyan energy aperture
- Replacement priority: Critical before commercial release until approved
- Gameplay notes: Transparency validated and integrated through the shared Core visual controller. The gameplay follower uses a 24×29 display box, trails below-left of the Hunter, and has restrained bob, sway, and cyan glow. Hunter Bay and inventory panels use a 42×50 display box. Feed and evolution events pulse the same sprite; evolution temporarily intensifies the glow and emits eight controlled cyan particles. Live crowd readability and final scale tuning remain manual.

## red_box_temp_v1_gameplay.png

- Category: Red Box rare loot
- Purpose: Temporary iconic rare-drop container
- Date added: 2026-07-28
- AI-generated: Yes
- Status: Experimental
- Prompt summary: Saturated top-down alien Red Box with heavy black framing, four corner clamps, cross-seam, and central crimson core
- Replacement priority: Critical before commercial release
- Gameplay notes: Configured at 44×44. Saturated red, the existing pulse, vertical beam, camera flash, and pickup presentation make it the strongest loot object on screen.
