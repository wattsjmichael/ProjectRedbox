import Phaser from 'phaser'

import {
  BootScene,
} from './scenes/BootScene'

import {
  TitleScene,
} from './scenes/TitleScene'

import {
  GameScene,
} from './scenes/GameScene'

import {
  HunterBayScene,
} from './scenes/HunterBayScene'

const config:
  Phaser.Types.Core.GameConfig = {
  type:
    Phaser.AUTO,

  width:
    1280,

  height:
    720,

  backgroundColor:
    '#111827',

  scale: {
    mode:
      Phaser.Scale.FIT,

    autoCenter:
      Phaser.Scale.CENTER_BOTH,
  },

  scene: [
    BootScene,
    TitleScene,
    GameScene,
    HunterBayScene,
  ],
}



new Phaser.Game(
  config
)
