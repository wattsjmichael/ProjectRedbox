export const CoreStage = {
  Dormant: 'dormant',
  Awakened: 'awakened',
} as const

export type CoreStage =
  typeof CoreStage[
    keyof typeof CoreStage
  ]

export interface CoreStats {
  power:
    number

  defense:
    number

  dexterity:
    number

  energy:
    number
}

export interface CoreData {
  id:
    string

  name:
    string

  level:
    number

  experience:
    number

  stats:
    CoreStats

  stage:
    CoreStage
}

export function createStarterCore():
  CoreData {
  return {
    id:
      'starter-core',

    name:
      'RB-01',

    level:
      1,

    experience:
      0,

    stage:
      CoreStage.Dormant,

    stats: {
      power:
        0,

      defense:
        0,

      dexterity:
        0,

      energy:
        0,
    },
  }
}
