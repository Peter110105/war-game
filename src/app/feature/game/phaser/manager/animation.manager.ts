import Phaser from 'phaser';
import { GAME_CONFIG } from '../../config/game.config';

/**
 * 動畫管理員
 * 負責: 指揮動畫
 */
export class AnimationManager {
  private tileSize = GAME_CONFIG.TILE_SIZE;

  constructor(private scence: Phaser.Scene) {}

  /**
   * 移動單位動畫 (單格)
   * @param sprite 單位 Sprite
   * @param toX 目標 X 座標
   * @param toY 目標 Y 座標
   * @param onComplete 完成回調
   */
  public playMoveAnimation(
    sprite: Phaser.GameObjects.Rectangle,
    toX: number,
    toY: number,
    onComplete?: () => void
  ): void {
    this.scence.tweens.add({
      targets: sprite,
      duration: GAME_CONFIG.ANIMATION.MOVE_DURATION, // 毫秒
      x: toX * this.tileSize + this.tileSize / 2,
      y: toY * this.tileSize + this.tileSize / 2,
      ease: 'Power2', // 緩動效果()
      onComplete: onComplete,
    });
  }

  /**
   * 沿著路徑移動動畫
   * @param sprite 單位 Sprite
   * @param path 路徑座標列表
   * @param onComplete 完成回調
   */
  public playPathAnimation(
    sprite: Phaser.GameObjects.Rectangle,
    path: { x: number; y: number }[],
    onComplete?: () => void
  ): void {
    if (!path || path.length === 0) {
      onComplete?.();
      console.log('path is empty');
      return;
    }

    let completeMoves = 0;
    const totalMoves = path.length;
    path.forEach((pos, index) => {
      this.scence.time.delayedCall(
        index * GAME_CONFIG.ANIMATION.MOVE_DURATION,
        () => {
          this.playMoveAnimation(sprite, pos.x, pos.y, () => {
            completeMoves++;
            if (completeMoves === totalMoves) {
              onComplete?.();
            }
          });
        }
      );
    });
  }

  /**
   * 攻擊動畫
   * @param attackerSprite 攻擊者 Sprite
   * @param targetSprite 目標 Sprite
   * @param onComplete 完成回調
   */
  public playAttackAnimation(
    attackerSprite: Phaser.GameObjects.Rectangle,
    targetSprite: Phaser.GameObjects.Rectangle,
    onComplete?: () => void
  ): void {
    const distance = Phaser.Math.Distance.Between(
      attackerSprite.x,
      attackerSprite.y,
      targetSprite.x,
      targetSprite.y
    );

    // 計算攻擊點 (目標方向 30 像素)
    const attackPoint = {
      x:
        attackerSprite.x +
        ((targetSprite.x - attackerSprite.x) / distance) * 30,
      y:
        attackerSprite.y +
        ((targetSprite.y - attackerSprite.y) / distance) * 30,
    };

    // 紀錄原始位置
    const originalX = attackerSprite.x;
    const originalY = attackerSprite.y;

    this.scence.tweens.add({
      targets: attackerSprite,
      duration: GAME_CONFIG.ANIMATION.ATTACK_DURATION,
      x: attackPoint.x,
      y: attackPoint.y,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        // 確保回到原位
        attackerSprite.setPosition(originalX, originalY);
        onComplete?.();
      },
    });

    console.log('attack-sound'); // TODO 之後替換成真實音效
  }

  /**
   * 受傷動畫
   * @param sprite 單位 Sprite
   */
  public playDamageAnimation(sprite: Phaser.GameObjects.Rectangle): void {
    this.scence.tweens.add({
      targets: sprite,
      alpha: 0.5, // 閃爍到半透明
      yoyo: true, // 來回播放
      duration: 50,
      repeat: 3, // 重複閃爍 3 次
      ease: 'Power1',
    });

    console.log('damage-sound'); // TODO 之後替換成真實音效
  }

  /**
   * 死亡動畫
   * @param sprite 單位 Sprite
   * @param onComplete 完成回調
   */
  playDeathAnimation(
    sprite: Phaser.GameObjects.Rectangle,
    onComplete?: () => void
  ): void {
    this.scence.tweens.add({
      targets: sprite,
      alpha: 0, // 目標不透明度為 0 (完全透明)
      duration: GAME_CONFIG.ANIMATION.DEATH_DURATION,
      ease: 'Linear',
      onComplete: () => {
        sprite.destroy();
        onComplete?.();
      },
    });

    console.log('dead-sound'); // TODO 之後替換成真實音效
  }
}
