import Phaser from 'phaser'

import type {
  TutorialSaveState,
  TutorialStep,
} from '../persistence/PersistenceSystem'

interface HunterHubTutorialConfig {
  scene: Phaser.Scene
  state: TutorialSaveState
  hasEquippedWeapon: () => boolean
  hasAnyWeapon: () => boolean
  hasFeedableItem: () => boolean
  onStateChanged: () => void
}

export class HunterHubTutorial {
  private readonly scene:
    Phaser.Scene

  private readonly state:
    TutorialSaveState

  private readonly hasEquippedWeapon:
    HunterHubTutorialConfig[
      'hasEquippedWeapon'
    ]

  private readonly hasFeedableItem:
    HunterHubTutorialConfig[
      'hasFeedableItem'
    ]

  private readonly hasAnyWeapon:
    HunterHubTutorialConfig[
      'hasAnyWeapon'
    ]

  private readonly onStateChanged:
    HunterHubTutorialConfig[
      'onStateChanged'
    ]

  private container:
    Phaser.GameObjects.Container |
    null = null

  private highlights:
    Phaser.GameObjects.Rectangle[] = []

  constructor(
    config:
      HunterHubTutorialConfig
  ) {
    this.scene =
      config.scene
    this.state =
      config.state
    this.hasEquippedWeapon =
      config.hasEquippedWeapon
    this.hasAnyWeapon =
      config.hasAnyWeapon
    this.hasFeedableItem =
      config.hasFeedableItem
    this.onStateChanged =
      config.onStateChanged
  }

  start() {
    if (this.state.completed) {
      return
    }

    this.state.currentStep ??=
      'welcome'
    this.persist()
    this.refresh()
  }

  refresh() {
    if (this.state.completed) {
      this.destroy()
      return
    }

    this.destroyVisuals()
    this.container =
      this.scene.add
        .container(
          0,
          0
        )
        .setDepth(
          2000
        )

    switch (
      this.getStep()
    ) {
      case 'welcome':
        this.renderWelcome()
        break
      case 'equip':
        this.renderEquip()
        break
      case 'feed':
        this.renderFeed()
        break
      case 'begin':
        this.renderBegin()
        break
    }
  }

  onWeaponEquipped() {
    if (
      this.isAtStep(
        'equip'
      )
    ) {
      this.advanceTo(
        'feed'
      )
    }
  }

  onCoreFed() {
    if (
      this.isAtStep(
        'feed'
      )
    ) {
      this.advanceTo(
        'begin'
      )
    }
  }

  canLaunchDrop() {
    return (
      this.state.completed ||
      this.isAtStep(
        'begin'
      )
    )
  }

  completeForLaunch() {
    if (
      !this.isAtStep(
        'begin'
      )
    ) {
      return false
    }

    this.state.completed =
      true
    this.state.skipped =
      false
    this.state.currentStep =
      undefined
    this.persist()
    this.destroy()

    return true
  }

  destroy() {
    this.destroyVisuals()
  }

  private renderWelcome() {
    const blocker =
      this.scene.add
        .rectangle(
          640,
          360,
          1280,
          720,
          0x000000,
          0.78
        )
        .setInteractive()

    const panel =
      this.scene.add.rectangle(
        640,
        350,
        650,
        300,
        0x111720,
        0.99
      )
        .setStrokeStyle(
          3,
          0xe50914
        )

    const heading =
      this.createText(
        640,
        265,
        'WELCOME, HUNTER',
        '30px',
        '#e50914'
      )

    const body =
      this.createBodyText(
        640,
        340,
        'This is your Hunter Hub. Prepare your equipment, strengthen your Core, and launch your next drop from here.',
        520
      )

    const continueButton =
      this.createButton(
        640,
        425,
        260,
        'CONTINUE',
        () => {
          this.advanceTo(
            'equip'
          )
        }
      )

    this.add([
      blocker,
      panel,
      heading,
      body,
      ...continueButton,
    ])
    this.addSkipButton(
      640,
      472
    )
  }

