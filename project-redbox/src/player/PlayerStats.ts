export interface PlayerStats {
  level: number
  currentXP: number
  xpToNextLevel: number

  health: number
  maxHealth: number

  power: number
  defense: number
  speed: number
}

export const createDefaultPlayerStats = (): PlayerStats => ({
  level: 1,
  currentXP: 0,
  xpToNextLevel: 10,

  health: 100,
  maxHealth: 100,

  power: 10,
  defense: 5,
  speed: 250,
})