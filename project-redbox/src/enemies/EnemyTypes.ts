export type EnemyType =
  | 'normal'
  | 'elite'
  | 'wyrm'

export interface EnemyStats {
  health: number
  speed: number
  contactDamage: number
  size: number
  color: number
}

export const ENEMY_STATS:
  Record<
    EnemyType,
    EnemyStats
  > = {
    normal: {
      health: 3,
      speed: 80,
      contactDamage: 10,
      size: 24,
      color: 0xff4444,
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