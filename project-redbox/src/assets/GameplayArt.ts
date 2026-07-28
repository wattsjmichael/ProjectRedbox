import type Phaser from 'phaser'

let missingArtWarningShown =
  false

export const GAMEPLAY_ATLAS = {
  key:
    'redbox-gameplay-atlas',
  path:
    'assets/sprites/redbox_sprite_atlas.png',
  frameWidth:
    362,
  frameHeight:
    362,
} as const

export const GAMEPLAY_FRAMES = {
  hunter:
    0,
  enemyBasic:
    1,
  enemyFast:
    2,
  enemyTank:
    3,
  enemyElite:
    4,
  wyrm:
    5,
  projectileRifle:
    6,
  projectileScattergun:
    7,
  projectileCannon:
    8,
  projectilePhoton:
    9,
  lootRare:
    10,
  lootCommon:
    11,
} as const

export const GAMEPLAY_DISPLAY = {
  hunter: {
    width:
      108,
    height:
      108,
    depth:
      20,
  },
  enemyStandard: {
    width:
      48,
    height:
      48,
    depth:
      10,
  },
  enemyElite: {
    width:
      66,
    height:
      66,
    depth:
      11,
  },
  enemyBoss: {
    width:
      150,
    height:
      150,
    depth:
      12,
  },
  projectileSmall: {
    width:
      22,
    height:
      10,
    depth:
      15,
  },
  projectileScatter: {
    width:
      14,
    height:
      8,
    depth:
      15,
  },
  projectileLarge: {
    width:
      30,
    height:
      24,
    depth:
      15,
  },
  lootCommon: {
    width:
      68,
    height:
      48,
    depth:
      8,
  },
  lootRare: {
    width:
      84,
    height:
      84,
    depth:
      9,
  },
} as const

export function hasGameplayArt(
  scene:
    Phaser.Scene
) {
  const available =
    scene.textures.exists(
      GAMEPLAY_ATLAS.key
    )

  if (
    !available &&
    !missingArtWarningShown
  ) {
    missingArtWarningShown =
      true
    console.warn(
      'Project Redbox gameplay atlas is missing; using geometry fallbacks.'
    )
  }

  return available
}
