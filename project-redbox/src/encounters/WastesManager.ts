import Phaser from 'phaser'

import type {
  CombatZoneState,
  EncounterZone,
  GateState,
  WastesGateDefinition,
  WastesObstacleDefinition,
} from './EncounterTypes'

import {
  WASTES_APPROACH,
  WASTES_BOSS_ARENA,
  WASTES_BOSS_TRIGGER,
  WASTES_GATES,
  WASTES_OBSTACLES,
  WASTES_WALLS,
  WASTES_ZONES,
} from './WastesLayout'

import {
  hasWastesTexture,
  WASTES_TEXTURES,
  WASTES_VISUALS,
} from '../assets/WastesArt'

interface WastesManagerConfig {
  scene: Phaser.Scene
  player:
    Phaser.GameObjects.Rectangle
  getEnemies:
    () =>
      Phaser.GameObjects.Rectangle[]
  getEnemyType:
    (
      enemy:
        Phaser.GameObjects.Rectangle
    ) => string
  onZoneActivated:
    (
      zone:
        EncounterZone
    ) =>
      Phaser.GameObjects.Rectangle[]
  onZoneCleared:
    (
      zone:
        EncounterZone,
      clearedCount:
        number,
      totalCount:
        number
    ) => void
  onMessage:
    (message: string) => void
  onWyrmArenaEntered:
    () => void
  onDebugRemoveEnemy:
    (
      enemy:
        Phaser.GameObjects.Rectangle
    ) => void
  syncEnemyVisual:
    (
      enemy:
        Phaser.GameObjects.Rectangle
    ) => void
}

interface ZoneRuntime {
  definition:
    EncounterZone
  state:
    CombatZoneState
  spawnComplete:
    boolean
  livingEnemies:
    Set<
      Phaser.GameObjects.Rectangle
    >
}

interface GateRuntime {
  definition:
    WastesGateDefinition
  state:
    GateState
  barrier:
    Phaser.GameObjects.Rectangle
  panels:
    Phaser.GameObjects.Rectangle[]
  lights:
    Phaser.GameObjects.Arc[]
  messageShown:
    boolean
}

export class WastesManager {
  private readonly scene:
    Phaser.Scene

  private readonly player:
    Phaser.GameObjects.Rectangle

  private readonly getEnemies:
    WastesManagerConfig['getEnemies']

  private readonly getEnemyType:
    WastesManagerConfig[
      'getEnemyType'
    ]

  private readonly onZoneActivated:
    WastesManagerConfig[
      'onZoneActivated'
    ]

  private readonly onZoneCleared:
    WastesManagerConfig[
      'onZoneCleared'
    ]

  private readonly onMessage:
    WastesManagerConfig['onMessage']

  private readonly onWyrmArenaEntered:
    WastesManagerConfig[
      'onWyrmArenaEntered'
    ]

  private readonly onDebugRemoveEnemy:
    WastesManagerConfig['onDebugRemoveEnemy']

  private readonly syncEnemyVisual:
    WastesManagerConfig['syncEnemyVisual']

  private readonly zones:
    ZoneRuntime[]

  private readonly gates =
    new Map<string, GateRuntime>()

  private readonly enemyOwners =
    new Map<
      Phaser.GameObjects.Rectangle,
      ZoneRuntime
    >()

  private readonly solids:
    WastesObstacleDefinition[]

  private previousPlayerPosition:
    Phaser.Math.Vector2

  private clearedCount = 0

  private approachEntered = false

  private bossTriggered = false

  private debugVisible = false

  private debugObjects:
    Phaser.GameObjects.GameObject[] = []

  constructor(
    config:
      WastesManagerConfig
  ) {
    this.scene =
      config.scene
    this.player =
      config.player
    this.getEnemies =
      config.getEnemies
    this.getEnemyType =
      config.getEnemyType
    this.onZoneActivated =
      config.onZoneActivated
    this.onZoneCleared =
      config.onZoneCleared
    this.onMessage =
      config.onMessage
    this.onWyrmArenaEntered =
      config.onWyrmArenaEntered
    this.onDebugRemoveEnemy =
      config.onDebugRemoveEnemy
    this.syncEnemyVisual =
      config.syncEnemyVisual
    this.previousPlayerPosition =
      new Phaser.Math.Vector2(
        this.player.x,
        this.player.y
      )
    this.zones =
      WASTES_ZONES.map(
        definition => ({
          definition,
          state:
            'inactive',
          spawnComplete:
            false,
          livingEnemies:
            new Set(),
        })
      )
    this.solids = [
      ...WASTES_WALLS,
      ...WASTES_OBSTACLES,
    ]

    this.createEnvironment()
  }

