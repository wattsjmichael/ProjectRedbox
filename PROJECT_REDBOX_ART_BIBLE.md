# PROJECT REDBOX
# ART BIBLE — v0.1

## Visual North Star

**Project Redbox should look like a lost late-1990s console action game that was remastered just enough to feel sharp on a modern screen.**

The visual identity combines the aggressive top-down action and chunky
silhouettes of a PSOne-era shooter with the clean science-fiction readability
and bright technology of an early online action RPG.

The visual identity combines:

- Chunky top-down action
- Dark industrial science fiction
- Clean, readable alien technology
- Exaggerated arcade violence
- Bright loot against oppressive environments
- Low-detail sprites built for gameplay readability

The game should feel like it belongs somewhere between:

- A gritty PSOne top-down shooter
- An early online sci-fi action RPG
- Industrial space horror
- A dark arcade loot game

It should **not** look like modern mobile-game concept art.

---

# 1. Core Style Pillars

## Chunky

Characters, enemies, weapons, and loot should use large, exaggerated shapes.

Small surface details are less important than:

- Silhouette
- Proportion
- Direction
- Threat level
- Weapon identity

A player should recognize an object immediately when it is moving through a crowded battlefield.

## Dark

The world is hostile, abandoned, mechanical, and dangerous.

Use:

- Black
- Charcoal
- Gunmetal
- Dirty gray
- Muted steel
- Deep brown
- Dark blue
- Controlled red lighting

Dark does not mean unreadable. Important gameplay elements must stand out clearly.

## Bright Technology

Energy, weapons, loot, and interfaces provide the color.

Use bright accents for:

- Photon energy
- Weapon fire
- Enemy weak points
- Hunter visor
- Core
- Red Boxes
- Rare loot
- Interactive objects

## Arcade Readability

Gameplay information must be understood instantly.

A player should be able to identify:

- The Hunter
- Basic enemies
- Fast enemies
- Tank enemies
- Elites
- The boss
- Enemy projectiles
- Player projectiles
- Healing items
- Red Boxes

Do not require close inspection.

## Retro-Futuristic

Technology should feel imagined from the perspective of the late 1990s or early 2000s.

Use:

- Heavy armor plates
- Large mechanical seams
- CRT-inspired interfaces
- Thick cables
- Glowing cores
- Oversized weapons
- Simple holographic displays
- Industrial machinery

Avoid sleek modern consumer electronics.

---

# 2. Camera and Perspective

## Primary Camera

- Strict top-down gameplay view
- Approximately 80–90 degrees above the battlefield
- The crown of the head, shoulders, weapon, and body direction should be visible
- Bodies and weapons must lie convincingly on the battlefield plane
- Use minimal perspective distortion and restrained foreshortening
- Sprites must not read as front-facing, side-view, or high three-quarter character renders
- Avoid side-view sprites
- Avoid eye-level perspective
- Avoid dramatic concept-art angles

Every gameplay sprite must appear to exist beneath the same near-vertical
camera. A sprite that presents the character's face, chest, or full front
profile to the viewer does not meet the Project Redbox gameplay perspective.

## Orientation

The Hunter and directional enemies should clearly face their movement or aiming direction.

Preferred options:

1. Eight-direction sprites
2. Four-direction sprites
3. One strong top-down sprite rotated carefully in-engine

Do not mix several perspective systems within the same scene.

---

# 3. Sprite Resolution

## Target Display Sizes

Approximate in-game display sizes:

| Asset | Target Size |
|---|---:|
| Hunter | 48–64 px |
| Basic enemy | 40–56 px |
| Fast enemy | 32–44 px |
| Tank enemy | 56–76 px |
| Elite enemy | Base size + 10–20% |
| Wyrm boss | 120–180 px |
| Common pickup | 20–30 px |
| Red Box | 32–44 px |
| Core | 20–28 px |
| Small projectile | 8–16 px |
| Heavy projectile | 16–28 px |

Source images may be larger, but they must remain readable after being reduced to these sizes.

## Pixel Treatment

The art does not need to be strict pixel art.

Preferred look:

- Low-resolution rendered sprites
- Crisp edges
- Limited shading
- Controlled texture detail
- Slightly retro digital appearance

Avoid:

- Painterly brushwork
- Soft airbrushed edges
- Extremely high-frequency detail
- Photorealistic materials
- Blurry downscaling

---

# 4. Shape Language

## Hunter

The Hunter must look powerful, practical, and slightly worn.

Key traits:

- Broad armored shoulders
- Compact body shape
- Large readable weapon
- Bright visor or face light
- Heavy boots
- Clear facing direction
- One strong accent color

The Hunter should not look like:

- A realistic military operator
- A superhero
- A sleek anime pilot
- A detailed tabletop miniature
- A mobile-game character portrait

