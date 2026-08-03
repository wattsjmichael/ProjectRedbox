import type {
  ArmorItem,
  InventoryItem,
  WeaponItem,
} from '../items/ItemTypes'
import {
  cloneInventoryItem,
  isArmorItem,
  isWeaponItem,
} from '../items/ItemTypes'
import { createDefaultArmor } from '../items/ArmorTypes'
import type {
  CoreData,
} from '../core/CoreTypes'
import {
  CoreStage,
  createStarterCore,
} from '../core/CoreTypes'
import { createDefaultPlayerStats } from '../player/PlayerStats'
import {
  canEquipArmor,
} from '../progression/HunterProgressionConfig'
import type {
  DropTier,
} from '../progression/HunterProgressionConfig'

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
  selectedDropTier?: DropTier
  lifetimeStats: LifetimeStats
}

export interface PersistentGameData {
  inventory: InventoryItem[]
  equippedWeapon: WeaponItem | null
  equippedArmor: ArmorItem
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
  version: 5
}

export interface HunterProfileSummary {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  hunterLevel: number
  equippedWeaponName: string
  equippedArmorName: string
  coreLevel: number
  coreStage: CoreStage
  completedDrops: number
  unavailable?: boolean
}

export interface HunterProfile {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  saveData: PersistentGameData
}

interface StoredHunterProfile
  extends Omit<HunterProfile, 'saveData'> {
  version: 1
  saveData: SaveFile
}

interface ProfileIndex {
  version: 1
  profiles: HunterProfileSummary[]
}

interface LegacyVersionThreeSave
  extends Omit<
    PersistentGameData,
    'core' | 'equippedArmor'
  > {
  mag: Omit<CoreData, 'stage'>
  version: 3
}

interface LegacyVersionTwoSave
  extends Omit<
    PersistentGameData,
    'tutorial' | 'core' | 'equippedArmor'
  > {
  mag: Omit<CoreData, 'stage'>
  version: 2
}

