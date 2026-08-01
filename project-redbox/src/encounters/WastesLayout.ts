import Phaser from 'phaser'

import type {
  EncounterZone,
  WastesGateDefinition,
  WastesObstacleDefinition,
} from './EncounterTypes'

const rectangle = (
  x: number,
  y: number,
  width: number,
  height: number
) => new Phaser.Geom.Rectangle(
  x,
  y,
  width,
  height
)

export const WASTES_WORLD_WIDTH =
  4800

export const WASTES_WORLD_HEIGHT =
  4200

export const WASTES_ENTRY =
  rectangle(
    60,
    300,
    320,
    720
  )

export const WASTES_ZONES:
  EncounterZone[] = [
    {
      id: 'salvage-yard',
      name: 'SALVAGE YARD',
      sequence: 0,
      bounds:
        rectangle(
          400,
          100,
          1240,
          1240
        ),
      activationBounds:
        rectangle(
          420,
          220,
          280,
          980
        ),
      spawnRegion:
        rectangle(
          720,
          180,
          820,
          1080
        ),
      budget: 6,
      gateId: 'salvage-access',
    },
    {
      id: 'reactor-trench',
      name: 'REACTOR TRENCH',
      sequence: 1,
      bounds:
        rectangle(
          1800,
          100,
          2800,
          1260
        ),
      activationBounds:
        rectangle(
          1840,
          430,
          360,
          500
        ),
      spawnRegion:
        rectangle(
          2260,
          180,
          2200,
          1080
        ),
      budget: 9,
      gateId: 'reactor-lift',
    },
    {
      id: 'extraction-pit',
      name: 'EXTRACTION PIT',
      sequence: 2,
      bounds:
        rectangle(
          1800,
          1580,
          2800,
          840
        ),
      activationBounds:
        rectangle(
          2700,
          1580,
          620,
          220
        ),
      spawnRegion:
        rectangle(
          1980,
          1840,
          2440,
          480
        ),
      budget: 13,
      gateId: 'pit-lock',
    },
  ]

export const WASTES_APPROACH =
  rectangle(
    2600,
    2530,
    800,
    230
  )

export const WASTES_BOSS_TRIGGER =
  rectangle(
    1800,
    3000,
    2000,
    900
  )

export const WASTES_BOSS_ARENA =
  rectangle(
    350,
    2950,
    4100,
    1050
  )

export const WASTES_GATES:
  WastesGateDefinition[] = [
    {
      id: 'salvage-access',
      ownerZoneId:
        'salvage-yard',
      bounds:
        rectangle(
          1690,
          490,
          60,
          440
        ),
      orientation:
        'vertical',
    },
    {
      id: 'reactor-lift',
      ownerZoneId:
        'reactor-trench',
      bounds:
        rectangle(
          2650,
          1450,
          900,
          60
        ),
      orientation:
        'horizontal',
    },
    {
      id: 'pit-lock',
      ownerZoneId:
        'extraction-pit',
      bounds:
        rectangle(
          2600,
          2470,
          800,
          60
        ),
      orientation:
        'horizontal',
    },
    {
      id: 'wyrm-seal',
      ownerZoneId:
        'approach',
      bounds:
        rectangle(
          2450,
          2840,
          1100,
          70
        ),
      orientation:
        'horizontal',
    },
  ]

export const WASTES_WALLS:
  WastesObstacleDefinition[] = [
    { id: 'west-divider-north', bounds: rectangle(1660, 0, 90, 490), color: 0x252b31 },
    { id: 'west-divider-south', bounds: rectangle(1660, 930, 90, 3270), color: 0x252b31 },
    { id: 'reactor-wall-west', bounds: rectangle(1750, 1360, 900, 90), color: 0x30363c },
    { id: 'reactor-wall-east', bounds: rectangle(3550, 1360, 1250, 90), color: 0x30363c },
    { id: 'pit-wall-west', bounds: rectangle(1750, 2420, 850, 80), color: 0x292e34 },
    { id: 'pit-wall-east', bounds: rectangle(3400, 2420, 1400, 80), color: 0x292e34 },
    { id: 'approach-wall-west', bounds: rectangle(0, 2760, 2450, 110), color: 0x1e242a },
    { id: 'approach-wall-east', bounds: rectangle(3550, 2760, 1250, 110), color: 0x1e242a },
  ]

export const WASTES_OBSTACLES:
  WastesObstacleDefinition[] = [
    { id: 'crashed-hauler', bounds: rectangle(760, 430, 360, 150), color: 0x39414a },
    { id: 'salvage-stack', bounds: rectangle(1240, 900, 210, 160), color: 0x4b3b31 },
    { id: 'reactor-housing-a', bounds: rectangle(2700, 300, 210, 480), color: 0x35414a },
    { id: 'reactor-housing-b', bounds: rectangle(3780, 650, 210, 480), color: 0x35414a },
    { id: 'trench-barrier', bounds: rectangle(3260, 1000, 340, 90), color: 0x4a3333 },
    { id: 'drill-base', bounds: rectangle(2150, 1900, 320, 250), color: 0x4a4032 },
    { id: 'pit-crane', bounds: rectangle(3850, 1740, 410, 130), color: 0x3c4248 },
    { id: 'pit-debris', bounds: rectangle(3400, 2200, 300, 100), color: 0x493634 },
    { id: 'boss-wreck-west', bounds: rectangle(650, 3350, 180, 110), color: 0x342d2d },
    { id: 'boss-wreck-east', bounds: rectangle(4000, 3600, 180, 110), color: 0x342d2d },
  ]
