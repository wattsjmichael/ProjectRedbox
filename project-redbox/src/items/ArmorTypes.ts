import type {
  ArmorAffix,
  ArmorAffixType,
  ArmorItem,
  ArmorModifiers,
  ArmorSecondaryStats,
} from './ItemTypes'

export interface ArmorAffixDefinition {
  type: ArmorAffixType
  displayName: string
  description: string
  modifiers: Partial<ArmorModifiers>
}

export const ARMOR_AFFIX_DEFINITIONS:
  Readonly<Record<ArmorAffixType, ArmorAffixDefinition>> = {
    reinforced: {
      type: 'reinforced',
      displayName: 'Reinforced',
      description: '+2 Defense',
      modifiers: { defense: 2 },
    },
    vital: {
      type: 'vital',
      displayName: 'Vital',
      description: '+2 Maximum Health',
      modifiers: { maxHealth: 2 },
    },
    mobile: {
      type: 'mobile',
      displayName: 'Mobile',
      description: '+5% Movement Speed',
      modifiers: { moveSpeedPercent: 0.05 },
    },
    salvager: {
      type: 'salvager',
      displayName: 'Salvager',
      description: '+10% Pickup Radius',
      modifiers: { pickupRadiusPercent: 0.1 },
    },
    integrated: {
      type: 'integrated',
      displayName: 'Integrated',
      description: '+10% Core Feed Progress',
      modifiers: { coreFeedBonusPercent: 0.1 },
    },
  }

const EMPTY_SECONDARY_STATS: ArmorSecondaryStats = {
  maxHealth: 0,
  moveSpeedPercent: 0,
  pickupRadiusPercent: 0,
  coreFeedBonusPercent: 0,
}

export function createArmorAffix(type: ArmorAffixType): ArmorAffix {
  const definition = ARMOR_AFFIX_DEFINITIONS[type]
  return {
    id: `armor-${type}`,
    type,
    displayName: definition.displayName,
    description: definition.description,
    modifiers: { ...definition.modifiers },
  }
}

export const createDefaultArmor = (): ArmorItem => ({
  id: 'starter-worn-hunter-suit',
  category: 'armor',
  armorType: 'suit',
  name: 'Worn Hunter Suit',
  rarity: 'common',
  defense: 5,
  secondaryStats: { ...EMPTY_SECONDARY_STATS },
  affixes: [],
  appearanceId: 'hunter_armor_starter',
})

export function getArmorModifiers(armor: ArmorItem): ArmorModifiers {
  const totals: ArmorModifiers = {
    defense: armor.defense,
    maxHealth: armor.secondaryStats.maxHealth,
    moveSpeedPercent: armor.secondaryStats.moveSpeedPercent,
    pickupRadiusPercent: armor.secondaryStats.pickupRadiusPercent,
    coreFeedBonusPercent: armor.secondaryStats.coreFeedBonusPercent,
  }

  for (const affix of armor.affixes) {
    totals.defense += affix.modifiers.defense ?? 0
    totals.maxHealth += affix.modifiers.maxHealth ?? 0
    totals.moveSpeedPercent += affix.modifiers.moveSpeedPercent ?? 0
    totals.pickupRadiusPercent += affix.modifiers.pickupRadiusPercent ?? 0
    totals.coreFeedBonusPercent += affix.modifiers.coreFeedBonusPercent ?? 0
  }

  return totals
}

export function createDevelopmentArmorItems(): ArmorItem[] {
  return [
    {
      id: 'dev-reinforced-wastes-rig',
      category: 'armor',
      armorType: 'suit',
      name: 'Reinforced Wastes Rig',
      rarity: 'uncommon',
      defense: 7,
      secondaryStats: { ...EMPTY_SECONDARY_STATS, maxHealth: 2 },
      affixes: [createArmorAffix('reinforced')],
      appearanceId: 'hunter_armor_wastes',
    },
    {
      id: 'dev-mobile-assault-suit',
      category: 'armor',
      armorType: 'suit',
      name: 'Mobile Assault Suit',
      rarity: 'rare',
      defense: 11,
      secondaryStats: { ...EMPTY_SECONDARY_STATS },
      affixes: [createArmorAffix('mobile'), createArmorAffix('salvager')],
      appearanceId: 'hunter_armor_assault',
    },
  ]
}
