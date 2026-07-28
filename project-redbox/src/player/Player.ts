import Phaser from 'phaser'

import type {
  PlayerStats,
} from './PlayerStats'

import {
  GAMEPLAY_ATLAS,
  GAMEPLAY_DISPLAY,
  GAMEPLAY_FRAMES,
  hasGameplayArt,
} from '../assets/GameplayArt'

interface PlayerConfig {
  scene: Phaser.Scene

  stats:
    PlayerStats

  worldWidth:
    number

  worldHeight:
    number
}

export class Player {
  private scene:
    Phaser.Scene

  private stats:
    PlayerStats

  private worldWidth:
    number

  private worldHeight:
    number

  private object:
    Phaser.GameObjects.Rectangle

  private visual:
    Phaser.GameObjects.Sprite |
    null = null

  private cursors:
    Phaser.Types.Input.Keyboard.CursorKeys

  private wasd:
    Record<
      string,
      Phaser.Input.Keyboard.Key
    >

  constructor(
    config: PlayerConfig
  ) {
    this.scene =
      config.scene

    this.stats =
      config.stats

    this.worldWidth =
      config.worldWidth

    this.worldHeight =
      config.worldHeight

    this.object =
      this.scene.add.rectangle(
        200,
        200,
        32,
        32,
        0x00ff88
      )

    if (
      hasGameplayArt(
        this.scene
      )
    ) {
      this.object.setAlpha(
        0
      )

      this.visual =
        this.scene.add.sprite(
          this.object.x,
          this.object.y,
          GAMEPLAY_ATLAS.key,
          GAMEPLAY_FRAMES.hunter
        )
          .setDisplaySize(
            GAMEPLAY_DISPLAY.hunter
              .width,
            GAMEPLAY_DISPLAY.hunter
              .height
          )
          .setDepth(
            GAMEPLAY_DISPLAY.hunter
              .depth
          )
    }

    this.cursors =
      this.scene.input.keyboard!.createCursorKeys()

    this.wasd =
      this.scene.input.keyboard!.addKeys({
        up:
          Phaser.Input.Keyboard.KeyCodes.W,

        down:
          Phaser.Input.Keyboard.KeyCodes.S,

        left:
          Phaser.Input.Keyboard.KeyCodes.A,

        right:
          Phaser.Input.Keyboard.KeyCodes.D,
      }) as Record<
        string,
        Phaser.Input.Keyboard.Key
      >
  }

  update(
    delta: number
  ) {
    if (
      !this.object.active
    ) {
      return
    }

    const distance =
      this.stats.speed *
      (delta / 1000)

    if (
      this.wasd.left.isDown ||
      this.cursors.left.isDown
    ) {
      this.object.x -=
        distance
    }

    if (
      this.wasd.right.isDown ||
      this.cursors.right.isDown
    ) {
      this.object.x +=
        distance
    }

    if (
      this.wasd.up.isDown ||
      this.cursors.up.isDown
    ) {
      this.object.y -=
        distance
    }

    if (
      this.wasd.down.isDown ||
      this.cursors.down.isDown
    ) {
      this.object.y +=
        distance
    }

    this.object.x =
      Phaser.Math.Clamp(
        this.object.x,
        16,
        this.worldWidth - 16
      )

    this.object.y =
      Phaser.Math.Clamp(
        this.object.y,
        16,
        this.worldHeight - 16
      )

    this.visual?.setPosition(
      this.object.x,
      this.object.y
    )
  }

  setAimTarget(
    x: number,
    y: number
  ) {
    if (!this.visual) {
      return
    }

    const aimAngle =
      Phaser.Math.Angle.Between(
        this.object.x,
        this.object.y,
        x,
        y
      )

    this.visual.setRotation(
      aimAngle
    )
    this.visual.setFlipX(false)
    this.visual.setFlipY(
      Math.abs(aimAngle) >
      Math.PI / 2
    )
  }

  getObject() {
    return this.object
  }

  showDamageFlash() {
    if (
      !this.object.active
    ) {
      return
    }

    if (this.visual) {
      this.visual.setTint(
        0xff5555
      )
    } else {
      this.object.setFillStyle(
        0xffffff
      )
    }

    this.scene.time.delayedCall(
      100,
      () => {
        if (
          this.object.active
        ) {
          if (this.visual) {
            this.visual.clearTint()
          } else {
            this.object.setFillStyle(
              0x00ff88
            )
          }
        }
      }
    )
  }

  destroy() {
    if (
      this.visual?.active
    ) {
      this.visual.destroy()
    }

    if (
      this.object.active
    ) {
      this.object.destroy()
    }
  }
}
