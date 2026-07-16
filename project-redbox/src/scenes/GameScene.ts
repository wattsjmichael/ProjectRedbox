import Phaser from 'phaser'

import type {
  WeaponType,
} from '../weapons/WeaponTypes'

import type {
  LootType,
} from '../loot/LootTypes'

import type {
  EncounterZone,
} from '../encounters/EncounterTypes'

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

  private isGameOver =
    false

  private playerStats =
    createDefaultPlayerStats()

  private progression!:
    ProgressionSystem

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

    this.createWeaponSystem()

    this.createLootSystem()

    this.createEncounterManager()

    this.setupCamera()

    this.createHUD()

    this.createCrosshair()

    this.setupDebugControls()
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

    this.isGameOver =
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

    // Temporary visual landmarks.

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
          (amount) => {
            this.damagePlayer(
              amount
            )
          },
      })
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
          (enemy) =>
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
          },

        killEnemy:
          (enemy) => {
            this.killEnemy(
              enemy
            )
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

        onLootCollected:
          (type) => {
            this.handleLootCollected(
              type
            )
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
          (zone) => {
            this.triggerEncounter(
              zone
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
    // Temporary weapon shortcuts.

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
  }

  update(
    _: number,
    delta: number
  ) {
    if (
      this.isGameOver
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
    zone: EncounterZone
  ) {
    this.hud.showEncounterMessage(
      'HOSTILES DETECTED'
    )

    for (
      let i = 0;
      i < zone.enemyCount;
      i++
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

      const x =
        zone.x +
        Math.cos(
          angle
        ) *
          distance

      const y =
        zone.y +
        Math.sin(
          angle
        ) *
          distance

      this.enemyManager.spawnAt(
        x,
        y
      )
    }
  }

  private damagePlayer(
    amount: number
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
    weapon: WeaponType
  ) {
    this.weaponSystem.setWeapon(
      weapon
    )

    this.hud.updateWeapon(
      weapon
    )
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

    this.enemyManager.removeEnemy(
      enemy
    )

    this.createDeathBurst(
      x,
      y
    )

    this.lootSystem.tryDrop(
      x,
      y
    )

    const gains =
      this.progression.addXP(
        1
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

    this.cameras.main.shake(
      80,
      0.003
    )
  }

  private handleLootCollected(
    type: LootType
  ) {
    if (
      type ===
        'rifle' ||
      type ===
        'scattergun' ||
      type ===
        'cannon'
    ) {
      this.setWeapon(
        type
      )

      this.hud.showLootMessage(
        `${type.toUpperCase()} EQUIPPED`
      )

      return
    }

    if (
      type ===
      'redbox'
    ) {
      this.setWeapon(
        'photonLance'
      )

      this.hud.showRareLootMessage(
        'PHOTON LANCE'
      )
    }
  }

  private createDeathBurst(
    x: number,
    y: number
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