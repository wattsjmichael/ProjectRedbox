import Phaser from 'phaser'

export class TitleScene extends Phaser.Scene {
  private starting = false

  constructor() {
    super('TitleScene')
  }

  create() {
    this.starting = false
    this.input.setDefaultCursor('default')
    this.cameras.main.setBackgroundColor('#050505')
    this.add.circle(640, 360, 360, 0x550000, 0.12)

    this.add.text(640, 265, 'PROJECT', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#999999',
    }).setOrigin(0.5)

    this.add.text(640, 335, 'REDBOX', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '86px',
      color: '#e50914',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(640, 400, 'CHOOSE YOUR HUNTER', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#777777',
    }).setOrigin(0.5)

    const profiles = this.add.text(640, 525, '[ HUNTER PROFILES ]', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#ffffff',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    this.tweens.add({
      targets: profiles,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    })

    profiles.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0) this.openProfiles()
    })
    this.input.keyboard?.once('keydown-ENTER', () => this.openProfiles())
  }

  private openProfiles() {
    if (this.starting) return
    this.starting = true
    this.cameras.main.flash(250, 180, 0, 0)
    this.time.delayedCall(150, () => {
      this.scene.start('HunterProfileScene')
    })
  }
}
