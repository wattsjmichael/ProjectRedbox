import type {
  InventoryItem,
} from '../items/ItemTypes'

export type RunOutcome =
  | 'completed'
  | 'defeated'

export interface RunSummary {
  outcome: RunOutcome
  kills: number
  bossesDefeated: number
  rareDrops: number
  timeMs: number
  recentFinds: InventoryItem[]
  hunterProgress: {
    xpGained: number
    previousLevel: number
    newLevel: number
    previousXP: number
    currentXP: number
    xpToNextLevel: number
    rewardLevels: number[]
  }
}
