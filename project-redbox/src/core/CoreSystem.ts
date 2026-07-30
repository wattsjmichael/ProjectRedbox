import type {
  WeaponItem,
} from '../items/ItemTypes'

import type {
  CoreData,
} from './CoreTypes'

import {
  CoreStage,
  createStarterCore,
} from './CoreTypes'

export interface CoreFeedPreview {
  experienceGained:
    number

  statName:
    CoreStatName

  statGained:
    number
}

export interface CoreFeedResult
  extends CoreFeedPreview {
  leveledUp:
    boolean

  newLevel:
    number

  previousLevel:
    number

  evolved:
    boolean

  stage:
    CoreStage
}

export type CoreStatName =
  | 'power'
  | 'defense'
  | 'dexterity'
  | 'energy'

export interface CoreEvolutionDefinition {
  stage:
    CoreStage
  displayName:
    string
  requiredLevel:
    number
  description:
    string
  bonus: {
    id:
      'none' |
      'salvageField'
    displayName:
      string
    description:
      string
    pickupRadiusMultiplier:
      number
  }
}

export const CORE_EVOLUTIONS:
  Record<
    CoreStage,
    CoreEvolutionDefinition
  > = {
    dormant: {
      stage:
        CoreStage.Dormant,
      displayName:
        'Dormant Core',
      requiredLevel:
        1,
      description:
        'An autonomous support module that develops as it processes salvaged equipment.',
      bonus: {
        id:
          'none',
        displayName:
          'None',
        description:
          'No evolution bonus active.',
        pickupRadiusMultiplier:
          1,
      },
    },
    awakened: {
      stage:
        CoreStage.Awakened,
      displayName:
        'Awakened Core',
      requiredLevel:
        10,
      description:
        'Its salvage-processing field has reached operational strength.',
      bonus: {
        id:
          'salvageField',
        displayName:
          'Salvage Field',
        description:
          '+15% pickup radius',
        pickupRadiusMultiplier:
          1.15,
      },
    },
  }

export class CoreSystem {
  private core:
    CoreData

  constructor(
    core?:
      CoreData
  ) {
    this.core =
      core ??
      createStarterCore()

    this.applyEligibleEvolution()
  }

  getCore() {
    return this.core
  }

  getLevel() {
    return this.core.level
  }

  getExperience() {
    return this.core.experience
  }

  getPower() {
    return this.core.stats.power
  }

  getDefense() {
    return this.core.stats.defense
  }

  getDexterity() {
    return this.core.stats.dexterity
  }

  getEnergy() {
    return this.core.stats.energy
  }

  getAttackMultiplier() {
    return (
      1 +
      this.core.stats.power *
        0.02
    )
  }

  getDefenseReduction() {
    return Math.min(
      0.5,
      this.core.stats.defense *
        0.01
    )
  }

  getCriticalChanceBonus() {
    return (
      this.core.stats.dexterity *
      0.005
    )
  }

  getEnergyMultiplier() {
    return (
      1 +
      this.core.stats.energy *
        0.02
    )
  }

  getWeaponDamageMultiplier(
    item:
      WeaponItem | null
  ) {
    let multiplier =
      this.getAttackMultiplier()

    if (
      item?.rarity ===
      'rare'
    ) {
      multiplier *=
        this.getEnergyMultiplier()
    }

    return multiplier
  }

  previewFeed(
    item:
      WeaponItem
  ): CoreFeedPreview {
    const experienceGained =
      this.getExperienceForItem(
        item
      )

    const statGained =
      this.getStatGrowthForItem(
        item
      )

    const statName =
      this.getStatForWeapon(
        item
      )

    return {
      experienceGained,
      statName,
      statGained,
    }
  }

  feedWeapon(
    item:
      WeaponItem
  ): CoreFeedResult {
    const preview =
      this.previewFeed(
        item
      )
    const oldStage =
      this.core.stage
    const oldLevel =
      this.core.level

    this.core.stats[
      preview.statName
    ] +=
      preview.statGained

    this.core.experience +=
      preview.experienceGained

    this.checkLevelUp()
    this.applyEligibleEvolution()

    return {
      ...preview,

      leveledUp:
        this.core.level >
        oldLevel,

      newLevel:
        this.core.level,

      previousLevel:
        oldLevel,

      evolved:
        oldStage !==
        this.core.stage,

      stage:
        this.core.stage,
    }
  }

  getExperienceNeeded() {
    return (
      100 +
      (
        this.core.level -
        1
      ) *
      25
    )
  }

  private getExperienceForItem(
    item:
      WeaponItem
  ) {
    switch (
      item.rarity
    ) {
      case 'common':
        return 10

      case 'uncommon':
        return 20

      case 'rare':
        return 40
    }
  }

  private getStatGrowthForItem(
    item:
      WeaponItem
  ) {
    switch (
      item.rarity
    ) {
      case 'common':
        return 1

      case 'uncommon':
        return 2

      case 'rare':
        return 4
    }
  }

  private getStatForWeapon(
    item:
      WeaponItem
  ):
    | 'power'
    | 'defense'
    | 'dexterity'
    | 'energy' {
    switch (
      item.weaponType
    ) {
      case 'rifle':
        return 'dexterity'

      case 'scattergun':
        return 'power'

      case 'cannon':
        return 'defense'

      case 'greatsword':
        return 'power'

      case 'photonLance':
        return 'energy'
    }
  }

  getStageDefinition() {
    return CORE_EVOLUTIONS[
      this.core.stage
    ]
  }

  getNextEvolution() {
    return this.core.stage ===
      CoreStage.Dormant
      ? CORE_EVOLUTIONS.awakened
      : null
  }

  getEvolutionProgress() {
    const next =
      this.getNextEvolution()

    if (!next) {
      return 1
    }

    return Math.min(
      1,
      this.core.level /
        next.requiredLevel
    )
  }

  getPickupRadiusMultiplier() {
    return this.getStageDefinition()
      .bonus
      .pickupRadiusMultiplier
  }

  /**
   * Development-only setup. The caller must
   * also guard this behind import.meta.env.DEV.
   */
  prepareEvolutionTest() {
    this.core.level =
      CORE_EVOLUTIONS.awakened
        .requiredLevel -
      1
    this.core.experience =
      Math.max(
        0,
        this.getExperienceNeeded() -
        10
      )
    this.core.stage =
      CoreStage.Dormant
  }

  private checkLevelUp() {
    let experienceNeeded =
      this.getExperienceNeeded()

    while (
      this.core.experience >=
      experienceNeeded
    ) {
      this.core.experience -=
        experienceNeeded

      this.core.level++

      experienceNeeded =
        this.getExperienceNeeded()
    }
  }

  private applyEligibleEvolution() {
    if (
      this.core.level >=
      CORE_EVOLUTIONS.awakened
        .requiredLevel
    ) {
      this.core.stage =
        CoreStage.Awakened
    }
  }
}
