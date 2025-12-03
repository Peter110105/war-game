import Phaser from 'phaser';
import { GAME_CONFIG } from '../../config/game.config';

export type ClickCallback = (x: number, y: number) => void;
export type MoveCallback = (x: number, y: number) => void;

/**
 * 輸入管理員
 * 負責: 接收玩家指令、可以開關
 */
export class InputManager {
  private titleSize = GAME_CONFIG.TILE_SIZE;
  private clickCallbacks: ClickCallback[] = [];
  private moveCallbacks: MoveCallback[] = [];
  private isEnabled = true;

  constructor(private scence: Phaser.Scene) {
    this.setupInputListeners();
  }

  /**
   * 設置輸入監聽器
   */
  private setupInputListeners(): void {
    // 監聽點擊事件
    this.scence.input.on('pointerdown', (pointer: { x: number; y: number }) => {
      if (!this.isEnabled) return;

      const x = Math.floor(pointer.x / this.titleSize);
      const y = Math.floor(pointer.y / this.titleSize);

      // 呼叫所有註冊的回調
      this.clickCallbacks.forEach((callback) => {
        callback(x, y);
      });
    });
    // 監聽滑鼠移動事件
    this.scence.input.on('pointermove', (pointer: { x: number; y: number }) => {
      if (!this.isEnabled) return;

      const x = Math.floor(pointer.x / this.titleSize);
      const y = Math.floor(pointer.y / this.titleSize);

      // 呼叫所有註冊的回調
      this.moveCallbacks.forEach((callback) => {
        callback(x, y);
      });
    });
  }

  /**
   * 註冊點擊回調
   * @param callback 回調函數
   */
  public onPointerDown(callback: ClickCallback): void {
    this.clickCallbacks.push(callback);
  }

  /**
   * 註冊移動回調
   * @param callback 回調函數
   */
  public onPointerMove(callback: MoveCallback): void {
    this.moveCallbacks.push(callback);
  }

  /**
   * 啟用輸入
   */
  public enable(): void {
    this.isEnabled = true;
  }

  /**
   * 禁用輸入
   */
  public disable(): void {
    this.isEnabled = false;
  }

  /**
   * 檢查輸入是否啟用
   */
  public getIsEnabled(): boolean {
    return this.isEnabled;
  }
}
