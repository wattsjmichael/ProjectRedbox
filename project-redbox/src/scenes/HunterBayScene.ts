import Phaser from 'phaser'

import type {
  WeaponItem,
} from '../items/ItemTypes'

import {
  InventorySystem,
} from '../inventory/InventorySystem'

import {
  MagSystem,
} from '../mag/MagSystem'

import {
  PersistenceSystem,
} from '../persistence/PersistenceSystem'

import type {
  PersistentGameData,
} from '../persistence/PersistenceSystem'

import type {
  RunSummary,
} from '../runs/RunTypes'

export class HunterBayScene
  extends Phaser.Scene {
  private readonly persistence =
    new PersistenceSystem()

  private saveData!:
    PersistentGameData

  private inventory!:
    InventorySystem

  private mag!:
    MagSystem

  private summary:
    RunSummary | null = null

  private selectedItem:
    WeaponItem | null = null

  private page =
    0

  private readonly itemsPerPage =
    12

  private statusMessage =
    ''

  constructor() {
    super(
      'HunterBayScene'
    )
  }

  create(
    summary?:
      RunSummary
  ) {
    const saveData =
      this.persistence.load()

    if (!saveData) {
      this.scene.start(
        'TitleScene'
      )
      return
    }

    this.saveData =
      saveData
    this.summary =
      summary ?? null
    this.inventory =
      new InventorySystem()
    this.inventory.restore(
      saveData.inventory,
      saveData.equippedWeapon
    )
    this.mag =
      new MagSystem(
        saveData.mag
      )

    this.selectedItem =
      this.getInitialSelection()

    this.render()
  }

  private getInitialSelection() {
    const recentItem =
      this.summary?.recentFinds.find(
        item =>
          this.inventory.getItem(
            item.id
          ) !== null
      )

    return (
      recentItem ??
      this.inventory.getEquippedItem() ??
      this.inventory.getItems()[0] ??
      null
    )
  }

  private render() {
    this.children.removeAll()
    this.cameras.main.setBackgroundColor(
      '#07090d'
    )

    this.createBackdrop()
    this.createHeader()
    this.createRecentFinds()
    this.createInventoryGrid()
    this.createItemDetails()
    this.createStatusMessage()
    this.createNavigation()
  }

  private createBackdrop() {
    this.add.rectangle(
      640,
      360,
      1280,
      720,
      0x07090d
    )

    this.add.rectangle(
      640,
      62,
      1280,
      124,
      0x111720
    )

    for (
      let x = 40;
      x < 1280;
      x += 120
    ) {
      this.add.rectangle(
        x,
        590,
        80,
        2,
        0x263244,
        0.65
      )
    }
  }

  private createHeader() {
    const account =
      this.saveData.account
    const mag =
      this.mag.getMag()
    const lifetime =
      account.lifetimeStats

    this.add.text(
      36,
      18,
      'HUNTER BAY',
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '32px',
        color:
          '#e50914',
      }
    )

    this.add.text(
      38,
      63,
      `${account.hunterName}  //  ${account.currency} CREDITS`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '16px',
        color:
          '#ffffff',
      }
    )

    this.add.text(
      405,
      20,
      `MAG ${mag.name}  LV ${mag.level}`,
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '17px',
        color:
          '#ff5555',
      }
    )

    this.add.text(
      405,
      53,
      `PWR ${mag.stats.power}   DEF ${mag.stats.defense}   DEX ${mag.stats.dexterity}   ENG ${mag.stats.energy}`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '14px',
        color:
          '#cccccc',
      }
    )

    const equipped =
      this.inventory.getEquippedItem()

    this.add.text(
      405,
      78,
      `EQUIPPED // ${equipped?.name ?? 'NONE'}`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '13px',
        color:
          '#888888',
      }
    )

    this.add.text(
      930,
      20,
      'LIFETIME',
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '17px',
        color:
          '#ffffff',
      }
    )

    this.add.text(
      930,
      50,
      `RUNS ${lifetime.runs}   KILLS ${lifetime.kills}\nBOSSES ${lifetime.bossesDefeated}`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '14px',
        color:
          '#aaaaaa',
        lineSpacing:
          7,
      }
    )
  }

  private createRecentFinds() {
    const recent =
      this.summary?.recentFinds ??
      []
    const outcome =
      this.summary?.outcome ===
        'completed'
        ? 'DROP COMPLETE'
        : 'HUNTER RECOVERED'

    this.add.text(
      36,
      122,
      `RECENT FINDS  //  ${outcome}`,
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '15px',
        color:
          '#e50914',
      }
    )

    if (this.summary) {
      const seconds =
        Math.floor(
          this.summary.timeMs /
          1000
        )

      this.add.text(
        1240,
        124,
        `KILLS ${this.summary.kills}   RED BOXES ${this.summary.rareDrops}   TIME ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
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
    }

    if (recent.length === 0) {
      this.add.text(
        36,
        157,
        'NO WEAPONS RECOVERED',
        {
          fontFamily:
            'Arial',
          fontSize:
            '14px',
          color:
            '#666666',
        }
      )
      return
    }

    recent
      .slice(-6)
      .forEach(
        (
          item,
          index
        ) => {
          const x =
            36 +
            index * 202
          const color =
            item.rarity === 'rare'
              ? 0x771111
              : 0x1b222d

          const card =
            this.add.rectangle(
              x + 94,
              169,
              188,
              54,
              color
            )
              .setStrokeStyle(
                1,
                item.rarity === 'rare'
                  ? 0xff4444
                  : 0x465366
              )
              .setInteractive({
                useHandCursor:
                  true,
              })

          this.add.text(
            x + 8,
            151,
            item.name,
            {
              fontFamily:
                'Arial',
              fontSize:
                '12px',
              color:
                item.rarity === 'rare'
                  ? '#ff6666'
                  : '#dddddd',
              wordWrap: {
                width:
                  172,
              },
            }
          )

          card.on(
            'pointerdown',
            () => {
              const owned =
                this.inventory.getItem(
                  item.id
                )

              if (owned) {
                this.selectedItem =
                  owned
                this.render()
              }
            }
          )
        }
      )
  }

  private createInventoryGrid() {
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

    this.page =
      Phaser.Math.Clamp(
        this.page,
        0,
        totalPages - 1
      )

    this.add.text(
      36,
      211,
      `INVENTORY  ${items.length}/${this.inventory.getCapacity()}`,
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '18px',
        color:
          '#ffffff',
      }
    )

    const visible =
      items.slice(
        this.page *
          this.itemsPerPage,
        (
          this.page + 1
        ) *
          this.itemsPerPage
      )

    visible.forEach(
      (
        item,
        index
      ) => {
        const column =
          index % 4
        const row =
          Math.floor(
            index / 4
          )
        const x =
          36 +
          column * 142
        const y =
          252 +
          row * 86
        const selected =
          item.id ===
          this.selectedItem?.id
        const equipped =
          this.inventory.isEquipped(
            item.id
          )

        const slot =
          this.add.rectangle(
            x + 66,
            y + 34,
            132,
            68,
            selected
              ? 0x421116
              : 0x171c24
          )
            .setStrokeStyle(
              selected
                ? 2
                : 1,
              selected
                ? 0xe50914
                : 0x3b4657
            )
            .setInteractive({
              useHandCursor:
                true,
            })

        this.add.text(
          x + 7,
          y + 7,
          item.name,
          {
            fontFamily:
              'Arial',
            fontSize:
              '12px',
            color:
              this.getRarityColor(
                item
              ),
            wordWrap: {
              width:
                116,
            },
          }
        )

        if (equipped) {
          this.add.text(
            x + 7,
            y + 49,
            'EQUIPPED',
            {
              fontFamily:
                'Arial Black, Arial',
              fontSize:
                '9px',
              color:
                '#e50914',
            }
          )
        }

        slot.on(
          'pointerdown',
          () => {
            this.selectedItem =
              item
            this.render()
          }
        )
      }
    )

    this.createPageButton(
      75,
      528,
      '< PREV',
      this.page > 0,
      () => {
        this.page--
        this.render()
      }
    )

    this.add.text(
      287,
      520,
      `${this.page + 1} / ${totalPages}`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '13px',
        color:
          '#888888',
      }
    )

    this.createPageButton(
      470,
      528,
      'NEXT >',
      this.page <
        totalPages - 1,
      () => {
        this.page++
        this.render()
      }
    )
  }

  private createPageButton(
    x: number,
    y: number,
    label: string,
    enabled: boolean,
    action: () => void
  ) {
    const text =
      this.add.text(
        x,
        y,
        label,
        {
          fontFamily:
            'Arial Black, Arial',
          fontSize:
            '13px',
          color:
            enabled
              ? '#e50914'
              : '#444444',
        }
      )
        .setOrigin(
          0.5
        )

    if (enabled) {
      text
        .setInteractive({
          useHandCursor:
            true,
        })
        .on(
          'pointerdown',
          action
        )
    }
  }

  private createItemDetails() {
    const item =
      this.selectedItem

    this.add.rectangle(
      925,
      390,
      650,
      340,
      0x11161e
    )
      .setStrokeStyle(
        2,
        0x343f50
      )

    if (!item) {
      this.add.text(
        660,
        250,
        'SELECT A WEAPON',
        {
          fontFamily:
            'Arial',
          fontSize:
            '20px',
          color:
            '#666666',
        }
      )
      return
    }

    const equipped =
      this.inventory.getEquippedItem()

    this.add.text(
      630,
      234,
      item.name.toUpperCase(),
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '24px',
        color:
          this.getRarityColor(
            item
          ),
      }
    )

    this.add.text(
      630,
      271,
      `${item.rarity.toUpperCase()} ${item.weaponType.toUpperCase()}  //  AFFIX: ${item.affix?.toUpperCase() ?? 'NONE'}`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '13px',
        color:
          '#aaaaaa',
      }
    )

    const equippedLabel =
      equipped
        ? equipped.name
        : 'NONE'

    this.add.text(
      630,
      310,
      `SELECTED                 EQUIPPED: ${equippedLabel}`,
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '13px',
        color:
          '#777777',
      }
    )

    this.add.text(
      630,
      344,
      [
        this.getComparisonLine(
          'ATTACK',
          item.attack,
          equipped?.attack
        ),
        this.getComparisonLine(
          'SPEED',
          item.speed,
          equipped?.speed
        ),
        this.getComparisonLine(
          'CRIT %',
          item.criticalChance *
            100,
          equipped
            ? equipped.criticalChance *
              100
            : undefined
        ),
        this.getComparisonLine(
          'CRIT DMG %',
          item.criticalDamage *
            100,
          equipped
            ? equipped.criticalDamage *
              100
            : undefined
        ),
      ].join(
        '\n'
      ),
      {
        fontFamily:
          'Courier New, monospace',
        fontSize:
          '16px',
        color:
          '#ffffff',
        lineSpacing:
          10,
      }
    )

    if (
      this.inventory.isEquipped(
        item.id
      )
    ) {
      this.add.text(
        925,
        514,
        'CURRENTLY EQUIPPED',
        {
          fontFamily:
            'Arial Black, Arial',
          fontSize:
            '17px',
          color:
            '#e50914',
        }
      )
        .setOrigin(
          0.5
        )
      return
    }

    this.createActionButton(
      775,
      514,
      260,
      'EQUIP WEAPON',
      0xe50914,
      () => {
        const equippedItem =
          this.inventory.equipItem(
            item.id
          )

        if (equippedItem) {
          this.statusMessage =
            `${equippedItem.name.toUpperCase()} EQUIPPED`
          this.save()
          this.render()
        }
      }
    )

    this.createActionButton(
      1075,
      514,
      260,
      'FEED TO MAG',
      0x3d1717,
      () => {
        if (
          !this.inventory.removeItem(
            item.id
          )
        ) {
          return
        }

        const result =
          this.mag.feedWeapon(
            item
          )
        this.statusMessage =
          `${item.name.toUpperCase()} FED // +${result.experienceGained} XP // +${result.statGained} ${result.statName.toUpperCase()} // MAG LV ${result.newLevel}`
        this.selectedItem =
          this.inventory
            .getEquippedItem() ??
          this.inventory
            .getItems()[0] ??
          null
        this.save()
        this.render()
      }
    )
  }

  private createStatusMessage() {
    if (!this.statusMessage) {
      return
    }

    this.add.text(
      925,
      580,
      this.statusMessage,
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '13px',
        color:
          '#ffcc66',
        align:
          'center',
        wordWrap: {
          width:
            610,
        },
      }
    )
      .setOrigin(
        0.5
      )
  }

  private getComparisonLine(
    label: string,
    selected: number,
    equipped?: number
  ) {
    const selectedText =
      Number.isInteger(selected)
        ? selected.toFixed(0)
        : selected.toFixed(2)
    const delta =
      equipped === undefined
        ? ''
        : selected - equipped
    const deltaText =
      delta === ''
        ? ''
        : `  (${delta >= 0 ? '+' : ''}${delta.toFixed(2)})`

    return `${label.padEnd(12)} ${selectedText.padStart(7)}${deltaText}`
  }

  private createNavigation() {
    this.createActionButton(
      850,
      655,
      350,
      'START NEXT DROP',
      0xe50914,
      () => {
        this.scene.start(
          'GameScene'
        )
      }
    )

    this.createActionButton(
      1115,
      655,
      180,
      'RETURN TO TITLE',
      0x202731,
      () => {
        this.scene.start(
          'TitleScene'
        )
      }
    )
  }

  private createActionButton(
    x: number,
    y: number,
    width: number,
    label: string,
    color: number,
    action: () => void
  ) {
    const background =
      this.add.rectangle(
        x,
        y,
        width,
        52,
        color
      )
        .setStrokeStyle(
          2,
          0xffffff,
          0.7
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    this.add.text(
      x,
      y,
      label,
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '17px',
        color:
          '#ffffff',
      }
    )
      .setOrigin(
        0.5
      )

    background.on(
      'pointerdown',
      action
    )
  }

  private save() {
    this.saveData.inventory =
      this.inventory.getItems()
    this.saveData.equippedWeapon =
      this.inventory.getEquippedItem()
    this.saveData.mag =
      this.mag.getMag()

    this.persistence.save(
      this.saveData
    )
  }

  private getRarityColor(
    item:
      WeaponItem
  ) {
    switch (item.rarity) {
      case 'common':
        return '#ffffff'
      case 'uncommon':
        return '#55dd88'
      case 'rare':
        return '#ff4b55'
    }
  }
}
