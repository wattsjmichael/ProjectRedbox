import Phaser from 'phaser'

import type {
  WeaponItem,
} from '../items/ItemTypes'

import {
  ItemGenerator,
} from '../items/ItemGenerator'

import {
  LOOT_DROP_RATES,
  rollWeaponType,
} from './LootTables'

import type {
  LootDrop,
} from './LootTypes'

import {
  GAMEPLAY_DISPLAY,
  GAMEPLAY_TEXTURES,
  hasGameplayTexture,
} from '../assets/GameplayArt'

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
    (
      item:
        WeaponItem
    ) => void

  getPickupRadiusMultiplier:
    () => number
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

  private getPickupRadiusMultiplier:
    LootSystemConfig[
      'getPickupRadiusMultiplier'
    ]

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

    this.getPickupRadiusMultiplier =
      config.getPickupRadiusMultiplier
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

    if (
      roll <
      LOOT_DROP_RATES.redBox
    ) {
      this.spawnRedBox(
        x,
        y
      )

      return
    }

    if (
      roll <
      LOOT_DROP_RATES.redBox +
      LOOT_DROP_RATES.weapon
    ) {
      const weaponType =
        this.getRandomWeaponType()

      const item =
        ItemGenerator.generateWeapon(
          weaponType
        )

      if (item.rarity === 'rare') {
        this.spawnRedBox(x, y, item)
        return
      }

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
        color = 0xffff00
        break

      case 'scattergun':
        color = 0xffaa00
        break

      case 'cannon':
        color = 0xff4444
        break

      case 'greatsword':
        color = 0xdddddd
        size = 26
        break

      case 'photonLance':
        color = 0x00ffff
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

    this.attachLootVisual(
      object,
      false,
      item.rarity
    )

    this.lootDrops.push({
      object,
      type: 'weapon',
      item,
    })
  }

  spawnRedBox(
    x: number,
    y: number,
    item?: WeaponItem
  ) {
    const rareItem =
      item ??
      ItemGenerator.generateRareWeapon(
        this.getRandomWeaponType()
      )

    const object =
      this.scene.add.rectangle(
        x,
        y,
        22,
        22,
        0xff0000
      )

    this.attachLootVisual(
      object,
      true
    )

    this.lootDrops.push({
      object,
      type: 'redbox',
      item: rareItem,
    })

    this.createRedBoxEffect(
      object
    )
  }

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

  private getRandomWeaponType() {
    return rollWeaponType()
  }

  private checkCollection() {
    for (
      let i =
        this.lootDrops.length - 1;
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
        ) ||
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          loot.object.x,
          loot.object.y
        ) <=
          (
            (
              this.player.width +
              loot.object.width
            ) /
            2
          ) *
          this.getPickupRadiusMultiplier()

      const distance =
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          loot.object.x,
          loot.object.y
        )

      if (
        loot.type === 'redbox' &&
        distance <= 190 &&
        loot.object.getData('anticipated') !== true
      ) {
        this.beginRedBoxAnticipation(loot)
      }

      if (
        !collected ||
        loot.object.getData('opening') === true
      ) {
        continue
      }

      if (loot.type === 'redbox') {
        this.beginRedBoxOpen(loot)
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
    loot: LootDrop
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
        'redbox' &&
      loot.item
    ) {
      this.onRedBoxCollected(
        loot.item
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

    const visual =
      loot.object.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined

    const anticipationRing =
      loot.object.getData(
        'anticipationRing'
      ) as Phaser.GameObjects.Arc | undefined

    anticipationRing?.destroy()

    if (
      beam?.active
    ) {
      beam.destroy()
    }

    if (
      visual?.active
    ) {
      visual.destroy()
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
    const visual =
      redBox.getData(
        'visual'
      ) as
        | Phaser.GameObjects.Sprite
        | undefined
    const target =
      visual ??
      redBox
    const baseScaleX =
      target.scaleX
    const baseScaleY =
      target.scaleY

    this.scene.tweens.add({
      targets:
        target,
      scaleX:
        baseScaleX *
        1.18,
      scaleY:
        baseScaleY *
        1.18,
      alpha: 0.7,
      duration: 400,
      yoyo: true,
      repeat: -1,
    })

    const beam =
      this.scene.add.rectangle(
        redBox.x,
        redBox.y - 60,
        6,
        120,
        0xff0000,
        0.35
      )

    this.scene.tweens.add({
      targets: beam,
      alpha: 0.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
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

  private beginRedBoxAnticipation(
    loot: LootDrop
  ) {
    loot.object.setData('anticipated', true)
    const ring = this.scene.add.circle(
      loot.object.x,
      loot.object.y,
      35,
      0xff1111,
      0.08
    )
      .setStrokeStyle(3, 0xff3344, 0.65)
      .setDepth(GAMEPLAY_DISPLAY.lootRare.depth - 1)
    loot.object.setData('anticipationRing', ring)

    this.scene.tweens.add({
      targets: ring,
      scale: 1.45,
      alpha: 0.15,
      duration: 520,
      yoyo: true,
      repeat: -1,
    })
    this.scene.events.emit('combat-audio:red-box-near')
  }

  private beginRedBoxOpen(
    loot: LootDrop
  ) {
    loot.object.setData('opening', true)
    const visual = loot.object.getData('visual') as
      | Phaser.GameObjects.Sprite
      | undefined
    const target = visual ?? loot.object

    this.scene.events.emit('combat-audio:red-box-open')
    this.scene.cameras.main.flash(120, 255, 32, 32)
    this.scene.tweens.add({
      targets: target,
      scaleX: target.scaleX * 1.32,
      scaleY: target.scaleY * 1.32,
      alpha: 1,
      duration: 110,
      yoyo: true,
    })

    const reveal = this.scene.add.circle(
      loot.object.x,
      loot.object.y,
      28,
      0xffffff,
      0.24
    )
      .setStrokeStyle(4, 0xff3344, 0.9)
      .setDepth(GAMEPLAY_DISPLAY.lootRare.depth + 1)

    this.scene.tweens.add({
      targets: reveal,
      scale: 2.2,
      alpha: 0,
      duration: 240,
      onComplete: () => reveal.destroy(),
    })

    this.scene.time.delayedCall(220, () => {
      if (!loot.object.active) return
      const index = this.lootDrops.indexOf(loot)
      if (index < 0) return
      this.collectLoot(loot)
      this.lootDrops.splice(index, 1)
    })
  }

  private attachLootVisual(
    object:
      Phaser.GameObjects.Rectangle,
    rare:
      boolean,
    rarity: WeaponItem['rarity'] = 'rare'
  ) {
    const texture =
      rare
        ? GAMEPLAY_TEXTURES.redBox
        : GAMEPLAY_TEXTURES
          .lootWeapon

    if (
      !hasGameplayTexture(
        this.scene,
        texture.key
      )
    ) {
      return
    }

    const display =
      rare
        ? GAMEPLAY_DISPLAY.lootRare
        : GAMEPLAY_DISPLAY
          .lootCommon
    const visual =
      this.scene.add.sprite(
        object.x,
        object.y,
        texture.key
      )
        .setDisplaySize(
          display.width,
          display.height
        )
        .setDepth(
          display.depth
        )

    if (!rare && rarity === 'uncommon') {
      visual.setTint(0x88ffbb)
    }

    object.setAlpha(0)
    object.setData(
      'visual',
      visual
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
