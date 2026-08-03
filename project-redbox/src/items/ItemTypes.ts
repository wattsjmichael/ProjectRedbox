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
  category: ItemCategory
  name: string
  rarity: ItemRarity
  acquiredAt?: number
}

export type ItemCategory =
  | 'weapon'
  | 'armor'

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

export type ArmorType = 'suit'

export interface ArmorSecondaryStats {
  maxHealth: number
  moveSpeedPercent: number
  pickupRadiusPercent: number
  coreFeedBonusPercent: number
}

export type ArmorAffixType =
  | 'reinforced'
  | 'vital'
  | 'mobile'
  | 'salvager'
  | 'integrated'

export interface ArmorModifiers {
  defense: number
  maxHealth: number
  moveSpeedPercent: number
  pickupRadiusPercent: number
  coreFeedBonusPercent: number
}

export interface ArmorAffix {
  id: string
  type: ArmorAffixType
  displayName: string
  description: string
  modifiers: Partial<ArmorModifiers>
}

export interface ArmorItem extends BaseItem {
  category: 'armor'
  armorType: ArmorType
  defense: number
  secondaryStats: ArmorSecondaryStats
  affixes: ArmorAffix[]
  appearanceId: string
}

export type InventoryItem =
  | WeaponItem
  | ArmorItem

export function isWeaponItem(item: InventoryItem): item is WeaponItem {
  return item.category === 'weapon'
}

export function isArmorItem(item: InventoryItem): item is ArmorItem {
  return item.category === 'armor'
}

export function cloneInventoryItem(item: WeaponItem): WeaponItem
export function cloneInventoryItem(item: ArmorItem): ArmorItem
export function cloneInventoryItem(item: InventoryItem): InventoryItem
export function cloneInventoryItem(item: InventoryItem): InventoryItem {
  if (isWeaponItem(item)) {
    return {
      ...item,
      modifiers: item.modifiers ? { ...item.modifiers } : undefined,
    }
  }

  return {
    ...item,
    secondaryStats: { ...item.secondaryStats },
    affixes: item.affixes.map(affix => ({
      ...affix,
      modifiers: { ...affix.modifiers },
    })),
  }
}
