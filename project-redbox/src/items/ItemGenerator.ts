import type {
  WeaponType,
} from '../weapons/WeaponTypes'

import type {
  ItemRarity,
  WeaponAffix,
  WeaponItem,
} from './ItemTypes'

export class ItemGenerator {
  static generateWeapon(
    weaponType: WeaponType,
    forcedRarity?: ItemRarity
  ): WeaponItem {
    const rarity =
      forcedRarity ??
      this.rollRarity()

    const multiplier =
      this.getRarityMultiplier(
        rarity
      )

    const baseStats =
      this.getBaseStats(
        weaponType
      )

    const item: WeaponItem = {
      id:
        this.generateId(),

      category:
        'weapon',

      weaponType,

      rarity,

      name:
        this.generateWeaponName(
          weaponType,
          rarity
        ),

      attack:
        Math.round(
          this.randomize(
            baseStats.attack
          ) *
            multiplier
        ),

      speed:
        Number(
          (
            this.randomize(
              baseStats.speed,
              0.1
            ) *
            multiplier
          ).toFixed(
            2
          )
        ),

      criticalChance:
        Number(
          Math.min(
            0.5,
            this.randomize(
              baseStats.criticalChance,
              0.25
            ) *
              multiplier
          ).toFixed(
            3
          )
        ),

      criticalDamage:
        Number(
          (
            this.randomize(
              baseStats.criticalDamage,
              0.15
            ) *
            multiplier
          ).toFixed(
            2
          )
        ),
    }

    if (
      rarity ===
      'rare'
    ) {
      this.applyRareAffix(
        item
      )
    }

    return item
  }

  static generateRareWeapon(
    weaponType: WeaponType
  ) {
    return this.generateWeapon(
      weaponType,
      'rare'
    )
  }

  private static rollRarity():
    ItemRarity {
    const roll =
      Math.random()

    if (
      roll <
      0.05
    ) {
      return 'rare'
    }

    if (
      roll <
      0.30
    ) {
      return 'uncommon'
    }

    return 'common'
  }

  private static getRarityMultiplier(
    rarity: ItemRarity
  ) {
    switch (
      rarity
    ) {
      case 'common':
        return 1

      case 'uncommon':
        return 1.15

      case 'rare':
        return 1.35
    }
  }

  private static applyRareAffix(
    item: WeaponItem
  ) {
    const affixes:
      WeaponAffix[] = [
        'heavy',
        'rapid',
        'deadeye',
        'brutal',
      ]

    const affix =
      affixes[
        Math.floor(
          Math.random() *
          affixes.length
        )
      ]

    item.affix =
      affix

    switch (
      affix
    ) {
      case 'heavy':
        item.attack =
          Math.round(
            item.attack *
            1.3
          )

        item.speed =
          Number(
            Math.max(
              0.35,
              item.speed *
                0.82
            ).toFixed(
              2
            )
          )
        break

      case 'rapid':
        item.speed =
          Number(
            (
              item.speed *
              1.3
            ).toFixed(
              2
            )
          )

        item.attack =
          Math.max(
            1,
            Math.round(
              item.attack *
              0.82
            )
          )
        break

      case 'deadeye':
        item.criticalChance =
          Number(
            Math.min(
              0.65,
              item.criticalChance +
                0.12
            ).toFixed(
              3
            )
          )
        break

      case 'brutal':
        item.criticalDamage =
          Number(
            (
              item.criticalDamage +
              0.75
            ).toFixed(
              2
            )
          )
        break
    }

    item.name =
      `${this.getAffixName(affix)} ${this.getWeaponName(item.weaponType)}`
  }

  private static getAffixName(
    affix: WeaponAffix
  ) {
    switch (
      affix
    ) {
      case 'heavy':
        return 'Heavy'

      case 'rapid':
        return 'Rapid'

      case 'deadeye':
        return 'Deadeye'

      case 'brutal':
        return 'Brutal'
    }
  }

  private static getBaseStats(
    weaponType: WeaponType
  ) {
    switch (
      weaponType
    ) {
      case 'rifle':
        return {
          attack: 10,
          speed: 1.2,
          criticalChance: 0.08,
          criticalDamage: 1.5,
        }

      case 'scattergun':
        return {
          attack: 16,
          speed: 0.8,
          criticalChance: 0.06,
          criticalDamage: 1.6,
        }

      case 'cannon':
        return {
          attack: 25,
          speed: 0.55,
          criticalChance: 0.04,
          criticalDamage: 1.8,
        }

      case 'photonLance':
        return {
          attack: 30,
          speed: 0.9,
          criticalChance: 0.12,
          criticalDamage: 2,
        }

      case 'greatsword':
        return {
          attack: 22,
          speed: 0.7,
          criticalChance: 0.1,
          criticalDamage: 1.75,
        }
    }
  }

  private static randomize(
    value: number,
    variance = 0.2
  ) {
    const min =
      value *
      (1 - variance)

    const max =
      value *
      (1 + variance)

    return (
      min +
      Math.random() *
      (max - min)
    )
  }

  private static generateWeaponName(
    weaponType: WeaponType,
    rarity: ItemRarity
  ) {
    const rarityNames:
      Record<
        ItemRarity,
        string
      > = {
        common: 'Standard',
        uncommon: 'Enhanced',
        rare: 'Prototype',
      }

    return `${rarityNames[rarity]} ${this.getWeaponName(weaponType)}`
  }

  private static getWeaponName(
    weaponType: WeaponType
  ) {
    const weaponNames:
      Record<
        WeaponType,
        string
      > = {
        rifle: 'Rifle',
        scattergun: 'Scattergun',
        cannon: 'Cannon',
        photonLance: 'Photon Lance',
        greatsword: 'Greatsword',
      }

    return weaponNames[
      weaponType
    ]
  }

  private static generateId() {
    return `weapon-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`
  }
}