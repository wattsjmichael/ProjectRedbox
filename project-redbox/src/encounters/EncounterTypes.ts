import type {
  EnemyType,
} from '../enemies/EnemyTypes'

export interface EncounterZone {
  x: number
  y: number
  radius: number
  enemyCount: number
  triggered: boolean
}

export interface EncounterSpawn {
  type: EnemyType
  angleOffset?: number
}

export interface EncounterComposition {
  name: string
  minimumZone: number
  maximumZone?: number
  weight: number
  spawns: EncounterSpawn[]
}
