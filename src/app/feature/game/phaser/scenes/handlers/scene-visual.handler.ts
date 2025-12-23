import Phaser from 'phaser';
import { GAME_CONFIG } from '../../../config/game/game.config';
import { GameStateService } from '../../../state/game-state.service';

/**
 * 場景視覺效果處理器
 * 職責：處理所有視覺特效（傷害數字、暴擊、升級等）
 */
export class SceneVisualHandler {
  constructor(
    private scene: Phaser.Scene,
    private gameService: GameStateService
  ) {}

  /**
   * 顯示傷害數字
   */
  public showDamageNumber(
    x: number,
    y: number,
    damage: number,
    isCritical: boolean
  ) {
    const pixelX = x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const pixelY = y * GAME_CONFIG.TILE_SIZE;

    const text = this.scene.add.text(pixelX, pixelY, `-${damage}`, {
      fontSize: isCritical ? '32px' : '24px',
      color: isCritical ? '#ff0000' : '#ff6b6b',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: pixelY - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * 顯示治療數字
   */
  public showHealNumber(x: number, y: number, amount: number) {
    const pixelX = x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const pixelY = y * GAME_CONFIG.TILE_SIZE;

    const text = this.scene.add.text(pixelX, pixelY, `+${amount}`, {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: pixelY - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * 顯示暴擊效果
   */
  public showCriticalEffect(x: number, y: number) {
    const pixelX = x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const pixelY = y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;

    const circle = this.scene.add.circle(pixelX, pixelY, 5, 0xff0000);
    circle.setDepth(999);

    this.scene.tweens.add({
      targets: circle,
      radius: 40,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => circle.destroy(),
    });
  }

  /**
   * 顯示閃避效果
   */
  public showEvadeEffect(x: number, y: number) {
    const pixelX = x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const pixelY = y * GAME_CONFIG.TILE_SIZE;

    const text = this.scene.add.text(pixelX, pixelY, 'MISS!', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: pixelY - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * 顯示升級效果
   */
  public showLevelUpEffect(unitId: string) {
    const unit = this.gameService.getUnitById(unitId);
    if (!unit) return;

    const pixelX = unit.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const pixelY = unit.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;

    // 發光效果
    const circle = this.scene.add.circle(pixelX, pixelY, 10, 0xffd700);
    circle.setDepth(999);

    this.scene.tweens.add({
      targets: circle,
      radius: 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => circle.destroy(),
    });

    // LEVEL UP 文字
    const text = this.scene.add.text(pixelX, pixelY - 30, 'LEVEL UP!', {
      fontSize: '20px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: pixelY - 60,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * 顯示技能效果
   */
  public showSkillEffect(unitId: string, skillId: string) {
    const unit = this.gameService.getUnitById(unitId);
    if (!unit) return;

    const pixelX = unit.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const pixelY = unit.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;

    // 技能特效圓圈
    const circle = this.scene.add.circle(pixelX, pixelY, 5, 0x87ceeb);
    circle.setDepth(999);

    this.scene.tweens.add({
      targets: circle,
      radius: 35,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => circle.destroy(),
    });
  }
}
