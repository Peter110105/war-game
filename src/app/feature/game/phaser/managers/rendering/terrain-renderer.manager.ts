import Phaser from 'phaser';
import { GAME_CONFIG } from '../../../config/game/game.config';
import { TERRAIN_CONFIG } from '../../../config/terrain/terrain.config';
import { GameState } from '../../../model/game-state.model';
import { TerrainType } from '../../../model/tile.model';

/**
 * 地形渲染管理器
 * 負責: 渲染地形、地形視覺效果
 */
export class TerrainRendererManager {
  private terrainGraphics?: Phaser.GameObjects.Graphics;
  private terrainEmojis: Phaser.GameObjects.Text[] = [];
  private tileSize = GAME_CONFIG.TILE_SIZE;

  constructor(private scene: Phaser.Scene) {}

  /**
   * 繪製地形
   */
  public drawTerrain(gameState: GameState): void {
    this.clearTerrain();

    this.terrainGraphics = this.scene.add.graphics();

    // 繪製每個格子的地形
    for (let y = 0; y < gameState.height; y++) {
      for (let x = 0; x < gameState.width; x++) {
        // 查找該位置的地形
        const tile = gameState.tiles.find((t) => t.x === x && t.y === y);

        if (tile) {
          this.drawTile(x, y, tile.terrain.terrainType);
        } else {
          // 預設地形 (平地)
          this.drawTile(x, y, TerrainType.PLAIN);
        }
      }
    }
  }

  /**
   * 繪製單個地形格子
   */
  private drawTile(x: number, y: number, terrainType: TerrainType): void {
    const config = TERRAIN_CONFIG[terrainType];
    if (!config) return;

    const pixelX = x * this.tileSize;
    const pixelY = y * this.tileSize;

    // 填充地形顏色 (半透明)
    this.terrainGraphics!.fillStyle(config.color, 0.4);
    this.terrainGraphics!.fillRect(
      pixelX,
      pixelY,
      this.tileSize,
      this.tileSize
    );

    // 繪製地形邊框 (增強視覺效果)
    this.terrainGraphics!.lineStyle(1, config.color, 0.8);
    this.terrainGraphics!.strokeRect(
      pixelX,
      pixelY,
      this.tileSize,
      this.tileSize
    );

    // 繪製地形圖示 (emoji)
    const emoji = this.scene.add.text(
      pixelX + this.tileSize / 2,
      pixelY + this.tileSize / 2,
      config.emoji,
      {
        fontSize: '24px',
        align: 'center',
      }
    );
    emoji.setOrigin(0.5, 0.5);
    emoji.setAlpha(0.7);
    emoji.setDepth(-1); // 確保在單位下方

    this.terrainEmojis.push(emoji);
  }

  /**
   * 高亮顯示特定地形
   * @param x X 座標
   * @param y Y 座標
   * @param color 高亮顏色
   * @param alpha 透明度
   */
  public highlightTile(
    x: number,
    y: number,
    color: number = 0xffff00,
    alpha: number = 0.5
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, alpha);
    graphics.fillRect(
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      this.tileSize
    );
    return graphics;
  }

  /**
   * 顯示地形資訊提示
   */
  public showTerrainTooltip(
    x: number,
    y: number,
    terrainType: TerrainType
  ): Phaser.GameObjects.Text {
    const config = TERRAIN_CONFIG[terrainType];
    if (!config) return null as any;

    const defenseText =
      config.defenseBonus > 0
        ? `+${(config.defenseBonus * 100).toFixed(0)}%`
        : '0%';

    const text = this.scene.add.text(
      x * this.tileSize + 5,
      y * this.tileSize + 5,
      `${config.name}\n移動: ${config.moveCost}\n防禦: ${defenseText}`,
      {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 },
      }
    );
    text.setDepth(1000);
    return text;
  }

  /**
   * 清除地形
   */
  public clearTerrain(): void {
    if (this.terrainGraphics) {
      this.terrainGraphics.destroy();
      this.terrainGraphics = undefined;
    }

    this.terrainEmojis.forEach((emoji) => emoji.destroy());
    this.terrainEmojis = [];
  }

  /**
   * 取得地形資訊 (用於 UI 顯示)
   */
  public getTerrainInfo(terrainType: TerrainType): {
    name: string;
    moveCost: number;
    defenseBonus: number;
    emoji: string;
  } {
    const config = TERRAIN_CONFIG[terrainType];
    return {
      name: config.name,
      moveCost: config.moveCost,
      defenseBonus: config.defenseBonus,
      emoji: config.emoji,
    };
  }
}
