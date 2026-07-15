import Phaser from 'phaser'

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>

  constructor() {
    super('GameScene')
  }

  create() {
    // Our beautiful AAA-quality Ranger
    this.player = this.add.rectangle(400, 300, 32, 32, 0x00ff88)

    this.cursors = this.input.keyboard!.createCursorKeys()

    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>
  }

  update(_: number, delta: number) {
    const speed = 250
    const distance = speed * (delta / 1000)

    if (this.wasd.left.isDown || this.cursors.left.isDown) {
      this.player.x -= distance
    }

    if (this.wasd.right.isDown || this.cursors.right.isDown) {
      this.player.x += distance
    }

    if (this.wasd.up.isDown || this.cursors.up.isDown) {
      this.player.y -= distance
    }

    if (this.wasd.down.isDown || this.cursors.down.isDown) {
      this.player.y += distance
    }

    // Keep the player inside the arena
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784)
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584)
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111827',
  scene: GameScene,
}

new Phaser.Game(config)