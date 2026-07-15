import Phaser from 'phaser'

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private enemies: Phaser.GameObjects.Rectangle[] = []
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>

  private enemySpawnTimer = 0

  private enemyHealth = new Map<
    Phaser.GameObjects.Rectangle,
    number
  >()

  private killCount = 0
  private killText!: Phaser.GameObjects.Text

  private createDeathBurst(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const particle = this.add.rectangle(x, y, 6, 6, 0xff8844)

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
      const speed = Phaser.Math.FloatBetween(80, 180)

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy()
        },
      })
    }
  }

  private bullets: Phaser.GameObjects.Rectangle[] = []
  private bulletDirections = new Map<
    Phaser.GameObjects.Rectangle,
    Phaser.Math.Vector2
  >()

  private fireAtNearestEnemy() {
    if (this.enemies.length === 0) return

    let nearestEnemy = this.enemies[0]
    let nearestDistance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      nearestEnemy.x,
      nearestEnemy.y
    )

    for (const enemy of this.enemies) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      )

      if (distance < nearestDistance) {
        nearestEnemy = enemy
        nearestDistance = distance
      }
    }

    const direction = new Phaser.Math.Vector2(
      nearestEnemy.x - this.player.x,
      nearestEnemy.y - this.player.y
    ).normalize()

    const bullet = this.add.rectangle(
      this.player.x,
      this.player.y,
      10,
      4,
      0xffff00
    )

    bullet.setRotation(direction.angle())

    this.bullets.push(bullet)
    this.bulletDirections.set(bullet, direction)
  }

  private moveBullets(delta: number) {
    const bulletSpeed = 500
    const distance = bulletSpeed * (delta / 1000)

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]
      const direction = this.bulletDirections.get(bullet)

      if (!direction) continue

      bullet.x += direction.x * distance
      bullet.y += direction.y * distance

      // Check collision with enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j]

        const hit = Phaser.Geom.Intersects.RectangleToRectangle(
          bullet.getBounds(),
          enemy.getBounds()
        )

        if (hit) {
          const currentHealth = this.enemyHealth.get(enemy) ?? 1
          const newHealth = currentHealth - 1

          this.enemyHealth.set(enemy, newHealth)

          // Tiny hit flash
          enemy.setFillStyle(0xffffff)

          this.time.delayedCall(75, () => {
            if (enemy.active) {
              enemy.setFillStyle(0xff4444)
            }
          })

          bullet.destroy()
          this.bulletDirections.delete(bullet)
          this.bullets.splice(i, 1)

          if (newHealth <= 0) {
            this.createDeathBurst(enemy.x, enemy.y)
            this.cameras.main.shake(80, 0.003)

            enemy.destroy()
            this.enemyHealth.delete(enemy)
            this.enemies.splice(j, 1)

            this.killCount++
            this.killText.setText(`Kills: ${this.killCount}`)
          }

          break
        }
      }

      // Bullet may already have been destroyed by a collision
      if (!bullet.active) {
        continue
      }

      // Destroy bullets that leave the arena
      if (
        bullet.x < 0 ||
        bullet.x > 800 ||
        bullet.y < 0 ||
        bullet.y > 600
      ) {
        bullet.destroy()
        this.bulletDirections.delete(bullet)
        this.bullets.splice(i, 1)
      }
    }
  }

  private fireTimer = 0

  constructor() {
    super('GameScene')
  }

  create() {
    // Our extremely expensive AAA Ranger
    this.player = this.add.rectangle(400, 300, 32, 32, 0x00ff88)
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      color: '#ffffff',
    })

    this.cursors = this.input.keyboard!.createCursorKeys()

    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>
  }


  update(_: number, delta: number) {
    this.movePlayer(delta)

    // Spawn a new enemy every second
    this.enemySpawnTimer += delta

    if (this.enemySpawnTimer >= 1000) {
      this.spawnEnemy()
      this.enemySpawnTimer = 0
    }

    this.moveEnemies(delta)
    // Fire every 400ms
    this.fireTimer += delta

    if (this.fireTimer >= 400) {
      this.fireAtNearestEnemy()
      this.fireTimer = 0
    }

    this.moveBullets(delta)
  }

  private movePlayer(delta: number) {
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

    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784)
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584)
  }

  private spawnEnemy() {
    const side = Phaser.Math.Between(0, 3)

    let x = 0
    let y = 0

    switch (side) {
      case 0: // Top
        x = Phaser.Math.Between(0, 800)
        y = 0
        break

      case 1: // Right
        x = 800
        y = Phaser.Math.Between(0, 600)
        break

      case 2: // Bottom
        x = Phaser.Math.Between(0, 800)
        y = 600
        break

      case 3: // Left
        x = 0
        y = Phaser.Math.Between(0, 600)
        break
    }

    const enemy = this.add.rectangle(x, y, 24, 24, 0xff4444)
    this.enemyHealth.set(enemy, 3)

    this.enemies.push(enemy)
  }

  private moveEnemies(delta: number) {
    const enemySpeed = 80
    const distance = enemySpeed * (delta / 1000)

    for (const enemy of this.enemies) {
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      )

      enemy.x += Math.cos(angle) * distance
      enemy.y += Math.sin(angle) * distance
    }
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