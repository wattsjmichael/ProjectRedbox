import type {
  WeaponItem,
} from '../items/ItemTypes'

import type {
  MagData,
} from './MagTypes'

import {
  createStarterMag,
} from './MagTypes'

export interface MagFeedResult {
  experienceGained:
    number

  statName:
    'power'
    | 'defense'
    | 'dexterity'
    | 'energy'

  statGained:
    number

  leveledUp:
    boolean

  newLevel:
    number
}

export class MagSystem {
  private mag:
    MagData

  constructor(
    mag?:
      MagData
  ) {
    this.mag =
      mag ??
      createStarterMag()
  }

  getMag() {
    return this.mag
  }

  getLevel() {
    return this.mag.level
  }

  getExperience() {
    return this.mag.experience
  }

  getPower() {
    return this.mag.stats.power
  }

  getDefense() {
    return this.mag.stats.defense
  }

  getDexterity() {
    return this.mag.stats.dexterity
  }

  getEnergy() {
    return this.mag.stats.energy
  }

  getAttackMultiplier() {
    return (
      1 +
      this.mag.stats.power *
        0.02
    )
  }

  getDefenseReduction() {
    return Math.min(
      0.5,
      this.mag.stats.defense *
        0.01
    )
  }

  getCriticalChanceBonus() {
    return (
      this.mag.stats.dexterity *
      0.005
    )
  }

  getEnergyMultiplier() {
    return (
      1 +
      this.mag.stats.energy *
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

  feedWeapon(
    item:
      WeaponItem
  ): MagFeedResult {
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

    this.mag.stats[
      statName
    ] +=
      statGained

    this.mag.experience +=
      experienceGained

    const oldLevel =
      this.mag.level

    this.checkLevelUp()

    return {
      experienceGained,

      statName,

      statGained,

      leveledUp:
        this.mag.level >
        oldLevel,

      newLevel:
        this.mag.level,
    }
  }

  getExperienceNeeded() {
    return (
      100 +
      (
        this.mag.level -
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

  private checkLevelUp() {
    let experienceNeeded =
      this.getExperienceNeeded()

    while (
      this.mag.experience >=
      experienceNeeded
    ) {
      this.mag.experience -=
        experienceNeeded

      this.mag.level++

      experienceNeeded =
        this.getExperienceNeeded()
    }
  }
}