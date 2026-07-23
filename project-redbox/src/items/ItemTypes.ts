import type {
  WeaponType,
} from '../weapons/WeaponTypes'

export type ItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'

export type WeaponAffix =
  | 'heavy'
  | 'rapid'
  | 'deadeye'
  | 'brutal'

export interface BaseItem {
  id: string
  name: string
  rarity: ItemRarity
}

export interface WeaponItem
  extends BaseItem {
  category: 'weapon'

  weaponType:
    WeaponType

  attack:
    number

  speed:
    number

  criticalChance:
    number

  criticalDamage:
    number

  affix?:
    WeaponAffix
}