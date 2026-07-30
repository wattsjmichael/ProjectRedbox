import Phaser from 'phaser'

import type {
  WeaponItem,
  ItemRarity,
} from '../items/ItemTypes'

import {
  InventorySystem,
} from './InventorySystem'

import {
  CoreSystem,
} from '../core/CoreSystem'

import {
  CoreVisual,
} from '../core/CoreVisual'

interface InventoryUIConfig {
  scene:
    Phaser.Scene

  inventory:
    InventorySystem

  core:
    CoreSystem

  getHunterStats:
    () => {
      attackBonus:
        number

      criticalChanceBonus:
        number

      defenseReduction:
        number

      energyBonus:
        number
    }

  onEquip:
    (
      item:
        WeaponItem
    ) => void

  onFeed:
    (
      item:
        WeaponItem
    ) => boolean

  onClose:
    () => void
}

export class InventoryUI {
  private scene:
    Phaser.Scene

  private inventory:
    InventorySystem

  private core:
    CoreSystem

  private coreVisual:
    CoreVisual | null =
    null

  private getHunterStats:
    InventoryUIConfig['getHunterStats']

  private onEquip:
    InventoryUIConfig['onEquip']

  private onFeed:
    InventoryUIConfig['onFeed']

  private onClose:
    InventoryUIConfig['onClose']

  private container:
    Phaser.GameObjects.Container

  private selectedItem:
    WeaponItem | null =
    null

  private visible =
    false

  private currentPage =
    0

  private readonly itemsPerPage =
    8

  constructor(
    config:
      InventoryUIConfig
  ) {
    this.scene =
      config.scene

    this.inventory =
      config.inventory

    this.core =
      config.core

    this.getHunterStats =
      config.getHunterStats

    this.onEquip =
      config.onEquip

    this.onFeed =
      config.onFeed

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

    // Keep the UI aligned with
    // the current camera position.
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

    if (
      equipped
    ) {
      const equippedIndex =
        items.findIndex(
          item =>
            item.id ===
            equipped.id
        )

      if (
        equippedIndex >= 0
      ) {
        this.currentPage =
          Math.floor(
            equippedIndex /
            this.itemsPerPage
          )
      }

      this.selectedItem =
        equipped
    } else {
      this.currentPage =
        0

      this.selectedItem =
        items[0] ??
        null
    }

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
    this.coreVisual?.destroy()
    this.coreVisual =
      null
    this.container.removeAll(
      true
    )

    this.createBackground()

    this.createCorePanel()

    this.createHunterStatsPanel()

    this.createItemList()

    this.createStatsPanel()
  }

  private createBackground() {
    const blocker =
      this.scene.add
        .rectangle(
          640,
          360,
          1280,
          720,
          0x000000,
          0.88
        )

    const panel =
      this.scene.add
        .rectangle(
          640,
          360,
          1160,
          640,
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
          80,
          55,
          'BACKPACK',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '38px',

            color:
              '#e50914',
          }
        )

    const divider =
      this.scene.add
        .rectangle(
          520,
          370,
          2,
          540,
          0x444444
        )

    const closeBackground =
      this.scene.add
        .rectangle(
          1190,
          70,
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
          1190,
          70,
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

  private createCorePanel() {
    const core =
      this.core.getCore()

    const xpNeeded =
      this.core
        .getExperienceNeeded()

    this.coreVisual =
      new CoreVisual({
        scene:
          this.scene,
        x:
          475,
        y:
          105,
        mode:
          'interface',
        awakened:
          this.core
            .getNextEvolution() ===
          null,
      })

    const coreBackground =
      this.scene.add
        .rectangle(
          290,
          145,
          400,
          112,
          0x181818,
          0.95
        )
        .setStrokeStyle(
          1,
          0x444444
        )

    const coreTitle =
      this.scene.add
        .text(
          105,
          125,
          `CORE // ${core.name}`,
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '15px',

            color:
              '#e50914',
          }
        )

    const coreLevel =
      this.scene.add
        .text(
          455,
          125,
          `${this.core.getStageDefinition().displayName.toUpperCase()} // LV ${core.level}`,
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '14px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          1,
          0
        )

    const coreStats =
      this.scene.add
        .text(
          105,
          151,
          [
            `PWR ${core.stats.power}`,
            `DEF ${core.stats.defense}`,
            `DEX ${core.stats.dexterity}`,
            `ENG ${core.stats.energy}`,
          ].join(
            '     '
          ),
          {
            fontFamily:
              'Arial',

            fontSize:
              '12px',

            color:
              '#bbbbbb',
          }
        )

    const coreExperience =
      this.scene.add
        .text(
          455,
          151,
          `PROGRESS ${core.experience} / ${xpNeeded}`,
          {
            fontFamily:
              'Arial',

            fontSize:
              '12px',

            color:
              '#777777',
          }
        )
        .setOrigin(
          1,
          0
        )

    const progressWidth =
      350
    const levelProgress =
      Phaser.Math.Clamp(
        core.experience /
          xpNeeded,
        0,
        1
      )
    const progressBackground =
      this.scene.add.rectangle(
        280,
        178,
        progressWidth,
        8,
        0x303743
      )
    const progressFill =
      this.scene.add.rectangle(
        105,
        178,
        progressWidth *
          levelProgress,
        8,
        0xe50914
      )
        .setOrigin(
          0,
          0.5
        )
    const next =
      this.core.getNextEvolution()
    const milestone =
      this.scene.add.text(
        105,
        187,
        next
          ? `NEXT EVOLUTION // ${next.displayName.toUpperCase()} // LEVEL ${next.requiredLevel}`
          : `EVOLUTION BONUS // ${this.core.getStageDefinition().bonus.displayName.toUpperCase()} // ${this.core.getStageDefinition().bonus.description.toUpperCase()}`,
        {
          fontFamily:
            'Arial',
          fontSize:
            '10px',
          color:
            '#ff9b9b',
        }
      )

    this.container.add([
      coreBackground,
      ...this.coreVisual
        .getObjects(),
      coreTitle,
      coreLevel,
      coreStats,
      coreExperience,
      progressBackground,
      progressFill,
      milestone,
    ])
  }

