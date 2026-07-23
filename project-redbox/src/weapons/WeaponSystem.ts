import Phaser from 'phaser'

import type {
  WeaponType,
} from './WeaponTypes'

import type {
  WeaponItem,
} from '../items/ItemTypes'

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

  private fireTimer =
    0

  private bullets:
    Phaser.GameObjects.Rectangle[] = []

  private bulletDirections =
    new Map<
      Phaser.GameObjects.Rectangle,
      Phaser.Math.Vector2
    >()

  // Greatsword rhythm

  private comboStep =
    0

  private comboTimer =
    0

  private readonly comboWindow =
    700

  private readonly perfectStart =
    180

  private readonly perfectEnd =
    420

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

    this.setupMeleeInput()
  }

  private setupMeleeInput() {
    this.scene.input.on(
      'pointerdown',
      () => {
        if (
  !this.enabled ||
  this.currentWeapon !==
  'greatsword'
) {
  return
}

        this.attackGreatsword()
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

    this.fireTimer =
      0

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

    if (
      this.currentWeapon !==
      'greatsword'
    ) {
      this.fireTimer +=
        delta

      if (
        this.fireTimer >=
        this.getFireRate()
      ) {
        this.fireAt(
          targetX,
          targetY
        )

        this.fireTimer =
          0
      }
    }

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

    this.fireTimer =
      0

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

    this.fireTimer =
      0

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
      this.fireTimer =
        0
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
    this.onComboStateChange?.({
      step:
        this.comboStep,

      elapsed:
        this.comboTimer,

      comboWindow:
        this.comboWindow,

      perfectStart:
        this.perfectStart,

      perfectEnd:
        this.perfectEnd,

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
      this.currentWeapon !==
      'greatsword'
    ) {
      return
    }

    if (
      this.comboStep ===
      0
    ) {
      return
    }

    this.comboTimer +=
      delta

    this.emitComboState()

    if (
      this.comboTimer >
      this.comboWindow
    ) {
      this.comboStep =
        0

      this.comboTimer =
        0

      this.emitComboState({
        failed:
          true,
      })

      this.scene.time.delayedCall(
        250,
        () => {
          if (
            this.currentWeapon ===
            'greatsword'
          ) {
            this.emitComboState()
          }
        }
      )
    }
  }

  private attackGreatsword() {
    if (
      !this.player.active ||
      this.meleeLocked
    ) {
      return
    }

    if (
      this.comboStep ===
      0
    ) {
      this.comboStep =
        1

      this.comboTimer =
        0

      this.emitComboState()

      this.performGreatswordSwing(
        1,
        95,
        65,
        180,
        false
      )

      return
    }

    if (
      this.comboTimer <
      this.perfectStart
    ) {
      this.emitComboState()

      return
    }

    const wasPerfect =
      this.comboTimer >=
      this.perfectStart &&
      this.comboTimer <=
      this.perfectEnd

    this.comboStep++

    this.comboTimer =
      0

    this.emitComboState({
      perfect:
        wasPerfect,
    })

    switch (
    this.comboStep
    ) {
      case 2: {
        const baseDamage =
          wasPerfect
            ? 3
            : 2

        this.performGreatswordSwing(
          baseDamage,
          115,
          85,
          240,
          wasPerfect
        )

        break
      }

      case 3: {
        const baseDamage =
          wasPerfect
            ? 6
            : 4

        this.performGreatswordSwing(
          baseDamage,
          145,
          120,
          400,
          wasPerfect
        )

        this.scene.time.delayedCall(
          450,
          () => {
            if (
              this.currentWeapon !==
              'greatsword'
            ) {
              return
            }

            this.comboStep =
              0

            this.comboTimer =
              0

            this.emitComboState()
          }
        )

        break
      }
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
      enemy
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
    targetY: number
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
          direction
        )
        break

      case 'scattergun':
        this.fireScattergun(
          direction
        )
        break

      case 'cannon':
        this.fireCannon(
          direction
        )
        break

      case 'photonLance':
        this.firePhotonLance(
          direction
        )
        break

      case 'greatsword':
        break
    }
  }

  private fireRifle(
    direction:
      Phaser.Math.Vector2
  ) {
    this.createBullet(
      direction,
      500,
      12,
      4,
      0xffff00,
      1,
      'rifle'
    )
  }

  private fireScattergun(
    direction:
      Phaser.Math.Vector2
  ) {
    const pelletCount =
      5

    const spread =
      0.35

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
        1,
        'scattergun'
      )
    }
  }

  private fireCannon(
    direction:
      Phaser.Math.Vector2
  ) {
    this.createBullet(
      direction,
      250,
      18,
      18,
      0xff4444,
      3,
      'cannon'
    )
  }

  private firePhotonLance(
    direction:
      Phaser.Math.Vector2
  ) {
    const beamLength =
      1000

    const beamWidth =
      14

    const baseDamage =
      3

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
        0x00ffff,
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
          enemy
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
      80,
      0.003
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
      WeaponType
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
          enemy
        )
      }

      if (
        weaponType ===
        'cannon'
      ) {
        this.createCannonExplosion(
          impactX,
          impactY
        )
      }

      return true
    }

    return false
  }

  private createCannonExplosion(
    x: number,
    y: number
  ) {
    const radius =
      80

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
          2
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
      Phaser.GameObjects.Rectangle
  ) {
    enemy.setFillStyle(
      0xffffff
    )

    this.scene.time.delayedCall(
      75,
      () => {
        if (
          enemy.active
        ) {
          enemy.setFillStyle(
            0xff4444
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

  private getFireRate() {
    let baseRate:
      number

    switch (
    this.currentWeapon
    ) {
      case 'rifle':
        baseRate =
          300
        break

      case 'scattergun':
        baseRate =
          800
        break

      case 'cannon':
        baseRate =
          1200
        break

      case 'photonLance':
        baseRate =
          900
        break

      case 'greatsword':
        return Infinity
    }

    return (
      baseRate /
      this.getSpeedMultiplier()
    )
  }
}