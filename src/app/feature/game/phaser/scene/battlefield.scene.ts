import Phaser from "phaser";
import { GameCommand } from "../../command/command.interface";
import { GameStateService } from "../../service/game-state.service";

export class BattlefieldScene extends Phaser.Scene {
  private tileSize = 64;
  private gameService!: GameStateService;
  private selectedUnitId: string | null = null;

  constructor() {
    super('BattlefieldScene');
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

      rect.setData('unitId', unit.id);
    });
  }

  private handleClick(x: number, y: number) {
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
        type: 'MOVE',
        playerId: this.gameService.currentPlayerId,
        unitId: this.selectedUnitId,
        to: { x, y }
      };

      const result = this.gameService.execute(cmd);
      console.log(result);

      this.scene.restart();
    }
  }
}
