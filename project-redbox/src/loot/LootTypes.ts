import type Phaser from 'phaser'
import type { WeaponType } from '../weapons/WeaponTypes'

export type LootType =
  | Exclude<WeaponType, 'photonLance'>
  | 'redbox'

export interface LootDrop {
  object: Phaser.GameObjects.Rectangle
  type: LootType
}