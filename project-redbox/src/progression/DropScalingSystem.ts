import type {
  WeaponItem,
} from '../items/ItemTypes'

import type {
  CoreData,
} from '../core/CoreTypes'

import type {
  AccountProgression,
} from '../persistence/PersistenceSystem'

import {
  getDropTierDefinition,
} from './HunterProgressionConfig'

import type {
  DropTier,
} from './HunterProgressionConfig'

export interface DropScaling {
  dropNumber: number
  dropTier: DropTier
  progressionScore: number
  enemyHealthMultiplier: number
  enemyDamageMultiplier: number
  wyrmHealthMultiplier: number
  wyrmDamageMultiplier: number
  rareDropChanceMultiplier: number
}

export class DropScalingSystem {
  static calculate(
    core:
      CoreData | null,
    equippedWeapon:
      WeaponItem | null,
    account:
      AccountProgression,
    dropTier:
      DropTier = 1
  ):
    DropScaling {
    const coreScore =
      Math.max(
        0,
        (
          core?.level ??
          1
        ) - 1
      ) *
      1.5

    const rarityScore =
      this.getRarityScore(
        equippedWeapon
      )

    const weaponScore =
      equippedWeapon
        ? Math.min(
          3,
          Math.max(
            0,
            (
              equippedWeapon.attack -
              10
            ) /
            10
          )
        )
        : 0

    // Each defeated Wyrm currently
    // represents one completed drop.
    const completedDropScore =
      account.lifetimeStats
        .bossesDefeated *
      2

    const progressionScore =
      Number(
        (
          coreScore +
          rarityScore +
          weaponScore +
          completedDropScore
        ).toFixed(
          2
        )
      )

    const tier =
      getDropTierDefinition(
        dropTier
      )

    return {
      dropNumber:
        account.lifetimeStats.runs +
        1,
      dropTier,
      progressionScore,
      enemyHealthMultiplier:
        this.combineMultipliers(
          this.toMultiplier(progressionScore, 0.01, 0.2),
          tier.enemyHealthMultiplier
        ),
      enemyDamageMultiplier:
        this.combineMultipliers(
          this.toMultiplier(progressionScore, 0.0075, 0.15),
          tier.enemyDamageMultiplier
        ),
      wyrmHealthMultiplier:
        this.combineMultipliers(
          this.toMultiplier(progressionScore, 0.009, 0.2),
          tier.wyrmHealthMultiplier
        ),
      wyrmDamageMultiplier:
        this.combineMultipliers(
          this.toMultiplier(progressionScore, 0.007, 0.15),
          tier.wyrmDamageMultiplier
        ),
      rareDropChanceMultiplier:
        tier.rareDropChanceMultiplier,
    }
  }

  private static getRarityScore(
    weapon:
      WeaponItem | null
  ) {
    switch (weapon?.rarity) {
      case 'uncommon':
        return 1.5
      case 'rare':
        return 3
      case 'common':
      case undefined:
        return 0
    }
  }

  private static toMultiplier(
    score: number,
    rate: number,
    maximumIncrease: number
  ) {
    return Number(
      (
        1 +
        Math.min(
          maximumIncrease,
          score * rate
        )
      ).toFixed(
        3
      )
    )
  }

  private static combineMultipliers(
    first: number,
    second: number
  ) {
    return Number((first * second).toFixed(3))
  }
}
