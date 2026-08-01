import Phaser from 'phaser'

import type {
  EnemyState,
  EnemyType,
} from './EnemyTypes'

import {
  EnemyType as EnemyTypes,
  ENEMY_BEHAVIORS,
  ENEMY_STATS,
} from './EnemyTypes'

import type {
  DropScaling,
} from '../progression/DropScalingSystem'

import {
  GAMEPLAY_DISPLAY,
  GAMEPLAY_TEXTURES,
  hasGameplayTexture,
} from '../assets/GameplayArt'

interface EnemyManagerConfig {
  scene: Phaser.Scene

  player:
    Phaser.GameObjects.Rectangle

  onPlayerDamage:
    (
      amount: number
    ) => void

  canDamagePlayerFrom?:
    (
      x: number,
      y: number
    ) => boolean

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

  private canDamagePlayerFrom:
    NonNullable<
      EnemyManagerConfig['canDamagePlayerFrom']
    >

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

    this.canDamagePlayerFrom =
      config.canDamagePlayerFrom ??
      (() => true)

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
      ) ?? EnemyTypes.Basic
    )
  }

  syncEnemyVisualPosition(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    this.syncEnemyVisual(
      enemy
    )
  }

  getMaxHealth(
    type:
      EnemyType
  ) {
    const multiplier =
      type === EnemyTypes.Wyrm
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
    type: EnemyType = EnemyTypes.Basic
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
    enemy.setData(
      'behaviorState',
      type === EnemyTypes.Wyrm
        ? 'pursue'
        : 'spawn'
    )
    enemy.setData(
      'stateTimer',
      type === EnemyTypes.Wyrm
        ? 0
        : 260
    )
    enemy.setData(
      'velocityX',
      0
    )
    enemy.setData(
      'velocityY',
      0
    )
    enemy.setData(
      'strafeDirection',
      Math.random() < 0.5
        ? -1
        : 1
    )
    enemy.setData(
      'attackDamageActive',
      false
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
      EnemyTypes.Elite
    ) {
      this.createEliteEffect(
        enemy,
        visual
      )
    }

    if (
      type ===
      EnemyTypes.Wyrm
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
      EnemyTypes.Wyrm
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
          EnemyTypes.Wyrm &&
        distanceToPlayer >
          this.chaseDistance
      ) {
        continue
      }

      // Wyrm pauses while telegraphing slam.
      if (
        type ===
          EnemyTypes.Wyrm &&
        this.wyrmSlamInProgress
      ) {
        continue
      }

      if (
        type ===
        EnemyTypes.Wyrm
      ) {
        this.moveToward(
          enemy,
          this.player.x,
          this.player.y,
          ENEMY_STATS[type].speed,
          delta,
          1
        )
      } else {
        this.updateRegularEnemy(
          enemy,
          type,
          distanceToPlayer,
          delta
        )
      }

      this.syncEnemyVisual(
        enemy
      )
    }
  }

  private updateRegularEnemy(
    enemy:
      Phaser.GameObjects.Rectangle,
    type:
      EnemyType,
    distanceToPlayer:
      number,
    delta:
      number
  ) {
    const config =
      ENEMY_BEHAVIORS[type]
    const state =
      (
        enemy.getData(
          'behaviorState'
        ) ?? 'spawn'
      ) as EnemyState
    const timer =
      Math.max(
        0,
        Number(
          enemy.getData(
            'stateTimer'
          ) ?? 0
        ) - delta
      )

    enemy.setData(
      'stateTimer',
      timer
    )

    if (state === 'spawn') {
      if (timer <= 0) {
        this.setEnemyState(
          enemy,
          'pursue'
        )
      }
      return
    }

    if (state === 'telegraph') {
      if (timer <= 0) {
        this.beginEnemyAttack(
          enemy,
          type
        )
      }
      return
    }

    if (state === 'attack') {
      this.updateEnemyAttack(
        enemy,
        type,
        delta
      )

      if (
        Number(
          enemy.getData(
            'stateTimer'
          )
        ) <= 0
      ) {
        this.finishEnemyAttack(
          enemy,
          type
        )
      }
      return
    }

    if (state === 'recover') {
      this.dampenVelocity(
        enemy,
        delta,
        type === EnemyTypes.Fast
          ? 8
          : 12
      )

      if (timer <= 0) {
        this.setEnemyState(
          enemy,
          'pursue',
          config.reengagementDelay
        )
      }
      return
    }

    if (
      timer > 0 &&
      state === 'pursue'
    ) {
      this.dampenVelocity(
        enemy,
        delta,
        5
      )
      return
    }

    if (
      distanceToPlayer <=
      config.attackRange
    ) {
      this.startEnemyTelegraph(
        enemy,
        type
      )
      return
    }

    if (
      type === EnemyTypes.Fast
    ) {
      this.moveFastEnemy(
        enemy,
        delta
      )
      return
    }

    if (
      type === EnemyTypes.Tank &&
      distanceToPlayer <
        config.preferredRange *
        0.72
    ) {
      const awayAngle =
        Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          enemy.x,
          enemy.y
        )
      this.moveToward(
        enemy,
        enemy.x +
          Math.cos(awayAngle) *
          80,
        enemy.y +
          Math.sin(awayAngle) *
          80,
        ENEMY_STATS[type].speed *
          0.65,
        delta,
        config.turnResponsiveness
      )
      return
    }

    this.moveToward(
      enemy,
      this.player.x,
      this.player.y,
      ENEMY_STATS[type].speed,
      delta,
      config.turnResponsiveness
    )
  }

  private moveFastEnemy(
    enemy:
      Phaser.GameObjects.Rectangle,
    delta:
      number
  ) {
    const side =
      Number(
        enemy.getData(
          'strafeDirection'
        ) ?? 1
      )
    const playerAngle =
      Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      )
    const flankAngle =
      playerAngle +
      side * 0.82
    const targetX =
      this.player.x -
      Math.cos(flankAngle) *
      ENEMY_BEHAVIORS.fast
        .preferredRange
    const targetY =
      this.player.y -
      Math.sin(flankAngle) *
      ENEMY_BEHAVIORS.fast
        .preferredRange

    this.moveToward(
      enemy,
      targetX,
      targetY,
      ENEMY_STATS.fast.speed,
      delta,
      ENEMY_BEHAVIORS.fast
        .turnResponsiveness
    )
  }

  private startEnemyTelegraph(
    enemy:
      Phaser.GameObjects.Rectangle,
    type:
      EnemyType
  ) {
    const config =
      ENEMY_BEHAVIORS[type]
    const angle =
      Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      )

    enemy.setData(
      'attackAngle',
      angle
    )
    this.setEnemyState(
      enemy,
      'telegraph',
      config.attackWindup
    )
    this.dampenVelocity(
      enemy,
      1000,
      20
    )

    const radius =
      type === EnemyTypes.Tank
        ? config.attackRange
        : Math.max(
          18,
          ENEMY_STATS[type].size *
            0.7
        )
    const marker =
      this.scene.add.circle(
        enemy.x,
        enemy.y,
        radius,
        type === EnemyTypes.Tank
          ? 0xff5522
          : 0xffaa44,
        type === EnemyTypes.Tank
          ? 0.1
          : 0.18
      )
        .setStrokeStyle(
          type === EnemyTypes.Tank
            ? 3
            : 2,
          type === EnemyTypes.Tank
            ? 0xff7744
            : 0xffcc66,
          0.85
        )
        .setDepth(8)

    marker.setScale(
      0.35
    )
    enemy.setData(
      'attackTelegraph',
      marker
    )
    this.scene.tweens.add({
      targets: marker,
      scale: 1,
      alpha:
        type === EnemyTypes.Tank
          ? 0.32
          : 0.5,
      duration:
        config.attackWindup,
      ease: 'Quad.Out',
    })
  }

  private beginEnemyAttack(
    enemy:
      Phaser.GameObjects.Rectangle,
    type:
      EnemyType
  ) {
    this.destroyAttackTelegraph(
      enemy
    )
    this.setEnemyState(
      enemy,
      'attack',
      ENEMY_BEHAVIORS[type]
        .attackDuration
    )
    enemy.setData(
      'attackDamageActive',
      type !== EnemyTypes.Tank
    )

    if (type === EnemyTypes.Fast) {
      const angle =
        Number(
          enemy.getData(
            'attackAngle'
          ) ?? 0
        )
      enemy.setData(
        'velocityX',
        Math.cos(angle) * 430
      )
      enemy.setData(
        'velocityY',
        Math.sin(angle) * 430
      )
    }

    if (type === EnemyTypes.Tank) {
      this.performTankSlam(
        enemy
      )
    }
  }

  private updateEnemyAttack(
    enemy:
      Phaser.GameObjects.Rectangle,
    type:
      EnemyType,
    delta:
      number
  ) {
    if (type === EnemyTypes.Fast) {
      enemy.x +=
        Number(
          enemy.getData(
            'velocityX'
          ) ?? 0
        ) *
        delta /
        1000
      enemy.y +=
        Number(
          enemy.getData(
            'velocityY'
          ) ?? 0
        ) *
        delta /
        1000
      return
    }

    if (
      type === EnemyTypes.Basic ||
      type === EnemyTypes.Elite
    ) {
      this.moveToward(
        enemy,
        this.player.x,
        this.player.y,
        ENEMY_STATS[type].speed *
          0.75,
        delta,
        1
      )
    }
  }

  private finishEnemyAttack(
    enemy:
      Phaser.GameObjects.Rectangle,
    type:
      EnemyType
  ) {
    enemy.setData(
      'attackDamageActive',
      false
    )
    this.setEnemyState(
      enemy,
      'recover',
      ENEMY_BEHAVIORS[type]
        .recoveryDuration
    )
  }

  private performTankSlam(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    const radius =
      ENEMY_BEHAVIORS.tank
        .attackRange
    const impact =
      this.scene.add.circle(
        enemy.x,
        enemy.y,
        radius,
        0xff6633,
        0.36
      )
        .setStrokeStyle(
          4,
          0xffaa55,
          0.9
        )
        .setDepth(9)

    this.scene.tweens.add({
      targets: impact,
      scale: 1.18,
      alpha: 0,
      duration: 260,
      onComplete: () =>
        impact.destroy(),
    })

    if (
      Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      ) <= radius &&
      this.canDamagePlayerFrom(
        enemy.x,
        enemy.y
      )
    ) {
      this.damagePlayerFrom(
        EnemyTypes.Tank
      )
    }
  }

  private moveToward(
    enemy:
      Phaser.GameObjects.Rectangle,
    targetX:
      number,
    targetY:
      number,
    speed:
      number,
    delta:
      number,
    turnResponsiveness:
      number
  ) {
    const angle =
      Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        targetX,
        targetY
      )
    const desiredX =
      Math.cos(angle) *
      speed
    const desiredY =
      Math.sin(angle) *
      speed
    const blend =
      Phaser.Math.Clamp(
        turnResponsiveness *
        delta /
        16.67,
        0,
        1
      )
    const velocityX =
      Phaser.Math.Linear(
        Number(
          enemy.getData(
            'velocityX'
          ) ?? 0
        ),
        desiredX,
        blend
      )
    const velocityY =
      Phaser.Math.Linear(
        Number(
          enemy.getData(
            'velocityY'
          ) ?? 0
        ),
        desiredY,
        blend
      )

    enemy.setData(
      'velocityX',
      velocityX
    )
    enemy.setData(
      'velocityY',
      velocityY
    )
    enemy.x +=
      velocityX *
      delta /
      1000
    enemy.y +=
      velocityY *
      delta /
      1000
  }

  private dampenVelocity(
    enemy:
      Phaser.GameObjects.Rectangle,
    delta:
      number,
    strength:
      number
  ) {
    const factor =
      Math.max(
        0,
        1 -
        strength *
        delta /
        1000
      )
    enemy.setData(
      'velocityX',
      Number(
        enemy.getData(
          'velocityX'
        ) ?? 0
      ) * factor
    )
    enemy.setData(
      'velocityY',
      Number(
        enemy.getData(
          'velocityY'
        ) ?? 0
      ) * factor
    )
  }

  private setEnemyState(
    enemy:
      Phaser.GameObjects.Rectangle,
    state:
      EnemyState,
    duration = 0
  ) {
    enemy.setData(
      'behaviorState',
      state
    )
    enemy.setData(
      'stateTimer',
      duration
    )
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

      if (
        type !== EnemyTypes.Wyrm &&
        enemy.getData(
          'attackDamageActive'
        ) !== true
      ) {
        continue
      }

      this.damagePlayerFrom(
        type
      )
      enemy.setData(
        'attackDamageActive',
        false
      )

      break
    }
  }

  private damagePlayerFrom(
    type:
      EnemyType
  ) {
    if (
      this.playerDamageCooldown >
      0
    ) {
      return
    }

    const damage =
      ENEMY_STATS[
        type
      ].contactDamage *
      (
        type === EnemyTypes.Wyrm
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
      EnemyTypes.Wyrm
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
    const texture =
      type === EnemyTypes.Wyrm
        ? GAMEPLAY_TEXTURES.wyrm
        : type === EnemyTypes.Elite
          ? GAMEPLAY_TEXTURES
            .enemyElite
          : GAMEPLAY_TEXTURES
            .enemyBasicProof
    const display =
      type === EnemyTypes.Wyrm
        ? GAMEPLAY_DISPLAY.enemyBoss
        : type === EnemyTypes.Elite
          ? GAMEPLAY_DISPLAY
            .enemyElite
          : GAMEPLAY_DISPLAY
            .enemyStandard

    if (
      !hasGameplayTexture(
        this.scene,
        texture.key
      )
    ) {
      return null
    }

    const visual =
      this.scene.add.sprite(
      enemy.x,
      enemy.y,
      texture.key
    )
      .setDisplaySize(
        display.width,
        display.height
      )
      .setOrigin(
        display.originX,
        display.originY
      )
      .setDepth(
        display.depth
      )

    if (
      type === EnemyTypes.Fast
    ) {
      visual.setDisplaySize(
        52,
        36
      )
      visual.setTint(
        0xffaa77
      )
    } else if (
      type === EnemyTypes.Tank
    ) {
      visual.setDisplaySize(
        88,
        67
      )
      visual.setTint(
        0xaa7755
      )
    }

    return visual
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

    const telegraph =
      enemy.getData(
        'attackTelegraph'
      ) as
        | Phaser.GameObjects.Arc
        | undefined

    telegraph?.setPosition(
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

    this.destroyAttackTelegraph(
      enemy
    )
  }

  private destroyAttackTelegraph(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    const marker =
      enemy.getData(
        'attackTelegraph'
      ) as
        | Phaser.GameObjects.Arc
        | undefined

    if (marker?.active) {
      this.scene.tweens.killTweensOf(
        marker
      )
      marker.destroy()
    }

    enemy.setData(
      'attackTelegraph',
      undefined
    )
  }
}
