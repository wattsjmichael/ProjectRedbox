export type HunterUnlock =
  'dropTier2'

export type DropTier = 1 | 2

export interface HunterStatGrowth {
  maxHealth?: number
  baseAttack?: number
  baseDefense?: number
}

export interface HunterLevelReward {
  level: number
  displayName: string
  description: string
  statGrowth?: HunterStatGrowth
  unlocks?: readonly HunterUnlock[]
}

export interface HunterRewardSummary {
  maxHealth: number
  baseAttack: number
  baseDefense: number
  unlocks: HunterUnlock[]
  rewards: HunterLevelReward[]
}

export interface DropTierDefinition {
  tier: DropTier
  displayName: string
  requiredLevel: number
  enemyHealthMultiplier: number
  enemyDamageMultiplier: number
  wyrmHealthMultiplier: number
  wyrmDamageMultiplier: number
  rareDropChanceMultiplier: number
}

// Hunter levels provide a dependable baseline. Weapon rolls, affixes,
// armor, and the Core remain the larger sources of combat power.
export const HUNTER_LEVEL_REWARDS:
  readonly HunterLevelReward[] = [
    {
      level: 2,
      displayName: 'Hardened I',
      description: 'Maximum health increased.',
      statGrowth: { maxHealth: 2 },
    },
    {
      level: 3,
      displayName: 'Weapons Drill I',
      description: 'Base attack increased.',
      statGrowth: { baseAttack: 1 },
    },
    {
      level: 4,
      displayName: 'Field Guard I',
      description: 'Base defense increased.',
      statGrowth: { baseDefense: 1 },
    },
    {
      level: 5,
      displayName: 'Field Endurance',
      description: 'Maximum health increased.',
      statGrowth: { maxHealth: 2 },
    },
    {
      level: 6,
      displayName: 'Hardened II',
      description: 'Maximum health increased.',
      statGrowth: { maxHealth: 2 },
    },
    {
      level: 7,
      displayName: 'Weapons Drill II',
      description: 'Base attack increased.',
      statGrowth: { baseAttack: 1 },
    },
    {
      level: 8,
      displayName: 'Deep Drop Clearance',
      description: 'Drop Tier 2 is now available.',
      unlocks: ['dropTier2'],
    },
    {
      level: 9,
      displayName: 'Field Guard II',
      description: 'Base defense increased.',
      statGrowth: { baseDefense: 1 },
    },
    {
      level: 10,
      displayName: 'Hardened III',
      description: 'Maximum health increased.',
      statGrowth: { maxHealth: 3 },
    },
  ]

export const DROP_TIER_DEFINITIONS:
  Readonly<Record<DropTier, DropTierDefinition>> = {
    1: {
      tier: 1,
      displayName: 'Drop Tier 1',
      requiredLevel: 1,
      enemyHealthMultiplier: 1,
      enemyDamageMultiplier: 1,
      wyrmHealthMultiplier: 1,
      wyrmDamageMultiplier: 1,
      rareDropChanceMultiplier: 1,
    },
    2: {
      tier: 2,
      displayName: 'Drop Tier 2',
      requiredLevel: 8,
      enemyHealthMultiplier: 1.15,
      enemyDamageMultiplier: 1.1,
      wyrmHealthMultiplier: 1.2,
      wyrmDamageMultiplier: 1.1,
      rareDropChanceMultiplier: 1.05,
    },
  }

export function getHunterLevelReward(level: number) {
  return HUNTER_LEVEL_REWARDS.find(reward => reward.level === level) ?? null
}

export function getNextHunterLevelReward(level: number) {
  return HUNTER_LEVEL_REWARDS.find(reward => reward.level > level) ?? null
}

export function getHunterRewardSummary(
  fromLevelExclusive: number,
  toLevelInclusive: number
): HunterRewardSummary {
  const rewards = HUNTER_LEVEL_REWARDS.filter(
    reward => reward.level > fromLevelExclusive && reward.level <= toLevelInclusive
  )

  return rewards.reduce<HunterRewardSummary>((summary, reward) => {
    summary.maxHealth += reward.statGrowth?.maxHealth ?? 0
    summary.baseAttack += reward.statGrowth?.baseAttack ?? 0
    summary.baseDefense += reward.statGrowth?.baseDefense ?? 0
    for (const unlock of reward.unlocks ?? []) {
      if (!summary.unlocks.includes(unlock)) summary.unlocks.push(unlock)
    }
    summary.rewards.push(reward)
    return summary
  }, {
    maxHealth: 0,
    baseAttack: 0,
    baseDefense: 0,
    unlocks: [],
    rewards: [],
  })
}

export function getHunterGrowthAtLevel(level: number) {
  return getHunterRewardSummary(1, level)
}

export function canEquipArmor(level: number) {
  return level >= 1
}

export function getHighestUnlockedDropTier(level: number): DropTier {
  return level >= DROP_TIER_DEFINITIONS[2].requiredLevel ? 2 : 1
}

export function normalizeSelectedDropTier(
  level: number,
  selectedTier: number | undefined
): DropTier {
  return selectedTier === 2 && getHighestUnlockedDropTier(level) >= 2 ? 2 : 1
}

export function getDropTierDefinition(tier: DropTier) {
  return DROP_TIER_DEFINITIONS[tier]
}

export function getHunterRewardDisplayLines(summary: HunterRewardSummary) {
  const lines: string[] = []
  if (summary.maxHealth) lines.push(`MAX HEALTH +${summary.maxHealth}`)
  if (summary.baseAttack) lines.push(`BASE ATTACK +${summary.baseAttack}`)
  if (summary.baseDefense) lines.push(`BASE DEFENSE +${summary.baseDefense}`)
  if (summary.unlocks.includes('dropTier2')) lines.push('DROP TIER 2 UNLOCKED')
  return lines
}

export function getHunterRewardPreview(reward: HunterLevelReward | null) {
  if (!reward) return 'MORE REWARDS COMING SOON'
  const summary = getHunterRewardSummary(reward.level - 1, reward.level)
  return getHunterRewardDisplayLines(summary).join(' // ') || reward.description.toUpperCase()
}
