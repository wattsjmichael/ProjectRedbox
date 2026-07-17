import Phaser from 'phaser'

interface ResultsData {
  kills: number
  level: number
  rares: number
  timeMs: number
}

export class ResultsScene extends Phaser.Scene {
  private starting = false

  constructor() {
    super('ResultsScene')
  }

  create(data: ResultsData) {
    this.cameras.main.setBackgroundColor(
      '#050505'
    )

    const totalSeconds =
      Math.floor(
        data.timeMs / 1000
      )

    const minutes =
      Math.floor(
        totalSeconds / 60
      )

    const seconds =
      totalSeconds % 60

    const formattedTime =
      `${minutes}:${seconds
        .toString()
        .padStart(
          2,
          '0'
        )}`

    this.add
      .text(
        400,
        100,
        'DROP COMPLETE',
        {
          fontFamily:
            'Arial Black, Arial',

          fontSize:
            '46px',

          color:
            '#e50914',
        }
      )
      .setOrigin(
        0.5
      )

    this.add
      .rectangle(
        400,
        145,
        320,
        3,
        0xe50914
      )

    this.add
      .text(
        400,
        210,
        'MISSION RESULTS',
        {
          fontFamily:
            'Arial',

          fontSize:
            '20px',

          color:
            '#999999',
        }
      )
      .setOrigin(
        0.5
      )

    const results =
      [
        {
          label:
            'KILLS',

          value:
            data.kills,
        },

        {
          label:
            'LEVEL',

          value:
            data.level,
        },

        {
          label:
            'RED BOXES',

          value:
            data.rares,
        },

        {
          label:
            'TIME',

          value:
            formattedTime,
        },
      ]

    let y =
      260

    for (
      const result of
        results
    ) {
      this.add
        .text(
          300,
          y,
          result.label,
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
          1,
          0.5
        )

      this.add
        .text(
          500,
          y,
          `${result.value}`,
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '24px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          0,
          0.5
        )

      y +=
        50
    }

    const runAgain =
      this.add
        .text(
          400,
          500,
          '[ RUN AGAIN ]',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '28px',

            color:
              '#e50914',
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
        runAgain,

      alpha:
        0.45,

      duration:
        700,

      yoyo:
        true,

      repeat:
        -1,
    })

    runAgain.on(
      'pointerdown',
      () => {
        this.startNewRun()
      }
    )

    this.input.keyboard?.once(
      'keydown-ENTER',
      () => {
        this.startNewRun()
      }
    )

    this.add
      .text(
        400,
        555,
        'ENTER TO BEGIN ANOTHER DROP',
        {
          fontFamily:
            'Arial',

          fontSize:
            '13px',

          color:
            '#555555',
        }
      )
      .setOrigin(
        0.5
      )
  }

  private startNewRun() {
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