  private renderEquip() {
    this.createDimmer()
    this.createHighlight(
      34,
      207,
      565,
      340
    )
    this.createHighlight(
      644,
      486,
      264,
      57
    )

    this.createInstructionPanel(
      'EQUIP A WEAPON',
      this.hasAnyWeapon()
        ? 'Select a weapon from your inventory and equip it before beginning your drop.'
        : 'No weapons have been recovered yet. Your first drop includes a field-issue Rifle; recovered weapons will become persistent inventory.'
    )

    if (
      this.hasEquippedWeapon()
    ) {
      const button =
        this.createButton(
          930,
          192,
          260,
          'USE EQUIPPED WEAPON',
          () => {
            this.advanceTo(
              'feed'
            )
          }
        )

      this.add(button)
    } else if (
      !this.hasAnyWeapon()
    ) {
      const button =
        this.createButton(
          930,
          192,
          260,
          'CONTINUE TO CORE',
          () => {
            this.advanceTo(
              'feed'
            )
          }
        )

      this.add(button)
    }
  }

  private renderFeed() {
    this.createDimmer()
    this.createHighlight(
      390,
      8,
      500,
      92
    )
    this.createHighlight(
      944,
      486,
      264,
      57
    )

    const canFeed =
      this.hasFeedableItem()

    this.createInstructionPanel(
      'FEED YOUR CORE',
      canFeed
        ? 'Select unwanted equipment, then feed it to your Core. The tutorial advances only after a successful feed.'
        : 'You have no spare equipment to feed. Recover loot during a drop, then feed it from the Hub later.'
    )

    if (!canFeed) {
      const button =
        this.createButton(
          930,
          192,
          250,
          'CONTINUE',
          () => {
            this.advanceTo(
              'begin'
            )
          }
        )

      this.add(button)
    }
  }

  private renderBegin() {
    this.createDimmer()
    this.createHighlight(
      673,
      627,
      354,
      57
    )

    const panel =
      this.scene.add.rectangle(
        335,
        635,
        560,
        130,
        0x111720,
        0.98
      )
        .setStrokeStyle(
          2,
          0xe50914
        )

    const heading =
      this.createText(
        335,
        606,
        'BEGIN THE HUNT',
        '22px',
        '#e50914'
      )

    const body =
      this.createBodyText(
        335,
        646,
        'Your equipment is ready. Launch a drop and recover what remains below.',
        470
      )

    this.add([
      panel,
      heading,
      body,
    ])
    this.addSkipButton(
      535,
      675
    )
  }

  private createInstructionPanel(
    headingText:
      string,
    bodyText:
      string
  ) {
    const panel =
      this.scene.add.rectangle(
        930,
        150,
        610,
        126,
        0x111720,
        0.98
      )
        .setStrokeStyle(
          2,
          0xe50914
        )

    const heading =
      this.createText(
        930,
        119,
        headingText,
        '21px',
        '#e50914'
      )

    const body =
      this.createBodyText(
        930,
        154,
        bodyText,
        530
      )

    this.add([
      panel,
      heading,
      body,
    ])
    this.addSkipButton(
      1165,
      190
    )
  }

  private createDimmer() {
    const dimmer =
      this.scene.add.rectangle(
        640,
        360,
        1280,
        720,
        0x000000,
        0.28
      )

    this.add(
      dimmer
    )
  }

  private createHighlight(
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const highlight =
      this.scene.add.rectangle(
        x + width / 2,
        y + height / 2,
        width,
        height,
        0xe50914,
        0.035
      )
        .setStrokeStyle(
          3,
          0xff5555,
          1
        )

    this.scene.tweens.add({
      targets:
        highlight,
      alpha: {
        from:
          0.55,
        to:
          1,
      },
      duration:
        650,
      yoyo:
        true,
      repeat:
        -1,
    })

    this.highlights.push(
      highlight
    )
    this.add(
      highlight
    )
  }

