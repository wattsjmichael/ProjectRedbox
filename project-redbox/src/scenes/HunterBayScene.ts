import Phaser from 'phaser'

import type {
  ArmorItem,
  InventoryItem,
} from '../items/ItemTypes'
import {
  isArmorItem,
  isWeaponItem,
} from '../items/ItemTypes'
import {
  createDevelopmentArmorItems,
  getArmorModifiers,
} from '../items/ArmorTypes'
import {
  calculateDamageReduction,
  calculateHunterStats,
} from '../player/PlayerStatCalculator'

import {
  InventorySystem,
} from '../inventory/InventorySystem'

import {
  ItemGenerator,
} from '../items/ItemGenerator'

import {
  getWeaponAffixDescriptions,
} from '../items/WeaponAffixes'

import {
  CoreSystem,
} from '../core/CoreSystem'

import {
  CoreVisual,
} from '../core/CoreVisual'

import {
  PersistenceSystem,
} from '../persistence/PersistenceSystem'

import type {
  PersistentGameData,
} from '../persistence/PersistenceSystem'

import type {
  RunSummary,
} from '../runs/RunTypes'

import {
  HunterHubTutorial,
} from '../tutorial/HunterHubTutorial'

import {
  canEquipArmor,
  getHighestUnlockedDropTier,
  getHunterRewardDisplayLines,
  getHunterRewardPreview,
  getHunterRewardSummary,
  getNextHunterLevelReward,
  normalizeSelectedDropTier,
} from '../progression/HunterProgressionConfig'

import type {
  DropTier,
} from '../progression/HunterProgressionConfig'

