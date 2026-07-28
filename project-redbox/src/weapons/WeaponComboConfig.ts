import type {
  WeaponType,
} from './WeaponTypes'

export interface WeaponComboTiming {
  attackDuration: number
  earliestNextInput: number
  latestComboInput: number
  inputBufferMs: number
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
      inputBufferMs: 100,
      finisherRecovery: 350,
      damageMultipliers: [
        1,
        1.05,
        1.2,
      ],
    },
    scattergun: {
      attackDuration: 500,
      earliestNextInput: 280,
      latestComboInput: 880,
      inputBufferMs: 130,
      finisherRecovery: 500,
      damageMultipliers: [
        1,
        1.08,
        1.3,
      ],
    },
    cannon: {
      attackDuration: 760,
      earliestNextInput: 440,
      latestComboInput: 1160,
      inputBufferMs: 160,
      finisherRecovery: 650,
      damageMultipliers: [
        1,
        1.08,
        1.35,
      ],
    },
    photonLance: {
      attackDuration: 480,
      earliestNextInput: 240,
      latestComboInput: 800,
      inputBufferMs: 110,
      finisherRecovery: 460,
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
      inputBufferMs: 140,
      finisherRecovery: 450,
      damageMultipliers: [
        1,
        2,
        4,
      ],
    },
  }
