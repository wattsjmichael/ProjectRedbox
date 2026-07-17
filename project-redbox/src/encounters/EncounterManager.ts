import Phaser from 'phaser'

import type {
  EncounterZone,
} from './EncounterTypes'

interface EncounterManagerConfig {
  scene: Phaser.Scene

  player:
    Phaser.GameObjects.Rectangle

  onEncounterTriggered:
    (
      zone:
        EncounterZone
    ) =>
      Phaser.GameObjects.Rectangle[]

  onEncounterCleared?:
    (
      zone:
        EncounterZone,

      clearedCount:
        number,

      totalCount:
        number
    ) => void
}

export class EncounterManager {
  private scene:
    Phaser.Scene

  private player:
    Phaser.GameObjects.Rectangle

  private zones:
    EncounterZone[] = []

  private encounterEnemies =
    new Map<
      EncounterZone,
      Phaser.GameObjects.Rectangle[]
    >()

  private clearedZones =
    new Set<
      EncounterZone
    >()

  private onEncounterTriggered:
    EncounterManagerConfig['onEncounterTriggered']

  private onEncounterCleared?:
    EncounterManagerConfig['onEncounterCleared']

  constructor(
    config:
      EncounterManagerConfig
  ) {
    this.scene =
      config.scene

    this.player =
      config.player

    this.onEncounterTriggered =
      config.onEncounterTriggered

    this.onEncounterCleared =
      config.onEncounterCleared

    this.createZones()
  }

  private createZones() {
    this.zones = [
      {
        x: 600,
        y: 400,
        radius: 220,
        enemyCount: 8,
        triggered: false,
      },

      {
        x: 1200,
        y: 400,
        radius: 220,
        enemyCount: 10,
        triggered: false,
      },

      {
        x: 1850,
        y: 650,
        radius: 250,
        enemyCount: 12,
        triggered: false,
      },

      {
        x: 1400,
        y: 1300,
        radius: 250,
        enemyCount: 14,
        triggered: false,
      },

      {
        x: 700,
        y: 1400,
        radius: 280,
        enemyCount: 16,
        triggered: false,
      },
    ]

    this.createZoneMarkers()
  }

  private createZoneMarkers() {
    for (
      const zone of
        this.zones
    ) {
      this.scene.add
        .circle(
          zone.x,
          zone.y,
          zone.radius,
          0x334455,
          0.08
        )
        .setStrokeStyle(
          2,
          0x445566,
          0.35
        )
    }
  }

  update() {
    if (
      !this.player.active
    ) {
      return
    }

    this.checkZoneTriggers()

    this.checkClearedEncounters()
  }

  private checkZoneTriggers() {
    for (
      const zone of
        this.zones
    ) {
      if (
        zone.triggered
      ) {
        continue
      }

      const distance =
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          zone.x,
          zone.y
        )

      if (
        distance >
        zone.radius
      ) {
        continue
      }

      zone.triggered =
        true

      const spawnedEnemies =
        this.onEncounterTriggered(
          zone
        )

      this.encounterEnemies.set(
        zone,
        spawnedEnemies
      )
    }
  }

  private checkClearedEncounters() {
    for (
      const zone of
        this.zones
    ) {
      if (
        !zone.triggered ||
        this.clearedZones.has(
          zone
        )
      ) {
        continue
      }

      const enemies =
        this.encounterEnemies.get(
          zone
        )

      if (
        !enemies
      ) {
        continue
      }

      const enemiesRemaining =
        enemies.some(
          (
            enemy
          ) =>
            enemy.active
        )

      if (
        enemiesRemaining
      ) {
        continue
      }

      this.clearedZones.add(
        zone
      )

      this.onEncounterCleared?.(
        zone,
        this.clearedZones.size,
        this.zones.length
      )
    }
  }

  getClearedCount() {
    return this.clearedZones.size
  }

  getTotalCount() {
    return this.zones.length
  }

  allEncountersCleared() {
    return (
      this.clearedZones.size ===
      this.zones.length
    )
  }

  reset() {
    for (
      const zone of
        this.zones
    ) {
      zone.triggered =
        false
    }

    this.encounterEnemies.clear()

    this.clearedZones.clear()
  }
}