export class HunterBayScene
  extends Phaser.Scene {
  private readonly persistence =
    new PersistenceSystem()

  private saveData!:
    PersistentGameData

  private inventory!:
    InventorySystem

  private core!:
    CoreSystem

  private coreVisual:
    CoreVisual | null =
    null

  private feedInProgress =
    false

  private summary:
    RunSummary | null = null

  private selectedItem:
    InventoryItem | null = null

  private page =
    0

  private readonly itemsPerPage =
    12

  private statusMessage =
    ''

  private tutorial:
    HunterHubTutorial | null =
    null

  constructor() {
    super(
      'HunterBayScene'
    )
  }

  create(
    summary?:
      RunSummary
  ) {
    this.input.setDefaultCursor(
      'default'
    )

    this.tutorial?.destroy()
    this.tutorial =
      null

    const saveData =
      this.persistence.load()

    if (!saveData) {
      this.scene.start(
        'HunterProfileScene'
      )
      return
    }

    this.saveData =
      saveData
    this.summary =
      summary &&
      Array.isArray(
        summary.recentFinds
      )
        ? summary
        : null
    this.inventory =
      new InventorySystem()
    this.inventory.restore(
      saveData.inventory,
      saveData.equippedWeapon,
      saveData.equippedArmor
    )
    this.core =
      new CoreSystem(
        saveData.core
      )

    this.selectedItem =
      this.getInitialSelection()

    this.render()
    this.setupCoreDebugControl()

    if (
      !this.saveData.tutorial
        .completed
    ) {
      this.tutorial =
        new HunterHubTutorial({
          scene:
            this,
          state:
            this.saveData.tutorial,
          hasEquippedWeapon:
            () =>
              this.inventory
                .getEquippedItem() !==
              null,
          hasAnyWeapon:
            () =>
              this.inventory
                .getItems()
                .some(isWeaponItem),
          hasFeedableItem:
            () =>
              this.inventory
                .getItems()
                .some(
                  item =>
                    !this.inventory
                      .isEquipped(
                        item.id
                      )
                ),
          onStateChanged:
            () => {
              this.save()
            },
        })

      this.tutorial.start()
    }

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.coreVisual?.destroy()
        this.coreVisual =
          null
        this.tutorial?.destroy()
        this.tutorial =
          null
      }
    )
  }

  private getInitialSelection() {
    const recentItem =
      this.summary?.recentFinds?.find(
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
    this.coreVisual?.destroy()
    this.coreVisual =
      null
    this.children.removeAll()
    this.cameras.main.setBackgroundColor(
      '#07090d'
    )

    this.createBackdrop()
    this.createHeader()
    this.createRecentFinds()
    this.createInventoryGrid()
    this.createItemDetails()
    this.createHunterProgression()
    this.createStatusMessage()
    this.createNavigation()

    this.tutorial?.refresh()
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
    const core =
      this.core.getCore()
    const lifetime =
      account.lifetimeStats

    this.coreVisual =
      new CoreVisual({
        scene:
          this,
        x:
          880,
        y:
          62,
        mode:
          'interface',
        awakened:
          this.core
            .getNextEvolution() ===
          null,
      })

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
      `CORE ${core.name} // ${this.core.getStageDefinition().displayName.toUpperCase()} // LV ${core.level}`,
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
      47,
      `PWR ${core.stats.power}   DEF ${core.stats.defense}   DEX ${core.stats.dexterity}   ENG ${core.stats.energy}`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '14px',
        color:
          '#cccccc',
      }
    )

    const xpNeeded =
      this.core.getExperienceNeeded()
    const progressWidth =
      460
    const progress =
      Phaser.Math.Clamp(
        core.experience /
          xpNeeded,
        0,
        1
      )

    this.add.text(
      405,
      68,
      `PROGRESS ${core.experience} / ${xpNeeded}`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '10px',
        color:
          '#999999',
      }
    )
    this.add.rectangle(
      405,
      83,
      progressWidth,
      7,
      0x303743
    )
      .setOrigin(
        0,
        0.5
      )
    this.add.rectangle(
      405,
      83,
      progressWidth *
        progress,
      7,
      0xe50914
    )
      .setOrigin(
        0,
        0.5
      )

    const next =
      this.core.getNextEvolution()
    this.add.text(
      405,
      90,
      next
        ? `NEXT EVOLUTION // ${next.displayName.toUpperCase()} // LEVEL ${next.requiredLevel} REQUIRED`
        : `EVOLUTION BONUS // ${this.core.getStageDefinition().bonus.displayName.toUpperCase()} // ${this.core.getStageDefinition().bonus.description.toUpperCase()}`,
      {
        fontFamily:
          'Arial',
        fontSize:
          '10px',
        color:
          '#ff9999',
      }
    )

    const equipped =
      this.inventory.getEquippedItem()

    this.add.text(
      38,
      90,
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
      405,
      106,
      'Autonomous support module // develops by processing salvaged equipment',
      {
        fontFamily:
          'Arial',
        fontSize:
          '10px',
        color:
          '#777777',
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

    if (import.meta.env.DEV) {
      const armorDebugButton = this.add.text(
        600,
        220,
        '[ DEV: ADD TEST ARMOR ]',
        {
          fontFamily:
            'Arial Black, Arial',
          fontSize:
            '11px',
          color:
            '#66d9ff',
        }
      )
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true })

      armorDebugButton.on('pointerover', () => {
        armorDebugButton.setColor('#ffffff')
      })
      armorDebugButton.on('pointerout', () => {
        armorDebugButton.setColor('#66d9ff')
      })
      armorDebugButton.on(
        'pointerdown',
        (pointer: Phaser.Input.Pointer) => {
          if (pointer.leftButtonDown()) {
            this.addDevelopmentArmor()
          }
        }
      )
    }

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
        'SELECT AN ITEM',
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

    if (isArmorItem(item)) {
      this.createArmorDetails(item)
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
      `${item.rarity.toUpperCase()} ${item.weaponType.toUpperCase()}\n${getWeaponAffixDescriptions(item).join('\n') || 'NO AFFIXES'}`,
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
      335,
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
      370,
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
          this.tutorial
            ?.onWeaponEquipped()
          this.render()
        }
      }
    )

    this.createActionButton(
      1075,
      514,
      260,
      'FEED CORE',
      0x3d1717,
      () => {
        if (
          this.feedInProgress
        ) {
          return
        }

        this.feedInProgress =
          true

        if (
          !this.inventory.removeItem(
            item.id
          )
        ) {
          this.feedInProgress =
            false
          return
        }

        const result =
          this.core.feedItem(
            item,
            this.getArmorCoreFeedBonus()
          )
        this.statusMessage =
          `CORE FED // ${item.name.toUpperCase()} // +${result.statGained} ${result.statName.toUpperCase()} // +${result.experienceGained} PROGRESS`

        if (
          result.leveledUp
        ) {
          this.statusMessage +=
            ` // CORE LEVEL UP ${result.newLevel}`
        }

        if (
          result.evolved
        ) {
          const definition =
            this.core
              .getStageDefinition()
          this.statusMessage =
            `CORE EVOLVED // ${definition.displayName.toUpperCase()} // ${definition.bonus.displayName.toUpperCase()} ACTIVATED // ${definition.bonus.description.toUpperCase()}`
          this.cameras.main.flash(
            450,
            255,
            60,
            60
          )
        }
        this.selectedItem =
          this.inventory
            .getEquippedItem() ??
          this.inventory
            .getItems()[0] ??
          null
        this.save()
        this.tutorial
          ?.onCoreFed()
        this.render()

        if (
          result.evolved
        ) {
          this.coreVisual
            ?.playEvolution()
        } else {
          this.coreVisual
            ?.playFeedPulse()
        }

        this.time.delayedCall(
          result.evolved
            ? 1800
            : 250,
          () => {
            this.feedInProgress =
              false
          }
        )
      }
    )

    const preview =
      this.core.previewFeed(
        item,
        this.getArmorCoreFeedBonus()
      )
    this.add.text(
      1075,
      472,
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

  private createArmorDetails(item: ArmorItem) {
    const equipped = this.inventory.getEquippedArmor()
    const selected = getArmorModifiers(item)
    const current = equipped ? getArmorModifiers(equipped) : null
    const calculated = calculateHunterStats(
      this.saveData.player,
      equipped
    )
    const coreReduction = this.core.getDefenseReduction()
    const finalReduction = calculateDamageReduction(
      calculated.defense,
      coreReduction
    )

    this.add.text(630, 234, item.name.toUpperCase(), {
      fontFamily: 'Arial Black, Arial', fontSize: '24px',
      color: this.getRarityColor(item),
    })
    this.add.text(630, 271,
      `${item.rarity.toUpperCase()} ARMOR // ${item.armorType.toUpperCase()}\n` +
      `${item.affixes.map(affix => `${affix.displayName}: ${affix.description}`).join('\n') || 'NO AFFIXES'}`,
      { fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa' }
    )
    this.add.text(630, 335,
      `SELECTED                 EQUIPPED: ${equipped?.name ?? 'NONE'}`,
      { fontFamily: 'Arial Black, Arial', fontSize: '13px', color: '#777777' }
    )
    this.add.text(630, 365, [
      this.getComparisonLine('DEFENSE', selected.defense, current?.defense),
      this.getComparisonLine('MAX HP', selected.maxHealth, current?.maxHealth),
      this.getComparisonLine('MOVE %', selected.moveSpeedPercent * 100, current ? current.moveSpeedPercent * 100 : undefined),
      this.getComparisonLine('PICKUP %', selected.pickupRadiusPercent * 100, current ? current.pickupRadiusPercent * 100 : undefined),
      `BASE DEF     ${this.saveData.player.defense}`,
      `FINAL DEF    ${calculated.defense} // CORE ${(coreReduction * 100).toFixed(0)}% // TOTAL DR ${(finalReduction * 100).toFixed(0)}%`,
    ].join('\n'), {
      fontFamily: 'Courier New, monospace', fontSize: '13px',
      color: '#ffffff', lineSpacing: 5,
    })

    if (this.inventory.isArmorEquipped(item.id)) {
      this.add.text(925, 514, 'CURRENTLY EQUIPPED', {
        fontFamily: 'Arial Black, Arial', fontSize: '17px', color: '#e50914',
      }).setOrigin(0.5)
      return
    }

    this.createActionButton(775, 514, 260, 'EQUIP ARMOR', 0xe50914, () => {
      const armor = this.inventory.equipArmor(item.id)
      if (!armor) return
      this.statusMessage = `${armor.name.toUpperCase()} EQUIPPED`
      this.save()
      this.render()
    })
    this.createActionButton(1075, 514, 260, 'FEED CORE', 0x3d1717, () => {
      if (this.feedInProgress || !this.inventory.removeItem(item.id)) return
      this.feedInProgress = true
      const result = this.core.feedItem(item, this.getArmorCoreFeedBonus())
      this.statusMessage =
        `CORE FED // ${item.name.toUpperCase()} // +${result.statGained} DEFENSE // +${result.experienceGained} PROGRESS`
      this.selectedItem = this.inventory.getEquippedArmor() ??
        this.inventory.getEquippedItem() ??
        this.inventory.getItems()[0] ?? null
      this.save()
      this.tutorial?.onCoreFed()
      this.render()
      this.time.delayedCall(250, () => { this.feedInProgress = false })
    })
    const preview = this.core.previewFeed(item, this.getArmorCoreFeedBonus())
    this.add.text(1075, 472,
      `FEED PREVIEW // DEFENSE +${preview.statGained} // PROGRESS +${preview.experienceGained}`,
      { fontFamily: 'Arial', fontSize: '12px', color: '#cc9966' }
    ).setOrigin(0.5)
  }

  private getArmorCoreFeedBonus() {
    const armor = this.inventory.getEquippedArmor()
    return armor
      ? getArmorModifiers(armor).coreFeedBonusPercent
      : 0
  }

  private createHunterProgression() {
    const player =
      this.saveData.player
    const nextReward =
      getNextHunterLevelReward(
        player.level
      )
    const highestTier =
      getHighestUnlockedDropTier(
        player.level
      )
    const selectedTier =
      normalizeSelectedDropTier(
        player.level,
        this.saveData.account.selectedDropTier
      )

    this.saveData.account.selectedDropTier =
      selectedTier

    this.add.rectangle(
      315,
      585,
      558,
      82,
      0x10161d
    ).setStrokeStyle(1, 0x354252)

    this.add.text(50, 550,
      `HUNTER LEVEL ${player.level}  //  XP ${player.currentXP} / ${player.xpToNextLevel}`,
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '14px',
        color: '#55d8ee',
      }
    )

    this.add.text(50, 575,
      nextReward
        ? `NEXT LEVEL ${nextReward.level} // ${getHunterRewardPreview(nextReward)}`
        : 'NEXT REWARD // MORE REWARDS COMING SOON',
      {
        fontFamily: 'Courier New, monospace',
        fontSize: '11px',
        color: '#b9c2ca',
      }
    )

    this.add.text(50, 597,
      canEquipArmor(player.level)
        ? `ARMOR // ${this.saveData.equippedArmor.name.toUpperCase()} // ${this.saveData.equippedArmor.rarity.toUpperCase()} // DEF ${getArmorModifiers(this.saveData.equippedArmor).defense}`
        : 'ARMOR SLOT // LOCKED',
      {
        fontFamily: 'Courier New, monospace',
        fontSize: '11px',
        color: canEquipArmor(player.level) ? '#75dba0' : '#777f87',
      }
    )

    const progress =
      this.summary?.hunterProgress
    if (progress) {
      const rewards =
        getHunterRewardSummary(
          progress.previousLevel,
          progress.newLevel
        )
      const rewardText =
        getHunterRewardDisplayLines(rewards).join(' // ')
      this.add.text(50, 619,
        `LAST DROP // XP +${progress.xpGained} // LEVEL ${progress.previousLevel} > ${progress.newLevel}${rewardText ? ` // ${rewardText}` : ''}`,
        {
          fontFamily: 'Courier New, monospace',
          fontSize: '9px',
          color: progress.newLevel > progress.previousLevel ? '#ffcc66' : '#78838c',
          wordWrap: { width: 400 },
        }
      )
    }

    this.add.text(465, 550,
      `DROP TIER // HIGHEST ${highestTier}`,
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '11px',
        color: '#ffffff',
      }
    )

    this.createTierButton(485, 590, 1, selectedTier, true)
    this.createTierButton(555, 590, 2, selectedTier, highestTier >= 2)
  }

  private createTierButton(
    x: number,
    y: number,
    tier: DropTier,
    selectedTier: DropTier,
    unlocked: boolean
  ) {
    const selected =
      tier === selectedTier
    const button =
      this.add.rectangle(
        x,
        y,
        58,
        35,
        selected ? 0x8f1119 : 0x222a33
      ).setStrokeStyle(
        1,
        selected ? 0xffffff : 0x46525e
      )

    this.add.text(x, y,
      unlocked ? `TIER ${tier}` : 'LOCKED',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '10px',
        color: unlocked ? '#ffffff' : '#666666',
      }
    ).setOrigin(0.5)

    if (unlocked) {
      button.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.saveData.account.selectedDropTier = tier
          this.statusMessage = `DROP TIER ${tier} SELECTED`
          this.save()
          this.render()
        })
    }

    if (!unlocked) {
      this.add.text(520, 616, 'LV 8 REQUIRED', {
        fontFamily: 'Arial',
        fontSize: '9px',
        color: '#696f76',
      }).setOrigin(0.5)
    }
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
    const threshold =
      equipped === undefined
        ? 0
        : Math.max(Math.abs(equipped) * 0.04, 0.01)
    const deltaText =
      delta === ''
        ? ''
        : delta > threshold
          ? '  ▲ BETTER'
          : delta < -threshold
            ? '  ▼ WORSE'
            : '  ≈ SIMILAR'

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
        if (
          this.tutorial &&
          !this.tutorial
            .canLaunchDrop()
        ) {
          this.statusMessage =
            'COMPLETE OR SKIP HUNTER ONBOARDING BEFORE LAUNCH'
          this.render()
          return
        }

        if (
          this.tutorial &&
          !this.saveData.tutorial
            .completed
        ) {
          this.tutorial
            .completeForLaunch()
        }

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

  private setupCoreDebugControl() {
    if (
      !import.meta.env.DEV ||
      !this.input.keyboard
    ) {
      return
    }

    const handler =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.code !==
            'KeyC' ||
          !event.shiftKey ||
          !event.ctrlKey
        ) {
          return
        }

        this.core
          .prepareEvolutionTest()

        const hasFeedableItem =
          this.inventory
            .getItems()
            .some(
              item =>
                !this.inventory
                  .isEquipped(
                    item.id
                  )
            )

        if (!hasFeedableItem) {
          const debugItem =
            ItemGenerator
              .generateWeapon(
                'rifle'
              )
          debugItem.id =
            `core-evolution-debug-${Date.now()}`
          debugItem.name =
            'CORE TEST SALVAGE'
          debugItem.rarity =
            'common'
          this.inventory.addItem(
            debugItem
          )
        }

        this.statusMessage =
          'DEV CTRL+SHIFT+C // CORE SET TO LEVEL 9 // FEED ONE COMMON ITEM TO EVOLVE'
        this.save()
        this.render()
      }

    this.input.keyboard.on(
      'keydown',
      handler
    )
    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.input.keyboard?.off(
          'keydown',
          handler
        )
      }
    )
  }

  private addDevelopmentArmor() {
    let added = 0
    for (const armor of createDevelopmentArmorItems()) {
      if (!this.inventory.getItem(armor.id) && this.inventory.addItem(armor)) {
        added++
      }
    }

    this.statusMessage = added > 0
      ? `DEV ARMOR ADDED // ${added} TEST SUITS`
      : 'DEV ARMOR ALREADY PRESENT OR INVENTORY FULL'
    this.save()
    this.render()
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
    this.saveData.equippedArmor =
      this.inventory.getEquippedArmor() ??
      this.saveData.equippedArmor
    this.saveData.core =
      this.core.getCore()

    this.persistence.save(
      this.saveData
    )
  }

  private getRarityColor(
    item:
      InventoryItem
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
