import Phaser from 'phaser'

import {
  GAMEPLAY_DISPLAY,
  GAMEPLAY_TEXTURES,
  hasGameplayTexture,
} from '../assets/GameplayArt'

interface CoreVisualConfig {
  scene:
    Phaser.Scene
  x:
    number
  y:
    number
  mode:
    'follower' |
    'interface'
  awakened?:
    boolean
}

export class CoreVisual {
  private readonly scene:
    Phaser.Scene

  private readonly mode:
    CoreVisualConfig['mode']

  private sprite:
    Phaser.GameObjects.Sprite |
    null = null

  private glow:
    Phaser.GameObjects.Arc

  private elapsed =
    Math.random() * 1000

  private readonly glowBaseAlpha:
    number

  private position:
    Phaser.Math.Vector2

  private idleTween:
    Phaser.Tweens.Tween |
    null = null

  constructor(
    config:
      CoreVisualConfig
  ) {
    this.scene =
      config.scene
    this.mode =
      config.mode
    this.position =
      new Phaser.Math.Vector2(
        config.x,
        config.y
      )

    const display =
      config.mode === 'follower'
        ? GAMEPLAY_DISPLAY.coreFollower
        : GAMEPLAY_DISPLAY.coreInterface
    const glowRadius =
      config.mode === 'follower'
        ? 12
        : 21
    this.glowBaseAlpha =
      config.awakened
        ? 0.18
        : 0.09

    this.glow =
      this.scene.add.circle(
        config.x,
        config.y,
        glowRadius,
        0x22ccff,
        this.glowBaseAlpha
      )
        .setDepth(
          display.depth - 1
        )
        .setBlendMode(
          Phaser.BlendModes.ADD
        )

    if (
      hasGameplayTexture(
        this.scene,
        GAMEPLAY_TEXTURES
          .coreDormant.key
      )
    ) {
      this.ensureTrimmedFrame()
      this.sprite =
        this.scene.add.sprite(
          config.x,
          config.y,
          GAMEPLAY_TEXTURES
            .coreDormant.key,
          'trimmed'
        )
          .setDisplaySize(
            display.width,
            display.height
          )
          .setDepth(
            display.depth
          )
    }

    if (
      config.mode ===
      'interface'
    ) {
      this.startInterfaceIdle()
    }
  }

  updateFollower(
    delta: number,
    hunterX: number,
    hunterY: number
  ) {
    if (
      this.mode !== 'follower'
    ) {
      return
    }

    this.elapsed +=
      delta
    const targetX =
      hunterX - 34
    const targetY =
      hunterY + 30
    const smoothing =
      1 -
      Math.exp(
        -delta * 0.008
      )

    this.position.x =
      Phaser.Math.Linear(
        this.position.x,
        targetX,
        smoothing
      )
    this.position.y =
      Phaser.Math.Linear(
        this.position.y,
        targetY,
        smoothing
      )

    const bob =
      Math.sin(
        this.elapsed * 0.003
      ) * 2
    const sway =
      Math.sin(
        this.elapsed * 0.0016
      ) * 0.08

    this.sprite
      ?.setPosition(
        this.position.x,
        this.position.y +
          bob
      )
      .setRotation(
        sway
      )
    this.glow.setPosition(
      this.position.x,
      this.position.y +
        bob
    )
    this.glow.setAlpha(
      this.glowBaseAlpha +
      (
        Math.sin(
          this.elapsed *
            0.004
        ) + 1
      ) *
      0.025
    )
  }

  playFeedPulse() {
    this.pulse(
      false
    )
  }

  playEvolution() {
    this.pulse(
      true
    )

    const originX =
      this.sprite?.x ??
      this.glow.x
    const originY =
      this.sprite?.y ??
      this.glow.y

    for (
      let index = 0;
      index < 8;
      index++
    ) {
      const angle =
        index /
        8 *
        Math.PI *
        2
      const particle =
        this.scene.add.rectangle(
          originX,
          originY,
          3,
          3,
          0x66ddff,
          0.9
        )
          .setDepth(
            this.glow.depth + 2
          )
          .setBlendMode(
            Phaser.BlendModes.ADD
          )

      this.scene.tweens.add({
        targets:
          particle,
        x:
          originX +
          Math.cos(angle) *
          34,
        y:
          originY +
          Math.sin(angle) *
          34,
        alpha:
          0,
        scale:
          0.4,
        duration:
          650,
        ease:
          'Quad.Out',
        onComplete:
          () =>
            particle.destroy(),
      })
    }
  }

  getObjects():
    Phaser.GameObjects.GameObject[] {
    return [
      this.glow,
      ...(
        this.sprite
          ? [this.sprite]
          : []
      ),
    ]
  }

  destroy() {
    this.idleTween?.stop()
    this.idleTween =
      null

    if (
      this.sprite?.active
    ) {
      this.sprite.destroy()
    }

    if (this.glow.active) {
      this.glow.destroy()
    }
  }

  private startInterfaceIdle() {
    const targets = [
      this.glow,
      ...(
        this.sprite
          ? [this.sprite]
          : []
      ),
    ]

    this.idleTween =
      this.scene.tweens.add({
        targets,
        y:
          '+=3',
        duration:
          1200,
        yoyo:
          true,
        repeat:
          -1,
        ease:
          'Sine.InOut',
      })

    if (this.sprite) {
      this.scene.tweens.add({
        targets:
          this.sprite,
        rotation: {
          from:
            -0.035,
          to:
            0.035,
        },
        duration:
          1700,
        yoyo:
          true,
        repeat:
          -1,
        ease:
          'Sine.InOut',
      })
    }
  }

  private pulse(
    evolution:
      boolean
  ) {
    const targets = [
      this.glow,
      ...(
        this.sprite
          ? [this.sprite]
          : []
      ),
    ]

    this.scene.tweens.add({
      targets,
      scaleX:
        evolution
          ? '*=1.45'
          : '*=1.15',
      scaleY:
        evolution
          ? '*=1.45'
          : '*=1.15',
      duration:
        evolution
          ? 260
          : 120,
      yoyo:
        true,
      repeat:
        evolution
          ? 2
          : 0,
      ease:
        'Sine.InOut',
    })

    this.scene.tweens.add({
      targets:
        this.glow,
      alpha:
        evolution
          ? 0.65
          : 0.32,
      duration:
        evolution
          ? 260
          : 120,
      yoyo:
        true,
      repeat:
        evolution
          ? 2
          : 0,
    })
  }

  private ensureTrimmedFrame() {
    const texture =
      this.scene.textures.get(
        GAMEPLAY_TEXTURES
          .coreDormant.key
      )

    if (
      !texture.has(
        'trimmed'
      )
    ) {
      texture.add(
        'trimmed',
        0,
        260,
        160,
        730,
        870
      )
    }
  }
}
