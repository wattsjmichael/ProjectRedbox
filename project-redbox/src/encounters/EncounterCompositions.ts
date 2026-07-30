import {
  EnemyType,
  ENEMY_BEHAVIORS,
} from '../enemies/EnemyTypes'

import type {
  EncounterComposition,
} from './EncounterTypes'

export const ENCOUNTER_COMPOSITIONS:
  EncounterComposition[] = [
    {
      name: 'Pressure Pack',
      minimumZone: 0,
      weight: 5,
      spawns: [
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
      ],
    },
    {
      name: 'Flank Pack',
      minimumZone: 1,
      weight: 4,
      spawns: [
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
        { type: EnemyType.Fast, angleOffset: -1.05 },
        { type: EnemyType.Fast, angleOffset: 1.05 },
      ],
    },
    {
      name: 'Anchor Pack',
      minimumZone: 2,
      weight: 4,
      spawns: [
        { type: EnemyType.Tank },
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
      ],
    },
    {
      name: 'Disruption Pack',
      minimumZone: 2,
      weight: 2,
      spawns: [
        { type: EnemyType.Fast, angleOffset: -0.8 },
        { type: EnemyType.Fast, angleOffset: 0.8 },
        { type: EnemyType.Basic },
      ],
    },
    {
      name: 'Mixed Assault',
      minimumZone: 3,
      weight: 3,
      spawns: [
        { type: EnemyType.Tank },
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
        { type: EnemyType.Fast, angleOffset: 1.1 },
      ],
    },
    {
      name: 'Elite Escort',
      minimumZone: 3,
      weight: 2,
      spawns: [
        { type: EnemyType.Elite },
        { type: EnemyType.Basic },
        { type: EnemyType.Basic },
      ],
    },
  ]

export function getCompositionCost(
  composition:
    EncounterComposition
) {
  return composition.spawns.reduce(
    (total, spawn) =>
      total +
      ENEMY_BEHAVIORS[
        spawn.type
      ].spawnCost,
    0
  )
}
