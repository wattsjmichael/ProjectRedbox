import type {
  WeaponItem,
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
  recentFinds: WeaponItem[]
}
