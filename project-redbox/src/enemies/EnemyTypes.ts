export const EnemyType = {
  Basic: 'basic',
  Fast: 'fast',
  Tank: 'tank',
  Elite: 'elite',
  Wyrm: 'wyrm',
} as const

export type EnemyType =
  typeof EnemyType[
    keyof typeof EnemyType
  ]

export type EnemyState =
  | 'spawn'
  | 'pursue'
  | 'telegraph'
  | 'attack'
  | 'recover'

export interface EnemyStats {
  health: number
  speed: number
  contactDamage: number
  size: number
  color: number
}

export interface EnemyBehaviorConfig {
  preferredRange: number
  acceleration: number
  turnResponsiveness: number
  attackRange: number
  attackWindup: number
  attackDuration: number
  recoveryDuration: number
  reengagementDelay: number
  strafeTendency: number
  separationRadius: number
  threatWeight: number
  spawnCost: number
  eliteCompatible: boolean
}

export const ENEMY_STATS:
  Record<EnemyType, EnemyStats> = {
    basic: {
      health: 3,
      speed: 80,
      contactDamage: 10,
      size: 24,
      color: 0xff4444,
    },
    fast: {
      health: 2,
      speed: 92,
      contactDamage: 8,
      size: 20,
      color: 0xff8844,
    },
    tank: {
      health: 14,
      speed: 42,
      contactDamage: 18,
      size: 42,
      color: 0x884433,
    },
    elite: {
      health: 10,
      speed: 105,
      contactDamage: 20,
      size: 36,
      color: 0xaa44ff,
    },
    wyrm: {
      health: 75,
      speed: 45,
      contactDamage: 30,
      size: 100,
      color: 0x881111,
    },
  }

export const ENEMY_BEHAVIORS:
  Record<EnemyType, EnemyBehaviorConfig> = {
    basic: {
      preferredRange: 0,
      acceleration: 420,
      turnResponsiveness: 1,
      attackRange: 30,
      attackWindup: 180,
      attackDuration: 180,
      recoveryDuration: 420,
      reengagementDelay: 0,
      strafeTendency: 0,
      separationRadius: 30,
      threatWeight: 1,
      spawnCost: 1,
      eliteCompatible: true,
    },
    fast: {
      preferredRange: 145,
      acceleration: 620,
      turnResponsiveness: 0.12,
      attackRange: 165,
      attackWindup: 380,
      attackDuration: 380,
      recoveryDuration: 850,
      reengagementDelay: 300,
      strafeTendency: 0.9,
      separationRadius: 58,
      threatWeight: 2,
      spawnCost: 2,
      eliteCompatible: true,
    },
    tank: {
      preferredRange: 105,
      acceleration: 180,
      turnResponsiveness: 0.08,
      attackRange: 125,
      attackWindup: 900,
      attackDuration: 120,
      recoveryDuration: 1300,
      reengagementDelay: 300,
      strafeTendency: 0,
      separationRadius: 88,
      threatWeight: 3,
      spawnCost: 3,
      eliteCompatible: true,
    },
    elite: {
      preferredRange: 0,
      acceleration: 520,
      turnResponsiveness: 1,
      attackRange: 42,
      attackWindup: 140,
      attackDuration: 180,
      recoveryDuration: 300,
      reengagementDelay: 0,
      strafeTendency: 0.15,
      separationRadius: 46,
      threatWeight: 4,
      spawnCost: 4,
      eliteCompatible: false,
    },
    wyrm: {
      preferredRange: 0,
      acceleration: 120,
      turnResponsiveness: 1,
      attackRange: 100,
      attackWindup: 0,
      attackDuration: 0,
      recoveryDuration: 0,
      reengagementDelay: 0,
      strafeTendency: 0,
      separationRadius: 0,
      threatWeight: 8,
      spawnCost: 8,
      eliteCompatible: false,
    },
  }
