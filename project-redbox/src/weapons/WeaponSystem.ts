import Phaser from 'phaser'

import type {
  WeaponType,
} from './WeaponTypes'

import type {
  WeaponItem,
} from '../items/ItemTypes'

import {
  WEAPON_COMBO_TIMINGS,
} from './WeaponComboConfig'

import type {
  WeaponAttackStyle,
} from './WeaponComboConfig'

import type {
  CombatFeedbackManager,
} from '../combat/CombatFeedbackManager'

import {
  GAMEPLAY_DISPLAY,
  GAMEPLAY_TEXTURES,
  hasGameplayTexture,
} from '../assets/GameplayArt'

export interface ComboState {
  step: number
  elapsed: number
  comboWindow: number
  perfectStart: number
  perfectEnd: number
  failed: boolean
  perfect: boolean
  queued: boolean
  finisherReady: boolean
  finisherLabel: string
}

interface WeaponSystemConfig {
  scene: Phaser.Scene

  player:
  Phaser.GameObjects.Rectangle

  worldWidth: number
  worldHeight: number

  getEnemies: () =>
    Phaser.GameObjects.Rectangle[]

  getEnemyHealth: (
    enemy: Phaser.GameObjects.Rectangle
  ) => number

  setEnemyHealth: (
    enemy: Phaser.GameObjects.Rectangle,
    health: number
  ) => void

  killEnemy: (
    enemy: Phaser.GameObjects.Rectangle
  ) => void

  onComboStateChange?: (
    state: ComboState
  ) => void

  onCriticalHit?: (
    x: number,
    y: number
  ) => void

onDamageDealt?: (
  x: number,
  y: number,
  damage: number,
  critical: boolean
) => void

getCoreAttackMultiplier:
  () => number

getCoreCriticalChanceBonus:
  () => number

  getCoreEnergyMultiplier:
  () => number

  feedback:
    CombatFeedbackManager
}

export class WeaponSystem {
  private scene:
    Phaser.Scene

  private player:
    Phaser.GameObjects.Rectangle

  private worldWidth:
    number

  private worldHeight:
    number

  private getEnemies:
    WeaponSystemConfig['getEnemies']

  private getEnemyHealth:
    WeaponSystemConfig['getEnemyHealth']

  private setEnemyHealth:
    WeaponSystemConfig['setEnemyHealth']

  private killEnemy:
    WeaponSystemConfig['killEnemy']

  private onComboStateChange?:
    WeaponSystemConfig['onComboStateChange']

  private onCriticalHit?:
    WeaponSystemConfig['onCriticalHit']

  private onDamageDealt?:
    WeaponSystemConfig['onDamageDealt']

  private getCoreAttackMultiplier:
    WeaponSystemConfig['getCoreAttackMultiplier']

private getCoreCriticalChanceBonus:
  WeaponSystemConfig['getCoreCriticalChanceBonus']

private getCoreEnergyMultiplier:
  WeaponSystemConfig['getCoreEnergyMultiplier']

  private feedback:
    CombatFeedbackManager

  private enabled =
    true

  private currentWeapon:
    WeaponType = 'rifle'

  private equippedWeapon:
    WeaponItem | null = null

  private bullets:
    Phaser.GameObjects.Rectangle[] = []

  private bulletDirections =
    new Map<
      Phaser.GameObjects.Rectangle,
      Phaser.Math.Vector2
    >()

  private bulletHitEnemies =
    new Map<
      Phaser.GameObjects.Rectangle,
      Set<
        Phaser.GameObjects.Rectangle
      >
    >()

  private bulletDistance =
    new Map<
      Phaser.GameObjects.Rectangle,
      number
    >()

  private readonly attackHandlers:
    Record<
      WeaponAttackStyle,
      (
        step: number,
        perfect: boolean
      ) => void
    > = {
      precisionProjectile:
        step =>
          this.fireRifle(
            this.getAttackDirection(),
            step
          ),
      spreadProjectile:
        step =>
          this.fireScattergun(
            this.getAttackDirection(),
            step
          ),
      heavyProjectile:
        step =>
          this.fireCannon(
            this.getAttackDirection(),
            step
          ),
      photonProjectile:
        step =>
          this.firePhotonLance(
            this.getAttackDirection(),
            step
          ),
      meleeRhythm:
        (step, perfect) =>
          this.performGreatswordComboStep(
            step,
            perfect
          ),
    }

  // Shared three-step attack rhythm.

  private comboStep =
    0

  private comboTimer =
    0

  private inputQueued =
    false

  private meleeLocked =
    false

  private targetX =
    0

  private targetY =
    0

