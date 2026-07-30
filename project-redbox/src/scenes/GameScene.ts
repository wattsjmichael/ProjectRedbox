import Phaser from 'phaser'

import type {
  WeaponType,
} from '../weapons/WeaponTypes'

import type {
  EncounterZone,
} from '../encounters/EncounterTypes'

import type {
  WeaponItem,
} from '../items/ItemTypes'

import {
  createDefaultPlayerStats,
} from '../player/PlayerStats'

import {
  Player,
} from '../player/Player'

import {
  ProgressionSystem,
} from '../progression/ProgressionSystem'

import {
  DropScalingSystem,
} from '../progression/DropScalingSystem'

import type {
  DropScaling,
} from '../progression/DropScalingSystem'

import {
  WeaponSystem,
} from '../weapons/WeaponSystem'

import {
  EnemyManager,
} from '../enemies/EnemyManager'

import {
  LootSystem,
} from '../loot/LootSystem'

import {
  EncounterManager,
} from '../encounters/EncounterManager'

import {
  ENCOUNTER_COMPOSITIONS,
  getCompositionCost,
} from '../encounters/EncounterCompositions'

import {
  EnemyType,
  ENEMY_BEHAVIORS,
} from '../enemies/EnemyTypes'

import {
  HUD,
} from '../ui/HUD'

import {
  CombatFeedbackManager,
} from '../combat/CombatFeedbackManager'

import {
  InventorySystem,
} from '../inventory/InventorySystem'

import {
  InventoryUI,
} from '../inventory/InventoryUI'

import {
  CoreSystem,
} from '../core/CoreSystem'

import {
  CoreVisual,
} from '../core/CoreVisual'

import {
  createDefaultAccount,
  createDefaultTutorialState,
  PersistenceSystem,
} from '../persistence/PersistenceSystem'

import type {
  AccountProgression,
  PersistentGameData,
} from '../persistence/PersistenceSystem'

import type {
  RunOutcome,
  RunSummary,
} from '../runs/RunTypes'

