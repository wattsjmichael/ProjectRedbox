import Phaser from 'phaser'

import type {
  WeaponItem,
  ItemRarity,
} from '../items/ItemTypes'

import {
  InventorySystem,
} from './InventorySystem'

interface InventoryUIConfig {
  scene:
    Phaser.Scene

  inventory:
    InventorySystem

  onEquip:
    (
      item:
        WeaponItem
    ) => void

  onClose:
    () => void
}

export class InventoryUI {
  private scene:
    Phaser.Scene

  private inventory:
    InventorySystem

  private onEquip:
    InventoryUIConfig['onEquip']

  private onClose:
    InventoryUIConfig['onClose']

  private container:
    Phaser.GameObjects.Container

  private selectedItem:
    WeaponItem | null = null

  private visible =
    false

  constructor(
    config:
      InventoryUIConfig
  ) {
    this.scene =
      config.scene

    this.inventory =
      config.inventory

    this.onEquip =
      config.onEquip

    this.onClose =
      config.onClose

    this.container =
      this.scene.add
        .container(
          0,
          0
        )
        .setDepth(
          1000
        )
        .setVisible(
          false
        )
  }

  open() {
  this.visible =
    true

  this.container.setPosition(
    this.scene.cameras.main.scrollX,
    this.scene.cameras.main.scrollY
  )

  this.container.setVisible(
    true
  )

    const items =
      this.inventory.getItems()

    const equipped =
      this.inventory.getEquippedItem()

    this.selectedItem =
      equipped ??
      items[0] ??
      null

    this.rebuild()
  }

  close(
    notify = true
  ) {
    this.visible =
      false

    this.container.setVisible(
      false
    )

    if (
      notify
    ) {
      this.onClose()
    }
  }

  isOpen() {
    return this.visible
  }

  refresh() {
    if (
      this.visible
    ) {
      this.rebuild()
    }
  }

  private rebuild() {
    this.container.removeAll(
      true
    )

    this.createBackground()
    this.createItemList()
    this.createStatsPanel()
  }

  private createBackground() {
    const blocker =
      this.scene.add
        .rectangle(
          400,
          300,
          800,
          600,
          0x000000,
          0.82
        )

    const panel =
      this.scene.add
        .rectangle(
          400,
          300,
          720,
          500,
          0x111111,
          0.98
        )
        .setStrokeStyle(
          3,
          0xe50914
        )

    const title =
      this.scene.add
        .text(
          70,
          70,
          'BACKPACK',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '34px',

            color:
              '#e50914',
          }
        )

    const divider =
      this.scene.add
        .rectangle(
          385,
          310,
          2,
          390,
          0x444444
        )

    const closeBackground =
      this.scene.add
        .rectangle(
          720,
          82,
          70,
          40,
          0x222222
        )
        .setStrokeStyle(
          1,
          0x666666
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    const closeText =
      this.scene.add
        .text(
          720,
          82,
          'X',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '20px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          0.5
        )

    closeBackground.on(
      'pointerdown',
      () => {
        this.close()
      }
    )

    this.container.add([
      blocker,
      panel,
      title,
      divider,
      closeBackground,
      closeText,
    ])
  }

  private createItemList() {
    const items =
      this.inventory.getItems()

    if (
      items.length ===
      0
    ) {
      const emptyText =
        this.scene.add.text(
          85,
          150,
          'NO ITEMS',
          {
            fontFamily:
              'Arial',

            fontSize:
              '18px',

            color:
              '#777777',
          }
        )

      this.container.add(
        emptyText
      )

      return
    }

    const maxVisible =
      8

    const visibleItems =
      items.slice(
        0,
        maxVisible
      )

    let y =
      140

    for (
      const item of
        visibleItems
    ) {
      const selected =
        this.selectedItem
          ?.id === item.id

      const equipped =
        this.inventory.isEquipped(
          item.id
        )

      // Entire row is clickable.
      const row =
        this.scene.add
          .rectangle(
            220,
            y,
            290,
            42,
            selected
              ? 0x3a1111
              : 0x1d1d1d
          )
          .setStrokeStyle(
            selected
              ? 2
              : 1,

            selected
              ? 0xe50914
              : 0x444444
          )
          .setInteractive({
            useHandCursor:
              true,
          })

      const rarityColor =
        this.getRarityColor(
          item.rarity
        )

      const name =
        this.scene.add
          .text(
            90,
            y,
            item.name,
            {
              fontFamily:
                'Arial',

              fontSize:
                '16px',

              color:
                rarityColor,
            }
          )
          .setOrigin(
            0,
            0.5
          )

      row.on(
        'pointerdown',
        () => {
          this.selectedItem =
            item

          this.rebuild()
        }
      )

      this.container.add([
        row,
        name,
      ])

      if (
        equipped
      ) {
        const equippedText =
          this.scene.add
            .text(
              340,
              y,
              'EQUIPPED',
              {
                fontFamily:
                  'Arial Black, Arial',

                fontSize:
                  '11px',

                color:
                  '#e50914',
              }
            )
            .setOrigin(
              0.5
            )

        this.container.add(
          equippedText
        )
      }

      y +=
        50
    }

    if (
      items.length >
      maxVisible
    ) {
      const moreText =
        this.scene.add.text(
          90,
          545,
          `+ ${items.length - maxVisible} MORE ITEMS`,
          {
            fontFamily:
              'Arial',

            fontSize:
              '13px',

            color:
              '#777777',
          }
        )

      this.container.add(
        moreText
      )
    }
  }

