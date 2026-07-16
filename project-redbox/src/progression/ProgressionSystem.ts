import Phaser from 'phaser'
import type { PlayerStats } from '../player/PlayerStats'

export interface LevelGains {
  hpGain: number
  powerGain: number
  defenseGain: number
}

export class ProgressionSystem {
  private stats: PlayerStats

  constructor(stats: PlayerStats) {
    this.stats = stats
  }

  getStats() {
    return this.stats
  }

  addXP(amount: number): LevelGains | null {
    this.stats.currentXP += amount

    if (
      this.stats.currentXP <
      this.stats.xpToNextLevel
    ) {
      return null
    }

    return this.levelUp()
  }

  private levelUp(): LevelGains {
    this.stats.currentXP -=
      this.stats.xpToNextLevel

    this.stats.level++

    this.stats.xpToNextLevel =
      Math.floor(
        this.stats.xpToNextLevel *
          1.4
      )

    const hpGain =
      Phaser.Math.Between(4, 6)

    const powerGain =
      Phaser.Math.Between(1, 3)

    const defenseGain =
      Phaser.Math.Between(1, 2)

    this.stats.maxHealth += hpGain
    this.stats.health += hpGain

    this.stats.power += powerGain
    this.stats.defense += defenseGain

    return {
      hpGain,
      powerGain,
      defenseGain,
    }
  }
}