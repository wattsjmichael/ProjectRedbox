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

import {
  GAMEPLAY_ATLAS,
  GAMEPLAY_DISPLAY,
  GAMEPLAY_FRAMES,
  hasGameplayArt,
} from '../assets/GameplayArt'

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

    const visual =
      this.createEnemyVisual(
        enemy,
        type
      )

    if (visual) {
      enemy.setAlpha(
        0
      )
      enemy.setData(
        'visual',
        visual
      )
    }

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
        enemy,
        visual
      )
    }

    if (
      type ===
      'wyrm'
    ) {
      this.createWyrmEffect(
        enemy,
        visual
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
      Phaser.GameObjects.Rectangle,
    visual:
      Phaser.GameObjects.Sprite |
      null
  ) {
    const target =
      visual ??
      enemy
    const baseScaleX =
      target.scaleX
    const baseScaleY =
      target.scaleY

    this.scene.tweens.add({
      targets:
        target,

      scaleX:
        baseScaleX *
        1.12,
      scaleY:
        baseScaleY *
        1.12,

      duration:
        400,

      yoyo:
        true,

      repeat:
        -1,
    })

    const aura =
      this.scene.add.circle(
        enemy.x,
        enemy.y,
        39,
        0xaa44ff,
        0.08
      )
        .setStrokeStyle(
          3,
          0xcc77ff,
          0.75
        )
        .setDepth(
          GAMEPLAY_DISPLAY.enemyElite
            .depth -
          1
        )

    enemy.setData(
      'eliteAura',
      aura
    )

    this.scene.tweens.add({
      targets:
        aura,
      alpha:
        0.35,
      scale:
        1.12,
      duration:
        650,
      yoyo:
        true,
      repeat:
        -1,
    })
  }

  private createWyrmEffect(
    wyrm:
      Phaser.GameObjects.Rectangle,
    visual:
      Phaser.GameObjects.Sprite |
      null
  ) {
    const target =
      visual ??
      wyrm
    const baseScaleX =
      target.scaleX
    const baseScaleY =
      target.scaleY

    target.setScale(
      baseScaleX * 0.2,
      baseScaleY * 0.2
    )

    target.setAlpha(
      0
    )

    this.scene.tweens.add({
      targets:
        target,

      scaleX:
        baseScaleX,
      scaleY:
        baseScaleY,

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

      this.syncEnemyVisual(
        enemy
      )

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
    const wyrmVisual =
      this.wyrm.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined
    const wyrmTarget =
      wyrmVisual ??
      this.wyrm
    const wyrmScaleX =
      wyrmTarget.scaleX
    const wyrmScaleY =
      wyrmTarget.scaleY

    this.scene.tweens.add({
      targets:
        wyrmTarget,

      scaleX:
        wyrmScaleX *
        1.2,

      scaleY:
        wyrmScaleY *
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

    this.destroyEnemyVisual(
      enemy
    )

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
        this.destroyEnemyVisual(
          enemy
        )
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

  private createEnemyVisual(
    enemy:
      Phaser.GameObjects.Rectangle,
    type:
      EnemyType
  ) {
    if (
      !hasGameplayArt(
        this.scene
      )
    ) {
      return null
    }

    const frame =
      type === 'wyrm'
        ? GAMEPLAY_FRAMES.wyrm
        : type === 'elite'
          ? GAMEPLAY_FRAMES.enemyElite
          : GAMEPLAY_FRAMES.enemyBasic
    const display =
      type === 'wyrm'
        ? GAMEPLAY_DISPLAY.enemyBoss
        : type === 'elite'
          ? GAMEPLAY_DISPLAY.enemyElite
          : GAMEPLAY_DISPLAY.enemyStandard

    return this.scene.add.sprite(
      enemy.x,
      enemy.y,
      GAMEPLAY_ATLAS.key,
      frame
    )
      .setDisplaySize(
        display.width,
        display.height
      )
      .setDepth(
        display.depth
      )
  }

  private syncEnemyVisual(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    const visual =
      enemy.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined

    visual?.setPosition(
      enemy.x,
      enemy.y
    )

    if (visual) {
      const facingAngle =
        Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        )

      visual.setRotation(
        facingAngle
      )
      visual.setFlipX(false)
      visual.setFlipY(
        Math.abs(facingAngle) >
        Math.PI / 2
      )
    }

    const aura =
      enemy.getData(
        'eliteAura'
      ) as
        | Phaser.GameObjects.Arc
        | undefined

    aura?.setPosition(
      enemy.x,
      enemy.y
    )
  }

  private destroyEnemyVisual(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    const visual =
      enemy.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined
    const aura =
      enemy.getData(
        'eliteAura'
      ) as
        | Phaser.GameObjects.Arc
        | undefined

    if (visual?.active) {
      visual.destroy()
    }

    if (aura?.active) {
      aura.destroy()
    }
  }
}
