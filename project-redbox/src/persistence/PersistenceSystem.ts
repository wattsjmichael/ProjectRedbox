import type { WeaponItem } from '../items/ItemTypes'
import type { MagData } from '../mag/MagTypes'
import { createStarterMag } from '../mag/MagTypes'
import { createDefaultPlayerStats } from '../player/PlayerStats'

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
  tutorial: TutorialSaveState
}

export type TutorialStep =
  | 'welcome'
  | 'equip'
  | 'feed'
  | 'begin'

export interface TutorialSaveState {
  completed: boolean
  skipped: boolean
  currentStep?: TutorialStep
}

interface SaveFile extends PersistentGameData {
  version: 3
}

interface LegacyVersionTwoSave
  extends Omit<
    PersistentGameData,
    'tutorial'
  > {
  version: 2
}

interface LegacyVersionOneSave
  extends Omit<
    PersistentGameData,
    'account' | 'tutorial'
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

export function createDefaultTutorialState():
  TutorialSaveState {
  return {
    completed:
      false,
    skipped:
      false,
    currentStep:
      'welcome',
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

      if (
        this.isLegacyVersionOneSave(
          parsed
        )
      ) {
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
          tutorial:
            createDefaultTutorialState(),
        })
      }

      if (
        this.isLegacyVersionTwoSave(
          parsed
        )
      ) {
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
            parsed.account,
          tutorial:
            createDefaultTutorialState(),
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
      version: 3,
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

  createFreshSave():
    PersistentGameData {
    const starterRifle:
      WeaponItem = {
      id:
        'starter-rifle',
      category:
        'weapon',
      weaponType:
        'rifle',
      rarity:
        'common',
      name:
        'Standard Rifle',
      attack:
        10,
      speed:
        1.2,
      criticalChance:
        0.08,
      criticalDamage:
        1.5,
    }

    const inventory:
      WeaponItem[] = [
      {
        id:
          'test-greatsword-1',
        category:
          'weapon',
        weaponType:
          'greatsword',
        rarity:
          'rare',
        name:
          'Prototype Greatsword',
        attack:
          28,
        speed:
          0.85,
        criticalChance:
          0.18,
        criticalDamage:
          2,
      },
      {
        id:
          'test-scattergun-1',
        category:
          'weapon',
        weaponType:
          'scattergun',
        rarity:
          'uncommon',
        name:
          'Enhanced Scattergun',
        attack:
          16,
        speed:
          1.15,
        criticalChance:
          0.12,
        criticalDamage:
          1.6,
      },
      {
        id:
          'test-cannon-1',
        category:
          'weapon',
        weaponType:
          'cannon',
        rarity:
          'rare',
        name:
          'Prototype Cannon',
        attack:
          25,
        speed:
          0.75,
        criticalChance:
          0.08,
        criticalDamage:
          2.25,
      },
      {
        id:
          'test-rifle-1',
        category:
          'weapon',
        weaponType:
          'rifle',
        rarity:
          'uncommon',
        name:
          'Enhanced Rifle',
        attack:
          15,
        speed:
          1.4,
        criticalChance:
          0.2,
        criticalDamage:
          1.75,
      },
      starterRifle,
    ]
    const player =
      createDefaultPlayerStats()

    return {
      inventory,
      equippedWeapon:
        starterRifle,
      mag:
        createStarterMag(),
      player: {
        level:
          player.level,
        currentXP:
          player.currentXP,
        xpToNextLevel:
          player.xpToNextLevel,
        maxHealth:
          player.maxHealth,
        power:
          player.power,
        defense:
          player.defense,
        speed:
          player.speed,
      },
      account:
        createDefaultAccount(),
      tutorial:
        createDefaultTutorialState(),
    }
  }

  reset() {
    try {
      window.localStorage.removeItem(
        PersistenceSystem.storageKey
      )

      return true
    } catch (error) {
      console.warn(
        'Could not reset Project Redbox save.',
        error
      )

      return false
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
      tutorial: {
        ...data.tutorial,
      },
    }
  }

  private isSaveFile(
    value: unknown
  ): value is SaveFile {
    if (
      !this.isRecord(value) ||
      value.version !== 3 ||
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
      !this.isAccount(value.account) ||
      !this.isTutorial(value.tutorial)
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

  private isLegacyVersionTwoSave(
    value: unknown
  ): value is LegacyVersionTwoSave {
    return (
      this.isRecord(value) &&
      value.version === 2 &&
      this.hasValidCoreData(value) &&
      this.isAccount(value.account)
    )
  }

  private isLegacyVersionOneSave(
    value: unknown
  ): value is LegacyVersionOneSave {
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

  private isTutorial(
    value: unknown
  ): value is TutorialSaveState {
    return (
      this.isRecord(value) &&
      typeof value.completed ===
        'boolean' &&
      typeof value.skipped ===
        'boolean' &&
      (
        value.currentStep ===
          undefined ||
        [
          'welcome',
          'equip',
          'feed',
          'begin',
        ].includes(
          String(
            value.currentStep
          )
        )
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
