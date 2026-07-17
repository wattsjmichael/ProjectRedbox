import Phaser from 'phaser'

export class TitleScene extends Phaser.Scene {
  private starting =
    false

  constructor() {
    super('TitleScene')
  }

  create() {
    this.cameras.main.setBackgroundColor(
      '#050505'
    )

    // Subtle red background glow.
    this.add.circle(
      400,
      300,
      280,
      0x550000,
      0.12
    )

    this.add
      .text(
        400,
        225,
        'PROJECT',
        {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#999999',
        }
      )
      .setOrigin(0.5)

    this.add
      .text(
        400,
        280,
        'REDBOX',
        {
          fontFamily: 'Arial Black, Arial',
          fontSize: '72px',
          color: '#e50914',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5)

    this.add
      .text(
        400,
        335,
        'THE DROP BEGINS',
        {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#777777',
        }
      )
      .setOrigin(0.5)

    const beginDrop =
      this.add
        .text(
          400,
          430,
          '[ BEGIN DROP ]',
          {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#ffffff',
          }
        )
        .setOrigin(0.5)
        .setInteractive({
          useHandCursor: true,
        })

    // Pulse the start button.
    this.tweens.add({
      targets: beginDrop,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    })

    beginDrop.on(
      'pointerdown',
      () => {
        this.beginGame()
      }
    )

    // ENTER also starts the game.
    this.input.keyboard?.once(
      'keydown-ENTER',
      () => {
        this.beginGame()
      }
    )
  }

  private beginGame() {
    if (
      this.starting
    ) {
      return
    }

    this.starting =
      true

    this.cameras.main.flash(
      250,
      180,
      0,
      0
    )

    this.time.delayedCall(
      150,
      () => {
        this.scene.start(
          'GameScene'
        )
      }
    )
  }
}