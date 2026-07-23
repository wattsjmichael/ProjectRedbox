import Phaser from 'phaser'

import type {
  EnemyType,
} from './EnemyTypes'

import {
  ENEMY_STATS,
} from './EnemyTypes'

import type {
  DropScaling,
} from '../progression/DropScalingSystem'

interface EnemyManagerConfig {
  scene: Phaser.Scene

  player:
    Phaser.GameObjects.Rectangle

  onPlayerDamage:
    (
      amount: number
    ) => void

  scaling:
    DropScaling
}

export class EnemyManager {
  private scene:
    Phaser.Scene

  private player:
    Phaser.GameObjects.Rectangle

  private enemies:
    Phaser.GameObjects.Rectangle[] = []

  private enemyHealth =
    new Map<
      Phaser.GameObjects.Rectangle,
      number
    >()

  private enemyTypes =
    new Map<
      Phaser.GameObjects.Rectangle,
      EnemyType
    >()

  private playerDamageCooldown =
    0

  private readonly chaseDistance =
    500

  private readonly damageCooldown =
    500

  private onPlayerDamage:
    EnemyManagerConfig['onPlayerDamage']

  private scaling:
    DropScaling

  // WYRM BOSS STATE

  private wyrm:
    Phaser.GameObjects.Rectangle |
    null = null

  private wyrmSlamTimer =
    0

  private readonly wyrmSlamCooldown =
    3500

  private wyrmSlamInProgress =
    false

  constructor(
    config:
      EnemyManagerConfig
  ) {
    this.scene =
      config.scene

    this.player =
      config.player

    this.onPlayerDamage =
      config.onPlayerDamage

    this.scaling =
      config.scaling
  }

  getEnemies() {
    return this.enemies
  }

  getEnemyHealth(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    return (
      this.enemyHealth.get(
        enemy
      ) ?? 1
    )
  }

  setEnemyHealth(
    enemy:
      Phaser.GameObjects.Rectangle,

    health:
      number
  ) {
    this.enemyHealth.set(
      enemy,
      health
    )
  }

  getEnemyType(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    return (
      this.enemyTypes.get(
        enemy
      ) ?? 'normal'
    )
  }

  getMaxHealth(
    type:
      EnemyType
  ) {
    const multiplier =
      type === 'wyrm'
        ? this.scaling
          .wyrmHealthMultiplier
        : this.scaling
          .enemyHealthMultiplier

    return (
      ENEMY_STATS[type].health *
      multiplier
    )
  }

  getWyrm() {
    return this.wyrm
  }

  isWyrmAlive() {
    return (
      this.wyrm !==
        null &&
      this.wyrm.active
    )
  }

  spawnAt(
    x: number,
    y: number,
    type: EnemyType = 'normal'
  ) {
    const stats =
      ENEMY_STATS[
        type
      ]

    const enemy =
      this.scene.add.rectangle(
        x,
        y,
        stats.size,
        stats.size,
        stats.color
      )

    enemy.setData(
      'enemyType',
      type
    )

    this.enemyHealth.set(
      enemy,
      this.getMaxHealth(
        type
      )
    )

    this.enemyTypes.set(
      enemy,
      type
    )

    this.enemies.push(
      enemy
    )

    if (
      type ===
      'elite'
    ) {
      this.createEliteEffect(
        enemy
      )
    }

    if (
      type ===
      'wyrm'
    ) {
      this.createWyrmEffect(
        enemy
      )

      this.wyrm =
        enemy

      this.wyrmSlamTimer =
        0
    }

    return enemy
  }

  spawnWyrm(
    x: number,
    y: number
  ) {
    if (
      this.isWyrmAlive()
    ) {
      return (
        this.wyrm!
      )
    }

    return this.spawnAt(
      x,
      y,
      'wyrm'
    )
  }

  private createEliteEffect(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    enemy.setStrokeStyle(
      3,
      0xffffff,
      0.8
    )

    this.scene.tweens.add({
      targets:
        enemy,

      scale:
        1.12,

      duration:
        400,

      yoyo:
        true,

      repeat:
        -1,
    })
  }

  private createWyrmEffect(
    wyrm:
      Phaser.GameObjects.Rectangle
  ) {
    wyrm.setStrokeStyle(
      5,
      0xff4444,
      1
    )

    wyrm.setScale(
      0.2
    )

    wyrm.setAlpha(
      0
    )

    this.scene.tweens.add({
      targets:
        wyrm,

      scale:
        1,

      alpha:
        1,

      duration:
        700,

      ease:
        'Back.Out',

      onComplete:
        () => {
          this.scene.cameras.main.shake(
            300,
            0.02
          )
        },
    })
  }

  update(
    delta: number
  ) {
    if (
      !this.player.active
    ) {
      return
    }

    this.moveEnemies(
      delta
    )

    this.checkPlayerCollision(
      delta
    )

    this.updateWyrm(
      delta
    )
  }

