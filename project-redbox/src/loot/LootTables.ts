import type { WeaponType } from '../weapons/WeaponTypes'

interface WeightedWeapon {
  type: WeaponType
  weight: number
}

export const LOOT_DROP_RATES = {
  redBox: 0.05,
  weapon: 0.2,
} as const

export const WEAPON_LOOT_TABLE:
  readonly WeightedWeapon[] = [
    { type: 'rifle', weight: 22 },
    { type: 'scattergun', weight: 20 },
    { type: 'cannon', weight: 18 },
    { type: 'photonLance', weight: 20 },
    { type: 'greatsword', weight: 20 },
  ]

export const rollWeaponType = (
  random = Math.random()
) => {
  const totalWeight = WEAPON_LOOT_TABLE.reduce(
    (total, entry) => total + entry.weight,
    0
  )
  let roll = random * totalWeight

  for (const entry of WEAPON_LOOT_TABLE) {
    roll -= entry.weight
    if (roll < 0) return entry.type
  }

  return WEAPON_LOOT_TABLE[WEAPON_LOOT_TABLE.length - 1].type
}