  constructor(
    config:
      WeaponSystemConfig
  ) {
    this.scene =
      config.scene

    this.player =
      config.player

    this.worldWidth =
      config.worldWidth

    this.worldHeight =
      config.worldHeight

    this.getEnemies =
      config.getEnemies

    this.getEnemyHealth =
      config.getEnemyHealth

    this.setEnemyHealth =
      config.setEnemyHealth

    this.killEnemy =
      config.killEnemy

    this.onComboStateChange =
      config.onComboStateChange

    this.onCriticalHit =
      config.onCriticalHit

    this.onDamageDealt =
      config.onDamageDealt

      this.getCoreAttackMultiplier =
        config.getCoreAttackMultiplier

this.getCoreCriticalChanceBonus =
  config.getCoreCriticalChanceBonus

this.getCoreEnergyMultiplier =
  config.getCoreEnergyMultiplier

    this.feedback =
      config.feedback

    this.setupAttackInput()
  }

  private setupAttackInput() {
    this.scene.input.on(
      'pointerdown',
      (
        pointer:
          Phaser.Input.Pointer
      ) => {
        if (
          !this.enabled
        ) {
          return
        }

        this.targetX =
          pointer.worldX
        this.targetY =
          pointer.worldY

        this.handleAttackInput()
      }
    )
  }

  reset() {
    for (
      const bullet of
      this.bullets
    ) {
      const visual =
        bullet.getData(
          'visual'
        ) as
          | Phaser.GameObjects.Sprite
          | undefined

      if (visual?.active) {
        visual.destroy()
      }

      if (
        bullet.active
      ) {
        bullet.destroy()
      }
    }

    this.bullets =
      []

    this.bulletDirections.clear()
    this.bulletHitEnemies.clear()
    this.bulletDistance.clear()

    this.currentWeapon =
      'rifle'

    this.equippedWeapon =
      null

    this.resetCombo()
  }

update(
  delta: number,
  targetX: number,
  targetY: number
) {
  if (
    !this.enabled
  ) {
    return
  }

  this.targetX =
    targetX

  this.targetY =
    targetY

  this.updateCombo(
    delta
  )

    this.moveBullets(
      delta
    )
  }

  // Used by normal loot.
  equipWeapon(
    item:
      WeaponItem
  ) {
    this.equippedWeapon =
      item

    this.currentWeapon =
      item.weaponType

    this.resetCombo()
  }

  // Used by debug shortcuts and
  // special weapons such as Photon Lance.
  setWeapon(
    weapon:
      WeaponType
  ) {
    this.currentWeapon =
      weapon

    this.equippedWeapon =
      null

    this.resetCombo()
  }

  getCurrentWeapon() {
    return this.currentWeapon
  }

  getEquippedWeapon() {
    return this.equippedWeapon
  }

  private resetCombo() {
    this.comboStep =
      0

    this.comboTimer =
      0

    this.inputQueued =
      false

    this.meleeLocked =
      false

    this.emitComboState({
      failed:
        false,

      perfect:
        false,
    })
  }
  setEnabled(
    enabled: boolean
  ) {
    this.enabled =
      enabled

    if (
      !enabled
    ) {
      this.resetCombo()
    }
  }

  isEnabled() {
    return this.enabled
  }
  private emitComboState(
    options: {
      failed?: boolean
      perfect?: boolean
    } = {}
  ) {
    const timing =
      this.getCurrentTiming()

    this.onComboStateChange?.({
      step:
        this.comboStep,

      elapsed:
        this.comboTimer,

      comboWindow:
        timing.latestComboInput,

      perfectStart:
        timing.earliestNextInput,

      perfectEnd:
        WEAPON_COMBO_TIMINGS[
          this.currentWeapon
        ].finisher ===
          'timedMelee'
          ? Math.min(
            420 /
            this.getSpeedMultiplier(),
            timing.latestComboInput
          )
          : timing.latestComboInput,

      failed:
        options.failed ??
        false,

      perfect:
        options.perfect ??
        false,

      queued:
        this.inputQueued,

      finisherReady:
        this.comboStep === 2 &&
        this.comboTimer >=
          timing.earliestNextInput,

      finisherLabel:
        WEAPON_COMBO_TIMINGS[
          this.currentWeapon
        ].finisherLabel,
    })
  }

  private updateCombo(
    delta: number
  ) {
    if (
      this.comboStep ===
      0
    ) {
      return
    }

    this.comboTimer +=
      delta

    this.emitComboState()

    const timing =
      this.getCurrentTiming()

    if (
      this.inputQueued &&
      this.comboStep < 3 &&
      this.comboTimer >=
        timing.earliestNextInput &&
      !this.meleeLocked
    ) {
      this.advanceCombo()
      return
    }

    const resetTime =
      this.comboStep === 3
        ? timing.attackDuration +
          timing.finisherRecovery
        : timing.latestComboInput

    if (
      this.comboTimer >
      resetTime
    ) {
      this.failAndResetCombo(
        this.comboStep < 3
      )
    }
  }

