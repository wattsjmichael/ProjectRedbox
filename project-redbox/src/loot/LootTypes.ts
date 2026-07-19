import type Phaser from 'phaser'

import type {
  WeaponItem,
} from '../items/ItemTypes'

export type LootType =
  | 'weapon'
  | 'redbox'

export interface LootDrop {
  object:
    Phaser.GameObjects.Rectangle

  type:
    LootType

  item?:
    WeaponItem
}