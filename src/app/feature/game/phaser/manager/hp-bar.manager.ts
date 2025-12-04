import Phaser from 'phaser';
import { GAME_CONFIG } from '../../config/game.config';
import { Unit } from '../../model/unit.model';

interface HealthBarData {
  graphics: Phaser.GameObjects.Graphics;
  x: number; // 紀錄位置
  y: number;
  width: number; // 紀錄尺寸
  height: number;
}

/**
 * 血條管理員
 * 負責: 創建、更新、移除血條
 */
export class HpBarManager {
  private hpBars: Map<string, HealthBarData> = new Map();
  private tileSize = GAME_CONFIG.TILE_SIZE;

  constructor(private scence: Phaser.Scene) {}

  /**
   * 為單位創建血條
   * @param unit 單位
   */
  public createHpBar(unit: Unit): void {
    const x =
      unit.x * this.tileSize + this.tileSize / 2 - (this.tileSize * 0.8) / 2;
    const y = unit.y * this.tileSize - this.tileSize / 2 + 30; // 單位上方

    const width = this.tileSize * 0.8;
    const height = 6;

    // 背景 (灰色)
    const graphics = this.scence.add.graphics();

    this.hpBars.set(unit.id, { graphics, x, y, width, height });
    this.drawHpBar(unit);
  }

  /**
   * 繪製血條
   * @param unit 單位
   */
  private drawHpBar(unit: Unit): void {
    const data = this.hpBars.get(unit.id);
    if (!data) return;

    const hpRatio = unit.hp / unit.maxHp;
    const currentWidth = data.width * hpRatio;

    // 清除舊的
    data.graphics.clear();

    // 繪製背景 (灰色)
    data.graphics.fillStyle(0x333333);
    data.graphics.fillRect(data.x, data.y, data.width, data.height);

    // 繪製血條 (根據 HP 比例)
    data.graphics.fillStyle(this.gethpColor(hpRatio));
    data.graphics.fillRect(data.x, data.y, currentWidth, data.height);
  }
  /**
   * 更新血條
   * @param unit 單位
   */
  public updateHpBar(unit: Unit): void {
    const data = this.hpBars.get(unit.id);
    if (!data) return;

    this.drawHpBar(unit);

    // 受傷閃爍效果 (用 alpha)
    this.scence.tweens.addCounter({
      from: 1,
      to: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1,
      onUpdate: (tween) => {
        data.graphics.alpha = tween.getValue() ?? 1;
      },
    });
  }

  /**
   * 移除血條
   * @param unitId 單位 ID
   */
  public removeHpBar(unitId: string): void {
    const data = this.hpBars.get(unitId);
    if (data) {
      data.graphics.destroy();
      this.hpBars.delete(unitId);
    }
  }

  /**
   * 清除所有血條
   */
  public clearAll() {
    this.hpBars.forEach((data) => {
      data.graphics.destroy();
    });
    this.hpBars.clear();
  }

  /**
   * 根據 HP 比例返回顏色
   * @param ratio HP 比例 (0-1)
   */
  private gethpColor(ratio: number): number {
    if (ratio > 0.6) return 0x00ff00; // 绿色
    if (ratio > 0.3) return 0xffff00; // 黄色
    return 0xff0000; // 红色
  }
}
