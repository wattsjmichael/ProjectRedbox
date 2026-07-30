import type Phaser from 'phaser'

let missingArtWarningShown =
  false

export const GAMEPLAY_TEXTURES = {
  hunterProof: {
    key:
      'hunter-temp-v3',
    path:
      'assets/sprites/temp-ai/hunter/hunter_temp_v3_gameplay.png',
  },
  enemyBasicProof: {
    key:
      'enemy-basic-temp-v3',
    path:
      'assets/sprites/temp-ai/enemies/enemy_basic_temp_v3_gameplay.png',
  },
  enemyElite: {
    key:
      'enemy-elite-temp-v1',
    path:
      'assets/sprites/temp-ai/enemies/enemy_elite_temp_v1_gameplay.png',
  },
  wyrm: {
    key:
      'wyrm-temp-v1',
    path:
      'assets/sprites/temp-ai/boss/wyrm_temp_v1_gameplay.png',
  },
  projectileRifle: {
    key:
      'projectile-rifle-temp-v1',
    path:
      'assets/sprites/temp-ai/projectiles/projectile_rifle_temp_v1_gameplay.png',
  },
  projectileScatter: {
    key:
      'projectile-scatter-temp-v1',
    path:
      'assets/sprites/temp-ai/projectiles/projectile_scatter_temp_v1_gameplay.png',
  },
  projectileCannon: {
    key:
      'projectile-cannon-temp-v1',
    path:
      'assets/sprites/temp-ai/projectiles/projectile_cannon_temp_v1_gameplay.png',
  },
  projectilePhoton: {
    key:
      'projectile-photon-temp-v1',
    path:
      'assets/sprites/temp-ai/projectiles/projectile_photon_temp_v1_gameplay.png',
  },
  lootWeapon: {
    key:
      'loot-weapon-temp-v1',
    path:
      'assets/sprites/temp-ai/loot/loot_weapon_temp_v1_gameplay.png',
  },
  redBox: {
    key:
      'red-box-temp-v1',
    path:
      'assets/sprites/temp-ai/loot/red_box_temp_v1_gameplay.png',
  },
  coreDormant: {
    key:
      'core-dormant-candidate-v1',
    path:
      'assets/sprites/temp-ai/core/core_dormant_candidate_v1.png',
  },
} as const

export const GAMEPLAY_DISPLAY = {
  hunter: {
    width:
      91,
    height:
      64,
    originX:
      0.31,
    originY:
      0.55,
    depth:
      20,
  },
  enemyStandard: {
    width:
      64,
    height:
      49,
    originX:
      0.5,
    originY:
      0.52,
    depth:
      10,
  },
  enemyElite: {
    width:
      82,
    height:
      60,
    originX:
      0.5,
    originY:
      0.52,
    depth:
      11,
  },
  enemyBoss: {
    width:
      180,
    height:
      93,
    originX:
      0.5,
    originY:
      0.5,
    depth:
      12,
  },
  projectileRifle: {
    width:
      18,
    height:
      8,
    depth:
      15,
  },
  projectilePhoton: {
    width:
      28,
    height:
      8,
    depth:
      15,
  },
  projectileScatter: {
    width:
      12,
    height:
      8,
    depth:
      15,
  },
  projectileCannon: {
    width:
      32,
    height:
      18,
    depth:
      15,
  },
  lootCommon: {
    width:
      32,
    height:
      22,
    depth:
      8,
  },
  lootRare: {
    width:
      44,
    height:
      44,
    depth:
      9,
  },
  coreFollower: {
    width:
      24,
    height:
      29,
    depth:
      19,
  },
  coreInterface: {
    width:
      42,
    height:
      50,
    depth:
      100,
  },
} as const

export function hasGameplayTexture(
  scene:
    Phaser.Scene,
  key:
    string
) {
  const available =
    scene.textures.exists(
      key
    )

  if (
    !available &&
    !missingArtWarningShown
  ) {
    missingArtWarningShown =
      true
    console.warn(
      `Project Redbox proof asset "${key}" is missing; using the geometry fallback.`
    )
  }

  return available
}
