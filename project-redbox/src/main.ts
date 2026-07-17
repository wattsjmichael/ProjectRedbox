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

const config:
  Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,

    width: 800,

    height: 600,

    backgroundColor: '#050505',

    scene: [
      BootScene,
      TitleScene,
      GameScene,
    ],
  }

new Phaser.Game(
  config
)