export interface MagStats {
  power:
    number

  defense:
    number

  dexterity:
    number

  energy:
    number
}

export interface MagData {
  id:
    string

  name:
    string

  level:
    number

  experience:
    number

  stats:
    MagStats
}

export function createStarterMag():
  MagData {
  return {
    id:
      'starter-mag',

    name:
      'RB-01',

    level:
      1,

    experience:
      0,

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