import type { WeaponItem } from '../items/ItemTypes'
import type {
  CoreData,
} from '../core/CoreTypes'
import {
  CoreStage,
  createStarterCore,
} from '../core/CoreTypes'
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
  core: CoreData
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
  version: 4
}

interface LegacyVersionThreeSave
  extends Omit<
    PersistentGameData,
    'core'
  > {
  mag: Omit<CoreData, 'stage'>
  version: 3
}

interface LegacyVersionTwoSave
  extends Omit<
    PersistentGameData,
    'tutorial' | 'core'
  > {
  mag: Omit<CoreData, 'stage'>
  version: 2
}

interface LegacyVersionOneSave
  extends Omit<
    PersistentGameData,
    'account' | 'tutorial' | 'core'
  > {
  mag: Omit<CoreData, 'stage'>
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
        return this.persistMigration({
          inventory:
            parsed.inventory,
          equippedWeapon:
            parsed.equippedWeapon,
          core:
            this.migrateLegacyCore(
              parsed.mag
            ),
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
        return this.persistMigration({
          inventory:
            parsed.inventory,
          equippedWeapon:
            parsed.equippedWeapon,
          core:
            this.migrateLegacyCore(
              parsed.mag
            ),
          player:
            parsed.player,
          account:
            parsed.account,
          tutorial:
            createDefaultTutorialState(),
        })
      }

      if (
        this.isLegacyVersionThreeSave(
          parsed
        )
      ) {
        return this.persistMigration({
          inventory:
            parsed.inventory,
          equippedWeapon:
            parsed.equippedWeapon,
          core:
            this.migrateLegacyCore(
              parsed.mag
            ),
          player:
            parsed.player,
          account:
            parsed.account,
          tutorial:
            parsed.tutorial,
        })
      }

      if (
        this.isRecord(parsed) &&
        parsed.version === 4 &&
        this.hasValidCurrentData(
          parsed
        ) &&
        !this.isCore(
          parsed.core
        ) &&
        this.isLegacyCore(
          parsed.core
        )
      ) {
        return this.persistMigration({
          inventory:
            parsed.inventory as
              WeaponItem[],
          equippedWeapon:
            parsed.equippedWeapon as
              WeaponItem | null,
          core:
            this.migrateLegacyCore(
              parsed.core
            ),
          player:
            parsed.player as
              PersistentPlayerProgression,
          account:
            parsed.account as
              AccountProgression,
          tutorial:
            parsed.tutorial as
              TutorialSaveState,
        })
      }

      if (!this.isSaveFile(parsed)) {
        console.warn(
          'Invalid Project Redbox save; using fresh data.'
        )
        return null
      }

      return this.removeTestWeapons(
        parsed
      )
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
      version: 4,
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
    const inventory:
      WeaponItem[] = []
    const player =
      createDefaultPlayerStats()

    return {
      inventory,
      equippedWeapon:
        null,
      core:
        createStarterCore(),
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
      core: {
        ...data.core,
        stats: {
          ...data.core.stats,
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
      value.version !== 4 ||
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
      !this.isCore(value.core) ||
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

  private isLegacyVersionThreeSave(
    value: unknown
  ): value is LegacyVersionThreeSave {
    return (
      this.isRecord(value) &&
      value.version === 3 &&
      this.hasValidLegacyData(
        value
      ) &&
      this.isAccount(value.account) &&
      this.isTutorial(value.tutorial)
    )
  }

  private isLegacyVersionTwoSave(
    value: unknown
  ): value is LegacyVersionTwoSave {
    return (
      this.isRecord(value) &&
      value.version === 2 &&
      this.hasValidLegacyData(value) &&
      this.isAccount(value.account)
    )
  }

  private isLegacyVersionOneSave(
    value: unknown
  ): value is LegacyVersionOneSave {
    return (
      this.isRecord(value) &&
      value.version === 1 &&
      this.hasValidLegacyData(value)
    )
  }

  private removeTestWeapons(
    data:
      PersistentGameData
  ) {
    const testWeaponIds =
      new Set([
        'starter-rifle',
        'test-greatsword-1',
        'test-scattergun-1',
        'test-cannon-1',
        'test-rifle-1',
      ])
    const inventory =
      data.inventory.filter(
        item =>
          !testWeaponIds.has(
            item.id
          )
      )
    const equippedWeapon =
      data.equippedWeapon &&
      !testWeaponIds.has(
        data.equippedWeapon.id
      )
        ? data.equippedWeapon
        : null

    return this.clone({
      ...data,
      inventory,
      equippedWeapon,
    })
  }

  private hasValidLegacyData(
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
      !this.isLegacyCore(value.mag) ||
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

  private hasValidCurrentData(
    value:
      Record<string, unknown>
  ) {
    return (
      Array.isArray(
        value.inventory
      ) &&
      value.inventory.length <= 30 &&
      value.inventory.every(
        item =>
          this.isWeapon(
            item
          )
      ) &&
      (
        value.equippedWeapon ===
          null ||
        this.isWeapon(
          value.equippedWeapon
        )
      ) &&
      this.isLegacyCore(
        value.core
      ) &&
      this.isPlayer(
        value.player
      ) &&
      this.isAccount(
        value.account
      ) &&
      this.isTutorial(
        value.tutorial
      ) &&
      (
        value.equippedWeapon ===
          null ||
        value.inventory.some(
          item =>
            this.isWeapon(item) &&
            item.id ===
              (
                value.equippedWeapon as
                  WeaponItem
              ).id
        )
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

  private isCore(
    value: unknown
  ): value is CoreData {
    return (
      this.isLegacyCore(value) &&
      [
        CoreStage.Dormant,
        CoreStage.Awakened,
      ].includes(
        (
          value as
            Record<
              string,
              unknown
            >
        ).stage as
          CoreData['stage']
      )
    )
  }

  private isLegacyCore(
    value: unknown
  ): value is Omit<
    CoreData,
    'stage'
  > {
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

  private migrateLegacyCore(
    legacy:
      Omit<CoreData, 'stage'>
  ): CoreData {
    // Legacy v0.11.4 save migration only.
    return {
      ...legacy,
      id:
        legacy.id ===
          'starter-mag'
          ? 'starter-core'
          : legacy.id,
      stage:
        legacy.level >= 10
          ? CoreStage.Awakened
          : CoreStage.Dormant,
    }
  }

  private persistMigration(
    data:
      PersistentGameData
  ) {
    const migrated =
      this.removeTestWeapons(
        data
      )

    // The legacy record is only superseded
    // after the current schema writes safely.
    this.save(
      migrated
    )

    return migrated
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
