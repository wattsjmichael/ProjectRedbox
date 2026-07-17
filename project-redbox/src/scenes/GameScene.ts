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

  private wyrmSpawned =
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

    this.setupCamera()

    this.createHUD()

    this.createWeaponSystem()

    this.createLootSystem()

    this.createEncounterManager()

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

    this.wyrmSpawned =
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
          (
            type
          ) => {
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

      const enemy =
        this.enemyManager.spawnAt(
          position.x,
          position.y,
          'normal'
        )

      spawned.push(
        enemy
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

      const enemy =
        this.enemyManager.spawnAt(
          position.x,
          position.y,
          'elite'
        )

      spawned.push(
        enemy
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
    x: number,
    y: number
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

  private handleLootCollected(
    type:
      LootType
  ) {
    if (
      type ===
        'rifle' ||
      type ===
        'scattergun' ||
      type ===
        'cannon' ||
      type ===
        'greatsword'
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