export class GameScene
  extends Phaser.Scene {
  private readonly worldWidth =
    2400

  private readonly worldHeight =
    1800

  private player!:
    Player

  private enemyManager!:
    EnemyManager

  private weaponSystem!:
    WeaponSystem

  private combatFeedback!:
    CombatFeedbackManager

  private lootSystem!:
    LootSystem

  private encounterManager!:
    EncounterManager

  private lastEliteEncounterIndex =
    -10

  private hud!:
    HUD

  private crosshair!:
    Phaser.GameObjects.Arc

  private killCount =
    0

  private rareCount =
    0

  private isGameOver =
    false

  private wyrmSpawned =
    false

  private awaitingBossReward =
    false

  private runStartTime =
    0

  private playerStats =
    createDefaultPlayerStats()

  private progression!:
    ProgressionSystem

  private inventorySystem!:
    InventorySystem

  private inventoryUI!:
    InventoryUI

  private coreSystem!:
    CoreSystem

  private coreVisual:
    CoreVisual | null =
    null

  private coreFeedInProgress =
    false

  private inventoryOpen =
    false

  private readonly persistence =
    new PersistenceSystem()

  private loadedSave:
    PersistentGameData | null = null

  private account:
    AccountProgression =
    createDefaultAccount()

  private recentFinds:
    WeaponItem[] = []

  private bossesDefeated =
    0

  private runFinalized =
    false

  private runScaling!:
    DropScaling

  constructor() {
    super(
      'GameScene'
    )
  }
  create() {
    this.loadedSave =
      this.persistence.load()

    if (!this.loadedSave) {
      this.loadedSave =
        this.persistence
          .createFreshSave()
      this.persistence.save(
        this.loadedSave
      )
    }

    this.account =
      this.loadedSave?.account ??
      createDefaultAccount()

    this.runScaling =
      DropScalingSystem.calculate(
        this.loadedSave?.core ??
        null,
        this.loadedSave
          ?.equippedWeapon ??
        null,
        this.account
      )

    this.logRunScaling()

    this.resetRunState()

    this.createWorld()

    this.createPlayer()

    this.createEnemyManager()

    this.setupCamera()

    this.createHUD()

    this.combatFeedback =
      new CombatFeedbackManager(
        this
      )

    this.createWeaponSystem()

    this.createInventorySystem()

    this.createCoreSystem()

    this.createCoreVisual()

    this.createInventoryUI()

    this.createLootSystem()

    this.createEncounterManager()

    this.createCrosshair()

    this.setupDebugControls()

    this.runStartTime =
      this.time.now

    this.savePersistentState()
  }
  private createCoreSystem() {
    this.coreSystem =
      new CoreSystem(
        this.loadedSave?.core
      )
  }

  private createCoreVisual() {
    const hunter =
      this.player.getObject()

    this.coreVisual?.destroy()
    this.coreVisual =
      new CoreVisual({
        scene:
          this,
        x:
          hunter.x - 34,
        y:
          hunter.y + 30,
        mode:
          'follower',
        awakened:
          this.coreSystem
            .getNextEvolution() ===
          null,
      })

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.coreVisual?.destroy()
        this.coreVisual =
          null
      }
    )
  }

  private createInventorySystem() {
    this.inventorySystem =
      new InventorySystem()

    if (
      this.loadedSave
    ) {
      this.inventorySystem.restore(
        this.loadedSave.inventory,
        this.loadedSave.equippedWeapon
      )

      const equipped =
        this.inventorySystem
          .getEquippedItem()

      if (equipped) {
        this.equipWeaponItem(
          equipped
        )
      }

      return
    }

  }

  private createInventoryUI() {
    this.inventoryUI =
      new InventoryUI({
        scene:
          this,

        inventory:
          this.inventorySystem,

        core:
          this.coreSystem,

        getHunterStats:
          () => {
            return {
              attackBonus:
                this.coreSystem
                  .getAttackMultiplier() -
                1,

              criticalChanceBonus:
                this.coreSystem
                  .getCriticalChanceBonus(),

              defenseReduction:
                this.coreSystem
                  .getDefenseReduction(),

              energyBonus:
                this.coreSystem
                  .getEnergyMultiplier() -
                1,
            }
          },

        onEquip:
          (
            item
          ) => {
            this.equipWeaponItem(
              item
            )
          },

        onFeed:
          (
            item
          ) => {
            return this.feedItemToCore(
              item
            )
          },

        onClose:
          () => {
            this.closeInventory()
          },
      })
  }

  private feedItemToCore(
    item:
      WeaponItem
  ) {
    if (
      this.coreFeedInProgress
    ) {
      return false
    }

    if (
      this.inventorySystem.isEquipped(
        item.id
      )
    ) {
      this.hud.showLootMessage(
        'CANNOT FEED EQUIPPED WEAPON'
      )

      return false
    }

    this.coreFeedInProgress =
      true

    const removed =
      this.inventorySystem.removeItem(
        item.id
      )

    if (
      !removed
    ) {
      this.coreFeedInProgress =
        false
      return false
    }

    const result =
      this.coreSystem.feedWeapon(
        item
      )

    this.savePersistentState()

    const statName =
      result.statName
        .toUpperCase()

    let message =
      `CORE FED // ${item.name.toUpperCase()}\n` +
      `+${result.statGained} ${statName}\n` +
      `+${result.experienceGained} PROGRESS`

    if (
      result.leveledUp
    ) {
      message +=
        `\nCORE LEVEL ${result.newLevel}`
    }

    if (
      result.evolved
    ) {
      const definition =
        this.coreSystem
          .getStageDefinition()
      message =
        `CORE EVOLVED\n${definition.displayName.toUpperCase()}\n` +
        `${definition.bonus.displayName.toUpperCase()} // ${definition.bonus.description.toUpperCase()}`
      this.cameras.main.flash(
        450,
        255,
        60,
        60
      )
      this.coreVisual
        ?.playEvolution()
    } else {
      this.coreVisual
        ?.playFeedPulse()
    }

    this.hud.showLootMessage(
      message
    )

    this.time.delayedCall(
      result.evolved
        ? 1800
        : 250,
      () => {
        this.coreFeedInProgress =
          false
      }
    )

    return true
  }

  private resetRunState() {
    const defaults =
      createDefaultPlayerStats()

    const savedPlayer =
      this.loadedSave?.player

    this.playerStats = {
      ...defaults,
      maxHealth:
        savedPlayer?.maxHealth ??
        defaults.maxHealth,
      health:
        savedPlayer?.maxHealth ??
        defaults.maxHealth,
      power:
        savedPlayer?.power ??
        defaults.power,
      defense:
        savedPlayer?.defense ??
        defaults.defense,
      speed:
        savedPlayer?.speed ??
        defaults.speed,
    }

    this.progression =
      new ProgressionSystem(
        this.playerStats
      )

    this.killCount =
      0

    this.rareCount =
      0

    this.isGameOver =
      false

    this.wyrmSpawned =
      false

    this.lastEliteEncounterIndex =
      -10

    this.awaitingBossReward =
      false

    this.recentFinds =
      []

    this.bossesDefeated =
      0

    this.runFinalized =
      false

    this.coreFeedInProgress =
      false
  }

  private createWorld() {
    this.add.rectangle(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      0x111827
    )

    this.add.rectangle(
      700,
      450,
      300,
      80,
      0x263244
    )

    this.add.rectangle(
      1200,
      900,
      100,
      400,
      0x263244
    )

    this.add.rectangle(
      1800,
      500,
      350,
      100,
      0x263244
    )

    this.add.rectangle(
      1750,
      1350,
      400,
      80,
      0x263244
    )

    this.add.rectangle(
      700,
      1350,
      120,
      350,
      0x263244
    )

    this.add
      .circle(
        1200,
        900,
        300,
        0x441111,
        0.08
      )
      .setStrokeStyle(
        3,
        0x662222,
        0.4
      )
  }

  private createPlayer() {
    this.player =
      new Player({
        scene:
          this,

        stats:
          this.playerStats,

        worldWidth:
          this.worldWidth,

        worldHeight:
          this.worldHeight,
      })
  }

  private createEnemyManager() {
    this.enemyManager =
      new EnemyManager({
        scene:
          this,

        player:
          this.player.getObject(),

        onPlayerDamage:
          (
            amount
          ) => {
            this.damagePlayer(
              amount
            )
          },
        scaling:
          this.runScaling,
      })
  }

  private setupCamera() {
    this.cameras.main.setBounds(
      0,
      0,
      this.worldWidth,
      this.worldHeight
    )

    this.cameras.main.startFollow(
      this.player.getObject(),
      true,
      0.08,
      0.08
    )
  }

  private createHUD() {
    this.hud =
      new HUD(
        this,
        this.playerStats
      )
  }

  private createWeaponSystem() {
    this.weaponSystem =
      new WeaponSystem({
        scene:
          this,

        player:
          this.player.getObject(),

        worldWidth:
          this.worldWidth,

        worldHeight:
          this.worldHeight,

        getEnemies:
          () =>
            this.enemyManager.getEnemies(),

        getEnemyHealth:
          (
            enemy
          ) =>
            this.enemyManager.getEnemyHealth(
              enemy
            ),

        setEnemyHealth:
          (
            enemy,
            health
          ) => {
            this.enemyManager.setEnemyHealth(
              enemy,
              health
            )

            if (
              this.enemyManager.getEnemyType(
                enemy
              ) ===
              'wyrm'
            ) {
              this.hud.updateBossHealth(
                health,
                this.enemyManager
                  .getMaxHealth(
                    'wyrm'
                  )
              )
            }
          },
        getCoreAttackMultiplier:
          () => {
            return (
              this.coreSystem
                ?.getAttackMultiplier() ??
              1
            )
          },

        getCoreCriticalChanceBonus:
          () => {
            return (
              this.coreSystem
                ?.getCriticalChanceBonus() ??
              0
            )
          },

        getCoreEnergyMultiplier:
          () => {
            return (
              this.coreSystem
                ?.getEnergyMultiplier() ??
              1
            )
          },

        feedback:
          this.combatFeedback,

        killEnemy:
          (
            enemy
          ) => {
            this.killEnemy(
              enemy
            )
          },

        onComboStateChange:
          (
            state
          ) => {
            if (
              state.step === 0 &&
              !state.failed
            ) {
              this.hud.hideCombo()
              return
            }

            this.hud.updateCombo(
              state.step,
              state.elapsed,
              state.comboWindow,
              state.perfectStart,
              state.perfectEnd,
              state.failed,
              state.perfect,
              state.queued,
              state.finisherReady,
              state.finisherLabel
            )
          },

        onCriticalHit:
          (
            x,
            y
          ) => {
            this.showCriticalHit(
              x,
              y
            )
          },

        onDamageDealt:
          (
            x,
            y,
            damage,
            critical
          ) => {
            this.showDamageNumber(
              x,
              y,
              damage,
              critical
            )
          },


      })


  }


  private showDamageNumber(
    x: number,
    y: number,
    damage: number,
    critical: boolean
  ) {
    const text =
      this.add
        .text(
          x + Phaser.Math.Between(
            -10,
            10
          ),
          y - 20,
          `${damage}`,
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              critical
                ? '24px'
                : '16px',

            color:
              critical
                ? '#ffdd55'
                : '#ffffff',

            stroke:
              '#000000',

            strokeThickness:
              4,
          }
        )
        .setOrigin(
          0.5
        )

    this.tweens.add({
      targets:
        text,

      y:
        y - 60,

      alpha:
        0,

      scale:
        critical
          ? 1.4
          : 1,

      duration:
        500,

      ease:
        'Power2',

      onComplete:
        () => {
          text.destroy()
        },
    })
  }

  private createLootSystem() {
    this.lootSystem =
      new LootSystem({
        scene:
          this,

        player:
          this.player.getObject(),

        onWeaponCollected:
          (
            item
          ) => {
            this.handleWeaponCollected(
              item
            )
          },

        onRedBoxCollected:
          (
            item
          ) => {
            this.handleRedBoxCollected(
              item
            )
          },

        getPickupRadiusMultiplier:
          () =>
            this.coreSystem
              .getPickupRadiusMultiplier(),
      })
  }

  private createEncounterManager() {
    this.encounterManager =
      new EncounterManager({
        scene:
          this,

        player:
          this.player.getObject(),

        onEncounterTriggered:
          (
            zone
          ) =>
            this.triggerEncounter(
              zone
            ),

        onEncounterCleared:
          (
            _zone,
            cleared,
            total
          ) => {
            this.handleEncounterCleared(
              cleared,
              total
            )
          },
      })
  }

  private createCrosshair() {
    this.crosshair =
      this.add.circle(
        0,
        0,
        8,
        0xffffff,
        0
      )

    this.crosshair.setStrokeStyle(
      2,
      0xffffff
    )
  }

  private setupDebugControls() {
    this.input.keyboard!.on(
      'keydown-ONE',
      () => {
        this.setWeapon(
          'rifle'
        )
      }
    )

    this.input.keyboard!.on(
      'keydown-TWO',
      () => {
        this.setWeapon(
          'scattergun'
        )
      }
    )

    this.input.keyboard!.on(
      'keydown-THREE',
      () => {
        this.setWeapon(
          'cannon'
        )
      }
    )

    this.input.keyboard!.on(
      'keydown-FOUR',
      () => {
        this.setWeapon(
          'greatsword'
        )
      }
    )

    this.input.keyboard!.on(
      'keydown-FIVE',
      () => {
        this.spawnWyrmDebug()
      }
    )

    this.input.keyboard!.on(
      'keydown-I',
      () => {
        this.toggleInventory()
      }
    )
  }

  private spawnWyrmDebug() {
    if (
      this.isGameOver ||
      this.enemyManager.isWyrmAlive()
    ) {
      return
    }

    this.wyrmSpawned =
      true

    this.hud.showEncounterMessage(
      'DEBUG: WYRM INCOMING'
    )

    this.time.delayedCall(
      500,
      () => {
        if (
          this.isGameOver
        ) {
          return
        }

        this.enemyManager.spawnWyrm(
          1200,
          900
        )

        this.hud.showBoss(
          this.enemyManager
            .getMaxHealth(
              'wyrm'
            ),
          this.enemyManager
            .getMaxHealth(
              'wyrm'
            )
        )

        this.hud.showEncounterMessage(
          'THE WYRM HAS LANDED'
        )
      }
    )
  }

  private toggleInventory() {
    if (
      this.inventoryOpen
    ) {
      this.closeInventory()
    } else {
      this.openInventory()
    }
  }

  private openInventory() {
    if (
      this.isGameOver
    ) {
      return
    }

    this.inventoryOpen =
      true

    this.weaponSystem.setEnabled(
      false
    )

    this.inventoryUI.open()
  }

  private closeInventory() {
    this.inventoryOpen =
      false

    this.weaponSystem.setEnabled(
      true
    )

    if (
      this.inventoryUI.isOpen()
    ) {
      this.inventoryUI.close(
        false
      )
    }
  }

  update(
    _: number,
    delta: number
  ) {
    if (
      this.isGameOver ||
      this.inventoryOpen
    ) {
      return
    }

    this.updateCrosshair()

    this.player.update(
      delta
    )

    const hunter =
      this.player.getObject()
    this.coreVisual
      ?.updateFollower(
        delta,
        hunter.x,
        hunter.y
      )

    this.encounterManager.update()

    this.enemyManager.update(
      delta
    )

    this.lootSystem.update()

    const pointer =
      this.input.activePointer

    this.player.setAimTarget(
      pointer.worldX,
      pointer.worldY
    )

    this.weaponSystem.update(
      delta,
      pointer.worldX,
      pointer.worldY
    )
  }

  private updateCrosshair() {
    const pointer =
      this.input.activePointer

    this.crosshair.setPosition(
      pointer.worldX,
      pointer.worldY
    )
  }

  private triggerEncounter(
    zone:
      EncounterZone
  ) {
    const spawned:
      Phaser.GameObjects.Rectangle[] = []
    const encounterIndex =
      zone.enemyCount <= 8
        ? 0
        : zone.enemyCount <= 10
          ? 1
          : zone.enemyCount <= 12
            ? 2
            : zone.enemyCount <= 14
              ? 3
              : 4
    const budget =
      6 +
      encounterIndex * 2
    const eliteAllowed =
      encounterIndex >= 3 &&
      encounterIndex -
        this.lastEliteEncounterIndex >=
        2
    const eligible =
      ENCOUNTER_COMPOSITIONS.filter(
        composition =>
          encounterIndex >=
            composition.minimumZone &&
          (
            composition.maximumZone ===
              undefined ||
            encounterIndex <=
              composition.maximumZone
          ) &&
          (
            eliteAllowed ||
            !composition.spawns.some(
              spawn =>
                spawn.type ===
                EnemyType.Elite
            )
          ) &&
          getCompositionCost(
            composition
          ) <= budget
      )
    const weighted =
      eligible.flatMap(
        composition =>
          Array.from(
            {
              length:
                composition.weight,
            },
            () => composition
          )
      )
    const composition =
      weighted[
        Phaser.Math.Between(
          0,
          Math.max(
            0,
            weighted.length - 1
          )
        )
      ] ??
      ENCOUNTER_COMPOSITIONS[0]

    if (
      composition.spawns.some(
        spawn =>
          spawn.type ===
          EnemyType.Elite
      )
    ) {
      this.lastEliteEncounterIndex =
        encounterIndex
    }

    this.hud.showEncounterMessage(
      composition.name.toUpperCase()
    )

    let spent =
      getCompositionCost(
        composition
      )
    const spawnPlan = [
      ...composition.spawns,
    ]

    while (
      spent +
        ENEMY_BEHAVIORS.basic
          .spawnCost <=
      budget
    ) {
      spawnPlan.push({
        type: EnemyType.Basic,
      })
      spent +=
        ENEMY_BEHAVIORS.basic
          .spawnCost
    }

    for (
      const planned of
        spawnPlan
    ) {
      const position =
        this.getEncounterSpawnPosition(
          zone,
          planned.angleOffset
        )

      spawned.push(
        this.enemyManager.spawnAt(
          position.x,
          position.y,
          planned.type
        )
      )
    }

    if (import.meta.env.DEV) {
      console.debug(
        `[Encounter] ${composition.name} | phase ${encounterIndex + 1} | budget ${spent}/${budget}`
      )
    }

    return spawned
  }

  private getEncounterSpawnPosition(
    zone:
      EncounterZone,
    angleOffset = 0
  ) {
    const minimumSafeDistance =
      260
    const existing =
      this.enemyManager.getEnemies()

    for (
      let attempt = 0;
      attempt < 12;
      attempt++
    ) {
      const playerAngle =
        Phaser.Math.Angle.Between(
          this.player.getObject().x,
          this.player.getObject().y,
          zone.x,
          zone.y
        )
      const angle =
        playerAngle +
        angleOffset +
        Phaser.Math.FloatBetween(
          -0.8,
          0.8
        )
      const distance =
        Phaser.Math.Between(
          Math.max(
            150,
            Math.round(
              zone.radius * 0.7
            )
          ),
          Math.max(
            180,
            zone.radius
          )
        )
      const candidate = {
        x:
          Phaser.Math.Clamp(
            zone.x +
              Math.cos(angle) *
              distance,
            48,
            this.worldWidth - 48
          ),
        y:
          Phaser.Math.Clamp(
            zone.y +
              Math.sin(angle) *
              distance,
            48,
            this.worldHeight - 48
          ),
      }
      const safeFromPlayer =
        Phaser.Math.Distance.Between(
          candidate.x,
          candidate.y,
          this.player.getObject().x,
          this.player.getObject().y
        ) >= minimumSafeDistance
      const separated =
        existing.every(
          enemy =>
            !enemy.active ||
            Phaser.Math.Distance.Between(
              candidate.x,
              candidate.y,
              enemy.x,
              enemy.y
            ) >= 64
        )

      if (
        safeFromPlayer &&
        separated
      ) {
        return candidate
      }
    }

    const fallbackAngle =
      Phaser.Math.Angle.Between(
        this.player.getObject().x,
        this.player.getObject().y,
        zone.x,
        zone.y
      ) +
      angleOffset

    return {
      x:
        Phaser.Math.Clamp(
          this.player.getObject().x +
            Math.cos(fallbackAngle) *
            minimumSafeDistance,
          48,
          this.worldWidth - 48
        ),
      y:
        Phaser.Math.Clamp(
          this.player.getObject().y +
            Math.sin(fallbackAngle) *
            minimumSafeDistance,
          48,
          this.worldHeight - 48
        ),
    }
  }

  private handleEncounterCleared(
    cleared:
      number,

    total:
      number
  ) {
    this.hud.showEncounterMessage(
      `AREA SECURED — ${cleared}/${total}`
    )

    if (
      cleared !==
      total ||
      this.wyrmSpawned
    ) {
      return
    }

    this.wyrmSpawned =
      true

    this.time.delayedCall(
      1200,
      () => {
        this.beginWyrmEncounter()
      }
    )
  }

  private beginWyrmEncounter() {
    if (
      this.isGameOver
    ) {
      return
    }

    this.hud.showEncounterMessage(
      'WARNING: WYRM DETECTED'
    )

    this.cameras.main.flash(
      400,
      120,
      0,
      0
    )

    this.cameras.main.shake(
      300,
      0.012
    )

    this.time.delayedCall(
      2000,
      () => {
        if (
          this.isGameOver
        ) {
          return
        }

        this.enemyManager.spawnWyrm(
          1200,
          900
        )

        this.hud.showBoss(
          this.enemyManager
            .getMaxHealth(
              'wyrm'
            ),
          this.enemyManager
            .getMaxHealth(
              'wyrm'
            )
        )

        this.hud.showEncounterMessage(
          'THE WYRM HAS LANDED'
        )
      }
    )
  }

  private damagePlayer(
    amount:
      number
  ) {
    if (
      this.isGameOver ||
      !this.player
        .getObject()
        .active
    ) {
      return
    }

    const defenseReduction =
      this.coreSystem
        ?.getDefenseReduction() ??
      0

    const finalDamage =
      Math.max(
        1,
        Math.round(
          amount *
          (
            1 -
            defenseReduction
          )
        )
      )

    this.playerStats.health -=
      finalDamage

    this.playerStats.health =
      Math.max(
        0,
        this.playerStats.health
      )

    this.hud.updateHealth(
      this.playerStats
    )

    this.player.showDamageFlash()

    this.combatFeedback
      .playPlayerHit()

    if (
      this.playerStats.health <=
      0
    ) {
      this.gameOver()
    }
  }

  private gameOver() {
    if (
      this.isGameOver
    ) {
      return
    }

    this.isGameOver =
      true

    this.weaponSystem.setEnabled(
      false
    )

    this.combatFeedback.stop()

    this.playerStats.health =
      0

    this.hud.updateHealth(
      this.playerStats
    )

    this.input.keyboard?.resetKeys()

    this.player.destroy()

    this.coreVisual?.destroy()
    this.coreVisual =
      null

    this.hud.showGameOver(
      this.killCount,
      () => {
        this.finishRun(
          'defeated'
        )
      }
    )
  }

  private setWeapon(
    weapon:
      WeaponType
  ) {
    this.weaponSystem.setWeapon(
      weapon
    )

    this.hud.updateWeapon(
      weapon
    )

    this.hud.hideCombo()
  }

  private equipWeaponItem(
    item:
      WeaponItem
  ) {
    this.weaponSystem.equipWeapon(
      item
    )

    this.hud.updateWeapon(
      item.name
    )

    this.hud.hideCombo()

    this.savePersistentState()
  }

  private killEnemy(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    if (
      !enemy.active
    ) {
      return
    }

    const x =
      enemy.x

    const y =
      enemy.y

    const enemyType =
      this.enemyManager.getEnemyType(
        enemy
      )

    this.combatFeedback
      .playEnemyDeath(
        enemy,
        enemyType
      )

    this.enemyManager.removeEnemy(
      enemy
    )

    if (
      enemyType ===
      'wyrm'
    ) {
      this.bossesDefeated++

      this.handleWyrmDeath(
        x,
        y
      )
    } else {
      this.lootSystem.tryDrop(
        x,
        y
      )
    }

    const xpReward =
      enemyType ===
        'elite'
        ? 3
        : enemyType ===
          'tank'
          ? 3
          : enemyType ===
            'fast'
            ? 2
        : enemyType ===
          'wyrm'
          ? 20
          : 1

    const gains =
      this.progression.addXP(
        xpReward
      )

    if (
      gains
    ) {
      this.hud.showLevelUp(
        this.playerStats.level,
        gains
      )

      this.hud.updateHealth(
        this.playerStats
      )
    }

    this.hud.updateXP(
      this.playerStats
    )

    this.savePersistentState()

    this.killCount++

    this.hud.updateKills(
      this.killCount
    )
  }

  private handleWyrmDeath(
    x:
      number,

    y:
      number
  ) {
    this.hud.hideBoss()

    this.createWyrmDeathExplosion(
      x,
      y
    )

    this.cameras.main.flash(
      500,
      255,
      100,
      0
    )

    this.cameras.main.shake(
      600,
      0.035
    )

    this.hud.showEncounterMessage(
      'WYRM TERMINATED'
    )

    this.awaitingBossReward =
      true

    this.time.delayedCall(
      900,
      () => {
        this.lootSystem.spawn(
          x,
          y,
          'redbox'
        )
      }
    )
  }

  private handleWeaponCollected(
    item:
      WeaponItem
  ) {
    const added =
      this.inventorySystem.addItem(
        item
      )

    if (
      !added
    ) {
      this.hud.showLootMessage(
        'BACKPACK FULL'
      )

      return
    }

    this.hud.showLootMessage(
      `${item.name.toUpperCase()}\n` +
      `ADDED TO BACKPACK\n` +
      `PRESS I TO VIEW`
    )

    console.log(
      'Weapon added to inventory:',
      item
    )

    this.recentFinds.push(
      item
    )

    this.savePersistentState()
  }

  private handleRedBoxCollected(
    item:
      WeaponItem
  ) {
    this.rareCount++

    const added =
      this.inventorySystem.addItem(
        item
      )

    if (
      added
    ) {
      this.recentFinds.push(
        item
      )

      this.savePersistentState()

      this.hud.showRareLootMessage(
        item.name.toUpperCase(),
        [
          `ATK ${item.attack}`,
          `SPD ${item.speed}`,
          `CRIT ${(item.criticalChance * 100).toFixed(0)}%`,
          `CRIT DMG ${(item.criticalDamage * 100).toFixed(0)}%`,
        ].join('   ')
      )
    } else {
      this.hud.showRareLootMessage(
        'BACKPACK FULL',
        `${item.name.toUpperCase()} COULD NOT BE STORED`
      )
    }

    if (
      this.awaitingBossReward
    ) {
      this.awaitingBossReward =
        false

      this.time.delayedCall(
        1200,
        () => {
          this.completeRun()
        }
      )
    }
  }

  private savePersistentState() {
    if (
      !this.inventorySystem ||
      !this.coreSystem
    ) {
      return
    }

    this.persistence.save({
      inventory:
        this.inventorySystem
          .getItems(),
      equippedWeapon:
        this.inventorySystem
          .getEquippedItem(),
      core:
        this.coreSystem.getCore(),
      player: {
        ...(
          this.loadedSave?.player ??
          {
            level:
              1,
            currentXP:
              0,
            xpToNextLevel:
              10,
            maxHealth:
              100,
            power:
              10,
            defense:
              5,
            speed:
              250,
          }
        ),
      },
      account:
        this.account,
      tutorial:
        this.loadedSave
          ?.tutorial ??
        createDefaultTutorialState(),
    })
  }

  private showCriticalHit(
    x: number,
    y: number
  ) {
    const text =
      this.add
        .text(
          x,
          y - 30,
          'CRITICAL!',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '18px',

            color:
              '#ffdd55',

            stroke:
              '#000000',

            strokeThickness:
              4,
          }
        )
        .setOrigin(
          0.5
        )

    this.tweens.add({
      targets:
        text,

      y:
        y - 70,

      alpha:
        0,

      scale:
        1.3,

      duration:
        500,

      ease:
        'Power2',

      onComplete:
        () => {
          text.destroy()
        },
    })
  }

  private completeRun() {
    this.finishRun(
      'completed'
    )
  }

  private logRunScaling() {
    console.info(
      '[Drop Scaling]',
      {
        drop:
          this.runScaling.dropNumber,
        progressionScore:
          this.runScaling
            .progressionScore,
        enemyHealth:
          this.runScaling
            .enemyHealthMultiplier,
        enemyDamage:
          this.runScaling
            .enemyDamageMultiplier,
        wyrmHealth:
          this.runScaling
            .wyrmHealthMultiplier,
        wyrmDamage:
          this.runScaling
            .wyrmDamageMultiplier,
      }
    )
  }

  private finishRun(
    outcome:
      RunOutcome
  ) {
    if (this.runFinalized) {
      return
    }

    this.runFinalized =
      true

    this.weaponSystem.setEnabled(
      false
    )
    this.combatFeedback.stop()

    const summary:
      RunSummary = {
      outcome,
      kills:
        this.killCount,
      bossesDefeated:
        this.bossesDefeated,
      rareDrops:
        this.rareCount,
      timeMs:
        this.time.now -
        this.runStartTime,
      recentFinds:
        this.recentFinds.map(
          item => ({
            ...item,
          })
        ),
    }

    this.account.lifetimeStats.runs++
    this.account.lifetimeStats.kills +=
      summary.kills
    this.account.lifetimeStats
      .bossesDefeated +=
      summary.bossesDefeated

    this.savePersistentState()

    this.scene.start(
      'HunterBayScene',
      summary
    )
  }

  private createWyrmDeathExplosion(
    x: number,
    y: number
  ) {
    for (
      let i = 0;
      i < 32;
      i++
    ) {
      const particle =
        this.add.rectangle(
          x,
          y,
          Phaser.Math.Between(
            8,
            18
          ),
          Phaser.Math.Between(
            8,
            18
          ),
          Phaser.Utils.Array.GetRandom([
            0xff2200,
            0xff6600,
            0xffaa00,
            0xffffff,
          ])
        )

      const angle =
        Phaser.Math.FloatBetween(
          0,
          Math.PI * 2
        )

      const distance =
        Phaser.Math.FloatBetween(
          150,
          450
        )

      this.tweens.add({
        targets:
          particle,

        x:
          x +
          Math.cos(
            angle
          ) *
          distance,

        y:
          y +
          Math.sin(
            angle
          ) *
          distance,

        rotation:
          Phaser.Math.FloatBetween(
            -4,
            4
          ),

        alpha:
          0,

        scale:
          0,

        duration:
          Phaser.Math.Between(
            500,
            900
          ),

        ease:
          'Power2',

        onComplete:
          () => {
            particle.destroy()
          },
      })
    }

    const blast =
      this.add.circle(
        x,
        y,
        80,
        0xff5500,
        0.8
      )

    this.tweens.add({
      targets:
        blast,

      scale:
        4,

      alpha:
        0,

      duration:
        700,

      onComplete:
        () => {
          blast.destroy()
        },
    })
  }

}
