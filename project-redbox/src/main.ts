import Phaser from 'phaser'

type WeaponType = 'rifle' | 'scattergun' | 'cannon'

type LootType = 'rifle' | 'scattergun' | 'cannon' | 'redbox'

interface LootDrop {
  object: Phaser.GameObjects.Rectangle
  type: LootType
}

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private lootDrops: LootDrop[] = []
  

  private enemies: Phaser.GameObjects.Rectangle[] = []
  private enemyHealth = new Map<Phaser.GameObjects.Rectangle, number>()

  private bullets: Phaser.GameObjects.Rectangle[] = []
  private bulletDirections = new Map<
    Phaser.GameObjects.Rectangle,
    Phaser.Math.Vector2
  >()

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>

  private enemySpawnTimer = 0
  private fireTimer = 0

  private currentWeapon: WeaponType = 'rifle'
  private weaponText!: Phaser.GameObjects.Text

  private playerHealth = 100
  private maxPlayerHealth = 100
  private playerDamageCooldown = 0

  private crosshair!: Phaser.GameObjects.Arc

  private healthText!: Phaser.GameObjects.Text
  private killText!: Phaser.GameObjects.Text

  private killCount = 0
  private isGameOver = false

  private currentXP = 0
  private xpToNextLevel = 10

  private playerLevel = 1

  private playerPower = 10
  private playerDefense = 5
  private playerSpeed = 250

  private xpBarBackground!: Phaser.GameObjects.Rectangle
  private xpBarFill!: Phaser.GameObjects.Rectangle
  private xpText!: Phaser.GameObjects.Text

  constructor() {
    super('GameScene')
  }

  create() {
    // Reset run state
    this.playerHealth = 100
    this.maxPlayerHealth = 100
    this.playerDamageCooldown = 0

    this.playerLevel = 1
    this.playerPower = 10
    this.playerDefense = 5
    this.playerSpeed = 250

    this.currentXP = 0
    this.xpToNextLevel = 10

    this.lootDrops = []

    this.killCount = 0
    this.isGameOver = false

    this.enemySpawnTimer = 0
    this.fireTimer = 0

    this.currentWeapon = 'rifle'

    this.enemies = []
    this.bullets = []

    this.enemyHealth.clear()
    this.bulletDirections.clear()

    // Player
    this.player = this.add.rectangle(
      400,
      300,
      32,
      32,
      0x00ff88
    )

    // Weapon HUD
    this.weaponText = this.add
      .text(
        784,
        16,
        'RIFLE',
        {
          fontSize: '20px',
          color: '#ffff00',
        }
      )
      .setOrigin(1, 0)

    // Crosshair
    this.crosshair = this.add.circle(
      0,
      0,
      8,
      0xffffff,
      0
    )

    this.crosshair.setStrokeStyle(
      2,
      0xffffff
    )

    // HUD
    this.killText = this.add.text(
      16,
      16,
      'Kills: 0',
      {
        fontSize: '24px',
        color: '#ffffff',
      }
    )

    this.healthText = this.add.text(
      16,
      50,
      'HP: 100 / 100',
      {
        fontSize: '24px',
        color: '#ffffff',
      }
    )

    this.xpBarBackground = this.add.rectangle(
      400,
      580,
      300,
      16,
      0x333333
    )

    this.xpBarFill = this.add
      .rectangle(
        250,
        580,
        0,
        12,
        0x44aaff
      )
      .setOrigin(0, 0.5)

    this.xpText = this.add
      .text(
        400,
        555,
        `XP: 0 / ${this.xpToNextLevel}`,
        {
          fontSize: '18px',
          color: '#ffffff',
        }
      )
      .setOrigin(0.5)

    // Controls
    this.cursors =
      this.input.keyboard!.createCursorKeys()

    this.wasd =
      this.input.keyboard!.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      }) as Record<
        string,
        Phaser.Input.Keyboard.Key
      >

    // Temporary dev weapon switching
    this.input.keyboard!.on(
      'keydown-ONE',
      () => {
        this.setWeapon('rifle')
      }
    )

    this.input.keyboard!.on(
      'keydown-TWO',
      () => {
        this.setWeapon('scattergun')
      }
    )

    this.input.keyboard!.on(
      'keydown-THREE',
      () => {
        this.setWeapon('cannon')
      }
    )
  }

  update(_: number, delta: number) {
    if (this.isGameOver) {
      return
    }

    const pointer =
      this.input.activePointer

    this.crosshair.setPosition(
      pointer.worldX,
      pointer.worldY
    )

    this.movePlayer(delta)

    // Spawn enemies
    this.enemySpawnTimer += delta

    if (this.enemySpawnTimer >= 1000) {
      this.spawnEnemy()
      this.enemySpawnTimer = 0
    }

    this.moveEnemies(delta)

    this.checkEnemyPlayerCollision(
      delta
    )
    this.checkLootCollection()

    // Auto fire
    this.fireTimer += delta

    if (
      this.fireTimer >=
      this.getFireRate()
    ) {
      this.fireAtMouse()
      this.fireTimer = 0
    }

    this.moveBullets(delta)
  }

  private checkLootCollection() {
  if (
    this.isGameOver ||
    !this.player.active
  ) {
    return
  }

  for (
    let i =
      this.lootDrops.length - 1;
    i >= 0;
    i--
  ) {
    const loot =
      this.lootDrops[i]

    if (!loot.object.active) {
      continue
    }

    const collected =
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        loot.object.getBounds()
      )

    if (!collected) {
      continue
    }

    this.collectLoot(loot)

    this.lootDrops.splice(
      i,
      1
    )
  }
}