  private handleAttackInput() {
    if (
      !this.player.active
    ) {
      return
    }

    if (
      this.comboStep ===
      0
    ) {
      this.performComboAttack(
        1,
        false
      )
      return
    }

    if (
      this.comboStep >= 3 ||
      this.inputQueued
    ) {
      return
    }

    const timing =
      this.getCurrentTiming()

    if (
      this.comboTimer <
      timing.earliestNextInput
    ) {
      if (
        this.comboTimer >=
        timing.earliestNextInput -
          timing.inputBufferMs
      ) {
        this.inputQueued =
          true
        this.emitComboState()
      }
      return
    }

    if (this.meleeLocked) {
      this.inputQueued =
        true
      this.emitComboState()
      return
    }

    if (
      this.comboTimer >
      timing.latestComboInput
    ) {
      this.resetCombo()
      this.performComboAttack(
        1,
        false
      )
      return
    }

    this.advanceCombo()
  }

  private advanceCombo() {
    const perfect =
      WEAPON_COMBO_TIMINGS[
        this.currentWeapon
      ].finisher ===
        'timedMelee' &&
      this.comboTimer >=
        this.getCurrentTiming()
          .earliestNextInput &&
      this.comboTimer <=
        420 /
        this.getSpeedMultiplier()

    this.performComboAttack(
      this.comboStep + 1,
      perfect
    )
  }

  private performComboAttack(
    step: number,
    perfect: boolean
  ) {
    this.comboStep =
      step
    this.comboTimer =
      0
    this.inputQueued =
      false

    this.emitComboState({
      perfect,
    })

    const definition =
      WEAPON_COMBO_TIMINGS[
        this.currentWeapon
      ]

    this.attackHandlers[
      definition.attackStyle
    ](
      step,
      perfect
    )
  }

  private performGreatswordComboStep(
    step: number,
    perfect: boolean
  ) {
    const attack =
      WEAPON_COMBO_TIMINGS
        .greatsword.behavior
        .meleeSteps?.[
        step - 1
      ]

    if (!attack) {
      return
    }

    this.performGreatswordSwing(
      perfect
        ? attack.perfectDamage
        : attack.damage,
      attack.range,
      attack.arc,
      attack.lock,
      perfect
    )
  }

  private failAndResetCombo(
    failed: boolean
  ) {
    this.comboStep =
      0
    this.comboTimer =
      0
    this.inputQueued =
      false

    this.emitComboState({
      failed,
    })

    if (failed) {
      this.scene.time.delayedCall(
        180,
        () => {
          if (
            this.comboStep === 0
          ) {
            this.emitComboState()
          }
        }
      )
    }
  }

  private performGreatswordSwing(
    baseDamage: number,
    range: number,
    arcDegrees: number,
    baseLockDuration: number,
    perfect: boolean
  ) {
    this.meleeLocked =
      true

    const speedMultiplier =
      this.getSpeedMultiplier()

    const lockDuration =
      baseLockDuration /
      speedMultiplier

    const direction =
      new Phaser.Math.Vector2(
        this.targetX -
        this.player.x,

        this.targetY -
        this.player.y
      )

    if (
      direction.length() ===
      0
    ) {
      direction.set(
        1,
        0
      )
    }

    direction.normalize()

    const attackAngle =
      direction.angle()

    this.createSwordVisual(
      direction,
      lockDuration,
      perfect
    )

    const enemies = [
      ...this.getEnemies(),
    ]

    for (
      const enemy of
      enemies
    ) {
      if (
        !enemy.active
      ) {
        continue
      }

      const distance =
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          enemy.x,
          enemy.y
        )

      if (
        distance >
        range
      ) {
        continue
      }

      const enemyAngle =
        Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          enemy.x,
          enemy.y
        )

      const angleDifference =
        Phaser.Math.Angle.Wrap(
          enemyAngle -
          attackAngle
        )

      const halfArc =
        Phaser.Math.DegToRad(
          arcDegrees /
          2
        )

      if (
        Math.abs(
          angleDifference
        ) >
        halfArc
      ) {
        continue
      }

