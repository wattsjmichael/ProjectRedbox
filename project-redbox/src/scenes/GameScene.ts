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
  ENEMY_STATS,
} from '../enemies/EnemyTypes'

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
  HUD,
} from '../ui/HUD'

import {
  InventorySystem,
} from '../inventory/InventorySystem'

import {
  InventoryUI,
} from '../inventory/InventoryUI'

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

  private lootSystem!:
    LootSystem

  private encounterManager!:
    EncounterManager

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

  private inventoryOpen =
    false

  constructor() {
    super(
      'GameScene'
    )
  }

  create() {
    this.resetRunState()

    this.createWorld()

    this.createPlayer()

    this.createEnemyManager()

    this.setupCamera()

    this.createHUD()

    this.createWeaponSystem()

    this.createInventorySystem()

    this.createInventoryUI()

    this.createLootSystem()

    this.createEncounterManager()

    this.createCrosshair()

    this.setupDebugControls()

    this.runStartTime =
      this.time.now
  }

  private createInventorySystem() {
    this.inventorySystem =
      new InventorySystem()
      const testItems: WeaponItem[] = [
  {
    id: 'test-greatsword-1',
    category: 'weapon',
    weaponType: 'greatsword',
    rarity: 'rare',
    name: 'Prototype Greatsword',
    attack: 28,
    speed: 0.85,
    criticalChance: 0.18,
    criticalDamage: 2.0,
  },
  {
    id: 'test-scattergun-1',
    category: 'weapon',
    weaponType: 'scattergun',
    rarity: 'uncommon',
    name: 'Enhanced Scattergun',
    attack: 16,
    speed: 1.15,
    criticalChance: 0.12,
    criticalDamage: 1.6,
  },
  {
    id: 'test-cannon-1',
    category: 'weapon',
    weaponType: 'cannon',
    rarity: 'rare',
    name: 'Prototype Cannon',
    attack: 25,
    speed: 0.75,
    criticalChance: 0.08,
    criticalDamage: 2.25,
  },
  {
    id: 'test-rifle-1',
    category: 'weapon',
    weaponType: 'rifle',
    rarity: 'uncommon',
    name: 'Enhanced Rifle',
    attack: 15,
    speed: 1.4,
    criticalChance: 0.2,
    criticalDamage: 1.75,
  },
]

for (
  const item of
    testItems
) {
  this.inventorySystem.addItem(
    item
  )
}

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

    this.inventorySystem.setEquippedItem(
      starterRifle
    )

    this.weaponSystem.equipWeapon(
      starterRifle
    )

    this.hud.updateWeapon(
      starterRifle.name
    )
  }

  private createInventoryUI() {
    this.inventoryUI =
      new InventoryUI({
        scene:
          this,

        inventory:
          this.inventorySystem,

        onEquip:
          (
            item
          ) => {
            this.equipWeaponItem(
              item
            )
          },

        onClose:
          () => {
            this.closeInventory()
          },
      })
  }

  private resetRunState() {
    this.playerStats =
      createDefaultPlayerStats()

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

    this.awaitingBossReward =
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
                ENEMY_STATS.wyrm.health
              )
            }
          },

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
              this.weaponSystem
                .getCurrentWeapon() !==
              'greatsword'
            ) {
              return
            }

            this.hud.updateCombo(
              state.step,
              state.elapsed,
              state.comboWindow,
              state.perfectStart,
              state.perfectEnd,
              state.failed,
              state.perfect
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
          () => {
            this.handleRedBoxCollected()
          },
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
          ENEMY_STATS.wyrm.health,
          ENEMY_STATS.wyrm.health
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

    this.encounterManager.update()

    this.enemyManager.update(
      delta
    )

    this.lootSystem.update()

    const pointer =
      this.input.activePointer

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
    this.hud.showEncounterMessage(
      'HOSTILES DETECTED'
    )

    const spawned:
      Phaser.GameObjects.Rectangle[] = []

    let eliteCount =
      1

    if (
      zone.enemyCount >=
      12
    ) {
      eliteCount =
        2
    }

    if (
      zone.enemyCount >=
      16
    ) {
      eliteCount =
        3
    }

    const normalCount =
      Math.max(
        0,
        zone.enemyCount -
        eliteCount
      )

    for (
      let i = 0;
      i < normalCount;
      i++
    ) {
      const position =
        this.getEncounterSpawnPosition(
          zone
        )

      spawned.push(
        this.enemyManager.spawnAt(
          position.x,
          position.y,
          'normal'
        )
      )
    }

    for (
      let i = 0;
      i < eliteCount;
      i++
    ) {
      const position =
        this.getEncounterSpawnPosition(
          zone
        )

      spawned.push(
        this.enemyManager.spawnAt(
          position.x,
          position.y,
          'elite'
        )
      )
    }

    return spawned
  }

  private getEncounterSpawnPosition(
    zone:
      EncounterZone
  ) {
    const angle =
      Phaser.Math.FloatBetween(
        0,
        Math.PI * 2
      )

    const distance =
      Phaser.Math.Between(
        100,
        zone.radius
      )

    return {
      x:
        zone.x +
        Math.cos(
          angle
        ) *
        distance,

      y:
        zone.y +
        Math.sin(
          angle
        ) *
        distance,
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
          ENEMY_STATS.wyrm.health,
          ENEMY_STATS.wyrm.health
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

    this.playerStats.health -=
      amount

    this.playerStats.health =
      Math.max(
        0,
        this.playerStats.health
      )

    this.hud.updateHealth(
      this.playerStats
    )

    this.player.showDamageFlash()

    this.cameras.main.shake(
      120,
      0.008
    )

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

    this.playerStats.health =
      0

    this.hud.updateHealth(
      this.playerStats
    )

    this.input.keyboard?.resetKeys()

    this.player.destroy()

    this.hud.showGameOver(
      this.killCount,
      () => {
        this.scene.restart()
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

    if (
      weapon ===
      'greatsword'
    ) {
      this.hud.setComboVisible(
        true
      )

      this.hud.updateCombo(
        0,
        0,
        700,
        180,
        420,
        false,
        false
      )
    } else {
      this.hud.hideCombo()
    }
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

    if (
      item.weaponType ===
      'greatsword'
    ) {
      this.hud.setComboVisible(
        true
      )

      this.hud.updateCombo(
        0,
        0,
        700,
        180,
        420,
        false,
        false
      )
    } else {
      this.hud.hideCombo()
    }
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

    this.enemyManager.removeEnemy(
      enemy
    )

    if (
      enemyType ===
      'wyrm'
    ) {
      this.handleWyrmDeath(
        x,
        y
      )
    } else {
      this.createDeathBurst(
        x,
        y
      )

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
  this.inventorySystem.addItem(
    item
  )

  this.hud.showLootMessage(
    `${item.name.toUpperCase()}\n` +
    `ADDED TO BACKPACK\n` +
    `PRESS I TO VIEW`
  )

  console.log(
    'Weapon added to inventory:',
    item
  )
}

  private handleRedBoxCollected() {
    this.rareCount++

    this.setWeapon(
      'photonLance'
    )

    this.hud.showRareLootMessage(
      'PHOTON LANCE'
    )

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
    const timeMs =
      this.time.now -
      this.runStartTime

    this.scene.start(
      'ResultsScene',
      {
        kills:
          this.killCount,

        level:
          this.playerStats.level,

        rares:
          this.rareCount,

        timeMs,
      }
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

  private createDeathBurst(
    x:
      number,

    y:
      number
  ) {
    for (
      let i = 0;
      i < 8;
      i++
    ) {
      const particle =
        this.add.rectangle(
          x,
          y,
          6,
          6,
          0xff8844
        )

      const angle =
        Phaser.Math.FloatBetween(
          0,
          Math.PI * 2
        )

      const speed =
        Phaser.Math.FloatBetween(
          80,
          180
        )

      this.tweens.add({
        targets:
          particle,

        x:
          x +
          Math.cos(
            angle
          ) *
          speed,

        y:
          y +
          Math.sin(
            angle
          ) *
          speed,

        alpha:
          0,

        scale:
          0,

        duration:
          300,

        ease:
          'Power2',

        onComplete:
          () => {
            particle.destroy()
          },
      })
    }
  }
}