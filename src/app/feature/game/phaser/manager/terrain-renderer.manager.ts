import Phaser from 'phaser';
import { GameState } from '../../model/game-state.model';
import { GAME_CONFIG } from '../../config/game.config';
import { TERRAIN_CONFIG } from '../../config/terrain.config';

export class TerrainRendererManager {
  private terrainGraphics?: Phaser.GameObjects.Graphics;
  private tileSize = GAME_CONFIG.TILE_SIZE;

  constructor(private scene: Phaser.Scene) {}

  /**
   * 繪製地形
   */
  public drawTerrain(gameState: GameState): void {
    this.clearTerrain();

    this.terrainGraphics = this.scene.add.graphics();

    // 繪製每個格子的地形
    gameState.tiles.forEach((tile) => {
      const config = TERRAIN_CONFIG[tile.terrain.terrainType];
      if (!config) return;

      const x = tile.x * this.tileSize;
      const y = tile.y * this.tileSize;

      // 填充地形顏色
      this.terrainGraphics!.fillStyle(config.color, 0.3);
      this.terrainGraphics!.fillRect(x, y, this.tileSize, this.tileSize);

      // 繪製地形圖示 (使用 emoji)
      const text = this.scene.add.text(
        x + this.tileSize / 2,
        y + this.tileSize / 2,
        config.emoji,
        {
          fontSize: '20px',
          align: 'center',
        }
      );
      text.setOrigin(0.5, 0.5);
      text.setAlpha(0.6);
    });
  }

  /**
   * 清除地形
   */
  public clearTerrain(): void {
    if (this.terrainGraphics) {
      this.terrainGraphics.destroy();
      this.terrainGraphics = undefined;
    }
  }
}
