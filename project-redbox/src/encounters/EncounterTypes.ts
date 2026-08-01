import type Phaser from 'phaser'

import type {
  EnemyType,
} from '../enemies/EnemyTypes'

export type CombatZoneState =
  | 'inactive'
  | 'active'
  | 'cleared'

export type GateState =
  | 'locked'
  | 'unlocking'
  | 'open'

export interface EncounterZone {
  id: string
  name: string
  sequence: number
  bounds:
    Phaser.Geom.Rectangle
  activationBounds:
    Phaser.Geom.Rectangle
  spawnRegion:
    Phaser.Geom.Rectangle
  budget: number
  gateId: string
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

export interface WastesGateDefinition {
  id: string
  ownerZoneId:
    string |
    'approach'
  bounds:
    Phaser.Geom.Rectangle
  orientation:
    'horizontal' |
    'vertical'
}

export interface WastesObstacleDefinition {
  id: string
  bounds:
    Phaser.Geom.Rectangle
  color: number
}