  private createHunterStatsPanel() {
    const stats =
      this.getHunterStats()

    const panel =
      this.scene.add
        .rectangle(
          850,
          145,
          600,
          120,
          0x181818,
          0.95
        )
        .setStrokeStyle(
          1,
          0x444444
        )

    const title =
      this.scene.add
        .text(
          570,
          105,
          'HUNTER STATS',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '16px',

            color:
              '#e50914',
          }
        )

    const statText =
      this.scene.add
        .text(
          570,
          137,
          [
            `ATTACK BONUS       +${(
              stats.attackBonus *
              100
            ).toFixed(0)}%`,

            `CRITICAL BONUS     +${(
              stats.criticalChanceBonus *
              100
            ).toFixed(1)}%`,

            `DAMAGE REDUCTION    ${(
              stats.defenseReduction *
              100
            ).toFixed(0)}%`,

            `RARE POWER         +${(
              stats.energyBonus *
              100
            ).toFixed(0)}%`,
          ].join(
            '\n'
          ),
          {
            fontFamily:
              'Arial',

            fontSize:
              '13px',

            color:
              '#cccccc',

            lineSpacing:
              5,
          }
        )

    this.container.add([
      panel,
      title,
      statText,
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
        this.scene.add
          .text(
            100,
            225,
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

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          items.length /
          this.itemsPerPage
        )
      )

    if (
      this.currentPage >=
      totalPages
    ) {
      this.currentPage =
        totalPages - 1
    }

    const startIndex =
      this.currentPage *
      this.itemsPerPage

    const visibleItems =
      items.slice(
        startIndex,
        startIndex +
        this.itemsPerPage
      )

    let y =
      225

    for (
      const item of
      visibleItems
    ) {
      const selected =
        this.selectedItem
          ?.id ===
        item.id

      const equipped =
        this.inventory.isEquipped(
          item.id
        )

      const row =
        this.scene.add
          .rectangle(
            290,
            y,
            400,
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
            100,
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
              450,
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

    this.createPageControls(
      items,
      totalPages
    )
  }

  private createPageControls(
    items:
      WeaponItem[],

    totalPages:
      number
  ) {
    const inventoryCount =
      this.scene.add
        .text(
          100,
          650,
          `${items.length} / ${this.inventory.getCapacity()}`,
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '13px',

            color:
              '#777777',
          }
        )

    const pageText =
      this.scene.add
        .text(
          330,
          650,
          `${this.currentPage + 1} / ${totalPages}`,
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '13px',

            color:
              '#ffffff',
          }
        )
        .setOrigin(
          0.5
        )

    this.container.add([
      inventoryCount,
      pageText,
    ])

    if (
      this.currentPage >
      0
    ) {
      const previousButton =
        this.scene.add
          .text(
            240,
            650,
            '< PREV',
            {
              fontFamily:
                'Arial Black, Arial',

              fontSize:
                '13px',

              color:
                '#e50914',
            }
          )
          .setOrigin(
            0.5
          )
          .setInteractive({
            useHandCursor:
              true,
          })

      previousButton.on(
        'pointerdown',
        () => {
          this.currentPage--

          const newItems =
            this.inventory.getItems()

          const index =
            this.currentPage *
            this.itemsPerPage

          this.selectedItem =
            newItems[
              index
            ] ?? null

          this.rebuild()
        }
      )

      this.container.add(
        previousButton
      )
    }

    if (
      this.currentPage <
      totalPages - 1
    ) {
      const nextButton =
        this.scene.add
          .text(
            420,
            650,
            'NEXT >',
            {
              fontFamily:
                'Arial Black, Arial',

              fontSize:
                '13px',

              color:
                '#e50914',
            }
          )
          .setOrigin(
            0.5
          )
          .setInteractive({
            useHandCursor:
              true,
          })

      nextButton.on(
        'pointerdown',
        () => {
          this.currentPage++

          const newItems =
            this.inventory.getItems()

          const index =
            this.currentPage *
            this.itemsPerPage

          this.selectedItem =
            newItems[
              index
            ] ?? null

          this.rebuild()
        }
      )

      this.container.add(
        nextButton
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
            570,
            265,
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

    const equipped =
      this.inventory
        .getEquippedItem()

    const comparison =
      (
        selected:
          number,
        equippedValue:
          number | undefined
      ) => {
        if (
          equippedValue ===
          undefined
        ) {
          return ''
        }

        const difference =
          selected -
          equippedValue

        return `  ${difference >= 0 ? '+' : ''}${difference.toFixed(2)}`
      }

    const name =
      this.scene.add
        .text(
          570,
          245,
          item.name.toUpperCase(),
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '28px',

            color:
              rarityColor,
          }
        )

    const rarity =
      this.scene.add
        .text(
          570,
          285,
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
          570,
          315,
          `${item.weaponType.toUpperCase()}  //  AFFIX ${item.affix?.toUpperCase() ?? 'NONE'}`,
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
          570,
          365,
          [
            `ATTACK          ${item.attack}${comparison(item.attack, equipped?.attack)}`,
            `SPEED           ${item.speed}${comparison(item.speed, equipped?.speed)}`,
            `CRIT CHANCE     ${(
              item.criticalChance *
              100
            ).toFixed(0)}%${comparison(item.criticalChance * 100, equipped ? equipped.criticalChance * 100 : undefined)}`,
            `CRIT DAMAGE     ${(
              item.criticalDamage *
              100
            ).toFixed(0)}%${comparison(item.criticalDamage * 100, equipped ? equipped.criticalDamage * 100 : undefined)}`,
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

    // Equipped weapons cannot be fed.
    if (
      this.inventory.isEquipped(
        item.id
      )
    ) {
      const equippedBackground =
        this.scene.add
          .rectangle(
            850,
            610,
            360,
            56,
            0x2a0a0a
          )
          .setStrokeStyle(
            2,
            0xe50914
          )

      const equippedText =
        this.scene.add
          .text(
            850,
            610,
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

    const equipButton =
      this.scene.add
        .rectangle(
          850,
          575,
          360,
          52,
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
          850,
          575,
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

    const feedButton =
      this.scene.add
        .rectangle(
          850,
          640,
          360,
          52,
          0x333333
        )
        .setStrokeStyle(
          2,
          0xff4444
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    const feedText =
      this.scene.add
        .text(
          850,
          640,
          'FEED CORE',
          {
            fontFamily:
              'Arial Black, Arial',

            fontSize:
              '18px',

            color:
              '#ff4444',
          }
        )
        .setOrigin(
          0.5
        )

    const preview =
      this.core.previewFeed(
        item
      )
    const feedPreview =
      this.scene.add.text(
        850,
        608,
        `FEED PREVIEW // ${preview.statName.toUpperCase()} +${preview.statGained} // PROGRESS +${preview.experienceGained}`,
        {
          fontFamily:
            'Arial',
          fontSize:
            '12px',
          color:
            '#cc9966',
        }
      )
        .setOrigin(
          0.5
        )

    feedButton.on(
      'pointerover',
      () => {
        feedButton.setFillStyle(
          0x551111
        )
      }
    )

    feedButton.on(
      'pointerout',
      () => {
        feedButton.setFillStyle(
          0x333333
        )
      }
    )

    feedButton.on(
      'pointerdown',
      () => {
        const previousStage =
          this.core
            .getCore()
            .stage
        const fed =
          this.onFeed(
            item
          )

        if (
          !fed
        ) {
          return
        }

        const items =
          this.inventory.getItems()

        const totalPages =
          Math.max(
            1,
            Math.ceil(
              items.length /
              this.itemsPerPage
            )
          )

        if (
          this.currentPage >=
          totalPages
        ) {
          this.currentPage =
            totalPages - 1
        }

        const startIndex =
          this.currentPage *
          this.itemsPerPage

        this.selectedItem =
          items[
            startIndex
          ] ??
          items[
            startIndex - 1
          ] ??
          items[0] ??
          null

        const evolved =
          previousStage !==
          this.core
            .getCore()
            .stage

        if (evolved) {
          this.coreVisual
            ?.playEvolution()
        } else {
          this.coreVisual
            ?.playFeedPulse()
        }

        this.scene.time
          .delayedCall(
            evolved
              ? 700
              : 180,
            () => {
              if (this.visible) {
                this.rebuild()
              }
            }
          )
      }
    )

    this.container.add([
      equipButton,
      equipText,
      feedPreview,
      feedButton,
      feedText,
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
