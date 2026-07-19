import Phaser from 'phaser'

import type {
  WeaponType,
} from '../weapons/WeaponTypes'

import type {
  WeaponItem,
} from '../items/ItemTypes'

import {
  ItemGenerator,
} from '../items/ItemGenerator'

import type {
  LootDrop,
} from './LootTypes'

interface LootSystemConfig {
  scene:
    Phaser.Scene

  player:
    Phaser.GameObjects.Rectangle

  onWeaponCollected:
    (
      item:
        WeaponItem
    ) => void

  onRedBoxCollected:
    () => void
}

export class LootSystem {
  private scene:
    Phaser.Scene

  private player:
    Phaser.GameObjects.Rectangle

  private lootDrops:
    LootDrop[] = []

  private onWeaponCollected:
    LootSystemConfig['onWeaponCollected']

  private onRedBoxCollected:
    LootSystemConfig['onRedBoxCollected']

  constructor(
    config:
      LootSystemConfig
  ) {
    this.scene =
      config.scene

    this.player =
      config.player

    this.onWeaponCollected =
      config.onWeaponCollected

    this.onRedBoxCollected =
      config.onRedBoxCollected
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
      this.spawnRedBox(
        x,
        y
      )

      return
    }

    // Additional 20%
    // normal randomized weapon
    if (
      roll <
      0.25
    ) {
      const weaponTypes:
        WeaponType[] = [
          'rifle',
          'scattergun',
          'cannon',
          'greatsword',
        ]

      const weaponType =
        Phaser.Utils.Array.GetRandom(
          weaponTypes
        )

      const item =
        ItemGenerator.generateWeapon(
          weaponType
        )

      this.spawnWeapon(
        x,
        y,
        item
      )
    }
  }

  spawnWeapon(
    x: number,
    y: number,
    item: WeaponItem
  ) {
    let color =
      0xffffff

    let size =
      18

    switch (
      item.weaponType
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

      case 'greatsword':
        color =
          0xdddddd

        size =
          26
        break

      case 'photonLance':
        color =
          0x00ffff
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

      type:
        'weapon',

      item,
    })
  }

  spawnRedBox(
    x: number,
    y: number
  ) {
    const object =
      this.scene.add.rectangle(
        x,
        y,
        22,
        22,
        0xff0000
      )

    this.lootDrops.push({
      object,

      type:
        'redbox',
    })

    this.createRedBoxEffect(
      object
    )
  }

  // Compatibility with your existing
  // Wyrm guaranteed drop call:
  spawn(
    x: number,
    y: number,
    type: 'redbox'
  ) {
    if (
      type ===
      'redbox'
    ) {
      this.spawnRedBox(
        x,
        y
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
        this.lootDrops[
          i
        ]

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

      this.collectLoot(
        loot
      )

      this.lootDrops.splice(
        i,
        1
      )
    }
  }

  private collectLoot(
    loot:
      LootDrop
  ) {
    this.destroyLoot(
      loot
    )

    if (
      loot.type ===
        'weapon' &&
      loot.item
    ) {
      this.onWeaponCollected(
        loot.item
      )

      return
    }

    if (
      loot.type ===
      'redbox'
    ) {
      this.onRedBoxCollected()
    }
  }

  private destroyLoot(
    loot:
      LootDrop
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