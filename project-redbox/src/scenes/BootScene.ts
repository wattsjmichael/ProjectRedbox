import Phaser from 'phaser'

export class BootScene
  extends Phaser.Scene {
  constructor() {
    super(
      'BootScene'
    )
  }

  create() {
    this.cameras.main
      .setBackgroundColor(
        '#050505'
      )

    const dadbod =
      this.add
        .text(
          640,
          320,
          'DADBOD',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '72px',

            color:
              '#e50914',

            fontStyle:
              'bold',
          }
        )
        .setOrigin(
          0.5
        )
        .setAlpha(
          0
        )

    const line =
      this.add
        .rectangle(
          640,
          370,
          360,
          3,
          0xe50914
        )
        .setScale(
          0,
          1
        )
        .setAlpha(
          0
        )

    const studios =
      this.add
        .text(
          640,
          405,
          'S T U D I O S',
          {
            fontFamily:
              'Arial',

            fontSize:
              '20px',

            color:
              '#dddddd',
          }
        )
        .setOrigin(
          0.5
        )
        .setAlpha(
          0
        )

    this.tweens.add({
      targets:
        dadbod,

      alpha:
        1,

      duration:
        600,

      ease:
        'Power2',
    })

    this.time.delayedCall(
      350,
      () => {
        line.setAlpha(
          1
        )

        this.tweens.add({
          targets:
            line,

          scaleX:
            1,

          duration:
            500,

          ease:
            'Power2',
        })
      }
    )

    this.time.delayedCall(
      700,
      () => {
        this.tweens.add({
          targets:
            studios,

          alpha:
            1,

          duration:
            500,
        })
      }
    )

    this.time.delayedCall(
      2000,
      () => {
        this.cameras.main
          .flash(
            350,
            180,
            0,
            0
          )

        this.time
          .delayedCall(
            200,
            () => {
              this.scene.start(
                'TitleScene'
              )
            }
          )
      }
    )
  }
}