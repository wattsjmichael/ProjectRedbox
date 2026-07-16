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

  constructor(
    scene: Phaser.Scene,
    stats: PlayerStats
  ) {
    this.scene =
      scene

    this.create(
      stats
    )
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