  private moveEnemies(
    delta: number
  ) {
    for (
      const enemy of
        this.enemies
    ) {
      if (
        !enemy.active
      ) {
        continue
      }

      const hitStopRemaining =
        Number(
          enemy.getData(
            'hitStopRemaining'
          ) ?? 0
        )

      if (
        hitStopRemaining > 0
      ) {
        enemy.setData(
          'hitStopRemaining',
          Math.max(
            0,
            hitStopRemaining -
            delta
          )
        )
        continue
      }

      const type =
        this.getEnemyType(
          enemy
        )

      const stats =
        ENEMY_STATS[
          type
        ]

      const distanceToPlayer =
        Phaser.Math.Distance.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        )

      // Wyrm always pursues.
      // Regular enemies have limited aggro range.
      if (
        type !==
          'wyrm' &&
        distanceToPlayer >
          this.chaseDistance
      ) {
        continue
      }

      // Wyrm pauses while telegraphing slam.
      if (
        type ===
          'wyrm' &&
        this.wyrmSlamInProgress
      ) {
        continue
      }

      const angle =
        Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        )

      const movement =
        stats.speed *
        (delta / 1000)

      enemy.x +=
        Math.cos(
          angle
        ) *
        movement

      enemy.y +=
        Math.sin(
          angle
        ) *
        movement
    }
  }

  private updateWyrm(
    delta: number
  ) {
    if (
      !this.isWyrmAlive()
    ) {
      return
    }

    if (
      this.wyrmSlamInProgress
    ) {
      return
    }

    this.wyrmSlamTimer +=
      delta

    if (
      this.wyrmSlamTimer <
      this.wyrmSlamCooldown
    ) {
      return
    }

    this.wyrmSlamTimer =
      0

    this.startWyrmSlam()
  }

  private startWyrmSlam() {
    if (
      !this.wyrm ||
      !this.wyrm.active ||
      !this.player.active
    ) {
      return
    }

    this.wyrmSlamInProgress =
      true

    // Lock the slam target
    // to where the player was
    // when the warning appeared.
    const targetX =
      this.player.x

    const targetY =
      this.player.y

    const radius =
      110

    // Shadow / danger telegraph.
    const shadow =
      this.scene.add.circle(
        targetX,
        targetY,
        radius,
        0xff0000,
        0.15
      )

    shadow.setStrokeStyle(
      4,
      0xff3333,
      0.8
    )

    shadow.setScale(
      0.25
    )

    this.scene.tweens.add({
      targets:
        shadow,

      scale:
        1,

      alpha:
        0.4,

      duration:
        800,

      ease:
        'Power2',
    })

    // Make Wyrm visually prepare.
    this.scene.tweens.add({
      targets:
        this.wyrm,

      scaleX:
        1.2,

      scaleY:
        0.8,

      duration:
        400,

      yoyo:
        true,
    })

    // Impact after telegraph.
    this.scene.time.delayedCall(
      850,
      () => {
        if (
          !this.player.active
        ) {
          shadow.destroy()

          this.wyrmSlamInProgress =
            false

          return
        }

        const impact =
          this.scene.add.circle(
            targetX,
            targetY,
            radius,
            0xff5500,
            0.7
          )

        impact.setScale(
          0.4
        )

        this.scene.tweens.add({
          targets:
            impact,

          scale:
            1.5,

          alpha:
            0,

          duration:
            300,

          onComplete:
            () => {
              impact.destroy()
            },
        })

        this.scene.cameras.main.shake(
          250,
          0.025
        )

        const playerDistance =
          Phaser.Math.Distance.Between(
            targetX,
            targetY,
            this.player.x,
            this.player.y
          )

        if (
          playerDistance <=
          radius
        ) {
          this.onPlayerDamage(
            ENEMY_STATS.wyrm
              .contactDamage *
            this.scaling
              .wyrmDamageMultiplier
          )
        }

        if (
          shadow.active
        ) {
          shadow.destroy()
        }

        this.wyrmSlamInProgress =
          false
      }
    )
  }

  private checkPlayerCollision(
    delta: number
  ) {
    if (
      this.playerDamageCooldown >
      0
    ) {
      this.playerDamageCooldown -=
        delta
    }

    if (
      this.playerDamageCooldown >
      0
    ) {
      return
    }

    for (
      const enemy of
        this.enemies
    ) {
      if (
        !enemy.active
      ) {
        continue
      }

      const hit =
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          enemy.getBounds()
        )

      if (
        !hit
      ) {
        continue
      }

      const type =
        this.getEnemyType(
          enemy
        )

      const damage =
        ENEMY_STATS[
          type
        ].contactDamage *
        (
          type === 'wyrm'
            ? this.scaling
              .wyrmDamageMultiplier
            : this.scaling
              .enemyDamageMultiplier
        )

      this.onPlayerDamage(
        damage
      )

      this.playerDamageCooldown =
        this.damageCooldown

      break
    }
  }

  removeEnemy(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    const type =
      this.getEnemyType(
        enemy
      )

    const index =
      this.enemies.indexOf(
        enemy
      )

    if (
      index !==
      -1
    ) {
      this.enemies.splice(
        index,
        1
      )
    }

    this.enemyHealth.delete(
      enemy
    )

    this.enemyTypes.delete(
      enemy
    )

    if (
      type ===
      'wyrm'
    ) {
      this.wyrm =
        null

      this.wyrmSlamInProgress =
        false

      this.wyrmSlamTimer =
        0
    }

    if (
      enemy.active
    ) {
      enemy.destroy()
    }
  }

  destroyAll() {
    for (
      const enemy of
        this.enemies
    ) {
      if (
        enemy.active
      ) {
        enemy.destroy()
      }
    }

    this.enemies =
      []

    this.enemyHealth.clear()

    this.enemyTypes.clear()

    this.playerDamageCooldown =
      0

    this.wyrm =
      null

    this.wyrmSlamTimer =
      0

    this.wyrmSlamInProgress =
      false
  }
}
