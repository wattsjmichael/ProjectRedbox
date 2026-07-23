import type { WeaponItem } from '../items/ItemTypes'
import type { MagData } from '../mag/MagTypes'

export interface PersistentPlayerProgression {
  level: number
  currentXP: number
  xpToNextLevel: number
  maxHealth: number
  power: number
  defense: number
  speed: number
}

export interface LifetimeStats {
  runs: number
  kills: number
  bossesDefeated: number
}

export interface AccountProgression {
  hunterName: string
  currency: number
  lifetimeStats: LifetimeStats
}

export interface PersistentGameData {
  inventory: WeaponItem[]
  equippedWeapon: WeaponItem | null
  mag: MagData
  player: PersistentPlayerProgression
  account: AccountProgression
}

interface SaveFile extends PersistentGameData {
  version: 2
}

interface LegacySaveFile
  extends Omit<
    PersistentGameData,
    'account'
  > {
  version: 1
}

export function createDefaultAccount():
  AccountProgression {
  return {
    hunterName:
      'RED HUNTER',
    currency:
      0,
    lifetimeStats: {
      runs:
        0,
      kills:
        0,
      bossesDefeated:
        0,
    },
  }
}

export class PersistenceSystem {
  private static readonly storageKey =
    'project-redbox-save'

  load(): PersistentGameData | null {
    try {
      const raw =
        window.localStorage.getItem(
          PersistenceSystem.storageKey
        )

      if (!raw) {
        return null
      }

      const parsed: unknown =
        JSON.parse(raw)

      if (this.isLegacySaveFile(parsed)) {
        return this.clone({
          inventory:
            parsed.inventory,
          equippedWeapon:
            parsed.equippedWeapon,
          mag:
            parsed.mag,
          player:
            parsed.player,
          account:
            createDefaultAccount(),
        })
      }

      if (!this.isSaveFile(parsed)) {
        console.warn(
          'Invalid Project Redbox save; using fresh data.'
        )
        return null
      }

      return this.clone(parsed)
    } catch (error) {
      console.warn(
        'Could not load Project Redbox save; using fresh data.',
        error
      )
      return null
    }
  }

  save(data: PersistentGameData) {
    const saveFile: SaveFile = {
      version: 2,
      ...this.clone(data),
    }

    try {
      window.localStorage.setItem(
        PersistenceSystem.storageKey,
        JSON.stringify(saveFile)
      )
    } catch (error) {
      console.warn(
        'Could not write Project Redbox save.',
        error
      )
    }
  }

  private clone(
    data: PersistentGameData
  ): PersistentGameData {
    return {
      inventory:
        data.inventory.map(
          item => ({ ...item })
        ),
      equippedWeapon:
        data.equippedWeapon
          ? { ...data.equippedWeapon }
          : null,
      mag: {
        ...data.mag,
        stats: {
          ...data.mag.stats,
        },
      },
      player: {
        ...data.player,
      },
      account: {
        ...data.account,
        lifetimeStats: {
          ...data.account.lifetimeStats,
        },
      },
    }
  }

  private isSaveFile(
    value: unknown
  ): value is SaveFile {
    if (
      !this.isRecord(value) ||
      value.version !== 2 ||
      !Array.isArray(value.inventory) ||
      value.inventory.length > 30 ||
      !value.inventory.every(
        item => this.isWeapon(item)
      ) ||
      (
        value.equippedWeapon !== null &&
        !this.isWeapon(
          value.equippedWeapon
        )
      ) ||
      !this.isMag(value.mag) ||
      !this.isPlayer(value.player) ||
      !this.isAccount(value.account)
    ) {
      return false
    }

    const equippedWeapon =
      value.equippedWeapon as
        WeaponItem | null

    return (
      equippedWeapon === null ||
      value.inventory.some(
        item =>
          item.id ===
          equippedWeapon.id
      )
    )
  }

  private isLegacySaveFile(
    value: unknown
  ): value is LegacySaveFile {
    return (
      this.isRecord(value) &&
      value.version === 1 &&
      this.hasValidCoreData(value)
    )
  }

  private hasValidCoreData(
    value: Record<string, unknown>
  ) {
    if (
      !Array.isArray(value.inventory) ||
      value.inventory.length > 30 ||
      !value.inventory.every(
        item => this.isWeapon(item)
      ) ||
      (
        value.equippedWeapon !== null &&
        !this.isWeapon(
          value.equippedWeapon
        )
      ) ||
      !this.isMag(value.mag) ||
      !this.isPlayer(value.player)
    ) {
      return false
    }

    const equippedWeapon =
      value.equippedWeapon as
        WeaponItem | null

    return (
      equippedWeapon === null ||
      value.inventory.some(
        item =>
          item.id ===
          equippedWeapon.id
      )
    )
  }

  private isWeapon(
    value: unknown
  ): value is WeaponItem {
    return (
      this.isRecord(value) &&
      value.category === 'weapon' &&
      typeof value.id === 'string' &&
      typeof value.name === 'string' &&
      ['common', 'uncommon', 'rare']
        .includes(String(value.rarity)) &&
      [
        'rifle',
        'scattergun',
        'cannon',
        'photonLance',
        'greatsword',
      ].includes(String(value.weaponType)) &&
      this.isNumber(value.attack) &&
      this.isNumber(value.speed) &&
      this.isNumber(value.criticalChance) &&
      this.isNumber(value.criticalDamage)
    )
  }

  private isMag(
    value: unknown
  ): value is MagData {
    return (
      this.isRecord(value) &&
      typeof value.id === 'string' &&
      typeof value.name === 'string' &&
      this.isInteger(value.level, 1) &&
      this.isInteger(value.experience, 0) &&
      this.isRecord(value.stats) &&
      this.isInteger(value.stats.power, 0) &&
      this.isInteger(value.stats.defense, 0) &&
      this.isInteger(value.stats.dexterity, 0) &&
      this.isInteger(value.stats.energy, 0)
    )
  }

  private isPlayer(
    value: unknown
  ): value is PersistentPlayerProgression {
    return (
      this.isRecord(value) &&
      this.isInteger(value.level, 1) &&
      this.isInteger(value.currentXP, 0) &&
      this.isInteger(value.xpToNextLevel, 1) &&
      this.isPositiveNumber(value.maxHealth) &&
      this.isNumber(value.power) &&
      this.isNumber(value.defense) &&
      this.isPositiveNumber(value.speed)
    )
  }

  private isAccount(
    value: unknown
  ): value is AccountProgression {
    return (
      this.isRecord(value) &&
      typeof value.hunterName === 'string' &&
      value.hunterName.length > 0 &&
      this.isInteger(value.currency, 0) &&
      this.isRecord(value.lifetimeStats) &&
      this.isInteger(
        value.lifetimeStats.runs,
        0
      ) &&
      this.isInteger(
        value.lifetimeStats.kills,
        0
      ) &&
      this.isInteger(
        value.lifetimeStats.bossesDefeated,
        0
      )
    )
  }

  private isRecord(
    value: unknown
  ): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null
    )
  }

  private isNumber(
    value: unknown
  ): value is number {
    return (
      typeof value === 'number' &&
      Number.isFinite(value)
    )
  }

  private isPositiveNumber(
    value: unknown
  ): value is number {
    return (
      this.isNumber(value) &&
      value > 0
    )
  }

  private isInteger(
    value: unknown,
    minimum: number
  ): value is number {
    return (
      this.isNumber(value) &&
      Number.isInteger(value) &&
      value >= minimum
    )
  }
}
