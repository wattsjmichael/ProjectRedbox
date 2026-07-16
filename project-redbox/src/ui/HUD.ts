import Phaser from 'phaser'

import type {
  PlayerStats,
} from '../player/PlayerStats'

import type {
  LevelGains,
} from '../progression/ProgressionSystem'

export class HUD {
  private scene:
    Phaser.Scene

  private healthText!:
    Phaser.GameObjects.Text

  private killText!:
    Phaser.GameObjects.Text

  private weaponText!:
    Phaser.GameObjects.Text

  private xpBarBackground!:
    Phaser.GameObjects.Rectangle

  private xpBarFill!:
    Phaser.GameObjects.Rectangle

  private xpText!:
    Phaser.GameObjects.Text

  private comboBoxes:
    Phaser.GameObjects.Rectangle[] = []

  private comboLabels:
    Phaser.GameObjects.Text[] = []

  private comboBarBackground!:
    Phaser.GameObjects.Rectangle

  private comboBarFill!:
    Phaser.GameObjects.Rectangle

  constructor(
    scene: Phaser.Scene,
    stats: PlayerStats
  ) {
    this.scene =
      scene

    this.create(
      stats
    )

    this.createComboUI()
  }

  private create(
    stats: PlayerStats
  ) {
    this.killText =
      this.scene.add
        .text(
          16,
          16,
          'Kills: 0',
          {
            fontSize:
              '24px',

            color:
              '#ffffff',
          }
        )
        .setScrollFactor(
          0
        )

    this.healthText =
      this.scene.add
        .text(
          16,
          50,
          `HP: ${stats.health} / ${stats.maxHealth}`,
          {
            fontSize:
              '24px',

            color:
              '#ffffff',
          }
        )
        .setScrollFactor(
          0
        )

    this.weaponText =
      this.scene.add
        .text(
          784,
          16,
          'RIFLE',
          {
            fontSize:
              '20px',

            color:
              '#ffff00',
          }
        )
        .setOrigin(
          1,
          0
        )
        .setScrollFactor(
          0
        )

    this.xpBarBackground =
      this.scene.add
        .rectangle(
          400,
          580,
          300,
          16,
          0x333333
        )
        .setScrollFactor(
          0
        )

    this.xpBarFill =
      this.scene.add
        .rectangle(
          250,
          580,
          0,
          12,
          0x44aaff
        )
        .setOrigin(
          0,
          0.5
        )
        .setScrollFactor(
          0
        )

    this.xpText =
      this.scene.add
        .text(
          400,
          555,
          `XP: ${stats.currentXP} / ${stats.xpToNextLevel}`,
          {
            fontSize:
              '18px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )
  }

  private createComboUI() {
    const startX =
      340

    const y =
      495

    const spacing =
      60

    for (
      let i = 0;
      i < 3;
      i++
    ) {
      const box =
        this.scene.add
          .rectangle(
            startX +
              i *
                spacing,
            y,
            42,
            42,
            0x222222,
            0.8
          )
          .setStrokeStyle(
            2,
            0x666666
          )
          .setScrollFactor(
            0
          )

      const label =
        this.scene.add
          .text(
            startX +
              i *
                spacing,
            y,
            `${i + 1}`,
            {
              fontSize:
                '22px',

              color:
                '#777777',
            }
          )
          .setOrigin(
            0.5
          )
          .setScrollFactor(
            0
          )

      this.comboBoxes.push(
        box
      )

      this.comboLabels.push(
        label
      )
    }

    this.comboBarBackground =
      this.scene.add
        .rectangle(
          400,
          527,
          160,
          8,
          0x222222
        )
        .setScrollFactor(
          0
        )

    this.comboBarFill =
      this.scene.add
        .rectangle(
          320,
          527,
          0,
          6,
          0xffcc44
        )
        .setOrigin(
          0,
          0.5
        )
        .setScrollFactor(
          0
        )

    this.setComboVisible(
      false
    )
  }

  setComboVisible(
    visible: boolean
  ) {
    for (
      const box of
        this.comboBoxes
    ) {
      box.setVisible(
        visible
      )
    }

    for (
      const label of
        this.comboLabels
    ) {
      label.setVisible(
        visible
      )
    }

    this.comboBarBackground.setVisible(
      visible
    )

    this.comboBarFill.setVisible(
      visible
    )
  }

  hideCombo() {
    this.setComboVisible(
      false
    )
  }

  updateCombo(
    step: number,
    progress: number,
    failed: boolean
  ) {
    this.setComboVisible(
      true
    )

    if (
      failed
    ) {
      for (
        const box of
          this.comboBoxes
      ) {
        box.setFillStyle(
          0x662222
        )

        box.setStrokeStyle(
          2,
          0xff4444
        )
      }

      for (
        const label of
          this.comboLabels
      ) {
        label.setColor(
          '#ff4444'
        )
      }

      this.comboBarFill.width =
        0

      return
    }

    for (
      let i = 0;
      i < 3;
      i++
    ) {
      const completed =
        i <
        step

      const next =
        i ===
        step

      if (
        completed
      ) {
        this.comboBoxes[
          i
        ].setFillStyle(
          0x665500
        )

        this.comboBoxes[
          i
        ].setStrokeStyle(
          2,
          0xffcc44
        )

        this.comboLabels[
          i
        ].setColor(
          '#ffffff'
        )
      } else if (
        next
      ) {
        this.comboBoxes[
          i
        ].setFillStyle(
          0x333333
        )

        this.comboBoxes[
          i
        ].setStrokeStyle(
          3,
          0xffff88
        )

        this.comboLabels[
          i
        ].setColor(
          '#ffff88'
        )
      } else {
        this.comboBoxes[
          i
        ].setFillStyle(
          0x222222
        )

        this.comboBoxes[
          i
        ].setStrokeStyle(
          2,
          0x666666
        )

        this.comboLabels[
          i
        ].setColor(
          '#777777'
        )
      }
    }

    this.comboBarFill.width =
      160 *
      Phaser.Math.Clamp(
        progress,
        0,
        1
      )
  }

  updateHealth(
    stats: PlayerStats
  ) {
    this.healthText.setText(
      `HP: ${stats.health} / ${stats.maxHealth}`
    )
  }

  updateKills(
    kills: number
  ) {
    this.killText.setText(
      `Kills: ${kills}`
    )
  }

  updateWeapon(
    weaponName: string
  ) {
    this.weaponText.setText(
      weaponName.toUpperCase()
    )
  }

  updateXP(
    stats: PlayerStats
  ) {
    const maxWidth =
      300

    const progress =
      stats.currentXP /
      stats.xpToNextLevel

    this.xpBarFill.width =
      maxWidth *
      Phaser.Math.Clamp(
        progress,
        0,
        1
      )

    this.xpText.setText(
      `XP: ${stats.currentXP} / ${stats.xpToNextLevel}`
    )
  }

  showEncounterMessage(
    message: string
  ) {
    const text =
      this.scene.add
        .text(
          400,
          100,
          message,
          {
            fontSize:
              '28px',

            color:
              '#ff4444',
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )

    this.scene.tweens.add({
      targets:
        text,

      alpha:
        0,

      y:
        70,

      duration:
        1200,

      onComplete:
        () => {
          text.destroy()
        },
    })
  }

  showLootMessage(
    message: string
  ) {
    const text =
      this.scene.add
        .text(
          400,
          120,
          message,
          {
            fontSize:
              '24px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )

    this.scene.tweens.add({
      targets:
        text,

      alpha:
        0,

      y:
        90,

      duration:
        900,

      onComplete:
        () => {
          text.destroy()
        },
    })
  }

  showRareLootMessage(
    weaponName: string
  ) {
    const rareText =
      this.scene.add
        .text(
          400,
          100,
          'RARE WEAPON',
          {
            fontSize:
              '20px',

            color:
              '#ff4444',
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )

    const weaponText =
      this.scene.add
        .text(
          400,
          135,
          weaponName,
          {
            fontSize:
              '32px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )

    this.scene.cameras.main.flash(
      200,
      255,
      0,
      0
    )

    this.scene.tweens.add({
      targets: [
        rareText,
        weaponText,
      ],

      alpha:
        0,

      y:
        '-=30',

      delay:
        800,

      duration:
        600,

      onComplete:
        () => {
          rareText.destroy()

          weaponText.destroy()
        },
    })
  }

  showLevelUp(
    level: number,
    gains: LevelGains
  ) {
    const levelText =
      this.scene.add
        .text(
          400,
          220,
          `LEVEL ${level}`,
          {
            fontSize:
              '42px',

            color:
              '#44aaff',

            align:
              'center',
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )

    const statsText =
      this.scene.add
        .text(
          400,
          280,
          `HP +${gains.hpGain}\nPOWER +${gains.powerGain}\nDEFENSE +${gains.defenseGain}`,
          {
            fontSize:
              '20px',

            color:
              '#ffffff',

            align:
              'center',
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )

    levelText.setAlpha(
      0
    )

    statsText.setAlpha(
      0
    )

    this.scene.tweens.add({
      targets: [
        levelText,
        statsText,
      ],

      alpha:
        1,

      duration:
        150,

      yoyo:
        true,

      hold:
        600,

      onComplete:
        () => {
          levelText.destroy()

          statsText.destroy()
        },
    })
  }

  showGameOver(
    kills: number,
    onRestart: () => void
  ) {
    this.scene.add
      .text(
        400,
        250,
        'DROP FAILED',
        {
          fontSize:
            '48px',

          color:
            '#ff4444',
        }
      )
      .setOrigin(
        0.5
      )
      .setScrollFactor(
        0
      )

    this.scene.add
      .text(
        400,
        320,
        `Kills: ${kills}`,
        {
          fontSize:
            '24px',

          color:
            '#ffffff',
        }
      )
      .setOrigin(
        0.5
      )
      .setScrollFactor(
        0
      )

    const restartText =
      this.scene.add
        .text(
          400,
          380,
          '[ RUN AGAIN ]',
          {
            fontSize:
              '28px',

            color:
              '#00ff88',
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    restartText.on(
      'pointerdown',
      onRestart
    )
  }
}