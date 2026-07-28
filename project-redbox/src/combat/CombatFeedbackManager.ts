import Phaser from 'phaser'

import type {
  EnemyType,
} from '../enemies/EnemyTypes'

import type {
  WeaponType,
} from '../weapons/WeaponTypes'

export interface WeaponFeedbackProfile {
  color: number
  hitStopMs: number
  finisherHitStopMs: number
  impactScale: number
  particleCount: number
  shakeDuration: number
  shakeIntensity: number
}

export const WEAPON_FEEDBACK:
  Record<
    WeaponType,
    WeaponFeedbackProfile
  > = {
    rifle: {
      color: 0xffff88,
      hitStopMs: 24,
      finisherHitStopMs: 62,
      impactScale: 12,
      particleCount: 3,
      shakeDuration: 35,
      shakeIntensity: 0.0015,
    },
    scattergun: {
      color: 0xffaa44,
      hitStopMs: 30,
      finisherHitStopMs: 72,
      impactScale: 18,
      particleCount: 5,
      shakeDuration: 55,
      shakeIntensity: 0.0035,
    },
    cannon: {
      color: 0xff5533,
      hitStopMs: 45,
      finisherHitStopMs: 88,
      impactScale: 26,
      particleCount: 7,
      shakeDuration: 85,
      shakeIntensity: 0.007,
    },
    photonLance: {
      color: 0x55ffff,
      hitStopMs: 22,
      finisherHitStopMs: 64,
      impactScale: 16,
      particleCount: 5,
      shakeDuration: 40,
      shakeIntensity: 0.0025,
    },
    greatsword: {
      color: 0xffdddd,
      hitStopMs: 40,
      finisherHitStopMs: 92,
      impactScale: 24,
      particleCount: 7,
      shakeDuration: 80,
      shakeIntensity: 0.0065,
    },
  }

export class CombatFeedbackManager {
  private readonly scene:
    Phaser.Scene

  private lastShakeAt =
    -Infinity

  private readonly shakeCooldownMs =
    55

  private reactionTweens =
    new Map<
      Phaser.GameObjects.GameObject,
      Phaser.Tweens.Tween
    >()

  private reactionBaseScales =
    new WeakMap<
      Phaser.GameObjects.GameObject,
      {
        x: number
        y: number
      }
    >()

  private active =
    true

