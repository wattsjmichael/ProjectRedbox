import type {
  WeaponItem,
} from '../items/ItemTypes'

import type {
  MagData,
} from '../mag/MagTypes'

import type {
  AccountProgression,
} from '../persistence/PersistenceSystem'

export interface DropScaling {
  dropNumber: number
  progressionScore: number
  enemyHealthMultiplier: number
  enemyDamageMultiplier: number
  wyrmHealthMultiplier: number
  wyrmDamageMultiplier: number
}

export class DropScalingSystem {
  static calculate(
    mag:
      MagData | null,
    equippedWeapon:
      WeaponItem | null,
    account:
      AccountProgression
  ):
    DropScaling {
    const magScore =
      Math.max(
        0,
        (
          mag?.level ??
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
          magScore +
          rarityScore +
          weaponScore +
          completedDropScore
        ).toFixed(
          2
        )
      )

    return {
      dropNumber:
        account.lifetimeStats.runs +
        1,
      progressionScore,
      enemyHealthMultiplier:
        this.toMultiplier(
          progressionScore,
          0.01,
          0.2
        ),
      enemyDamageMultiplier:
        this.toMultiplier(
          progressionScore,
          0.0075,
          0.15
        ),
      wyrmHealthMultiplier:
        this.toMultiplier(
          progressionScore,
          0.009,
          0.2
        ),
      wyrmDamageMultiplier:
        this.toMultiplier(
          progressionScore,
          0.007,
          0.15
        ),
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
}