  capturePlayerPosition() {
    this.previousPlayerPosition.set(
      this.player.x,
      this.player.y
    )
  }

  updateBeforeEnemies() {
    if (!this.player.active) {
      return
    }

    this.resolvePlayerCollision()
    this.activateEligibleZone()
    this.updateApproach()
    this.updateGatePrompts()
    this.refreshDebugText()
  }

  updateAfterEnemies() {
    this.constrainOwnedEnemies()
    this.constrainWyrm()
  }

  isPointBlocked(
    x: number,
    y: number,
    margin = 0
  ) {
    return this.solids.some(
      solid =>
        Phaser.Geom.Rectangle.Contains(
          new Phaser.Geom.Rectangle(
            solid.bounds.x - margin,
            solid.bounds.y - margin,
            solid.bounds.width + margin * 2,
            solid.bounds.height + margin * 2
          ),
          x,
          y
        )
    )
  }

  hasClearLine(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) {
    const line =
      new Phaser.Geom.Line(
        fromX,
        fromY,
        toX,
        toY
      )

    return !this.solids.some(
      solid =>
        Phaser.Geom.Intersects.LineToRectangle(
          line,
          solid.bounds
        )
    )
  }

  notifyEnemyDefeated(
    enemy:
      Phaser.GameObjects.Rectangle
  ) {
    const zone =
      this.enemyOwners.get(
        enemy
      )

    if (!zone) {
      return
    }

    this.enemyOwners.delete(
      enemy
    )

    if (
      !zone.livingEnemies.delete(
        enemy
      )
    ) {
      return
    }

    this.tryClearZone(
      zone
    )
  }

  getSafeDropPoint(
    x: number,
    y: number
  ) {
    const point =
      new Phaser.Math.Vector2(
        x,
        y
      )

    for (
      const solid of
        this.solids
    ) {
      if (
        !solid.bounds.contains(
          point.x,
          point.y
        )
      ) {
        continue
      }

      const left =
        Math.abs(
          point.x -
          solid.bounds.left
        )
      const right =
        Math.abs(
          solid.bounds.right -
          point.x
        )
      const top =
        Math.abs(
          point.y -
          solid.bounds.top
        )
      const bottom =
        Math.abs(
          solid.bounds.bottom -
          point.y
        )
      const nearest =
        Math.min(
          left,
          right,
          top,
          bottom
        )

      if (nearest === left) {
        point.x =
          solid.bounds.left - 28
      } else if (
        nearest === right
      ) {
        point.x =
          solid.bounds.right + 28
      } else if (
        nearest === top
      ) {
        point.y =
          solid.bounds.top - 28
      } else {
        point.y =
          solid.bounds.bottom + 28
      }
    }

    return point
  }

  toggleDebug() {
    if (!import.meta.env.DEV) {
      return
    }

    this.debugVisible =
      !this.debugVisible

    if (this.debugVisible) {
      this.createDebugObjects()
    } else {
      this.destroyDebugObjects()
    }
  }

  forceClearCurrentZone() {
    if (!import.meta.env.DEV) {
      return
    }

    const zone =
      this.zones.find(
        candidate =>
          candidate.state ===
          'active'
      )

    if (!zone) {
      return
    }

    for (
      const enemy of
        [...zone.livingEnemies]
    ) {
      this.enemyOwners.delete(
        enemy
      )
      zone.livingEnemies.delete(
        enemy
      )
      this.onDebugRemoveEnemy(
        enemy
      )
    }

    zone.spawnComplete =
      true
    this.tryClearZone(
      zone
    )
  }

