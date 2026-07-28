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

export type WeaponAttackStyle =
  | 'precisionProjectile'
  | 'spreadProjectile'
  | 'heavyProjectile'
  | 'photonProjectile'
  | 'meleeRhythm'

export type WeaponFinisherBehavior =
  | 'piercingRound'
  | 'devastatingBlast'
  | 'explosiveShell'
  | 'photonChain'
  | 'timedMelee'

export interface WeaponCombatDefinition
  extends WeaponComboTiming {
  attackStyle:
    WeaponAttackStyle
  finisher:
    WeaponFinisherBehavior
  finisherLabel:
    string
  behavior: {
    projectileSpeed?: number
    maxHits?: number
    finisherMaxHits?: number
    maxRange?: number
    comboCounts?:
      readonly [
        number,
        number,
        number,
      ]
    comboSpreads?:
      readonly [
        number,
        number,
        number,
      ]
    finisherKnockback?: number
    chainCount?: number
    chainRange?: number
    explosionRadius?: number
    meleeSteps?:
      readonly {
        damage: number
        perfectDamage: number
        range: number
        arc: number
        lock: number
      }[]
  }
}

export const WEAPON_COMBO_TIMINGS:
  Record<
    WeaponType,
    WeaponCombatDefinition
  > = {
    rifle: {
      attackStyle:
        'precisionProjectile',
      finisher:
        'piercingRound',
      finisherLabel:
        'PIERCING ROUND',
      behavior: {
        projectileSpeed: 500,
        maxHits: 1,
        finisherMaxHits:
          Number.POSITIVE_INFINITY,
        maxRange: 1200,
      },
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
      attackStyle:
        'spreadProjectile',
      finisher:
        'devastatingBlast',
      finisherLabel:
        'DEVASTATING BLAST',
      behavior: {
        projectileSpeed: 450,
        comboCounts: [
          5,
          6,
          10,
        ],
        comboSpreads: [
          0.35,
          0.44,
          0.72,
        ],
        finisherKnockback: 48,
      },
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
      attackStyle:
        'heavyProjectile',
      finisher:
        'explosiveShell',
      finisherLabel:
        'EXPLOSIVE SHELL',
      behavior: {
        projectileSpeed: 250,
        explosionRadius: 105,
      },
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
      attackStyle:
        'photonProjectile',
      finisher:
        'photonChain',
      finisherLabel:
        'PHOTON CHAIN',
      behavior: {
        projectileSpeed: 720,
        maxHits: 2,
        finisherMaxHits: 1,
        chainCount: 3,
        chainRange: 230,
      },
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
      attackStyle:
        'meleeRhythm',
      finisher:
        'timedMelee',
      finisherLabel:
        'RHYTHM FINISHER',
      behavior: {
        meleeSteps: [
          {
            damage: 1,
            perfectDamage: 1,
            range: 95,
            arc: 65,
            lock: 180,
          },
          {
            damage: 2,
            perfectDamage: 3,
            range: 115,
            arc: 85,
            lock: 240,
          },
          {
            damage: 4,
            perfectDamage: 6,
            range: 145,
            arc: 120,
            lock: 400,
          },
        ],
      },
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
