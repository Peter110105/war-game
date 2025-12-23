import Phaser from 'phaser';
import { BattlefieldScene } from '../scenes/battlefield.scene';
import { GAME_CONFIG } from '../../config/game/game.config';

export const PHASER_CONFIG = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.CANVAS_WIDTH,
  height: GAME_CONFIG.CANVAS_HEIGHT,
  scene: [BattlefieldScene],
  backgroundColor: GAME_CONFIG.BACKGROUND,
};
