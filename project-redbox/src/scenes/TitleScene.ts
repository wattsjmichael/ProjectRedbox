import Phaser from 'phaser'

import {
  PersistenceSystem,
} from '../persistence/PersistenceSystem'

export class TitleScene
  extends Phaser.Scene {
  private starting =
    false

  private readonly persistence =
    new PersistenceSystem()

  constructor() {
    super(
      'TitleScene'
    )
  }

  create() {
    this.starting =
      false

    this.cameras.main
      .setBackgroundColor(
        '#050505'
      )

    this.add.circle(
      640,
      360,
      360,
      0x550000,
      0.12
    )

    this.add
      .text(
        640,
        265,
        'PROJECT',
        {
          fontFamily:
            'Arial',

          fontSize:
            '22px',

          color:
            '#999999',
        }
      )
      .setOrigin(
        0.5
      )

    this.add
      .text(
        640,
        335,
        'REDBOX',
        {
          fontFamily:
            'Arial Black, Arial',

          fontSize:
            '86px',

          color:
            '#e50914',

          fontStyle:
            'bold',
        }
      )
      .setOrigin(
        0.5
      )

    this.add
      .text(
        640,
        400,
        'THE DROP BEGINS',
        {
          fontFamily:
            'Arial',

          fontSize:
            '18px',

          color:
            '#777777',
        }
      )
      .setOrigin(
        0.5
      )

    const beginDrop =
      this.add
        .text(
          640,
          525,
          '[ BEGIN DROP ]',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '28px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          0.5
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    this.tweens.add({
      targets:
        beginDrop,

      alpha:
        0.4,

      duration:
        700,

      yoyo:
        true,

      repeat:
        -1,
    })

    beginDrop.on(
      'pointerdown',
      () => {
        this.beginGame()
      }
    )

    this.input.keyboard
      ?.once(
        'keydown-ENTER',
        () => {
          this.beginGame()
        }
      )

    this.createResetHunterButton()
  }

  private createResetHunterButton() {
    const resetHunter =
      this.add
        .text(
          640,
          655,
          '[ RESET HUNTER ]',
          {
            fontFamily:
              'Arial Black, Arial',
            fontSize:
              '14px',
            color:
              '#777777',
          }
        )
        .setOrigin(
          0.5
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    resetHunter.on(
      'pointerover',
      () => {
        resetHunter.setColor(
          '#ff5555'
        )
      }
    )

    resetHunter.on(
      'pointerout',
      () => {
        resetHunter.setColor(
          '#777777'
        )
      }
    )

    resetHunter.on(
      'pointerdown',
      () => {
        if (this.starting) {
          return
        }

        const confirmed =
          window.confirm(
            'Reset Hunter? This permanently deletes all inventory, MAG progress, equipment, and lifetime stats.'
          )

        if (!confirmed) {
          return
        }

        const reset =
          this.persistence.reset()

        if (!reset) {
          this.showResetError()
          return
        }

        this.scene.restart()
      }
    )
  }

  private showResetError() {
    const error =
      this.add
        .text(
          640,
          615,
          'RESET FAILED — SAVE DATA WAS NOT CHANGED',
          {
            fontFamily:
              'Arial Black, Arial',
            fontSize:
              '13px',
            color:
              '#ff5555',
          }
        )
        .setOrigin(
          0.5
        )

    this.time.delayedCall(
      2200,
      () => {
        error.destroy()
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

    this.cameras.main
      .flash(
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