  private createStatsPanel() {
    const item =
      this.selectedItem

    if (
      !item
    ) {
      const text =
        this.scene.add
          .text(
            430,
            150,
            'SELECT AN ITEM',
            {
              fontFamily:
                'Arial',

              fontSize:
                '20px',

              color:
                '#777777',
            }
          )

      this.container.add(
        text
      )

      return
    }

    const rarityColor =
      this.getRarityColor(
        item.rarity
      )

    const name =
      this.scene.add
        .text(
          430,
          135,
          item.name.toUpperCase(),
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '24px',

            color:
              rarityColor,
          }
        )

    const rarity =
      this.scene.add
        .text(
          430,
          170,
          item.rarity.toUpperCase(),
          {
            fontFamily:
              'Arial',

            fontSize:
              '14px',

            color:
              rarityColor,
          }
        )

    const type =
      this.scene.add
        .text(
          430,
          205,
          item.weaponType.toUpperCase(),
          {
            fontFamily:
              'Arial',

            fontSize:
              '16px',

            color:
              '#999999',
          }
        )

    const stats =
      this.scene.add
        .text(
          430,
          260,
          [
            `ATTACK          ${item.attack}`,
            `SPEED           ${item.speed}`,
            `CRIT CHANCE     ${(item.criticalChance * 100).toFixed(0)}%`,
            `CRIT DAMAGE     ${(item.criticalDamage * 100).toFixed(0)}%`,
          ].join(
            '\n\n'
          ),
          {
            fontFamily:
              'Arial',

            fontSize:
              '18px',

            color:
              '#ffffff',
          }
        )

    this.container.add([
      name,
      rarity,
      type,
      stats,
    ])

    if (
      this.inventory.isEquipped(
        item.id
      )
    ) {
      const equippedBackground =
        this.scene.add
          .rectangle(
            540,
            475,
            240,
            58,
            0x2a0a0a
          )
          .setStrokeStyle(
            2,
            0xe50914
          )

      const equippedText =
        this.scene.add
          .text(
            540,
            475,
            'EQUIPPED',
            {
              fontFamily:
                'Arial Black, Arial',

              fontSize:
                '22px',

              color:
                '#e50914',
            }
          )
          .setOrigin(
            0.5
          )

      this.container.add([
        equippedBackground,
        equippedText,
      ])

      return
    }

    // Entire button is clickable.
    const equipButton =
      this.scene.add
        .rectangle(
          540,
          475,
          240,
          58,
          0xe50914
        )
        .setStrokeStyle(
          3,
          0xffffff
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    const equipText =
      this.scene.add
        .text(
          540,
          475,
          'EQUIP WEAPON',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '20px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          0.5
        )

    equipButton.on(
      'pointerover',
      () => {
        equipButton.setFillStyle(
          0xff1f2b
        )
      }
    )

    equipButton.on(
      'pointerout',
      () => {
        equipButton.setFillStyle(
          0xe50914
        )
      }
    )

    equipButton.on(
      'pointerdown',
      () => {
        const equippedItem =
          this.inventory.equipItem(
            item.id
          )

        if (
          !equippedItem
        ) {
          console.error(
            'Could not equip item:',
            item.id
          )

          return
        }

        this.onEquip(
          equippedItem
        )

        this.selectedItem =
          equippedItem

        this.rebuild()
      }
    )

    this.container.add([
      equipButton,
      equipText,
    ])
  }

  private getRarityColor(
    rarity:
      ItemRarity
  ) {
    switch (
      rarity
    ) {
      case 'common':
        return '#ffffff'

      case 'uncommon':
        return '#44dd88'

      case 'rare':
        return '#ff4444'
    }
  }
}