      this.damageEnemyMelee(
        enemy,
        baseDamage,
        direction,
        this.comboStep,
        perfect
      )
    }

    this.feedback.playAttack(
      'greatsword',
      this.comboStep
    )

    this.scene.time.delayedCall(
      lockDuration,
      () => {
        this.meleeLocked =
          false
      }
    )
  }

  private damageEnemyMelee(
    enemy:
      Phaser.GameObjects.Rectangle,

    baseDamage:
      number,

    direction:
      Phaser.Math.Vector2,

    comboStep:
      number,

    perfect:
      boolean
  ) {
    const damageResult =
      this.calculateDamage(
        baseDamage
      )

    const currentHealth =
      this.getEnemyHealth(
        enemy
      )

    const newHealth =
      currentHealth -
      damageResult.damage

    this.setEnemyHealth(
      enemy,
      newHealth
    )
    this.onDamageDealt?.(
      enemy.x,
      enemy.y,
      damageResult.damage,
      damageResult.critical
    )

    if (
      damageResult.critical
    ) {
      this.triggerCriticalFeedback(
        enemy.x,
        enemy.y
      )
    }

    this.feedback.playHit(
      enemy,
      'greatsword',
      comboStep,
      {
        critical:
          damageResult.critical,
        perfect,
      }
    )

    if (
      newHealth <=
      0
    ) {
      this.killEnemy(
        enemy
      )

      return
    }

    let knockback =
      comboStep === 3
        ? 70
        : comboStep === 2
          ? 40
          : 20

    if (
      perfect
    ) {
      knockback *=
        1.35
    }

    enemy.x +=
      direction.x *
      knockback

    enemy.y +=
      direction.y *
      knockback
  }

  private createSwordVisual(
    direction:
      Phaser.Math.Vector2,

    duration:
      number,

    perfect:
      boolean
  ) {
    const swordLength =
      this.comboStep ===
        3
        ? 130
        : 105

    const swordWidth =
      this.comboStep ===
        3
        ? 22
        : 16

    const color =
      perfect
        ? 0xffdd55
        : this.comboStep ===
          3
          ? 0xff4444
          : 0xdddddd

    const sword =
      this.scene.add.rectangle(
        this.player.x,
        this.player.y,
        swordLength,
        swordWidth,
        color
      )

    sword.setOrigin(
      0,
      0.5
    )
    sword.setStrokeStyle(
      this.comboStep === 3
        ? 4
        : 2,
      perfect
        ? 0xffffff
        : 0xffaaaa,
      0.9
    )

    const baseAngle =
      direction.angle()

    sword.setRotation(
      baseAngle -
      0.8
    )

    this.scene.tweens.add({
      targets:
        sword,

      rotation:
        baseAngle +
        0.8,

      duration,

      ease:
        'Power2',

      onComplete:
        () => {
          sword.destroy()
        },
    })

    if (
      this.comboStep === 3 ||
      perfect
    ) {
      const trail =
        this.scene.add.rectangle(
          this.player.x,
          this.player.y,
          swordLength +
            24,
          swordWidth +
            14,
          perfect
            ? 0xffdd55
            : 0xff3344,
          0.22
        )
          .setOrigin(
            0,
            0.5
          )
          .setRotation(
            baseAngle -
            0.9
          )
          .setBlendMode(
            Phaser.BlendModes.ADD
          )

      this.scene.tweens.add({
        targets: trail,
        rotation:
          baseAngle +
          0.9,
        alpha: 0,
        scaleY: 1.6,
        duration:
          duration +
          40,
        onComplete: () =>
          trail.destroy(),
      })
    }
  }

  private getAttackDirection() {
    const direction =
      new Phaser.Math.Vector2(
        this.targetX -
        this.player.x,

        this.targetY -
        this.player.y
      )

    if (
      direction.length() ===
      0
    ) {
      direction.set(
        1,
        0
      )
    }

    return direction.normalize()
  }

  private fireRifle(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number
  ) {
    const behavior =
      WEAPON_COMBO_TIMINGS
        .rifle.behavior
    const multiplier =
      this.getComboDamageMultiplier(
        comboStep
      )

    this.createBullet(
      direction,
      behavior.projectileSpeed ??
        500,
      comboStep === 3 ? 17 : 12,
      comboStep === 3 ? 6 : 4,
      comboStep === 3
        ? 0xffffff
        : 0xffff00,
      multiplier,
      'rifle',
      comboStep,
      comboStep === 3
        ? {
          maxHits:
            behavior
              .finisherMaxHits,
          maxRange:
            behavior.maxRange,
        }
        : undefined
    )

    this.createMuzzleFlash(
      direction,
      comboStep,
      0xffff55
    )

    if (comboStep === 3) {
      this.createTracer(
        direction,
        1200,
        0xaaffff
      )
    }

    this.feedback.playAttack(
      'rifle',
      comboStep
    )
  }

  private fireScattergun(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number
  ) {
    const behavior =
      WEAPON_COMBO_TIMINGS
        .scattergun.behavior
    const pelletCount =
      behavior.comboCounts?.[
        comboStep - 1
      ] ?? 5

    const spread =
      behavior.comboSpreads?.[
        comboStep - 1
      ] ?? 0.35

    const multiplier =
      this.getComboDamageMultiplier(
        comboStep
      )

    for (
      let i = 0;
      i < pelletCount;
      i++
    ) {
      const pelletDirection =
        direction
          .clone()
          .rotate(
            Phaser.Math.FloatBetween(
              -spread,
              spread
            )
          )

      this.createBullet(
        pelletDirection,
        behavior.projectileSpeed ??
          450,
        8,
        4,
        0xffaa00,
        multiplier,
        'scattergun',
        comboStep,
        comboStep === 3
          ? {
            knockback:
              behavior
                .finisherKnockback,
          }
          : undefined
      )
    }

    this.createMuzzleFlash(
      direction,
      comboStep,
      0xffaa00
    )

    if (comboStep === 3) {
      this.playPlayerRecoil(
        1.14
      )
    }

    this.feedback.playAttack(
      'scattergun',
      comboStep
    )
  }

  private fireCannon(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number
  ) {
    const behavior =
      WEAPON_COMBO_TIMINGS
        .cannon.behavior
    this.createBullet(
      direction,
      behavior.projectileSpeed ??
        250,
      comboStep === 3 ? 24 : 18,
      comboStep === 3 ? 24 : 18,
      comboStep === 3
        ? 0xffaa44
        : 0xff4444,
      3 *
      this.getComboDamageMultiplier(
        comboStep
      ),
      'cannon',
      comboStep,
      comboStep === 3
        ? {
          explode:
            true,
        }
        : undefined
    )

    this.createMuzzleFlash(
      direction,
      comboStep,
      0xff5533
    )

    this.feedback.playAttack(
      'cannon',
      comboStep
    )
  }

  private firePhotonLance(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number
  ) {
    const behavior =
      WEAPON_COMBO_TIMINGS
        .photonLance.behavior
    this.createBullet(
      direction,
      behavior.projectileSpeed ??
        720,
      comboStep === 3
        ? 28
        : 22,
      comboStep === 3
        ? 10
        : 8,
      0x55ffff,
      3 *
      this.getComboDamageMultiplier(
        comboStep
      ),
      'photonLance',
      comboStep,
      comboStep === 3
        ? {
          maxHits:
            behavior
              .finisherMaxHits,
          chainCount:
            behavior.chainCount,
        }
        : {
          maxHits:
            behavior.maxHits,
        }
    )

    this.createMuzzleFlash(
      direction,
      comboStep,
      0x66ffff
    )

    this.feedback.playAttack(
      'photonLance',
      comboStep
    )
  }

  private createBullet(
    direction:
      Phaser.Math.Vector2,

    speed:
      number,

    width:
      number,

    height:
      number,

    color:
      number,

    baseDamage:
      number,

    weaponType:
      Exclude<
        WeaponType,
        'greatsword'
      >,

    comboStep:
      number,

    options: {
      maxHits?: number
      maxRange?: number
      chainCount?: number
      explode?: boolean
      knockback?: number
    } = {}
  ) {
    const bullet =
      this.scene.add.rectangle(
        this.player.x,
        this.player.y,
        width,
        height,
        color
      )

    const projectileVisuals = {
      rifle: {
        texture:
          GAMEPLAY_TEXTURES
            .projectileRifle,
        display:
          GAMEPLAY_DISPLAY
            .projectileRifle,
      },
      scattergun: {
        texture:
          GAMEPLAY_TEXTURES
            .projectileScatter,
        display:
          GAMEPLAY_DISPLAY
            .projectileScatter,
      },
      cannon: {
        texture:
          GAMEPLAY_TEXTURES
            .projectileCannon,
        display:
          GAMEPLAY_DISPLAY
            .projectileCannon,
      },
      photonLance: {
        texture:
          GAMEPLAY_TEXTURES
            .projectilePhoton,
        display:
          GAMEPLAY_DISPLAY
            .projectilePhoton,
      },
    } as const
    const visualDefinition =
      projectileVisuals[
        weaponType
      ]
    const texture =
      visualDefinition?.texture
    const display =
      visualDefinition?.display

    if (
      texture &&
      display &&
      hasGameplayTexture(
        this.scene,
        texture.key
      )
    ) {
      const visual =
        this.scene.add.sprite(
          bullet.x,
          bullet.y,
          texture.key
        )
          .setDisplaySize(
            display.width,
            display.height
          )
          .setDepth(
            display.depth
          )
          .setRotation(
            direction.angle()
          )

      bullet.setAlpha(0)
      bullet.setData(
        'visual',
        visual
      )
    }

    bullet.setRotation(
      direction.angle()
    )

    bullet.setData(
      'speed',
      speed
    )

    bullet.setData(
      'baseDamage',
      baseDamage
    )

    bullet.setData(
      'weaponType',
      weaponType
    )

    bullet.setData(
      'comboStep',
      comboStep
    )
    bullet.setData(
      'maxHits',
      options.maxHits ?? 1
    )
    bullet.setData(
      'maxRange',
      options.maxRange ??
      Number.POSITIVE_INFINITY
    )
    bullet.setData(
      'chainCount',
      options.chainCount ?? 0
    )
    bullet.setData(
      'explode',
      options.explode ?? false
    )
    bullet.setData(
      'knockback',
      options.knockback ?? 0
    )

    this.bullets.push(
      bullet
    )

    this.bulletDirections.set(
      bullet,
      direction
    )
    this.bulletHitEnemies.set(
      bullet,
      new Set()
    )
    this.bulletDistance.set(
      bullet,
      0
    )
  }

  private moveBullets(
    delta: number
  ) {
    for (
      let i =
        this.bullets.length -
        1;

      i >= 0;

      i--
    ) {
      const bullet =
        this.bullets[i]

      if (
        !bullet.active
      ) {
        this.removeBullet(
          bullet,
          i
        )

        continue
      }

      const direction =
        this.bulletDirections.get(
          bullet
        )

      if (
        !direction
      ) {
        this.removeBullet(
          bullet,
          i
        )

        continue
      }

      const speed =
        bullet.getData(
          'speed'
        ) ?? 500

      const distance =
        speed *
        (delta / 1000)

      const totalDistance =
        (
          this.bulletDistance.get(
            bullet
          ) ?? 0
        ) +
        distance
      this.bulletDistance.set(
        bullet,
        totalDistance
      )

      bullet.x +=
        direction.x *
        distance

      bullet.y +=
        direction.y *
        distance

      const visual =
        bullet.getData(
          'visual'
        ) as
          | Phaser.GameObjects.Sprite
          | undefined

      visual?.setPosition(
        bullet.x,
        bullet.y
      )

      const hitEnemy =
        this.checkBulletCollision(
          bullet
        )

      if (
        hitEnemy
      ) {
        this.removeBullet(
          bullet,
          i
        )

        continue
      }

      if (
        totalDistance >=
        Number(
          bullet.getData(
            'maxRange'
          )
        ) ||
        bullet.x < 0 ||
        bullet.x >
        this.worldWidth ||
        bullet.y < 0 ||
        bullet.y >
        this.worldHeight
      ) {
        this.removeBullet(
          bullet,
          i
        )
      }
    }
  }

  private checkBulletCollision(
    bullet:
      Phaser.GameObjects.Rectangle
  ) {
    const enemies =
      this.getEnemies()
    const hitEnemies =
      this.bulletHitEnemies.get(
        bullet
      ) ??
      new Set<
        Phaser.GameObjects.Rectangle
      >()

    for (
      const enemy of
      enemies
    ) {
      if (
        !enemy.active ||
        hitEnemies.has(
          enemy
        )
      ) {
        continue
      }

      const hit =
        Phaser.Geom.Intersects.RectangleToRectangle(
          bullet.getBounds(),
          enemy.getBounds()
        )

      if (
        !hit
      ) {
        continue
      }

      const baseDamage =
        bullet.getData(
          'baseDamage'
        ) ?? 1

      const weaponType =
        bullet.getData(
          'weaponType'
        ) as WeaponType

      const comboStep =
        bullet.getData(
          'comboStep'
        ) ?? 1

      const damageResult =
        this.calculateDamage(
          baseDamage
        )

      const currentHealth =
        this.getEnemyHealth(
          enemy
        )

      const impactX =
        enemy.x

      const impactY =
        enemy.y

      const newHealth =
        currentHealth -
        damageResult.damage

      hitEnemies.add(
        enemy
      )
      this.bulletHitEnemies.set(
        bullet,
        hitEnemies
      )

      this.setEnemyHealth(
        enemy,
        newHealth
      )

      this.onDamageDealt?.(
        enemy.x,
        enemy.y,
        damageResult.damage,
        damageResult.critical
      )

      if (
        damageResult.critical
      ) {
        this.triggerCriticalFeedback(
          enemy.x,
          enemy.y
        )
      }

      this.feedback.playHit(
        enemy,
        weaponType,
        comboStep,
        {
          critical:
            damageResult.critical,
        }
      )

      if (
        newHealth <=
        0
      ) {
        this.killEnemy(
          enemy
        )
      } else {
        const knockback =
          Number(
            bullet.getData(
              'knockback'
            ) ?? 0
          )
        const direction =
          this.bulletDirections.get(
            bullet
          )

        if (
          knockback > 0 &&
          direction
        ) {
          const lastKnockback =
            Number(
              enemy.getData(
                'lastWeaponKnockbackAt'
              ) ??
              -Infinity
            )

          if (
            this.scene.time.now -
            lastKnockback >
            80
          ) {
            const resistance =
              enemy.getData(
                'enemyType'
              ) === 'wyrm'
                ? 0.2
                : 1
            enemy.x +=
              direction.x *
              knockback *
              resistance
            enemy.y +=
              direction.y *
              knockback *
              resistance
            enemy.setData(
              'lastWeaponKnockbackAt',
              this.scene.time.now
            )
          }
        }
      }

      if (
        bullet.getData(
          'explode'
        ) === true
      ) {
        this.createCannonExplosion(
          impactX,
          impactY,
          comboStep,
          enemy
        )
      }

      const chainCount =
        Number(
          bullet.getData(
            'chainCount'
          ) ?? 0
        )

      if (chainCount > 0) {
        this.createPhotonChain(
          enemy,
          chainCount,
          baseDamage,
          comboStep
        )
      }

      return (
        hitEnemies.size >=
        Number(
          bullet.getData(
            'maxHits'
          ) ?? 1
        )
      )
    }

    return false
  }

  private createCannonExplosion(
    x: number,
    y: number,
    comboStep: number,
    directHit:
      Phaser.GameObjects.Rectangle
  ) {
    const radius =
      WEAPON_COMBO_TIMINGS
        .cannon.behavior
        .explosionRadius ??
      105

    const explosion =
      this.scene.add.circle(
        x,
        y,
        radius,
        0xff4444,
        0.25
      )

    this.scene.tweens.add({
      targets:
        explosion,

      alpha:
        0,

      scale:
        1.4,

      duration:
        200,

      onComplete:
        () => {
          explosion.destroy()
        },
    })

    const enemies = [
      ...this.getEnemies(),
    ]

    for (
      const enemy of
      enemies
    ) {
      if (
        !enemy.active ||
        enemy === directHit
      ) {
        continue
      }

      const distance =
        Phaser.Math.Distance.Between(
          x,
          y,
          enemy.x,
          enemy.y
        )

      if (
        distance >
        radius
      ) {
        continue
      }

      const damageResult =
        this.calculateDamage(
          comboStep === 3
            ? 3
            : 2
        )

      const currentHealth =
        this.getEnemyHealth(
          enemy
        )

      this.onDamageDealt?.(
        enemy.x,
        enemy.y,
        damageResult.damage,
        damageResult.critical
      )

      const newHealth =
        currentHealth -
        damageResult.damage

      this.setEnemyHealth(
        enemy,
        newHealth
      )

      this.feedback.playHit(
        enemy,
        'cannon',
        comboStep,
        {
          critical:
            damageResult.critical,
        }
      )

      if (
        damageResult.critical
      ) {
        this.triggerCriticalFeedback(
          enemy.x,
          enemy.y
        )
      }

      if (
        newHealth <=
        0
      ) {
        this.killEnemy(
          enemy
        )
      }
    }
  }

  private createPhotonChain(
    firstTarget:
      Phaser.GameObjects.Rectangle,
    chainCount: number,
    baseDamage: number,
    comboStep: number
  ) {
    const visited =
      new Set<
        Phaser.GameObjects.Rectangle
      >([
        firstTarget,
      ])
    let sourceX =
      firstTarget.x
    let sourceY =
      firstTarget.y

    for (
      let link = 0;
      link < chainCount;
      link++
    ) {
      const next =
        this.getEnemies()
          .filter(
            enemy =>
              enemy.active &&
              !visited.has(
                enemy
              ) &&
              Phaser.Math.Distance.Between(
                sourceX,
                sourceY,
                enemy.x,
                enemy.y
              ) <=
              (
                WEAPON_COMBO_TIMINGS
                  .photonLance
                  .behavior
                  .chainRange ??
                230
              )
          )
          .sort(
            (left, right) =>
              Phaser.Math.Distance.Between(
                sourceX,
                sourceY,
                left.x,
                left.y
              ) -
              Phaser.Math.Distance.Between(
                sourceX,
                sourceY,
                right.x,
                right.y
              )
          )[0]

      if (!next) {
        break
      }

      visited.add(
        next
      )
      this.createPhotonArc(
        sourceX,
        sourceY,
        next.x,
        next.y
      )

      const damageResult =
        this.calculateDamage(
          baseDamage *
          0.82
        )
      const newHealth =
        this.getEnemyHealth(
          next
        ) -
        damageResult.damage

      this.setEnemyHealth(
        next,
        newHealth
      )
      this.onDamageDealt?.(
        next.x,
        next.y,
        damageResult.damage,
        damageResult.critical
      )
      if (
        damageResult.critical
      ) {
        this.triggerCriticalFeedback(
          next.x,
          next.y
        )
      }
      this.feedback.playHit(
        next,
        'photonLance',
        comboStep,
        {
          critical:
            damageResult.critical,
        }
      )

      sourceX =
        next.x
      sourceY =
        next.y

      if (newHealth <= 0) {
        this.killEnemy(
          next
        )
      }
    }

    this.scene.events.emit(
      'combat-audio:photon-chain',
      visited.size - 1
    )
  }

  private createPhotonArc(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) {
    const arc =
      this.scene.add.graphics()
        .setDepth(19)

    arc.lineStyle(
      5,
      0x33ddff,
      0.45
    )
    arc.lineBetween(
      fromX,
      fromY,
      toX,
      toY
    )
    arc.lineStyle(
      2,
      0xffffff,
      0.95
    )
    arc.lineBetween(
      fromX,
      fromY,
      toX,
      toY
    )

    this.scene.tweens.add({
      targets: arc,
      alpha: 0,
      duration: 150,
      onComplete: () =>
        arc.destroy(),
    })
  }

