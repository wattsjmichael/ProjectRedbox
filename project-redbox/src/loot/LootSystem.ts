import Phaser from 'phaser'


import type {
  LootDrop,
  LootType,
} from './LootTypes'

interface LootSystemConfig {
  scene: Phaser.Scene

  player:
  Phaser.GameObjects.Rectangle

  onLootCollected: (
    type: LootType
  ) => void
}

export class LootSystem {
  private scene:
    Phaser.Scene

  private player:
    Phaser.GameObjects.Rectangle

  private lootDrops:
    LootDrop[] = []

  private onLootCollected:
    LootSystemConfig['onLootCollected']

  constructor(
    config: LootSystemConfig
  ) {
    this.scene =
      config.scene

    this.player =
      config.player

    this.onLootCollected =
      config.onLootCollected
  }

  update() {
    if (
      !this.player.active
    ) {
      return
    }

    this.checkCollection()
  }

  tryDrop(
    x: number,
    y: number
  ) {
    const roll =
      Math.random()

    // 5% RED BOX
    if (
      roll <
      0.05
    ) {
      this.spawn(
        x,
        y,
        'redbox'
      )

      return
    }

    // Additional 20%
    // normal weapon drop.
    if (
      roll <
      0.25
    ) {
      const weapons:
        LootType[] = [
          'rifle',
          'scattergun',
          'cannon',
          'greatsword'
        ]

      const weapon =
        Phaser.Utils.Array.GetRandom(
          weapons
        )

      this.spawn(
        x,
        y,
        weapon
      )
    }
  }

  spawn(
    x: number,
    y: number,
    type: LootType
  ) {
    let color =
      0xffffff

    let size =
      18

    switch (
    type
    ) {
      case 'rifle':
        color =
          0xffff00
        break

      case 'scattergun':
        color =
          0xffaa00
        break

      case 'cannon':
        color =
          0xff4444
        break

      case 'redbox':
        color =
          0xff0000

        size =
          22
        break

      case 'greatsword':
        color =
          0xdddddd

        size =
          26
        break
    }

    const object =
      this.scene.add.rectangle(
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

    if (
      type ===
      'redbox'
    ) {
      this.createRedBoxEffect(
        object
      )
    }
  }

  private checkCollection() {
    for (
      let i =
        this.lootDrops.length -
        1;

      i >= 0;

      i--
    ) {
      const loot =
        this.lootDrops[i]

      if (
        !loot.object.active
      ) {
        this.lootDrops.splice(
          i,
          1
        )

        continue
      }

      const collected =
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          loot.object.getBounds()
        )

      if (
        !collected
      ) {
        continue
      }

      const type =
        loot.type

      this.destroyLoot(
        loot
      )

      this.lootDrops.splice(
        i,
        1
      )

      this.onLootCollected(
        type
      )
    }
  }

  private destroyLoot(
    loot: LootDrop
  ) {
    const beam =
      loot.object.getData(
        'beam'
      ) as
      | Phaser.GameObjects.Rectangle
      | undefined

    if (
      beam?.active
    ) {
      beam.destroy()
    }

    if (
      loot.object.active
    ) {
      loot.object.destroy()
    }
  }

  private createRedBoxEffect(
    redBox:
      Phaser.GameObjects.Rectangle
  ) {
    this.scene.tweens.add({
      targets:
        redBox,

      scale:
        1.4,

      alpha:
        0.7,

      duration:
        400,

      yoyo:
        true,

      repeat:
        -1,
    })

    const beam =
      this.scene.add.rectangle(
        redBox.x,
        redBox.y -
        60,
        6,
        120,
        0xff0000,
        0.35
      )

    this.scene.tweens.add({
      targets:
        beam,

      alpha:
        0.1,

      duration:
        500,

      yoyo:
        true,

      repeat:
        -1,
    })

    redBox.setData(
      'beam',
      beam
    )

    this.scene.cameras.main.flash(
      150,
      255,
      0,
      0
    )

    this.scene.cameras.main.shake(
      150,
      0.006
    )
  }

  destroyAll() {
    for (
      const loot of
      this.lootDrops
    ) {
      this.destroyLoot(
        loot
      )
    }

    this.lootDrops =
      []
  }
}