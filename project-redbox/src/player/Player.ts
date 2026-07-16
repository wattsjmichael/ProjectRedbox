import Phaser from 'phaser'

import type {
  PlayerStats,
} from './PlayerStats'

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

    this.object.setFillStyle(
      0xffffff
    )

    this.scene.time.delayedCall(
      100,
      () => {
        if (
          this.object.active
        ) {
          this.object.setFillStyle(
            0x00ff88
          )
        }
      }
    )
  }

  destroy() {
    if (
      this.object.active
    ) {
      this.object.destroy()
    }
  }
}