interface LegacyVersionOneSave
  extends Omit<
    PersistentGameData,
    'account' | 'tutorial' | 'core' | 'equippedArmor'
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
    selectedDropTier:
      1,
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
  private static readonly legacyStorageKey =
    'project-redbox-save'

  private static readonly profileIndexKey =
    'project-redbox.profiles'

  private static readonly profileKeyPrefix =
    'project-redbox.profile.'

  private static readonly activeProfileKey =
    'project-redbox.activeProfileId'

  private static readonly legacyMigrationKey =
    'project-redbox.legacyMigrated'

  load(): PersistentGameData | null {
    const activeId = this.getActiveProfileId()
    return activeId
      ? this.loadProfile(activeId)?.saveData ?? null
      : null
  }

  save(data: PersistentGameData) {
    const activeId = this.getActiveProfileId()

    if (!activeId) {
      console.warn('Could not save Hunter: no active profile.')
      return false
    }

    const profile = this.loadProfile(activeId)
    if (!profile) {
      console.warn(`Could not save Hunter: profile ${activeId} is unavailable.`)
      return false
    }

    return this.writeProfile({
      ...profile,
      updatedAt: Date.now(),
      saveData: {
        ...this.clone(data),
        account: {
          ...data.account,
          hunterName: profile.name,
          lifetimeStats: {
            ...data.account.lifetimeStats,
          },
        },
      },
    })
  }

  createFreshSave(
    hunterName = 'HUNTER'
  ):
    PersistentGameData {
    const starterArmor =
      createDefaultArmor()
    const inventory:
      InventoryItem[] = [
        starterArmor,
      ]
    const player =
      createDefaultPlayerStats()

    return {
      inventory,
      equippedWeapon:
        null,
      equippedArmor:
        starterArmor,
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
      account: {
        ...createDefaultAccount(),
        hunterName,
      },
      tutorial:
        createDefaultTutorialState(),
    }
  }

  reset() {
    const activeId = this.getActiveProfileId()
    return activeId
      ? this.resetProfile(activeId)
      : false
  }

  initializeProfiles() {
    const profiles = this.listProfiles()

    try {
      if (
        window.localStorage.getItem(
          PersistenceSystem.legacyMigrationKey
        ) === 'complete'
      ) {
        return profiles
      }

      const legacyRaw = window.localStorage.getItem(
        PersistenceSystem.legacyStorageKey
      )

      if (!legacyRaw) {
        window.localStorage.setItem(
          PersistenceSystem.legacyMigrationKey,
          'complete'
        )
        return profiles
      }

      const legacy = this.parseRawSave(legacyRaw)
      if (!legacy) {
        console.warn('Legacy save could not be migrated; recovery copy was preserved.')
        return profiles
      }

      const preferredName = legacy.account.hunterName.trim()
      const name =
        preferredName && preferredName !== 'RED HUNTER'
          ? this.normalizeHunterName(preferredName.slice(0, 16)) ?? 'Legacy Hunter'
          : 'Legacy Hunter'
      const created = this.createProfile(name, legacy)

      if (!created || !this.loadProfile(created.id)) {
        console.warn('Legacy profile write could not be verified; migration will retry later.')
        return this.listProfiles()
      }

      window.localStorage.setItem(
        PersistenceSystem.legacyMigrationKey,
        'complete'
      )
      return this.listProfiles()
    } catch (error) {
      console.warn('Hunter profile migration could not access local storage.', error)
      return profiles
    }
  }

  listProfiles(): HunterProfileSummary[] {
    const index = this.readProfileIndex()
    const summaries = index.profiles.map(summary => {
      const stored = this.loadStoredProfile(summary.id)
      if (!stored) return { ...summary, unavailable: true }
      return this.buildSummary({
        id: stored.id,
        name: stored.name,
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
        saveData: stored.saveData,
      })
    })

    this.writeProfileIndex({ version: 1, profiles: summaries })
    return summaries
  }

  createProfile(
    rawName: string,
    initialData?: PersistentGameData
  ): HunterProfileSummary | null {
    const name = this.normalizeHunterName(rawName)
    if (!name) return null

    const now = Date.now()
    const id = this.generateProfileId()
    const source = initialData ?? this.createFreshSave(name)
    const saveData = this.clone({
      ...source,
      account: {
        ...source.account,
        hunterName: name,
        lifetimeStats: {
          ...source.account.lifetimeStats,
        },
      },
    })
    const profile: HunterProfile = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
      saveData,
    }

    if (!this.writeProfile(profile)) return null
    this.setActiveProfile(id)
    return this.buildSummary(profile)
  }

  loadProfile(id: string): HunterProfile | null {
    const stored = this.loadStoredProfile(id)
    if (!stored) return null

    return {
      id: stored.id,
      name: stored.name,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
      saveData: this.clone(stored.saveData),
    }
  }

  setActiveProfile(id: string) {
    if (!this.loadStoredProfile(id)) return false

    try {
      window.localStorage.setItem(
        PersistenceSystem.activeProfileKey,
        id
      )
      return true
    } catch (error) {
      console.warn('Could not select Hunter profile.', error)
      return false
    }
  }

  getActiveProfileId() {
    try {
      return window.localStorage.getItem(
        PersistenceSystem.activeProfileKey
      )
    } catch (error) {
      console.warn('Could not read the active Hunter profile.', error)
      return null
    }
  }

  deleteProfile(id: string) {
    try {
      window.localStorage.removeItem(this.getProfileKey(id))
      const index = this.readProfileIndex()
      index.profiles = index.profiles.filter(profile => profile.id !== id)
      if (!this.writeProfileIndex(index)) return false

      if (this.getActiveProfileId() === id) {
        window.localStorage.removeItem(PersistenceSystem.activeProfileKey)
      }
      return true
    } catch (error) {
      console.warn(`Could not delete Hunter profile ${id}.`, error)
      return false
    }
  }

  resetProfile(id: string) {
    const profile = this.loadProfile(id)
    if (!profile) return false

    return this.writeProfile({
      ...profile,
      updatedAt: Date.now(),
      saveData: this.createFreshSave(profile.name),
    })
  }

  normalizeHunterName(rawName: string) {
    const name = rawName.trim()
    return (
      name.length >= 1 &&
      name.length <= 16 &&
      /^[A-Za-z0-9 '\-]+$/.test(name)
    )
      ? name
      : null
  }

  private writeProfile(profile: HunterProfile) {
    const saveFile: SaveFile = {
      version: 5,
      ...this.clone(profile.saveData),
    }
    const stored: StoredHunterProfile = {
      version: 1,
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      saveData: saveFile,
    }

    try {
      window.localStorage.setItem(
        this.getProfileKey(profile.id),
        JSON.stringify(stored)
      )
      const index = this.readProfileIndex()
      const summary = this.buildSummary(profile)
      const existing = index.profiles.findIndex(entry => entry.id === profile.id)
      if (existing >= 0) index.profiles[existing] = summary
      else index.profiles.push(summary)
      return this.writeProfileIndex(index)
    } catch (error) {
      console.warn(`Could not write Hunter profile ${profile.id}.`, error)
      return false
    }
  }

  private loadStoredProfile(id: string): StoredHunterProfile | null {
    try {
      const raw = window.localStorage.getItem(this.getProfileKey(id))
      if (!raw) return null
      const value: unknown = JSON.parse(raw)

      if (
        !this.isRecord(value) ||
        value.version !== 1 ||
        value.id !== id ||
        typeof value.name !== 'string' ||
        !this.normalizeHunterName(value.name) ||
        !this.isNumber(value.createdAt) ||
        !this.isNumber(value.updatedAt)
      ) {
        return null
      }

      const saveData = this.parseSaveValue(value.saveData)
      if (!saveData) return null

      const stored: StoredHunterProfile = {
        version: 1,
        id,
        name: value.name,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
        saveData: {
          version: 5,
          ...saveData,
        },
      }

      if (
        !this.isRecord(value.saveData) ||
        value.saveData.version !== 5
      ) {
        window.localStorage.setItem(
          this.getProfileKey(id),
          JSON.stringify(stored)
        )
      }

      return stored
    } catch (error) {
      console.warn(`Could not load Hunter profile ${id}.`, error)
      return null
    }
  }

  private readProfileIndex(): ProfileIndex {
    try {
      const raw = window.localStorage.getItem(PersistenceSystem.profileIndexKey)
      if (!raw) return this.rebuildProfileIndex()
      const value: unknown = JSON.parse(raw)
      if (!this.isProfileIndex(value)) return this.rebuildProfileIndex()
      return {
        version: 1,
        profiles: value.profiles.map(profile => ({ ...profile })),
      }
    } catch (error) {
      console.warn('Profile index is corrupted; rebuilding from profile saves.', error)
      return this.rebuildProfileIndex()
    }
  }

  private rebuildProfileIndex(): ProfileIndex {
    const profiles: HunterProfileSummary[] = []

    try {
      for (let index = 0; index < window.localStorage.length; index++) {
        const key = window.localStorage.key(index)
        if (!key?.startsWith(PersistenceSystem.profileKeyPrefix)) continue
        const id = key.slice(PersistenceSystem.profileKeyPrefix.length)
        const stored = this.loadStoredProfile(id)
        if (stored) {
          profiles.push(this.buildSummary({
            id: stored.id,
            name: stored.name,
            createdAt: stored.createdAt,
            updatedAt: stored.updatedAt,
            saveData: stored.saveData,
          }))
        }
      }
    } catch (error) {
      console.warn('Could not scan local Hunter profiles.', error)
    }

    const rebuilt: ProfileIndex = { version: 1, profiles }
    this.writeProfileIndex(rebuilt)
    return rebuilt
  }

  private writeProfileIndex(index: ProfileIndex) {
    try {
      window.localStorage.setItem(
        PersistenceSystem.profileIndexKey,
        JSON.stringify(index)
      )
      return true
    } catch (error) {
      console.warn('Could not write Hunter profile index.', error)
      return false
    }
  }

  private isProfileIndex(value: unknown): value is ProfileIndex {
    return (
      this.isRecord(value) &&
      value.version === 1 &&
      Array.isArray(value.profiles) &&
      value.profiles.every(profile =>
        this.isRecord(profile) &&
        typeof profile.id === 'string' &&
        typeof profile.name === 'string' &&
        this.isNumber(profile.createdAt) &&
        this.isNumber(profile.updatedAt) &&
        this.isInteger(profile.hunterLevel, 1) &&
        typeof profile.equippedWeaponName === 'string' &&
        typeof profile.equippedArmorName === 'string' &&
        this.isInteger(profile.coreLevel, 1) &&
        [CoreStage.Dormant, CoreStage.Awakened].includes(profile.coreStage as CoreStage) &&
        this.isInteger(profile.completedDrops, 0)
      )
    )
  }

  private buildSummary(profile: HunterProfile): HunterProfileSummary {
    return {
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      hunterLevel: profile.saveData.player.level ?? 1,
      equippedWeaponName: profile.saveData.equippedWeapon?.name ?? 'None',
      equippedArmorName:
        canEquipArmor(profile.saveData.player.level)
          ? profile.saveData.equippedArmor.name
          : 'Slot Locked',
      coreLevel: profile.saveData.core.level,
      coreStage: profile.saveData.core.stage,
      completedDrops: profile.saveData.account.lifetimeStats.runs,
    }
  }

  private getProfileKey(id: string) {
    return `${PersistenceSystem.profileKeyPrefix}${id}`
  }

  private generateProfileId() {
    return globalThis.crypto?.randomUUID?.() ??
      `hunter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  private parseRawSave(raw: string) {
    try {
      return this.parseSaveValue(JSON.parse(raw) as unknown)
    } catch (error) {
      console.warn('Could not parse Project Redbox save data.', error)
      return null
    }
  }

  private parseSaveValue(value: unknown): PersistentGameData | null {
    if (this.isRecord(value) && value.version === 4) {
      return this.migrateVersionFourSave(value)
    }

    if (this.isLegacyVersionOneSave(value)) {
      return this.removeTestWeapons({
        inventory: value.inventory,
        equippedWeapon: value.equippedWeapon,
        equippedArmor: createDefaultArmor(),
        core: this.migrateLegacyCore(value.mag),
        player: value.player,
        account: createDefaultAccount(),
        tutorial: createDefaultTutorialState(),
      })
    }

    if (this.isLegacyVersionTwoSave(value)) {
      return this.removeTestWeapons({
        inventory: value.inventory,
        equippedWeapon: value.equippedWeapon,
        equippedArmor: createDefaultArmor(),
        core: this.migrateLegacyCore(value.mag),
        player: value.player,
        account: value.account,
        tutorial: createDefaultTutorialState(),
      })
    }

    if (this.isLegacyVersionThreeSave(value)) {
      return this.removeTestWeapons({
        inventory: value.inventory,
        equippedWeapon: value.equippedWeapon,
        equippedArmor: createDefaultArmor(),
        core: this.migrateLegacyCore(value.mag),
        player: value.player,
        account: value.account,
        tutorial: value.tutorial,
      })
    }

    return this.isSaveFile(value)
      ? this.removeTestWeapons(value)
      : null
  }

  private clone(
    data: PersistentGameData
  ): PersistentGameData {
    const inventory =
      data.inventory.map(
        cloneInventoryItem
      )
    const sourceArmor =
      this.isArmor(data.equippedArmor)
        ? data.equippedArmor
        : createDefaultArmor()

    if (
      !inventory.some(
        item => item.id === sourceArmor.id
      ) &&
      inventory.length < 30
    ) {
      inventory.push(
        cloneInventoryItem(sourceArmor)
      )
    }

    return {
      inventory,
      equippedWeapon:
        data.equippedWeapon
          ? {
              ...data.equippedWeapon,
              modifiers: data.equippedWeapon.modifiers
                ? { ...data.equippedWeapon.modifiers }
                : undefined,
            }
          : null,
      equippedArmor:
        cloneInventoryItem(sourceArmor),
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
        selectedDropTier:
          data.account.selectedDropTier === 2
            ? 2
            : 1,
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
      value.version !== 5 ||
      !Array.isArray(value.inventory) ||
      value.inventory.length > 31 ||
      !value.inventory.every(item => this.isInventoryItem(item)) ||
      (
        value.equippedWeapon !== null &&
        !this.isWeapon(
          value.equippedWeapon
        )
      ) ||
      (
        !this.isArmor(value.equippedArmor)
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

    const equippedArmor =
      value.equippedArmor as ArmorItem

    return (
      value.inventory.some(item => item.id === equippedArmor.id) &&
      (
        equippedWeapon === null ||
        value.inventory.some(
          item =>
            item.id ===
            equippedWeapon.id
        )
      )
    )
  }

  private migrateVersionFourSave(
    value: Record<string, unknown>
  ): PersistentGameData | null {
    if (
      !Array.isArray(value.inventory) ||
      value.inventory.length > 30 ||
      !this.isPlayer(value.player) ||
      !this.isAccount(value.account) ||
      !this.isTutorial(value.tutorial) ||
      (
        value.equippedWeapon !== null &&
        !this.isWeapon(value.equippedWeapon)
      )
    ) {
      return null
    }

    const inventory: InventoryItem[] = []
    for (const rawItem of value.inventory) {
      if (this.isInventoryItem(rawItem)) {
        inventory.push(rawItem)
        continue
      }

      // Temporary pre-Day-42 armor records contained only id and name.
      if (
        this.isRecord(rawItem) &&
        typeof rawItem.id === 'string' &&
        rawItem.id.startsWith('starter-') &&
        typeof rawItem.name === 'string'
      ) {
        continue
      }

      return null
    }

    const equippedWeapon =
      value.equippedWeapon as WeaponItem | null
    if (
      equippedWeapon &&
      !inventory.some(
        item => isWeaponItem(item) && item.id === equippedWeapon.id
      )
    ) {
      return null
    }

    const storedArmor =
      this.isArmor(value.equippedArmor)
        ? value.equippedArmor
        : inventory.find(isArmorItem) ??
          createDefaultArmor()

    if (!inventory.some(item => item.id === storedArmor.id)) {
      inventory.push(storedArmor)
    }

    const core =
      this.isCore(value.core)
        ? value.core
        : this.isLegacyCore(value.core)
          ? this.migrateLegacyCore(value.core)
          : null
    if (!core) return null

    return this.removeTestWeapons({
      inventory,
      equippedWeapon,
      equippedArmor: storedArmor,
      core,
      player: value.player,
      account: value.account,
      tutorial: value.tutorial,
    })
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

  private isInventoryItem(
    value: unknown
  ): value is InventoryItem {
    return this.isWeapon(value) || this.isArmor(value)
  }

  private isArmor(
    value: unknown
  ): value is ArmorItem {
    return (
      this.isRecord(value) &&
      value.category === 'armor' &&
      typeof value.id === 'string' &&
      value.id.length > 0 &&
      typeof value.name === 'string' &&
      value.name.length > 0 &&
      ['common', 'uncommon', 'rare'].includes(String(value.rarity)) &&
      value.armorType === 'suit' &&
      this.isNumber(value.defense) &&
      this.isRecord(value.secondaryStats) &&
      this.isNumber(value.secondaryStats.maxHealth) &&
      this.isNumber(value.secondaryStats.moveSpeedPercent) &&
      this.isNumber(value.secondaryStats.pickupRadiusPercent) &&
      this.isNumber(value.secondaryStats.coreFeedBonusPercent) &&
      Array.isArray(value.affixes) &&
      value.affixes.every(affix => this.isArmorAffix(affix)) &&
      typeof value.appearanceId === 'string'
    )
  }

  private isArmorAffix(value: unknown) {
    return (
      this.isRecord(value) &&
      typeof value.id === 'string' &&
      ['reinforced', 'vital', 'mobile', 'salvager', 'integrated']
        .includes(String(value.type)) &&
      typeof value.displayName === 'string' &&
      typeof value.description === 'string' &&
      this.isRecord(value.modifiers) &&
      Object.entries(value.modifiers).every(([key, modifier]) =>
        [
          'defense',
          'maxHealth',
          'moveSpeedPercent',
          'pickupRadiusPercent',
          'coreFeedBonusPercent',
        ].includes(key) && this.isNumber(modifier)
      )
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
      (
        value.selectedDropTier === undefined ||
        value.selectedDropTier === 1 ||
        value.selectedDropTier === 2
      ) &&
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