  teleportToSequence(
    sequence: number
  ) {
    if (!import.meta.env.DEV) {
      return
    }

    const target =
      sequence >=
      this.zones.length
        ? WASTES_APPROACH
        : this.zones[
          Math.max(
            0,
            sequence
          )
        ].definition
          .activationBounds

    this.player.setPosition(
      target.centerX,
      target.centerY
    )
  }

  destroy() {
    this.destroyDebugObjects()
    this.enemyOwners.clear()
    this.gates.clear()
  }

  private createEnvironment() {
    this.createFloorRegions()
    this.createFloorMarkings()

    for (
      const solid of
        this.solids
    ) {
      this.scene.add.rectangle(
        solid.bounds.centerX,
        solid.bounds.centerY,
        solid.bounds.width,
        solid.bounds.height,
        solid.color
      )
        .setStrokeStyle(
          2,
          0x56606a,
          0.65
        )
        .setDepth(-15)

      this.decorateSolid(solid)
    }

    for (
      const definition of
        WASTES_GATES
    ) {
      this.createGate(
        definition
      )
    }

    this.createLandmarks()
    this.createAtmosphere()
  }

  private createFloorRegions() {
    const regions = [
      {
        bounds:
          WASTES_ZONES[0]
            .bounds,
        color:
          0x24211e,
        texture:
          WASTES_TEXTURES.salvageFloor.key,
        tint: 0xb8aea0,
      },
      {
        bounds:
          WASTES_ZONES[1]
            .bounds,
        color:
          0x17242a,
        texture:
          WASTES_TEXTURES.reactorFloor.key,
        tint: 0xa0b8bc,
      },
      {
        bounds:
          WASTES_ZONES[2]
            .bounds,
        color:
          0x28201c,
        texture:
          WASTES_TEXTURES.extractionFloor.key,
        tint: 0xb6a394,
      },
      {
        bounds:
          WASTES_APPROACH,
        color:
          0x171316,
        texture:
          WASTES_TEXTURES.extractionFloor.key,
        tint: 0x756b6d,
      },
      {
        bounds:
          WASTES_BOSS_ARENA,
        color:
          0x211719,
        texture:
          WASTES_TEXTURES.extractionFloor.key,
        tint: 0x75656a,
      },
    ]

    for (
      const region of
        regions
    ) {
      this.scene.add.rectangle(
        region.bounds.centerX,
        region.bounds.centerY,
        region.bounds.width,
        region.bounds.height,
        region.color,
        0.72
      )
        .setStrokeStyle(
          3,
          0x4a4140,
          0.45
        )
        .setDepth(-28)

      if (
        hasWastesTexture(
          this.scene,
          region.texture
        )
      ) {
        this.scene.add.tileSprite(
          region.bounds.centerX,
          region.bounds.centerY,
          region.bounds.width,
          region.bounds.height,
          region.texture
        )
          .setTileScale(
            WASTES_VISUALS.floorTileScale,
            WASTES_VISUALS.floorTileScale
          )
          .setTint(region.tint)
          .setAlpha(WASTES_VISUALS.floorAlpha)
          .setDepth(WASTES_VISUALS.floorDepth)
      }
    }
  }

  private createFloorMarkings() {
    for (const zone of WASTES_ZONES) {
      const horizontal =
        zone.sequence !== 1
      const length = horizontal
        ? Math.min(520, zone.bounds.width * 0.42)
        : Math.min(520, zone.bounds.height * 0.5)

      for (let index = -1; index <= 1; index++) {
        this.scene.add.rectangle(
          zone.bounds.centerX + (horizontal ? 0 : index * 90),
          zone.bounds.centerY + (horizontal ? index * 90 : 0),
          horizontal ? length : 5,
          horizontal ? 5 : length,
          zone.sequence === 1 ? 0x28727a : 0x7a4628,
          0.22
        ).setDepth(-27)
      }
    }

    this.scene.add.rectangle(
      WASTES_BOSS_ARENA.centerX,
      WASTES_BOSS_ARENA.centerY,
      WASTES_BOSS_ARENA.width - 80,
      WASTES_BOSS_ARENA.height - 80,
      0x000000,
      0
    )
      .setStrokeStyle(8, 0x6f2024, 0.5)
      .setDepth(-26)
  }

