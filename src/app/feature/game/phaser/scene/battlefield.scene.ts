import Phaser from "phaser";
import { GameCommand } from "../../command/command.interface";
import { GameStateService } from "../../service/game-state.service";
import { GameEventService } from "../../service/game-event.service";

export class BattlefieldScene extends Phaser.Scene {
  private unitSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private tileSize = 64;
  private gameService!: GameStateService;
  private eventService!: GameEventService
  private selectedUnitId: string | null = null;

  constructor() {
    super('BattlefieldScene');
  }
  intit(data: { gameService: GameStateService, eventService: GameEventService }) {
    this.gameService = data.gameService;
    this.eventService = data.eventService;
  }

  
  create() {
    // 在 Angular component 裡掛上 window.ngGameService
    this.gameService = (window as any).ngGameService;

    this.drawMap();
    this.drawUnits();

    this.input.on('pointerdown', (pointer: { x: number; y: number; }) =>{
      const x = Math.floor(pointer.x / this.tileSize);
      const y = Math.floor(pointer.y / this.tileSize);
      this.handleClick(x, y);
    });
  }

  private drawMap() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x444444);

    for (let i = 0; i <= 800; i += this.tileSize) {
      g.lineBetween(i, 0, i, 600);
    }
    for (let j = 0; j <= 600; j += this.tileSize) {
      g.lineBetween(0, j, 800, j);
    }
  }

  private drawUnits() {
    // 清除舊的
    this.unitSprites.forEach(sprite => sprite.destroy());
    this.unitSprites.clear();

    // 重新繪製
    const units = this.gameService.getUnits();
    units.forEach(unit => {
      const color = unit.ownerId === 'p1' ? 0xff0000 : 0x00ff00;

      const rect = this.add.rectangle(
        unit.x * this.tileSize + this.tileSize / 2,
        unit.y * this.tileSize + this.tileSize / 2,
        this.tileSize * 0.8,
        this.tileSize * 0.8,
        color,
      );
      this.unitSprites.set(unit.id, rect);
    });
  }

  // 只更新單個單位 (v0.1.0 移動動畫會用到)
  updateUnitPosition(unitId: string, x: number, y: number) {
    const sprite = this.unitSprites.get(unitId);
    if (sprite) {
      sprite.setPosition(
        x * this.tileSize + this.tileSize / 2,
        y * this.tileSize + this.tileSize / 2
      )
    }
  }

  private handleClick(x: number, y: number) {
     // 通知 Angular 層
     this.eventService.emit({
      type: 'UNIT_CLICKED',
      data: { x, y }
    });
    const unit = this.gameService.getUnitAt(x, y);

    // 選取我方單位
    if (unit && unit.ownerId === this.gameService.currentPlayerId) {
      this.selectedUnitId = unit.id;
      console.log(`選擇單位: ${unit.name}`);
      return;
    }

    // 執行移動
    if (this.selectedUnitId) {
      const cmd: GameCommand = {
        id: 'cmd_' + Date.now(),
        type: 'MOVE',
        playerId: this.gameService.currentPlayerId,
        unitId: this.selectedUnitId,
        to: { x, y },
        timestamp: Date.now(),
      };

      const result = this.gameService.execute(cmd);
      console.log(result);

      this.scene.restart();
    }
  }
}
