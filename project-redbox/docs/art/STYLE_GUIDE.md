# Project Redbox Visual Style Guide

**Last Updated:** 2026-08-03  
**Status:** Authoritative direction; current assets are largely temporary

## Visual Direction

Project Redbox targets crisp top-down retro-console action: chunky late-1990s silhouettes, clean early-2000s sci-fi readability, dark industrial ruins, restrained detail, and aggressive impact. References describe mood and readability only; never copy commercial assets or franchise designs.

## Perspective and Rendering

- Gameplay sprites must be top-down or strongly top-down three-quarter, with facing readable through rotation/flip behavior.
- Favor a few large shapes over tiny armor panels, vents, spikes, or painterly surface noise.
- Judge every asset in a crowded 1280×720 scene, not as a large isolated illustration.
- Use crisp edges and controlled palettes; avoid glossy mobile-game rendering and photoreal machinery.

## Hunter and Core

The Hunter must remain identifiable against swarms, with an obvious aim direction and oversized readable weapon language. The Core is secondary: smaller than the Hunter, cyan-accented, gently hovering, and never visually competing with attacks or loot.

## Enemy Silhouettes

- Basic: medium, readable pressure silhouette.
- Fast: visibly lean/sharp, not merely recolored.
- Tank: broad/heavy and readable around telegraphs.
- Elite: preserve base identity while adding restrained aura/scale/accent treatment.
- Wyrm: boss-scale without obscuring the arena.

## Environment

The Wastes uses muted dirty metal, cracked ground, red warnings, cyan powered systems, sparse landmarks, and separated collision/art. Each zone should be navigable by floor treatment and one major landmark. Decoration must not hide gates, telegraphs, loot, or collision edges.

## Loot Language

- Rare loot must remain readable during heavy combat.
- Red Boxes own saturated red, pulse/glow, and stronger reveal effects.
- Common pickups stay quieter and smaller.
- The player should identify rarity before reading text.

## Lighting, VFX, and Animation

Use restrained pools of red/cyan light, dust, sparks, and haze. VFX must reinforce impact without hiding threats. Later combo steps may grow in flash/particles/shake; simultaneous impacts must aggregate. Animation should communicate anticipation, contact, recovery, and facing before ornamental motion.

## UI and Screenshot Readability

UI should feel futuristic without becoming difficult to read: hard rectangular frames, strong hierarchy, high-contrast text, and limited accent colors. Promotional screenshots must show a legible Hunter, threat, objective/reward, and uncluttered HUD at real gameplay scale.

## Temporary Asset Policy

Current AI/concept assets live under `public/assets/sprites/temp-ai/`. Placeholder assets should be tracked and replaced deliberately. Do not mix temporary files into approved-final directories, invent licenses, or let decorative art become collision authority.