  private decorateSolid(
    solid: WastesObstacleDefinition
  ) {
    const bounds = solid.bounds
    const depth = WASTES_VISUALS.wallDepth + 1
    const isWall = solid.id.includes('wall') ||
      solid.id.includes('divider')

    if (isWall) {
      const horizontal = bounds.width > bounds.height
      const stripeCount = Math.max(
        2,
        Math.floor(
          (horizontal ? bounds.width : bounds.height) / 180
        )
      )

      for (let index = 1; index < stripeCount; index++) {
        const progress = index / stripeCount
        this.scene.add.rectangle(
          horizontal
            ? bounds.left + bounds.width * progress
            : bounds.centerX,
          horizontal
            ? bounds.centerY
            : bounds.top + bounds.height * progress,
          horizontal ? 7 : bounds.width - 16,
          horizontal ? bounds.height - 16 : 7,
          0x11161a,
          0.7
        ).setDepth(depth)
      }
      return
    }

    const accent = solid.id.includes('reactor')
      ? 0x3e9aaa
      : solid.id.includes('pit') || solid.id.includes('drill')
        ? 0x8a3b2f
        : 0x8a6038
    const horizontal = bounds.width >= bounds.height

    this.scene.add.rectangle(
      bounds.centerX,
      bounds.centerY,
      horizontal ? bounds.width - 24 : 10,
      horizontal ? 10 : bounds.height - 24,
      accent,
      0.55
    ).setDepth(depth)

    for (const direction of [-1, 1]) {
      this.scene.add.circle(
        bounds.centerX + (horizontal ? direction * (bounds.width / 2 - 18) : 0),
        bounds.centerY + (horizontal ? 0 : direction * (bounds.height / 2 - 18)),
        6,
        0x111417,
        1
      )
        .setStrokeStyle(2, 0x737b80, 0.7)
        .setDepth(depth + 1)
    }
  }

