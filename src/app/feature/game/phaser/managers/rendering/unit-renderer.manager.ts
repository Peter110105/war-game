import Phaser from 'phaser';
import { GameState } from '../../../model/game-state.model';
import { GAME_CONFIG } from '../../../config/game/game.config';

/**
 * 單位管理員
 * 負責: 畫單位、擦單位
 */
export class UnitRendererManager {
  private unitSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private tileSize = GAME_CONFIG.TILE_SIZE;

  constructor(private scence: Phaser.Scene) {}

  /**
   * 繪製所有單位
   * @param gameState 遊戲狀態
   */
  public drawUnits(gameState: GameState): void {
    // 清除舊的 sprite
    this.clearUnits();

    // 繪製所有活著的單位
    gameState.units.forEach((unit) => {
      console.log('drawUnits', unit);
      if (!unit.alive) return;

      const color =
        unit.ownerId === 'P1' ? GAME_CONFIG.COLOR.P1 : GAME_CONFIG.COLOR.P2;

      const sprite = this.scence.add.rectangle(
        unit.x * this.tileSize + this.tileSize / 2,
        unit.y * this.tileSize + this.tileSize / 2,
        this.tileSize * 0.8,
        this.tileSize * 0.8,
        color
      );
      this.unitSprites.set(unit.id, sprite);
    });
  }

  /**
   * 取得單位 Sprite
   * @param unitId 單位 ID
   */
  public getUnitSprite(
    unitId: string
  ): Phaser.GameObjects.Rectangle | undefined {
    return this.unitSprites.get(unitId);
  }

  /**
   * 移除單位
   * @param unitId 單位 ID
   */
  public removeUnit(unitId: string): void {
    const sprite = this.unitSprites.get(unitId);
    if (sprite) {
      sprite.destroy();
      this.unitSprites.delete(unitId);
    }
  }

  /**
   * 清除所有單位
   */
  public clearUnits(): void {
    this.unitSprites.forEach((sprite) => sprite.destroy());
    this.unitSprites.clear();
  }

  /**
   * 取得所有單位 Sprite
   */
  getAllSprites(): Map<string, Phaser.GameObjects.Rectangle> {
    return this.unitSprites;
  }
}
