import Phaser from 'phaser'

interface EnemyManagerConfig {
  scene: Phaser.Scene
  player: Phaser.GameObjects.Rectangle
  onPlayerDamage: (amount: number) => void
}

export class EnemyManager {
  private scene: Phaser.Scene
  private player: Phaser.GameObjects.Rectangle

  private enemies: Phaser.GameObjects.Rectangle[] = []

  private enemyHealth = new Map<
    Phaser.GameObjects.Rectangle,
    number
  >()

  private playerDamageCooldown = 0

  private readonly enemySpeed = 80
  private readonly chaseDistance = 500
  private readonly contactDamage = 10
  private readonly damageCooldown = 500

  private onPlayerDamage:
    EnemyManagerConfig['onPlayerDamage']

  constructor(config: EnemyManagerConfig) {
    this.scene = config.scene
    this.player = config.player
    this.onPlayerDamage = config.onPlayerDamage
  }

  getEnemies() {
    return this.enemies
  }

  getEnemyHealth(
    enemy: Phaser.GameObjects.Rectangle
  ) {
    return this.enemyHealth.get(enemy) ?? 1
  }

  setEnemyHealth(
    enemy: Phaser.GameObjects.Rectangle,
    health: number
  ) {
    this.enemyHealth.set(
      enemy,
      health
    )
  }

  spawnAt(
    x: number,
    y: number,
    health = 3
  ) {
    const enemy =
      this.scene.add.rectangle(
        x,
        y,
        24,
        24,
        0xff4444
      )

    this.enemyHealth.set(
      enemy,
      health
    )

    this.enemies.push(
      enemy
    )

    return enemy
  }

  update(delta: number) {
    if (!this.player.active) {
      return
    }

    this.moveEnemies(delta)

    this.checkPlayerCollision(
      delta
    )
  }

  private moveEnemies(
    delta: number
  ) {
    const distance =
      this.enemySpeed *
      (delta / 1000)

    for (
      const enemy of
        this.enemies
    ) {
      if (!enemy.active) {
        continue
      }

      const distanceToPlayer =
        Phaser.Math.Distance.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        )

      // Don't let enemies chase
      // across the entire map.
      if (
        distanceToPlayer >
        this.chaseDistance
      ) {
        continue
      }

      const angle =
        Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        )

      enemy.x +=
        Math.cos(angle) *
        distance

      enemy.y +=
        Math.sin(angle) *
        distance
    }
  }

  private checkPlayerCollision(
    delta: number
  ) {
    if (
      this.playerDamageCooldown >
      0
    ) {
      this.playerDamageCooldown -=
        delta
    }

    if (
      this.playerDamageCooldown >
      0
    ) {
      return
    }

    for (
      const enemy of
        this.enemies
    ) {
      if (!enemy.active) {
        continue
      }

      const hit =
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          enemy.getBounds()
        )

      if (!hit) {
        continue
      }

      this.onPlayerDamage(
        this.contactDamage
      )

      this.playerDamageCooldown =
        this.damageCooldown

      break
    }
  }

  removeEnemy(
    enemy: Phaser.GameObjects.Rectangle
  ) {
    const index =
      this.enemies.indexOf(
        enemy
      )

    if (
      index !== -1
    ) {
      this.enemies.splice(
        index,
        1
      )
    }

    this.enemyHealth.delete(
      enemy
    )

    if (
      enemy.active
    ) {
      enemy.destroy()
    }
  }

  destroyAll() {
    for (
      const enemy of
        this.enemies
    ) {
      if (
        enemy.active
      ) {
        enemy.destroy()
      }
    }

    this.enemies = []

    this.enemyHealth.clear()

    this.playerDamageCooldown =
      0
  }
}