  private createAtmosphere() {
    const haze = [
      { x: 980, y: 1080, width: 500, height: 180, color: 0x6c5845 },
      { x: 3500, y: 1120, width: 620, height: 150, color: 0x345862 },
      { x: 3250, y: 2250, width: 700, height: 170, color: 0x67413c },
      { x: 3000, y: 2700, width: 520, height: 120, color: 0x4f262b },
    ]

    for (const cloud of haze) {
      const visual = this.scene.add.ellipse(
        cloud.x,
        cloud.y,
        cloud.width,
        cloud.height,
        cloud.color,
        0.045
      ).setDepth(WASTES_VISUALS.atmosphereDepth)

      this.scene.tweens.add({
        targets: visual,
        x: cloud.x + 45,
        alpha: 0.075,
        duration: 5200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    for (let index = 0; index < 5; index++) {
      const warning = this.scene.add.circle(
        2670 + index * 165,
        2730,
        7,
        0xff2938,
        0.55
      ).setDepth(WASTES_VISUALS.atmosphereDepth + 1)

      this.scene.tweens.add({
        targets: warning,
        alpha: 0.12,
        duration: 720 + index * 90,
        yoyo: true,
        repeat: -1,
      })
    }

    const sparkOrigins = [
      { x: 2805, y: 220, color: 0x55ddff },
      { x: 2920, y: 330, color: 0x55ddff },
      { x: 2330, y: 1810, color: 0xff9b45 },
      { x: 3060, y: 2590, color: 0xff4455 },
    ]

    sparkOrigins.forEach((spark, index) => {
      const visual = this.scene.add.rectangle(
        spark.x,
        spark.y,
        4,
        18,
        spark.color,
        0
      )
        .setRotation(0.55)
        .setDepth(WASTES_VISUALS.atmosphereDepth + 2)

      this.scene.tweens.add({
        targets: visual,
        alpha: 0.75,
        y: spark.y + 28,
        scaleY: 0.25,
        delay: 500 + index * 640,
        duration: 260,
        hold: 1400 + index * 380,
        repeat: -1,
        repeatDelay: 1800,
        onRepeat: () => {
          visual
            .setPosition(spark.x, spark.y)
            .setScale(1)
            .setAlpha(0)
        },
      })
    })
  }

  private createGate(
    definition:
      WastesGateDefinition
  ) {
    const horizontal =
      definition.orientation === 'horizontal'
    const frameThickness = 18
    const frameOffset = horizontal
      ? definition.bounds.height / 2 + frameThickness / 2
      : definition.bounds.width / 2 + frameThickness / 2

    for (const direction of [-1, 1]) {
      this.scene.add.rectangle(
        definition.bounds.centerX +
          (horizontal ? 0 : frameOffset * direction),
        definition.bounds.centerY +
          (horizontal ? frameOffset * direction : 0),
        horizontal
          ? definition.bounds.width + 40
          : frameThickness,
        horizontal
          ? frameThickness
          : definition.bounds.height + 40,
        0x4c555d,
        1
      )
        .setStrokeStyle(2, 0x88939c, 0.7)
        .setDepth(-6)
    }

    const barrier =
      this.scene.add.rectangle(
        definition.bounds.centerX,
        definition.bounds.centerY,
        definition.bounds.width,
        definition.bounds.height,
        0x9b1018,
        0.78
      )
        .setStrokeStyle(
          3,
          0xff3344,
          0.95
        )
        .setDepth(-5)
    const panels = [
      this.scene.add.rectangle(
        definition.bounds.centerX -
          (horizontal ? definition.bounds.width * 0.26 : 0),
        definition.bounds.centerY -
          (horizontal ? 0 : definition.bounds.height * 0.26),
        horizontal
          ? definition.bounds.width * 0.48
          : definition.bounds.width,
        horizontal
          ? definition.bounds.height
          : definition.bounds.height * 0.48,
        0x252b31,
        0.94
      ),
      this.scene.add.rectangle(
        definition.bounds.centerX +
          (horizontal ? definition.bounds.width * 0.26 : 0),
        definition.bounds.centerY +
          (horizontal ? 0 : definition.bounds.height * 0.26),
        horizontal
          ? definition.bounds.width * 0.48
          : definition.bounds.width,
        horizontal
          ? definition.bounds.height
          : definition.bounds.height * 0.48,
        0x252b31,
        0.94
      ),
    ]

    for (const panel of panels) {
      panel
        .setStrokeStyle(3, 0x9b2028, 0.9)
        .setDepth(WASTES_VISUALS.gateBarrierDepth)
    }
    const lights = [
      this.scene.add.circle(
        definition.bounds.left + 12,
        definition.bounds.top + 12,
        5,
        0xff2222
      ),
      this.scene.add.circle(
        definition.bounds.right - 12,
        definition.bounds.bottom - 12,
        5,
        0xff2222
      ),
    ]

    for (const light of lights) {
      light.setDepth(-4)
    }

    this.gates.set(
      definition.id,
      {
        definition,
        state:
          'locked',
        barrier,
        panels,
        lights,
        messageShown:
          false,
      }
    )
  }

  private createLandmarks() {
    this.createLandmark(
      920,
      390,
      'CRASHED HAULER',
      0xcc6633
    )
    this.createLandmark(
      2805,
      250,
      'BREACHED REACTOR',
      0x33bbcc
    )
    this.createLandmark(
      2310,
      1840,
      'EXCAVATION DRILL',
      0xdd8833
    )
    this.createLandmark(
      3000,
      2640,
      'WYRM BREACH // CAUTION',
      0xff3344
    )
    this.createLandmark(
      WASTES_BOSS_ARENA.centerX,
      WASTES_BOSS_ARENA.centerY,
      'CONTAINMENT CRATER',
      0x8f2932
    )

    for (
      let index = 0;
      index < 5;
      index++
    ) {
      this.scene.add.rectangle(
        2740 +
          index * 105,
        2690 +
          (index % 2) * 18,
        88,
        11,
        0x541b1b,
        0.8
      )
        .setRotation(
          -0.18
        )
        .setDepth(-12)
    }
  }

  private createLandmark(
    x: number,
    y: number,
    label: string,
    color: number
  ) {
    const depth = WASTES_VISUALS.landmarkDepth

    if (label === 'CRASHED HAULER') {
      this.scene.add.polygon(
        x,
        y,
        [
          -170, -58,
          110, -72,
          178, -20,
          135, 55,
          -145, 70,
          -190, 18,
        ],
        0x30383f,
        0.96
      )
        .setStrokeStyle(6, 0x7a4c32, 0.8)
        .setRotation(-0.13)
        .setDepth(depth)
      this.scene.add.rectangle(x - 25, y, 210, 18, color, 0.32)
        .setRotation(-0.13)
        .setDepth(depth + 1)
    } else if (label === 'BREACHED REACTOR') {
      this.scene.add.circle(x, y, 105, 0x172126, 0.96)
        .setStrokeStyle(18, 0x43525b, 0.9)
        .setDepth(depth)
      this.scene.add.circle(x, y, 53, color, 0.16)
        .setStrokeStyle(7, color, 0.75)
        .setDepth(depth + 1)
      for (let index = 0; index < 4; index++) {
        this.scene.add.rectangle(
          x + Math.cos(index * Math.PI / 2) * 82,
          y + Math.sin(index * Math.PI / 2) * 82,
          70,
          18,
          0x56636b,
          0.85
        )
          .setRotation(index * Math.PI / 2)
          .setDepth(depth + 1)
      }
    } else if (label === 'EXCAVATION DRILL') {
      this.scene.add.triangle(
        x,
        y,
        -150, -70,
        -150, 70,
        180, 0,
        0x3a3f43,
        1
      )
        .setStrokeStyle(7, color, 0.7)
        .setDepth(depth)
      for (let offset = -85; offset <= 45; offset += 65) {
        this.scene.add.circle(x + offset, y, 28, 0x16191b, 1)
          .setStrokeStyle(5, 0x6e5b3d, 0.8)
          .setDepth(depth + 1)
      }
    } else if (label === 'WYRM BREACH // CAUTION') {
      for (const direction of [-1, 1]) {
        this.scene.add.rectangle(
          x + direction * 150,
          y,
          85,
          210,
          0x303237,
          0.95
        )
          .setRotation(direction * 0.12)
          .setStrokeStyle(6, color, 0.65)
          .setDepth(depth)
      }
    } else {
      this.scene.add.ellipse(
        x,
        y,
        760,
        440,
        0x090b0d,
        0.38
      )
        .setStrokeStyle(18, color, 0.42)
        .setDepth(depth)
      this.scene.add.ellipse(
        x,
        y,
        520,
        270,
        0x030405,
        0.36
      )
        .setStrokeStyle(6, 0x5a3034, 0.5)
        .setDepth(depth + 1)
    }

    this.scene.add.text(
      x,
      y - (label === 'CONTAINMENT CRATER' ? 250 : 125),
      label,
      {
        fontFamily:
          'Arial Black, Arial',
        fontSize:
          '12px',
        color:
          '#9da7ad',
      }
    )
      .setOrigin(0.5)
      .setDepth(depth + 2)
  }

  private activateEligibleZone() {
    for (
      const zone of
        this.zones
    ) {
      if (
        zone.state !==
        'inactive'
      ) {
        continue
      }

      const previousCleared =
        zone.definition
          .sequence === 0 ||
        this.zones[
          zone.definition
            .sequence - 1
        ].state ===
          'cleared'

      if (
        !previousCleared ||
        !zone.definition
          .activationBounds
          .contains(
            this.player.x,
            this.player.y
          )
      ) {
        continue
      }

      zone.state =
        'active'

      const spawned =
        this.onZoneActivated(
          zone.definition
        )

      for (
        const enemy of
          spawned
      ) {
        zone.livingEnemies.add(
          enemy
        )
        this.enemyOwners.set(
          enemy,
          zone
        )
        enemy.setData(
          'combatZoneId',
          zone.definition.id
        )
      }

      zone.spawnComplete =
        true
      this.tryClearZone(zone)
      break
    }
  }

  private tryClearZone(
    zone:
      ZoneRuntime
  ) {
    if (
      zone.state !== 'active' ||
      !zone.spawnComplete ||
      zone.livingEnemies.size > 0
    ) {
      return
    }

    zone.state =
      'cleared'
    this.clearedCount++
    this.onZoneCleared(
      zone.definition,
      this.clearedCount,
      this.zones.length
    )
    this.unlockGate(
      zone.definition.gateId
    )
  }

  private unlockGate(
    gateId: string
  ) {
    const gate =
      this.gates.get(
        gateId
      )

    if (
      !gate ||
      gate.state !== 'locked'
    ) {
      return
    }

    gate.state =
      'unlocking'
    gate.messageShown =
      true

    for (
      const light of
        gate.lights
    ) {
      light.setFillStyle(
        0x44ddff
      )
    }

    this.scene.tweens.add({
      targets:
        gate.barrier,
      alpha:
        0.15,
      scaleX:
        gate.definition
          .orientation ===
          'horizontal'
          ? 0.05
          : 1,
      scaleY:
        gate.definition
          .orientation ===
          'vertical'
          ? 0.05
          : 1,
      duration:
        550,
      ease:
        'Power2',
      onComplete:
        () => {
          gate.state =
            'open'
          gate.barrier.setVisible(
            false
          )
          this.onMessage(
            'AREA SECURED\nACCESS GRANTED'
          )
          this.scene.events.emit(
            'combat-audio:gate-open',
            gateId
          )
        },
    })

    gate.panels.forEach((panel, index) => {
      const direction = index === 0 ? -1 : 1
      this.scene.tweens.add({
        targets: panel,
        x: gate.definition.orientation === 'horizontal'
          ? panel.x + direction * gate.definition.bounds.width * 0.44
          : panel.x,
        y: gate.definition.orientation === 'vertical'
          ? panel.y + direction * gate.definition.bounds.height * 0.44
          : panel.y,
        alpha: 0.45,
        duration: 550,
        ease: 'Power2',
      })
    })
  }

  private updateApproach() {
    const zoneThree =
      this.zones[2]

    if (
      zoneThree.state ===
        'cleared' &&
      !this.approachEntered &&
      WASTES_APPROACH.contains(
        this.player.x,
        this.player.y
      )
    ) {
      this.approachEntered =
        true
      this.onMessage(
        'WYRM BREACH DETECTED\nPROCEED WITH CAUTION'
      )
      this.scene.cameras.main.shake(
        180,
        0.003
      )
      this.scene.time.delayedCall(
        900,
        () => {
          if (this.player.active) {
            this.unlockGate(
              'wyrm-seal'
            )
          }
        }
      )
    }

    const finalGate =
      this.gates.get(
        'wyrm-seal'
      )

    if (
      !this.bossTriggered &&
      finalGate?.state ===
        'open' &&
      WASTES_BOSS_TRIGGER
        .contains(
          this.player.x,
          this.player.y
        )
    ) {
      this.bossTriggered =
        true
      this.onWyrmArenaEntered()
    }
  }

  private resolvePlayerCollision() {
    const playerBounds =
      this.player.getBounds()
    const blocking = [
      ...this.solids.map(
        solid =>
          solid.bounds
      ),
      ...[...this.gates.values()]
        .filter(
          gate =>
            gate.state !== 'open'
        )
        .map(
          gate =>
            gate.definition
              .bounds
        ),
    ]

    if (
      blocking.some(
        bounds =>
          Phaser.Geom.Intersects
            .RectangleToRectangle(
              playerBounds,
              bounds
            )
      )
    ) {
      this.player.setPosition(
        this.previousPlayerPosition.x,
        this.previousPlayerPosition.y
      )
    }
  }

  private constrainOwnedEnemies() {
    for (
      const enemy of
        this.getEnemies()
    ) {
      const owner =
        this.enemyOwners.get(
          enemy
        )

      if (
        !owner ||
        !enemy.active
      ) {
        continue
      }

      const type =
        this.getEnemyType(
          enemy
        )
      const inset =
        type === 'tank'
          ? 140
          : type === 'fast'
            ? 35
            : 28
      const bounds =
        owner.definition.bounds

      enemy.x =
        Phaser.Math.Clamp(
          enemy.x,
          bounds.left + inset,
          bounds.right - inset
        )
      enemy.y =
        Phaser.Math.Clamp(
          enemy.y,
          bounds.top + inset,
          bounds.bottom - inset
        )

      for (
        const obstacle of
          WASTES_OBSTACLES
      ) {
        this.pushOutside(
          enemy,
          obstacle.bounds,
          10
        )
      }


      this.syncEnemyVisual(
        enemy
      )
    }
  }

  private constrainWyrm() {
    if (!this.bossTriggered) {
      return
    }

    const wyrm =
      this.getEnemies().find(
        enemy =>
          enemy.active &&
          this.getEnemyType(enemy) === 'wyrm'
      )

    if (!wyrm) {
      return
    }

    wyrm.x = Phaser.Math.Clamp(
      wyrm.x,
      WASTES_BOSS_ARENA.left + 90,
      WASTES_BOSS_ARENA.right - 90
    )
    wyrm.y = Phaser.Math.Clamp(
      wyrm.y,
      WASTES_BOSS_ARENA.top + 75,
      WASTES_BOSS_ARENA.bottom - 75
    )
    this.syncEnemyVisual(wyrm)
  }

  private pushOutside(
    object:
      Phaser.GameObjects.Rectangle,
    bounds:
      Phaser.Geom.Rectangle,
    padding: number
  ) {
    if (
      !Phaser.Geom.Intersects
        .RectangleToRectangle(
          object.getBounds(),
          bounds
        )
    ) {
      return
    }

    const distances = [
      {
        axis: 'x',
        value:
          bounds.left -
          object.width / 2 -
          padding,
        distance:
          Math.abs(
            object.x -
            bounds.left
          ),
      },
      {
        axis: 'x',
        value:
          bounds.right +
          object.width / 2 +
          padding,
        distance:
          Math.abs(
            bounds.right -
            object.x
          ),
      },
      {
        axis: 'y',
        value:
          bounds.top -
          object.height / 2 -
          padding,
        distance:
          Math.abs(
            object.y -
            bounds.top
          ),
      },
      {
        axis: 'y',
        value:
          bounds.bottom +
          object.height / 2 +
          padding,
        distance:
          Math.abs(
            bounds.bottom -
            object.y
          ),
      },
    ].sort(
      (a, b) =>
        a.distance -
        b.distance
    )
    const nearest =
      distances[0]

    if (nearest.axis === 'x') {
      object.x = nearest.value
    } else {
      object.y = nearest.value
    }
  }

  private updateGatePrompts() {
    for (
      const gate of
        this.gates.values()
    ) {
      if (
        gate.state !== 'locked'
      ) {
        continue
      }

      const distance =
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          gate.definition.bounds
            .centerX,
          gate.definition.bounds
            .centerY
        )

      if (
        distance < 150 &&
        !gate.messageShown
      ) {
        gate.messageShown =
          true
        this.onMessage(
          'AREA LOCKED\nHOSTILES REMAIN'
        )
      } else if (
        distance > 230
      ) {
        gate.messageShown =
          false
      }
    }
  }

  private createDebugObjects() {
    this.destroyDebugObjects()

    for (
      const zone of
        this.zones
    ) {
      const outline =
        this.scene.add.rectangle(
          zone.definition.bounds
            .centerX,
          zone.definition.bounds
            .centerY,
          zone.definition.bounds
            .width,
          zone.definition.bounds
            .height,
          0x00ffff,
          0.025
        )
          .setStrokeStyle(
            2,
            0x00ffff,
            0.8
          )
          .setDepth(100)
      const text =
        this.scene.add.text(
          zone.definition.bounds.left + 10,
          zone.definition.bounds.top + 10,
          '',
          {
            fontFamily:
              'Courier New',
            fontSize:
              '13px',
            color:
              '#00ffff',
            backgroundColor:
              '#001014',
          }
        )
          .setDepth(101)
      text.setData(
        'zoneRuntime',
        zone
      )
      this.debugObjects.push(
        outline,
        text
      )
    }
  }

  private refreshDebugText() {
    if (!this.debugVisible) {
      return
    }

    for (
      const object of
        this.debugObjects
    ) {
      if (
        !(object instanceof
          Phaser.GameObjects.Text)
      ) {
        continue
      }

      const zone =
        object.getData(
          'zoneRuntime'
        ) as ZoneRuntime
      object.setText(
        `${zone.definition.id}\n${zone.state} // alive ${zone.livingEnemies.size} // spawned ${zone.spawnComplete}`
      )
    }
  }

  private destroyDebugObjects() {
    for (
      const object of
        this.debugObjects
    ) {
      if (object.active) {
        object.destroy()
      }
    }
    this.debugObjects = []
  }
}