## Basic Enemy

Shape language:

- Medium size
- Balanced proportions
- Simple central body
- Two to four obvious limbs or blades
- One visible glowing weak point

The basic enemy establishes the enemy faction’s design language.

## Fast Enemy

Shape language:

- Narrow
- Pointed
- Forward-leaning
- Small body
- Long blades, legs, wings, or claws

It must communicate speed without relying on color.

## Tank Enemy

Shape language:

- Wide
- Heavy
- Low center of gravity
- Thick armor
- Large shoulders, shell, or front plate

It must communicate durability without relying on color.

## Elite Enemy

An elite should retain the base enemy silhouette while adding:

- Larger scale
- Glowing ring
- Shoulder spikes
- Energy core
- Aura
- Stronger accent lighting

Tint alone is not enough.

## Wyrm

The Wyrm should feel like a biomechanical horror, not a clean vehicle.

Key traits:

- Uneven organic-mechanical body
- Large jaws, claws, or drilling structure
- Visible cables or internal machinery
- Multiple red or orange sensory lights
- Strong central silhouette
- Recognizable head or attack direction

Avoid making the Wyrm look like a polished spaceship or battle tank.

---

# 5. Materials

Preferred materials:

- Scratched metal
- Dark ceramic armor
- Oxidized machinery
- Dirty industrial plating
- Rubber cables
- Corroded steel
- Glowing photon components
- Biological tissue fused with machinery

Materials should be communicated with broad shapes and limited highlights.

Avoid covering every surface with tiny panels, bolts, vents, and scratches.

---

# 6. Color Language

## Environment

Primary colors:

- Near black
- Charcoal
- Steel gray
- Dirty brown
- Muted navy
- Desaturated green

## Hunter

The Hunter should be darker than their energy effects but brighter than the environment.

Suggested accents:

- Cyan
- Blue-white
- Amber
- Muted orange
- Small controlled red highlights

## Enemies

Enemy faction accents:

- Deep red
- Hot orange
- Sickly yellow
- Muted violet

Enemy accents should visually oppose the Hunter’s energy color.

## Loot

Loot colors must remain consistent.

Suggested hierarchy:

| Loot Type | Color |
|---|---|
| Common | White or pale blue |
| Uncommon | Green |
| Rare | Blue |
| High rarity | Purple |
| Red Box | Saturated red |
| Healing | Green or teal |
| Core-related | Cyan or gold |

The Red Box must always remain unmistakably red.

---

# 7. Lighting

Lighting should feel baked into the sprite rather than realistically simulated.

Use:

- One dominant overhead light
- Strong rim highlights
- Small glowing energy sources
- Deep controlled shadows
- Limited reflective surfaces

Avoid:

- Cinematic volumetric lighting
- Glossy mobile-game rendering
- Realistic ray-traced reflections
- Excessive bloom
- Bright lighting across every edge

Glow should be reserved for gameplay-critical elements.

---

# 8. Line and Edge Treatment

Sprites should use:

- Strong dark outer edges
- Clean separation between major shapes
- Thick internal divisions
- Minimal tiny linework
- Hard or semi-hard shading transitions

At gameplay size, the silhouette should remain readable against both dark and medium backgrounds.

Avoid thin illustration-style outlines.

---

# 9. Animation Direction

Animation must remain achievable for a small development project.

Preferred animation style:

- Two to four frames per action
- Strong key poses
- Limited transitional frames
- Small recoil
- Quick impact flashes
- Sprite rotation where appropriate
- Engine-driven squash, scale, and movement

Priority animations:

1. Movement
2. Attack
3. Hit reaction
4. Death
5. Idle

Do not build highly fluid animation at the expense of gameplay development.

A strong two-frame attack is better than an unfinished twelve-frame animation.

---

# 10. Weapon Visual Language

## Rifle

- Long, narrow shape
- Compact energy chamber
- Small precise muzzle flash
- Thin projectile
- Sharp impact

Feel:

**POP — POP — CRACK**

## Scattergun

- Wide barrel
- Heavy front profile
- Short broad muzzle flash
- Multiple visible pellets
- Wide impact burst

Feel:

**BOOM — BOOM — KABOOM**

## Cannon

- Large body
- Thick barrel
- Heavy energy core
- Large projectile
- Strong recoil

Feel:

**THOOM — THOOM — BOOM**

## Photon Lance

- Long energy blade or beam
- Cyan or blue-white core
- Clean shape
- Minimal physical debris
- Fast luminous impact

## Greatsword

- Oversized silhouette
- Thick blade
- Mechanical or photon edge
- Strong directional slash
- Clear rhythm timing
- Heavy contact effect