private calculateDamage(
  baseDamage: number
) {
  // Weapon's rolled Attack stat.
  const weaponAttackMultiplier =
    this.getAttackMultiplier()

  // Core Power bonus.
  const coreAttackMultiplier =
    this.getCoreAttackMultiplier()

  let damage =
    baseDamage *
    weaponAttackMultiplier *
    coreAttackMultiplier

  // Core Energy gives an additional
  // damage bonus to Rare weapons.
  if (
    this.equippedWeapon
      ?.rarity ===
    'rare'
  ) {
    damage *=
      this.getCoreEnergyMultiplier()
  }

  // Weapon's rolled crit chance
  // plus Core Dexterity bonus.
  const criticalChance =
    Math.min(
      0.95,
      (
        this.equippedWeapon
          ?.criticalChance ??
        0
      ) +
      this.getCoreCriticalChanceBonus()
    )

  const criticalDamage =
    this.equippedWeapon
      ?.criticalDamage ??
    1.5

  const critical =
    Math.random() <
    criticalChance

  if (
    critical
  ) {
    damage *=
      criticalDamage
  }

  return {
    damage:
      Math.max(
        1,
        Math.round(
          damage
        )
      ),

    critical,
  }
}

  private getAttackMultiplier() {
    if (
      !this.equippedWeapon
    ) {
      return 1
    }

    return Math.max(
      0.5,
      this.equippedWeapon.attack /
      10
    )
  }

  private getSpeedMultiplier() {
    if (
      !this.equippedWeapon
    ) {
      return 1
    }

    return Math.max(
      0.5,
      this.equippedWeapon.speed
    )
  }

  private triggerCriticalFeedback(
    x: number,
    y: number
  ) {
    this.onCriticalHit?.(
      x,
      y
    )

  }

  private removeBullet(
    bullet:
      Phaser.GameObjects.Rectangle,

    index:
      number
  ) {
    const visual =
      bullet.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined

    if (visual?.active) {
      visual.destroy()
    }

    if (
      bullet.active
    ) {
      bullet.destroy()
    }

    this.bulletDirections.delete(
      bullet
    )
    this.bulletHitEnemies.delete(
      bullet
    )
    this.bulletDistance.delete(
      bullet
    )

    if (
      this.bullets[index] ===
      bullet
    ) {
      this.bullets.splice(
        index,
        1
      )
    }
  }

  private getCurrentTiming() {
    const base =
      WEAPON_COMBO_TIMINGS[
        this.currentWeapon
      ]
    const speed =
      this.getSpeedMultiplier()

    return {
      attackDuration:
        base.attackDuration /
        speed,
      earliestNextInput:
        base.earliestNextInput /
        speed,
      latestComboInput:
        base.latestComboInput /
        speed,
      inputBufferMs:
        base.inputBufferMs /
        speed,
      finisherRecovery:
        base.finisherRecovery /
        speed,
    }
  }

  private getComboDamageMultiplier(
    comboStep:
      number
  ) {
    return (
      WEAPON_COMBO_TIMINGS[
        this.currentWeapon
      ].damageMultipliers[
        comboStep - 1
      ] ?? 1
    )
  }

  private createMuzzleFlash(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number,
    color:
      number
  ) {
    const size =
      comboStep === 3
        ? 22
        : comboStep === 2
          ? 16
          : 12

    const flash =
      this.scene.add.circle(
        this.player.x +
          direction.x * 22,
        this.player.y +
          direction.y * 22,
        size,
        color,
        0.85
      )

    this.scene.tweens.add({
      targets:
        flash,
      alpha:
        0,
      scale:
        1.8,
      duration:
        comboStep === 3
          ? 100
          : 70,
      onComplete:
        () => {
          flash.destroy()
        },
    })

  }

  private createTracer(
    direction:
      Phaser.Math.Vector2,
    length: number,
    color: number
  ) {
    const tracer =
      this.scene.add.graphics()
        .setDepth(14)
    const startX =
      this.player.x +
      direction.x * 24
    const startY =
      this.player.y +
      direction.y * 24

    tracer.lineStyle(
      3,
      color,
      0.72
    )
    tracer.lineBetween(
      startX,
      startY,
      startX +
      direction.x *
      length,
      startY +
      direction.y *
      length
    )

    this.scene.tweens.add({
      targets: tracer,
      alpha: 0,
      duration: 90,
      onComplete: () =>
        tracer.destroy(),
    })
  }

  private playPlayerRecoil(
    strength: number
  ) {
    const visual =
      this.player.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined

    if (!visual?.active) {
      return
    }

    this.scene.tweens.killTweensOf(
      visual
    )
    const scaleX =
      visual.scaleX
    const scaleY =
      visual.scaleY

    this.scene.tweens.add({
      targets: visual,
      scaleX:
        scaleX *
        strength,
      scaleY:
        scaleY /
        strength,
      duration: 55,
      yoyo: true,
      onComplete: () => {
        if (visual.active) {
          visual.setScale(
            scaleX,
            scaleY
          )
        }
      },
    })
  }
}
