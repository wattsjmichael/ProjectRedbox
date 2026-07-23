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

import {
  ENEMY_STATS,
} from '../enemies/EnemyTypes'

import type {
  EnemyType,
} from '../enemies/EnemyTypes'

export interface ComboState {
  step: number
  elapsed: number
  comboWindow: number
  perfectStart: number
  perfectEnd: number
  failed: boolean
  perfect: boolean
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

getMagAttackMultiplier:
  () => number

getMagCriticalChanceBonus:
  () => number

getMagEnergyMultiplier:
  () => number
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

  private getMagAttackMultiplier:
  WeaponSystemConfig['getMagAttackMultiplier']

private getMagCriticalChanceBonus:
  WeaponSystemConfig['getMagCriticalChanceBonus']

private getMagEnergyMultiplier:
  WeaponSystemConfig['getMagEnergyMultiplier']

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

      this.getMagAttackMultiplier =
  config.getMagAttackMultiplier

this.getMagCriticalChanceBonus =
  config.getMagCriticalChanceBonus

this.getMagEnergyMultiplier =
  config.getMagEnergyMultiplier

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
      if (
        bullet.active
      ) {
        bullet.destroy()
      }
    }

    this.bullets =
      []

    this.bulletDirections.clear()

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
        this.currentWeapon ===
          'greatsword'
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
      timing.earliestNextInput ||
      this.meleeLocked
    ) {
      this.inputQueued =
        true
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
      this.currentWeapon ===
        'greatsword' &&
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

    switch (
      this.currentWeapon
    ) {
      case 'greatsword':
        this.performGreatswordComboStep(
          step,
          perfect
        )
        break
      default:
        this.fireAt(
          this.targetX,
          this.targetY,
          step
        )
        break
    }
  }

  private performGreatswordComboStep(
    step: number,
    perfect: boolean
  ) {
    switch (step) {
      case 1:
        this.performGreatswordSwing(
          1,
          95,
          65,
          180,
          false
        )
        break
      case 2:
        this.performGreatswordSwing(
          perfect
            ? 3
            : 2,
          115,
          85,
          240,
          perfect
        )
        break
      case 3:
        this.performGreatswordSwing(
          perfect
            ? 6
            : 4,
          145,
          120,
          400,
          perfect
        )
        break
    }
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

    if (
      this.comboStep ===
      3
    ) {
      this.scene.cameras.main.shake(
        perfect
          ? 180
          : 140,

        perfect
          ? 0.018
          : 0.012
      )
    } else {
      this.scene.cameras.main.shake(
        perfect
          ? 80
          : 60,

        perfect
          ? 0.007
          : 0.004
      )
    }

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

    if (
      newHealth <=
      0
    ) {
      this.killEnemy(
        enemy
      )

      return
    }

    this.flashEnemy(
      enemy,
      comboStep
    )

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
  }

  private fireAt(
    targetX: number,
    targetY: number,
    comboStep: number
  ) {
    if (
      !this.player.active
    ) {
      return
    }

    const direction =
      new Phaser.Math.Vector2(
        targetX -
        this.player.x,

        targetY -
        this.player.y
      )

    if (
      direction.length() ===
      0
    ) {
      return
    }

    direction.normalize()

    switch (
    this.currentWeapon
    ) {
      case 'rifle':
        this.fireRifle(
          direction,
          comboStep
        )
        break

      case 'scattergun':
        this.fireScattergun(
          direction,
          comboStep
        )
        break

      case 'cannon':
        this.fireCannon(
          direction,
          comboStep
        )
        break

      case 'photonLance':
        this.firePhotonLance(
          direction,
          comboStep
        )
        break

      case 'greatsword':
        break
    }
  }

  private fireRifle(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number
  ) {
    const multiplier =
      this.getComboDamageMultiplier(
        comboStep
      )

    this.createBullet(
      direction,
      500,
      comboStep === 3 ? 17 : 12,
      comboStep === 3 ? 6 : 4,
      comboStep === 3
        ? 0xffffff
        : 0xffff00,
      multiplier,
      'rifle',
      comboStep
    )

    this.createMuzzleFlash(
      direction,
      comboStep,
      0xffff55
    )

    if (comboStep === 3) {
      this.scene.cameras.main.shake(
        55,
        0.003
      )
    }
  }

  private fireScattergun(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number
  ) {
    const pelletCount =
      comboStep === 3
        ? 7
        : comboStep === 2
          ? 6
          : 5

    const spread =
      comboStep === 1
        ? 0.35
        : 0.44

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
        450,
        8,
        4,
        0xffaa00,
        multiplier,
        'scattergun',
        comboStep
      )
    }

    this.createMuzzleFlash(
      direction,
      comboStep,
      0xffaa00
    )

    if (comboStep === 3) {
      this.scene.cameras.main.shake(
        90,
        0.008
      )
    }
  }

  private fireCannon(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number
  ) {
    this.createBullet(
      direction,
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
      comboStep
    )

    this.createMuzzleFlash(
      direction,
      comboStep,
      0xff5533
    )

    this.scene.cameras.main.shake(
      comboStep === 3
        ? 150
        : 65,
      comboStep === 3
        ? 0.012
        : 0.004
    )
  }

  private firePhotonLance(
    direction:
      Phaser.Math.Vector2,
    comboStep:
      number
  ) {
    const beamLength =
      1000

    const beamWidth =
      comboStep === 3
        ? 22
        : comboStep === 2
          ? 17
          : 14

    const baseDamage =
      3 *
      this.getComboDamageMultiplier(
        comboStep
      )

    const startX =
      this.player.x

    const startY =
      this.player.y

    const endX =
      startX +
      direction.x *
      beamLength

    const endY =
      startY +
      direction.y *
      beamLength

    const beam =
      this.scene.add.rectangle(
        startX,
        startY,
        beamLength,
        beamWidth,
        comboStep === 3
          ? 0x88ffff
          : 0x00ffff,
        0.9
      )

    beam.setOrigin(
      0,
      0.5
    )

    beam.setRotation(
      direction.angle()
    )

    const beamCore =
      this.scene.add.rectangle(
        startX,
        startY,
        beamLength,
        4,
        0xffffff,
        1
      )

    beamCore.setOrigin(
      0,
      0.5
    )

    beamCore.setRotation(
      direction.angle()
    )

    const laserLine =
      new Phaser.Geom.Line(
        startX,
        startY,
        endX,
        endY
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

      const hitCircle =
        new Phaser.Geom.Circle(
          enemy.x,
          enemy.y,
          18
        )

      const hit =
        Phaser.Geom.Intersects.LineToCircle(
          laserLine,
          hitCircle
        )

      if (
        !hit
      ) {
        continue
      }

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

      if (
        newHealth <=
        0
      ) {
        this.killEnemy(
          enemy
        )
      } else {
        this.flashEnemy(
          enemy,
          comboStep
        )
      }
    }

    this.scene.tweens.add({
      targets: [
        beam,
        beamCore,
      ],

      alpha:
        0,

      duration:
        120,

      onComplete:
        () => {
          beam.destroy()
          beamCore.destroy()
        },
    })

    this.scene.cameras.main.shake(
      comboStep === 3
        ? 130
        : 70,
      comboStep === 3
        ? 0.009
        : 0.003
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
      WeaponType,

    comboStep:
      number
  ) {
    const bullet =
      this.scene.add.rectangle(
        this.player.x,
        this.player.y,
        width,
        height,
        color
      )

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

    this.bullets.push(
      bullet
    )

    this.bulletDirections.set(
      bullet,
      direction
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

      bullet.x +=
        direction.x *
        distance

      bullet.y +=
        direction.y *
        distance

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

    for (
      const enemy of
      enemies
    ) {
      if (
        !enemy.active
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

      if (
        newHealth <=
        0
      ) {
        this.killEnemy(
          enemy
        )
      } else {
        this.flashEnemy(
          enemy,
          comboStep
        )
      }

      if (
        weaponType ===
        'cannon'
      ) {
        this.createCannonExplosion(
          impactX,
          impactY,
          comboStep
        )
      }

      return true
    }

    return false
  }

  private createCannonExplosion(
    x: number,
    y: number,
    comboStep: number
  ) {
    const radius =
      comboStep === 3
        ? 105
        : 80

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
        !enemy.active
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

private calculateDamage(
  baseDamage: number
) {
  // Weapon's rolled Attack stat.
  const weaponAttackMultiplier =
    this.getAttackMultiplier()

  // MAG Power bonus.
  const magAttackMultiplier =
    this.getMagAttackMultiplier()

  let damage =
    baseDamage *
    weaponAttackMultiplier *
    magAttackMultiplier

  // MAG Energy gives an additional
  // damage bonus to Rare weapons.
  if (
    this.equippedWeapon
      ?.rarity ===
    'rare'
  ) {
    damage *=
      this.getMagEnergyMultiplier()
  }

  // Weapon's rolled crit chance
  // plus MAG Dexterity bonus.
  const criticalChance =
    Math.min(
      0.95,
      (
        this.equippedWeapon
          ?.criticalChance ??
        0
      ) +
      this.getMagCriticalChanceBonus()
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

    this.scene.cameras.main.shake(
      50,
      0.005
    )
  }

  private flashEnemy(
    enemy:
      Phaser.GameObjects.Rectangle,
    comboStep =
      1
  ) {
    enemy.setData(
      'hitStopRemaining',
      comboStep === 3
        ? 70
        : 35
    )

    enemy.setFillStyle(
      0xffffff
    )

    this.scene.time.delayedCall(
      comboStep === 3
        ? 115
        : 75,
      () => {
        if (
          enemy.active
        ) {
          enemy.setFillStyle(
            ENEMY_STATS[
              (
                enemy.getData(
                  'enemyType'
                ) ??
                'normal'
              ) as EnemyType
            ].color
          )
        }
      }
    )
  }

  private removeBullet(
    bullet:
      Phaser.GameObjects.Rectangle,

    index:
      number
  ) {
    if (
      bullet.active
    ) {
      bullet.destroy()
    }

    this.bulletDirections.delete(
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
}
