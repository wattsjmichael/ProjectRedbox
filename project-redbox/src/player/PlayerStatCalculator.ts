import type {
  ArmorItem,
  ArmorModifiers,
} from '../items/ItemTypes'
import type {
  PersistentPlayerProgression,
} from '../persistence/PersistenceSystem'

import {
  getArmorModifiers,
} from '../items/ArmorTypes'
import {
  getHunterGrowthAtLevel,
} from '../progression/HunterProgressionConfig'

export interface CalculatedHunterStats {
  maxHealth: number
  power: number
  defense: number
  speed: number
  armor: ArmorModifiers
}

const EMPTY_ARMOR_MODIFIERS: ArmorModifiers = {
  defense: 0,
  maxHealth: 0,
  moveSpeedPercent: 0,
  pickupRadiusPercent: 0,
  coreFeedBonusPercent: 0,
}

export function calculateHunterStats(
  base: PersistentPlayerProgression,
  armor: ArmorItem | null
): CalculatedHunterStats {
  const levelGrowth = getHunterGrowthAtLevel(base.level)
  const armorModifiers = armor
    ? getArmorModifiers(armor)
    : { ...EMPTY_ARMOR_MODIFIERS }

  return {
    maxHealth:
      base.maxHealth +
      levelGrowth.maxHealth +
      armorModifiers.maxHealth,
    power:
      base.power +
      levelGrowth.baseAttack,
    defense:
      base.defense +
      levelGrowth.baseDefense +
      armorModifiers.defense,
    speed:
      base.speed *
      (1 + armorModifiers.moveSpeedPercent),
    armor: armorModifiers,
  }
}

export function calculateDamageReduction(
  totalDefense: number,
  coreDamageReduction: number
) {
  const defenseReduction =
    Math.max(0, totalDefense) /
    (Math.max(0, totalDefense) + 100)
  const boundedCoreReduction =
    Math.min(0.5, Math.max(0, coreDamageReduction))

  // Independent defenses combine multiplicatively so neither armor nor
  // Core Defense can grant immunity by itself.
  return Math.min(
    0.85,
    1 -
      (1 - defenseReduction) *
      (1 - boundedCoreReduction)
  )
}