private collectLoot(
  loot: LootDrop
) {
  const type = loot.type

  const beam =
    loot.object.getData(
      'beam'
    ) as
      | Phaser.GameObjects.Rectangle
      | undefined

  if (beam?.active) {
    beam.destroy()
  }

  loot.object.destroy()

  if (
    type === 'rifle' ||
    type === 'scattergun' ||
    type === 'cannon'
  ) {
    this.setWeapon(type)

    this.showLootMessage(
      `${type.toUpperCase()} EQUIPPED`
    )

    return
  }

  if (type === 'redbox') {
    this.collectRedBox()
  }
}

private collectRedBox() {
  this.showLootMessage(
    'RARE WEAPON FOUND'
  )

  // Placeholder rare reward:
  // give the player the cannon for now
  this.setWeapon('cannon')
}

private showLootMessage(
  message: string
) {
  const text =
    this.add
      .text(
        400,
        120,
        message,
        {
          fontSize: '24px',
          color: '#ffffff',
        }
      )
      .setOrigin(0.5)

  this.tweens.add({
    targets: text,
    alpha: 0,
    y: 90,
    duration: 900,

    onComplete: () => {
      text.destroy()
    },
  })
}

private createRedBoxEffect(
  redBox: Phaser.GameObjects.Rectangle
) {
  // Pulsing glow
  this.tweens.add({
    targets: redBox,
    scale: 1.4,
    alpha: 0.7,
    duration: 400,
    yoyo: true,
    repeat: -1,
  })

  // Vertical beacon
  const beam =
    this.add.rectangle(
      redBox.x,
      redBox.y - 60,
      6,
      120,
      0xff0000,
      0.35
    )

  this.tweens.add({
    targets: beam,
    alpha: 0.1,
    duration: 500,
    yoyo: true,
    repeat: -1,
  })

  // Keep the beam associated with the box
  redBox.setData(
    'beam',
    beam
  )

  // Screen reaction
  this.cameras.main.flash(
    150,
    255,
    0,
    0
  )

  this.cameras.main.shake(
    150,
    0.006
  )
}

  private setWeapon(
    weapon: WeaponType
  ) {
    this.currentWeapon = weapon

    this.weaponText.setText(
      weapon.toUpperCase()
    )

    this.fireTimer = 0
  }

  private movePlayer(delta: number) {
    if (
      this.isGameOver ||
      !this.player.active
    ) {
      return
    }

    const distance =
      this.playerSpeed *
      (delta / 1000)

    if (
      this.wasd.left.isDown ||
      this.cursors.left.isDown
    ) {
      this.player.x -= distance
    }

    if (
      this.wasd.right.isDown ||
      this.cursors.right.isDown
    ) {
      this.player.x += distance
    }

    if (
      this.wasd.up.isDown ||
      this.cursors.up.isDown
    ) {
      this.player.y -= distance
    }

    if (
      this.wasd.down.isDown ||
      this.cursors.down.isDown
    ) {
      this.player.y += distance
    }

    this.player.x =
      Phaser.Math.Clamp(
        this.player.x,
        16,
        784
      )

    this.player.y =
      Phaser.Math.Clamp(
        this.player.y,
        16,
        584
      )
  }

  private spawnEnemy() {
    if (this.isGameOver) {
      return
    }

    const side =
      Phaser.Math.Between(0, 3)

    let x = 0
    let y = 0

    switch (side) {
      case 0:
        x = Phaser.Math.Between(
          0,
          800
        )
        y = 0
        break

      case 1:
        x = 800
        y = Phaser.Math.Between(
          0,
          600
        )
        break

      case 2:
        x = Phaser.Math.Between(
          0,
          800
        )
        y = 600
        break

      case 3:
        x = 0
        y = Phaser.Math.Between(
          0,
          600
        )
        break
    }

    const enemy =
      this.add.rectangle(
        x,
        y,
        24,
        24,
        0xff4444
      )

    this.enemyHealth.set(
      enemy,
      3
    )

    this.enemies.push(enemy)
  }

  private moveEnemies(
    delta: number
  ) {
    if (
      this.isGameOver ||
      !this.player.active
    ) {
      return
    }

    const enemySpeed = 80

    const distance =
      enemySpeed *
      (delta / 1000)

    for (const enemy of this.enemies) {
      if (!enemy.active) {
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

  private checkEnemyPlayerCollision(
    delta: number
  ) {
    if (
      this.isGameOver ||
      !this.player.active
    ) {
      return
    }

    if (
      this.playerDamageCooldown > 0
    ) {
      this.playerDamageCooldown -=
        delta
    }

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue
      }

      const hit =
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          enemy.getBounds()
        )

      if (
        hit &&
        this.playerDamageCooldown <= 0
      ) {
        this.damagePlayer(10)

        this.playerDamageCooldown =
          500

        break
      }
    }
  }

  private damagePlayer(
    amount: number
  ) {
    if (
      this.isGameOver ||
      !this.player.active
    ) {
      return
    }

    this.playerHealth -= amount

    this.playerHealth =
      Math.max(
        0,
        this.playerHealth
      )

    this.healthText.setText(
      `HP: ${this.playerHealth} / ${this.maxPlayerHealth}`
    )

    this.player.setFillStyle(
      0xffffff
    )

    this.time.delayedCall(
      100,
      () => {
        if (
          this.player.active &&
          !this.isGameOver
        ) {
          this.player.setFillStyle(
            0x00ff88
          )
        }
      }
    )

    this.cameras.main.shake(
      120,
      0.008
    )

    if (
      this.playerHealth <= 0
    ) {
      this.gameOver()
    }
  }

  private gameOver() {
    if (this.isGameOver) {
      return
    }

    this.isGameOver = true
    this.playerHealth = 0

    this.healthText.setText(
      `HP: 0 / ${this.maxPlayerHealth}`
    )

    this.input.keyboard?.resetKeys()

    if (this.player.active) {
      this.player.destroy()
    }

    this.add
      .text(
        400,
        250,
        'DROP FAILED',
        {
          fontSize: '48px',
          color: '#ff4444',
        }
      )
      .setOrigin(0.5)

    this.add
      .text(
        400,
        320,
        `Kills: ${this.killCount}`,
        {
          fontSize: '24px',
          color: '#ffffff',
        }
      )
      .setOrigin(0.5)

    const restartText =
      this.add
        .text(
          400,
          380,
          '[ RUN AGAIN ]',
          {
            fontSize: '28px',
            color: '#00ff88',
          }
        )
        .setOrigin(0.5)
        .setInteractive({
          useHandCursor: true,
        })

    restartText.on(
      'pointerdown',
      () => {
        this.scene.restart()
      }
    )
  }

  private fireAtMouse() {
    if (
      this.isGameOver ||
      !this.player.active
    ) {
      return
    }

    const pointer =
      this.input.activePointer

    const direction =
      new Phaser.Math.Vector2(
        pointer.worldX -
          this.player.x,

        pointer.worldY -
          this.player.y
      )

    if (
      direction.length() === 0
    ) {
      return
    }

    direction.normalize()

    switch (
      this.currentWeapon
    ) {
      case 'rifle':
        this.fireRifle(direction)
        break

      case 'scattergun':
        this.fireScattergun(
          direction
        )
        break

      case 'cannon':
        this.fireCannon(direction)
        break
    }
  }

  private fireRifle(
    direction: Phaser.Math.Vector2
  ) {
    this.createBullet(
      direction,
      500,
      12,
      4,
      0xffff00,
      1,
      'rifle'
    )
  }

  private fireScattergun(
    direction: Phaser.Math.Vector2
  ) {
    const pelletCount = 5
    const spread = 0.35

    for (
      let i = 0;
      i < pelletCount;
      i++
    ) {
      const pelletDirection =
        direction
          .clone()
          .rotate(
            Phaser.Math.FloatBetween(
              -spread,
              spread
            )
          )

      this.createBullet(
        pelletDirection,
        450,
        8,
        4,
        0xffaa00,
        1,
        'scattergun'
      )
    }
  }

  private fireCannon(
    direction: Phaser.Math.Vector2
  ) {
    this.createBullet(
      direction,
      250,
      18,
      18,
      0xff4444,
      3,
      'cannon'
    )
  }

  private createBullet(
    direction: Phaser.Math.Vector2,
    speed: number,
    width: number,
    height: number,
    color: number,
    damage: number,
    weaponType: WeaponType
  ) {
    const bullet =
      this.add.rectangle(
        this.player.x,
        this.player.y,
        width,
        height,
        color
      )

    bullet.setRotation(
      direction.angle()
    )

    this.bullets.push(
      bullet
    )

    this.bulletDirections.set(
      bullet,
      direction
    )

    bullet.setData(
      'speed',
      speed
    )

    bullet.setData(
      'damage',
      damage
    )

    bullet.setData(
      'weaponType',
      weaponType
    )
  }

  private moveBullets(
    delta: number
  ) {
    if (this.isGameOver) {
      return
    }

    for (
      let i =
        this.bullets.length - 1;
      i >= 0;
      i--
    ) {
      const bullet =
        this.bullets[i]

      if (!bullet.active) {
        continue
      }

      const bulletSpeed =
        bullet.getData(
          'speed'
        ) ?? 500

      const distance =
        bulletSpeed *
        (delta / 1000)

      const direction =
        this.bulletDirections.get(
          bullet
        )

      if (!direction) {
        continue
      }

      bullet.x +=
        direction.x *
        distance

      bullet.y +=
        direction.y *
        distance

      // Check enemy collisions
      for (
        let j =
          this.enemies.length - 1;
        j >= 0;
        j--
      ) {
        const enemy =
          this.enemies[j]

        if (!enemy.active) {
          continue
        }

        const hit =
          Phaser.Geom.Intersects.RectangleToRectangle(
            bullet.getBounds(),
            enemy.getBounds()
          )

        if (!hit) {
          continue
        }

        const currentHealth =
          this.enemyHealth.get(
            enemy
          ) ?? 1

        const damage =
          bullet.getData(
            'damage'
          ) ?? 1

        const weaponType =
          bullet.getData(
            'weaponType'
          ) as WeaponType

        const impactX =
          enemy.x

        const impactY =
          enemy.y

        const newHealth =
          currentHealth -
          damage

        this.enemyHealth.set(
          enemy,
          newHealth
        )

        // Hit flash
        enemy.setFillStyle(
          0xffffff
        )

        this.time.delayedCall(
          75,
          () => {
            if (enemy.active) {
              enemy.setFillStyle(
                0xff4444
              )
            }
          }
        )

        // Destroy bullet
        bullet.destroy()

        this.bulletDirections.delete(
          bullet
        )

        this.bullets.splice(
          i,
          1
        )

        // Direct hit death
        if (newHealth <= 0) {
          this.killEnemy(
            enemy
          )
        }

        // Cannon splash happens after
        // direct-hit processing.
        if (
          weaponType ===
          'cannon'
        ) {
          this.createCannonExplosion(
            impactX,
            impactY
          )
        }

        break
      }

      if (!bullet.active) {
        continue
      }

      // Destroy bullets outside arena
      if (
        bullet.x < 0 ||
        bullet.x > 800 ||
        bullet.y < 0 ||
        bullet.y > 600
      ) {
        bullet.destroy()

        this.bulletDirections.delete(
          bullet
        )

        this.bullets.splice(
          i,
          1
        )
      }
    }
  }

  private createCannonExplosion(
    x: number,
    y: number
  ) {
    const radius = 80

    const explosion =
      this.add.circle(
        x,
        y,
        radius,
        0xff4444,
        0.25
      )

    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 1.4,
      duration: 200,

      onComplete: () => {
        explosion.destroy()
      },
    })

    // Work backwards because enemies
    // may be removed during the loop.
    for (
      let i =
        this.enemies.length - 1;
      i >= 0;
      i--
    ) {
      const enemy =
        this.enemies[i]

      if (!enemy.active) {
        continue
      }

      const distance =
        Phaser.Math.Distance.Between(
          x,
          y,
          enemy.x,
          enemy.y
        )

      if (
        distance > radius
      ) {
        continue
      }

      const currentHealth =
        this.enemyHealth.get(
          enemy
        ) ?? 1

      const splashDamage = 2

      const newHealth =
        currentHealth -
        splashDamage

      this.enemyHealth.set(
        enemy,
        newHealth
      )

      if (newHealth <= 0) {
        this.killEnemy(
          enemy
        )
      }
    }
  }

  private killEnemy(
    enemy: Phaser.GameObjects.Rectangle
  ) {
    // Prevent double kills
    if (!enemy.active) {
      return
    }

    const x = enemy.x
    const y = enemy.y

    // Immediately make this enemy invalid
    // before any other logic can hit it.
    enemy.destroy()

    this.createDeathBurst(
      x,
      y
    )

    const index =
      this.enemies.indexOf(
        enemy
      )

    if (index !== -1) {
      this.enemies.splice(
        index,
        1
      )
    }

    this.enemyHealth.delete(
      enemy
    )


    this.tryDropLoot(x, y)
    // XP is automatic
    this.currentXP++

    this.updateXPBar()

    // Kill counter
    this.killCount++

    this.killText.setText(
      `Kills: ${this.killCount}`
    )

    this.cameras.main.shake(
      80,
      0.003
    )
  }

  private tryDropLoot(x: number, y: number) {
  const roll = Math.random()

  // 5% chance for RED BOX
  if (roll < 0.05) {
    this.spawnLoot(x, y, 'redbox')
    return
  }

  // 20% chance for normal weapon loot
  if (roll < 0.25) {
    const weapons: WeaponType[] = [
      'rifle',
      'scattergun',
      'cannon',
    ]

    const weapon =
      Phaser.Utils.Array.GetRandom(
        weapons
      )

    this.spawnLoot(
      x,
      y,
      weapon
    )
  }
}