  constructor(
    scene: Phaser.Scene
  ) {
    this.scene =
      scene

    scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => this.destroy()
    )
  }

  playAttack(
    weapon: WeaponType,
    comboStep: number
  ) {
    const profile =
      WEAPON_FEEDBACK[weapon]
    const finisher =
      comboStep === 3

    this.requestShake(
      finisher
        ? profile.shakeDuration
        : Math.round(
          profile.shakeDuration *
          0.55
        ),
      finisher
        ? profile.shakeIntensity
        : profile.shakeIntensity *
          0.45
    )

    this.scene.events.emit(
      finisher
        ? 'combat-audio:combo-finisher'
        : 'combat-audio:weapon-fire',
      weapon,
      comboStep
    )
  }

  playHit(
    enemy:
      Phaser.GameObjects.Rectangle,
    weapon: WeaponType,
    comboStep: number,
    options: {
      critical?: boolean
      perfect?: boolean
    } = {}
  ) {
    if (
      !this.active ||
      !enemy.active
    ) {
      return
    }

    const profile =
      WEAPON_FEEDBACK[weapon]
    const type =
      (
        enemy.getData(
          'enemyType'
        ) ?? 'normal'
      ) as EnemyType
    const finisher =
      comboStep === 3
    const heavy =
      finisher ||
      options.critical === true ||
      options.perfect === true
    const resistance =
      type === 'wyrm'
        ? 0.5
        : type === 'elite'
          ? 0.72
          : 1
    const hitStop =
      (
        finisher
          ? profile
            .finisherHitStopMs
          : profile.hitStopMs
      ) *
      resistance

    enemy.setData(
      'hitStopRemaining',
      Math.max(
        Number(
          enemy.getData(
            'hitStopRemaining'
          ) ?? 0
        ),
        hitStop
      )
    )

    this.flashAndPunchEnemy(
      enemy,
      type,
      profile.color,
      heavy
    )
    this.createImpact(
      enemy.x,
      enemy.y,
      profile,
      heavy
    )
    this.requestShake(
      heavy
        ? profile.shakeDuration
        : Math.round(
          profile.shakeDuration *
          0.55
        ),
      heavy
        ? profile.shakeIntensity
        : profile.shakeIntensity *
          0.55
    )

    this.scene.events.emit(
      'combat-audio:weapon-hit',
      weapon,
      comboStep
    )
  }

  playEnemyDeath(
    enemy:
      Phaser.GameObjects.Rectangle,
    type: EnemyType
  ) {
    if (!this.active) {
      return
    }

    const visual =
      enemy.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined
    const color =
      type === 'wyrm'
        ? 0xff3322
        : type === 'elite'
          ? 0xff44aa
          : 0xffaa66
    const size =
      type === 'wyrm'
        ? 58
        : type === 'elite'
          ? 30
          : 20
    const burst =
      this.scene.add.circle(
        enemy.x,
        enemy.y,
        size,
        color,
        0.72
      )
        .setDepth(
          visual?.depth ?? 5
        )

    this.scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale:
        type === 'wyrm'
          ? 2.5
          : 1.8,
      duration:
        type === 'wyrm'
          ? 420
          : 180,
      ease: 'Quad.Out',
      onComplete: () =>
        burst.destroy(),
    })

    if (
      type === 'elite' ||
      type === 'wyrm'
    ) {
      this.requestShake(
        type === 'wyrm'
          ? 180
          : 70,
        type === 'wyrm'
          ? 0.012
          : 0.004
      )
    }

    this.scene.events.emit(
      'combat-audio:enemy-death',
      type
    )
  }

  playPlayerHit() {
    this.requestShake(
      100,
      0.007
    )
    this.scene.events.emit(
      'combat-audio:player-hit'
    )
  }

  stop() {
    const camera =
      this.scene.cameras?.main

    if (camera) {
      camera.resetFX()
    }
  }

  destroy() {
    if (!this.active) {
      return
    }

    this.active =
      false
    this.stop()

    for (
      const tween of
      this.reactionTweens.values()
    ) {
      tween.stop()
    }
    this.reactionTweens.clear()
  }

  private flashAndPunchEnemy(
    enemy:
      Phaser.GameObjects.Rectangle,
    type: EnemyType,
    color: number,
    heavy: boolean
  ) {
    const visual =
      enemy.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined
    const target =
      visual?.active
        ? visual
        : enemy
    const existing =
      this.reactionTweens.get(
        target
      )

    existing?.stop()

    if (visual?.active) {
      visual.setTint(
        color
      )
    } else {
      enemy.setFillStyle(
        0xffffff
      )
    }

    if (type === 'wyrm') {
      this.scene.time.delayedCall(
        heavy
          ? 85
          : 55,
        () => {
          if (visual?.active) {
            visual.clearTint()
          }
        }
      )
      return
    }

    const storedScale =
      this.reactionBaseScales.get(
        target
      ) ?? {
        x:
          Math.abs(
            target.scaleX
          ),
        y:
          target.scaleY,
      }
    this.reactionBaseScales.set(
      target,
      storedScale
    )
    const baseScaleX =
      storedScale.x
    const scaleSignX =
      target.scaleX < 0
        ? -1
        : 1
    const baseScaleY =
      storedScale.y
    const resistance =
      type === 'elite'
          ? 0.6
            : 1
    const punch =
      (
        heavy
          ? 0.12
          : 0.07
      ) *
      resistance

    target.setScale(
      baseScaleX *
      scaleSignX,
      baseScaleY
    )

    const tween =
      this.scene.tweens.add({
        targets: target,
        scaleX:
          baseScaleX *
          (1 + punch) *
          scaleSignX,
        scaleY:
          baseScaleY *
          (1 - punch),
        duration:
          heavy
            ? 55
            : 35,
        yoyo: true,
        onComplete: () => {
          this.reactionTweens.delete(
            target
          )
          if (visual?.active) {
            visual.clearTint()
          }
        },
      })

    this.reactionTweens.set(
      target,
      tween
    )
  }

  private createImpact(
    x: number,
    y: number,
    profile:
      WeaponFeedbackProfile,
    heavy: boolean
  ) {
    const scale =
      profile.impactScale *
      (
        heavy
          ? 1.35
          : 1
      )
    const ring =
      this.scene.add.circle(
        x,
        y,
        scale,
        profile.color,
        0.16
      )
        .setStrokeStyle(
          heavy
            ? 3
            : 2,
          profile.color,
          0.95
        )
        .setDepth(20)

    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale:
        heavy
          ? 1.9
          : 1.45,
      duration:
        heavy
          ? 150
          : 90,
      onComplete: () =>
        ring.destroy(),
    })

    for (
      let index = 0;
      index <
      profile.particleCount;
      index++
    ) {
      const angle =
        Phaser.Math.FloatBetween(
          -Math.PI,
          Math.PI
        )
      const distance =
        Phaser.Math.Between(
          Math.round(
            scale * 0.7
          ),
          Math.round(
            scale * 1.5
          )
        )
      const spark =
        this.scene.add.rectangle(
          x,
          y,
          heavy
            ? 5
            : 3,
          2,
          profile.color,
          0.9
        )
          .setRotation(angle)
          .setDepth(21)

      this.scene.tweens.add({
        targets: spark,
        x:
          x +
          Math.cos(angle) *
          distance,
        y:
          y +
          Math.sin(angle) *
          distance,
        alpha: 0,
        duration:
          heavy
            ? 150
            : 95,
        onComplete: () =>
          spark.destroy(),
      })
    }
  }

  private requestShake(
    duration: number,
    intensity: number
  ) {
    if (
      !this.active ||
      intensity <= 0
    ) {
      return
    }

    const now =
      this.scene.time.now

    if (
      now -
      this.lastShakeAt <
      this.shakeCooldownMs
    ) {
      return
    }

    this.lastShakeAt =
      now
    this.scene.cameras.main.shake(
      duration,
      intensity
    )
  }
}
