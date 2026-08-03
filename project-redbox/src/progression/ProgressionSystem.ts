import {
  getHunterRewardSummary,
} from './HunterProgressionConfig'

import type {
  HunterRewardSummary,
} from './HunterProgressionConfig'

export interface HunterProgressState {
  level: number
  currentXP: number
  xpToNextLevel: number
}

export interface HunterProgressionResult {
  xpGained: number
  previousLevel: number
  newLevel: number
  levelsGained: number
  rewards: HunterRewardSummary
}

export class ProgressionSystem {
  private stats: HunterProgressState

  constructor(stats: HunterProgressState) {
    this.stats = stats
  }

  getStats() {
    return this.stats
  }

  addXP(amount: number): HunterProgressionResult {
    const xpGained = Math.max(0, Math.floor(amount))
    const previousLevel = this.stats.level

    this.stats.currentXP += xpGained

    while (this.stats.currentXP >= this.stats.xpToNextLevel) {
      this.stats.currentXP -= this.stats.xpToNextLevel
      this.stats.level++
      this.stats.xpToNextLevel = Math.max(
        1,
        Math.floor(this.stats.xpToNextLevel * 1.4)
      )
    }

    return {
      xpGained,
      previousLevel,
      newLevel: this.stats.level,
      levelsGained: this.stats.level - previousLevel,
      rewards: getHunterRewardSummary(previousLevel, this.stats.level),
    }
  }
}