private spawnLoot(
  x: number,
  y: number,
  type: LootType
) {
  let color = 0xffffff
  let size = 18

  switch (type) {
    case 'rifle':
      color = 0xffff00
      break

    case 'scattergun':
      color = 0xffaa00
      break

    case 'cannon':
      color = 0xff4444
      break

    case 'redbox':
      color = 0xff0000
      size = 22
      break
  }

  const object =
    this.add.rectangle(
      x,
      y,
      size,
      size,
      color
    )

  this.lootDrops.push({
    object,
    type,
  })

  if (type === 'redbox') {
    this.createRedBoxEffect(
      object
    )
  }
}

  private updateXPBar() {
    const maxWidth = 300

    const progress =
      this.currentXP /
      this.xpToNextLevel

    this.xpBarFill.width =
      maxWidth *
      Phaser.Math.Clamp(
        progress,
        0,
        1
      )

    this.xpText.setText(
      `XP: ${this.currentXP} / ${this.xpToNextLevel}`
    )

    if (
      this.currentXP >=
      this.xpToNextLevel
    ) {
      this.levelUp()
    }
  }

  private levelUp() {
    this.currentXP -=
      this.xpToNextLevel

    this.playerLevel++

    this.xpToNextLevel =
      Math.floor(
        this.xpToNextLevel *
        1.4
      )

    const gains =
      this.applyLevelStats()

    this.showLevelUp(
      gains
    )

    this.updateXPBar()
  }

  private applyLevelStats() {
    const hpGain =
      Phaser.Math.Between(
        4,
        6
      )

    const powerGain =
      Phaser.Math.Between(
        1,
        3
      )

    const defenseGain =
      Phaser.Math.Between(
        1,
        2
      )

    this.maxPlayerHealth +=
      hpGain

    this.playerHealth +=
      hpGain

    this.playerPower +=
      powerGain

    this.playerDefense +=
      defenseGain

    this.healthText.setText(
      `HP: ${this.playerHealth} / ${this.maxPlayerHealth}`
    )

    return {
      hpGain,
      powerGain,
      defenseGain,
    }
  }

  private showLevelUp(
    gains: {
      hpGain: number
      powerGain: number
      defenseGain: number
    }
  ) {
    const levelText =
      this.add
        .text(
          400,
          220,
          `LEVEL ${this.playerLevel}`,
          {
            fontSize: '42px',
            color: '#44aaff',
            align: 'center',
          }
        )
        .setOrigin(0.5)

    const statsText =
      this.add
        .text(
          400,
          280,
          `HP +${gains.hpGain}\nPOWER +${gains.powerGain}\nDEFENSE +${gains.defenseGain}`,
          {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
          }
        )
        .setOrigin(0.5)

    levelText.setAlpha(0)
    statsText.setAlpha(0)

    this.tweens.add({
      targets: [
        levelText,
        statsText,
      ],

      alpha: 1,

      duration: 150,

      yoyo: true,

      hold: 600,

      onComplete: () => {
        levelText.destroy()
        statsText.destroy()
      },
    })
  }

  private getFireRate() {
    switch (
      this.currentWeapon
    ) {
      case 'rifle':
        return 300

      case 'scattergun':
        return 800

      case 'cannon':
        return 1200
    }
  }

  private createDeathBurst(
    x: number,
    y: number
  ) {
    for (
      let i = 0;
      i < 8;
      i++
    ) {
      const particle =
        this.add.rectangle(
          x,
          y,
          6,
          6,
          0xff8844
        )

      const angle =
        Phaser.Math.FloatBetween(
          0,
          Math.PI * 2
        )

      const speed =
        Phaser.Math.FloatBetween(
          80,
          180
        )

      this.tweens.add({
        targets: particle,

        x:
          x +
          Math.cos(angle) *
            speed,

        y:
          y +
          Math.sin(angle) *
            speed,

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
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: 800,
  height: 600,

  backgroundColor: '#111827',

  scene: GameScene,
}

new Phaser.Game(config)