  private addSkipButton(
    x: number,
    y: number
  ) {
    const skip =
      this.createText(
        x,
        y,
        'SKIP TUTORIAL',
        '12px',
        '#777777'
      )
        .setInteractive({
          useHandCursor:
            true,
        })

    skip.on(
      'pointerdown',
      () => {
        this.renderSkipConfirmation()
      }
    )

    this.add(
      skip
    )
  }

  private renderSkipConfirmation() {
    this.destroyVisuals()
    this.container =
      this.scene.add
        .container(
          0,
          0
        )
        .setDepth(
          2100
        )

    const blocker =
      this.scene.add
        .rectangle(
          640,
          360,
          1280,
          720,
          0x000000,
          0.82
        )
        .setInteractive()

    const panel =
      this.scene.add.rectangle(
        640,
        360,
        620,
        260,
        0x111720
      )
        .setStrokeStyle(
          3,
          0xe50914
        )

    const heading =
      this.createText(
        640,
        295,
        'SKIP HUNTER ONBOARDING?',
        '24px',
        '#e50914'
      )

    const body =
      this.createBodyText(
        640,
        340,
        'You can restore onboarding later by using Reset Hunter on the Title Screen.',
        500
      )

    const continueButton =
      this.createButton(
        510,
        420,
        250,
        'CONTINUE TUTORIAL',
        () => {
          this.refresh()
        },
        0x27313f
      )

    const skipButton =
      this.createButton(
        770,
        420,
        180,
        'SKIP',
        () => {
          this.state.completed =
            true
          this.state.skipped =
            true
          this.state.currentStep =
            undefined
          this.persist()
          this.destroy()
        },
        0x8d1118
      )

    this.add([
      blocker,
      panel,
      heading,
      body,
      ...continueButton,
      ...skipButton,
    ])
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    label: string,
    action: () => void,
    color =
      0xe50914
  ) {
    const background =
      this.scene.add.rectangle(
        x,
        y,
        width,
        46,
        color
      )
        .setStrokeStyle(
          2,
          0xffffff,
          0.65
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    const text =
      this.createText(
        x,
        y,
        label,
        '14px',
        '#ffffff'
      )

    background.on(
      'pointerdown',
      action
    )

    return [
      background,
      text,
    ]
  }

  private createText(
    x: number,
    y: number,
    text:
      string,
    size:
      string,
    color:
      string
  ) {
    return this.scene.add
      .text(
        x,
        y,
        text,
        {
          fontFamily:
            'Arial Black, Arial',
          fontSize:
            size,
          color,
          align:
            'center',
        }
      )
      .setOrigin(
        0.5
      )
  }

  private createBodyText(
    x: number,
    y: number,
    text:
      string,
    width:
      number
  ) {
    return this.scene.add
      .text(
        x,
        y,
        text,
        {
          fontFamily:
            'Arial',
          fontSize:
            '16px',
          color:
            '#dddddd',
          align:
            'center',
          wordWrap: {
            width,
          },
        }
      )
      .setOrigin(
        0.5
      )
  }

  private add(
    objects:
      Phaser.GameObjects.GameObject |
      Phaser.GameObjects.GameObject[]
  ) {
    this.container?.add(
      objects
    )
  }

  private advanceTo(
    step:
      TutorialStep
  ) {
    this.state.currentStep =
      step
    this.persist()
    this.refresh()
  }

  private isAtStep(
    step:
      TutorialStep
  ) {
    return (
      !this.state.completed &&
      this.getStep() ===
      step
    )
  }

  private getStep():
    TutorialStep {
    return (
      this.state.currentStep ??
      'welcome'
    )
  }

  private persist() {
    this.onStateChanged()
  }

  private destroyVisuals() {
    for (
      const highlight of
      this.highlights
    ) {
      this.scene.tweens
        .killTweensOf(
          highlight
        )
    }

    this.highlights =
      []

    if (
      this.container?.active
    ) {
      this.container.destroy(
        true
      )
    }

    this.container =
      null
  }
}
