import type {
  WeaponType,
} from './WeaponTypes'

export interface WeaponComboTiming {
  attackDuration: number
  earliestNextInput: number
  latestComboInput: number
  finisherRecovery: number
  damageMultipliers:
    readonly [
      number,
      number,
      number,
    ]
}

export const WEAPON_COMBO_TIMINGS:
  Record<
    WeaponType,
    WeaponComboTiming
  > = {
    rifle: {
      attackDuration: 260,
      earliestNextInput: 140,
      latestComboInput: 650,
      finisherRecovery: 350,
      damageMultipliers: [
        1,
        1.05,
        1.2,
      ],
    },
    scattergun: {
      attackDuration: 520,
      earliestNextInput: 260,
      latestComboInput: 900,
      finisherRecovery: 500,
      damageMultipliers: [
        1,
        1.08,
        1.3,
      ],
    },
    cannon: {
      attackDuration: 800,
      earliestNextInput: 420,
      latestComboInput: 1200,
      finisherRecovery: 700,
      damageMultipliers: [
        1,
        1.08,
        1.35,
      ],
    },
    photonLance: {
      attackDuration: 620,
      earliestNextInput: 300,
      latestComboInput: 950,
      finisherRecovery: 550,
      damageMultipliers: [
        1,
        1.1,
        1.3,
      ],
    },
    greatsword: {
      attackDuration: 700,
      earliestNextInput: 180,
      latestComboInput: 700,
      finisherRecovery: 450,
      damageMultipliers: [
        1,
        2,
        4,
      ],
    },
  }
