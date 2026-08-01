import type Phaser from 'phaser'

export const WASTES_TEXTURES = {
  salvageFloor: {
    key: 'wastes-floor-salvage-temp-v1',
    path: 'assets/sprites/temp-ai/environment/wastes_floor_salvage_temp_v1.png',
  },
  reactorFloor: {
    key: 'wastes-floor-reactor-temp-v1',
    path: 'assets/sprites/temp-ai/environment/wastes_floor_reactor_temp_v1.png',
  },
  extractionFloor: {
    key: 'wastes-floor-extraction-temp-v1',
    path: 'assets/sprites/temp-ai/environment/wastes_floor_extraction_temp_v1.png',
  },
} as const

export const WASTES_VISUALS = {
  floorTileScale: 0.42,
  floorAlpha: 0.68,
  floorDepth: -27,
  wallDepth: -15,
  landmarkDepth: -12,
  atmosphereDepth: -11,
  gateFrameDepth: -6,
  gateBarrierDepth: -5,
  gateLightDepth: -4,
} as const

export const hasWastesTexture = (
  scene: Phaser.Scene,
  key: string
) => {
  const texture = scene.textures.get(key)

  if (!texture || texture.key === '__MISSING') {
    console.warn(
      `[WastesArt] Missing optional environment texture: ${key}. Using graybox floor fallback.`
    )
    return false
  }

  return true
}