Weapons should be identifiable from silhouette alone.

---

# 11. Projectile Language

Player projectiles must remain distinct from enemy projectiles.

## Player Projectiles

- Cyan
- Blue-white
- Pale yellow
- Controlled orange

## Enemy Projectiles

- Red
- Dark orange
- Acid yellow
- Violet

Avoid giving both sides the same projectile colors.

Projectile sprites should be simpler than character sprites.

---

# 12. Loot and Pickup Style

## Red Box

The Red Box is a central symbol of Project Redbox.

Required traits:

- Bright saturated red
- Simple box or container silhouette
- Thick mechanical framing
- Visible central glow
- Readable at 32–44 pixels
- Slight hover or pulse
- Optional vertical loot beam

The Red Box should not look like:

- A realistic shipping crate
- A treasure chest
- A modern UI icon
- A highly detailed mobile-game reward box

It should feel like a mysterious piece of alien technology.

## Common Pickups

Common pickups should use:

- Simple shapes
- Low detail
- Small glow
- Clear category colors
- Less visual intensity than the Red Box

---

# 13. Core Art Direction

The Core is an evolving autonomous support module equipped by the Hunter. It supports the Hunter without becoming the protagonist, a mascot, or a class identity.

Its visual target is:

- Small
- Strictly top-down
- Mechanical and strange
- Chunky and readable at 20–28 pixels
- Built from the same technology as the Hunter's equipment
- Loaded-era PSOne aggression with Phantasy Star Online-era sci-fi clarity

## Core Silhouette Rule

The Core must be designed from its silhouette outward. Before color, lighting, surface detail, or animation:

1. Produce 10–20 black silhouette thumbnails.
2. Review them at approximate gameplay size.
3. Reject designs that read as a generic orb, drone, pet, or pickup.
4. Select one silhouette with a memorable directional profile.
5. Build the sprite from that approved shape.

Do not create a finished Core sprite before the silhouette is approved.

Strong silhouette ingredients may include:

- An asymmetric central chassis
- Two or three large stabilizer fins, clamps, blades, or antenna forms
- A clear front and rear when viewed directly from above
- One deliberate negative-space cutout
- A compact shape that can evolve by opening, extending, or adding one major element

The Dormant Core should look mechanically contained. The Awakened evolution should preserve the same recognizable outline while changing one major silhouette feature.

Avoid:

- Generic floating spheres or polished mechanical orbs
- Symmetrical mobile-game drones
- Mascot faces or cute pet proportions
- Tiny armor panels, vents, wires, and surface noise
- Painterly lighting used to rescue a weak shape
- Wings that make it read as fantasy equipment
- Silhouettes resembling Red Boxes, loot capsules, or enemy cores

## Core Approval Gate

Core art follows three explicit approvals:

1. Black silhouette sheet
2. Selected silhouette at 20–28 pixel gameplay scale
3. Finished Dormant sprite and restrained Awakened variation

Stop at each gate for visual-direction approval. Do not generate an entire evolution set in one pass.

---

# 14. Environment and Biome Direction

The first biome should feel like an abandoned industrial colony consumed by alien machinery.

Possible environmental components:

- Broken metal walkways
- Collapsed machinery
- Reactor pits
- Crashed transport vessels
- Thick cables
- Damaged terminals
- Contaminated soil
- Excavation equipment
- Mechanical growths
- Warning lights
- Fogged industrial flooring

The environment should use muted colors so:

- Hunter
- Enemies
- Projectiles
- Loot

remain readable.

Do not fill every floor tile with visual detail.

---

# 15. UI Direction

The interface should feel like an old sci-fi operating system.

Use:

- Rectangular panels
- Cut corners
- Thick borders
- Small technical labels
- Dark translucent backgrounds
- Red, cyan, and off-white highlights
- Simple diagrams
- CRT-inspired spacing
- Minimal animation

Avoid:

- Rounded mobile-app cards
- Glossy buttons
- Soft gradients
- Fantasy frames
- Overly clean modern dashboards

UI text should remain readable at the itch.io embed size.

---

# 16. Detail Budget

Every sprite must pass this test:

> Can the important parts still be identified when viewed at actual gameplay size?

Detail priority:

1. Silhouette
2. Direction
3. Gameplay category
4. Weapon or attack type
5. Accent lighting
6. Material
7. Surface detail

Surface decoration is always last.

---

# 17. AI Asset Rules

AI-generated art may be used during pre-alpha as temporary production art.

Every AI-generated asset must:

- Be labeled temporary
- Be stored separately from approved final art
- Avoid requesting the style of a living artist
- Avoid recreating a specific copyrighted character
- Follow this Art Bible
- Be tested at actual gameplay scale
- Be replaceable without rewriting gameplay systems

