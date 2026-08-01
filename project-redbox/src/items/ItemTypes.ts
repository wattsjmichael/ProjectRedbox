import type {
  WeaponType,
} from '../weapons/WeaponTypes'

export type ItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'

export type WeaponPrefix =
  | 'heavy'
  | 'rapid'
  | 'deadeye'
  | 'brutal'
  | 'marksman'
  | 'longshot'
  | 'wideBore'
  | 'crowdbreaker'
  | 'reinforcedStock'
  | 'siege'
  | 'impact'
  | 'overcharged'
  | 'focused'
  | 'conductive'
  | 'executioner'

export type WeaponSuffix =
  | 'precision'
  | 'alignment'
  | 'fury'
  | 'breach'
  | 'impact'
  | 'ruin'
  | 'conductivity'
  | 'resonance'
  | 'blood'
  | 'mastery'

export type WeaponAffix =
  WeaponPrefix

export interface WeaponModifiers {
  additionalPierce?: number
  projectileRangeMultiplier?: number
  additionalPellets?: number
  finisherSpreadMultiplier?: number
  recoilMultiplier?: number
  explosionRadiusMultiplier?: number
  knockbackMultiplier?: number
  additionalChains?: number
  chainRangeMultiplier?: number
  sweetSpotMultiplier?: number
}

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

  prefix?:
    WeaponPrefix

  suffix?:
    WeaponSuffix

  modifiers?:
    WeaponModifiers
}
