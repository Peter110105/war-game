import Phaser from "phaser";
import { GameCommand } from "../../command/command.interface";
import { GameStateService } from "../../service/game-state.service";
import { GameEventService } from "../../service/game-event.service";
import { PathfindingService } from "../../logic/path-finding.service";

export class BattlefieldScene extends Phaser.Scene {
  private unitSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private tileSize = 64;
  private gameService!: GameStateService;
  private eventService!: GameEventService;
  private pathfindingService!: PathfindingService;
  private selectedUnitId: string | null = null;
  private movableAreaGraphics?: Phaser.GameObjects.Graphics; // 可移動範圍圖形
  private unitTooltip?: Phaser.GameObjects.Text; // 單位提示文字

  constructor() {
    super('BattlefieldScene');
  }
  init(data: {
    gameService: GameStateService;
    eventService: GameEventService;
    pathfindingService: PathfindingService;
  }) {
    this.gameService = data.gameService;
    this.eventService = data.eventService;
    this.pathfindingService = data.pathfindingService;
  }

  create() {
    this.drawMap();
    this.drawUnits();
    // 註冊輸入事件
    this.input.on('pointerdown', (pointer: { x: number; y: number }) => {
      const x = Math.floor(pointer.x / this.tileSize);
      const y = Math.floor(pointer.y / this.tileSize);
      this.handleClick(x, y);
    });
    // 註冊滑鼠移動事件
    this.input.on('pointermove', (pointer: { x: number; y: number }) => {
      const x = Math.floor(pointer.x / this.tileSize);
      const y = Math.floor(pointer.y / this.tileSize);
      this.showUnitTooltip(x, y);
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
    this.unitSprites.forEach((sprite) => sprite.destroy());
    this.unitSprites.clear();

    // 重新繪製
    const units = this.gameService.getUnits();
    units.forEach((unit) => {
      const color = unit.ownerId === 'p1' ? 0xff0000 : 0x00ff00;

      const rect = this.add.rectangle(
        unit.x * this.tileSize + this.tileSize / 2,
        unit.y * this.tileSize + this.tileSize / 2,
        this.tileSize * 0.8,
        this.tileSize * 0.8,
        color
      );
      this.unitSprites.set(unit.id, rect);
    });
  }
  // 顯示單位提示文字
  private showUnitTooltip(x: number, y: number) {
    const unit = this.gameService.getUnitAt(x, y);
    if (unit) {
      if (!this.unitTooltip) {
        this.unitTooltip = this.add.text(0, 0, '', {
          font: '16px Arial',
          color: '#ffffff',
          backgroundColor: '#000000',
        });
      }
      this.unitTooltip.setText(
        `名稱: ${unit.name}\nHP: ${unit.hp}/${unit.maxHp}\n攻擊: ${unit.attack}\n防禦: ${unit.defense}`
      );
      this.unitTooltip.setPosition(
        x * this.tileSize + 10,
        y * this.tileSize + 10
      );
      this.unitTooltip.setVisible(true);
    } else {
      this.unitTooltip?.setVisible(false);
    }
  }

  // 只更新單個單位
  private updateUnitPosition(unitId: string, x: number, y: number) {
    const sprite = this.unitSprites.get(unitId);
    if (!sprite) return;
    // 用 Tween 做平滑移動動畫
    this.tweens.add({
      targets: sprite,
      duration: 300, // 毫秒
      x: x * this.tileSize + this.tileSize / 2,
      y: y * this.tileSize + this.tileSize / 2,
      ease: 'Power2', // 緩動效果()
      onComplete: () => {
        // 動畫完成後的回調
        this.eventService.emit({
          type: 'UNIT_MOVED',
          data: { unitId, x, y },
        });
      },
    });
  }

  private moveUnitAlongPath(unitId: string, path:{x: number, y: number}[]) {
    if (!path) return;

    this.input.enabled = false; // 禁用輸入

    path.forEach((pos, index) => {
      this.time.delayedCall(index * 300, () => {
        this.updateUnitPosition(unitId, pos.x, pos.y);
      });
    });

    // 等所有動畫完成後才啟用
    const totalDuration = path.length * 300;
    this.time.delayedCall(totalDuration, () => {
      this.input.enabled = true;
    });
  }

  private handleClick(x: number, y: number) {
    // 通知 Angular 層
    // this.eventService.emit({
    //   type: 'UNIT_CLICKED',
    //   data: { x, y },
    // });
    const currentPlayerId = this.gameService.currentPlayerId;
    const clickedUnit = this.gameService.getUnitAt(x, y);

    // 選取我方單位
    if ( clickedUnit && clickedUnit.ownerId === this.gameService.currentPlayerId) {
      // 如果該單位本回合已移動過，則不允許選取
      if(clickedUnit.actionState.hasMoved){
        console.log('該單位本回合已移動過');
        return;
      }
      // 選取單位
      this.selectedUnitId = clickedUnit.id;
      this.showMovableArea(clickedUnit.id);
      this.eventService.emit({
        type: 'UNIT_SELECTED',
        data: { x, y },
      });
      console.log(`選擇單位: ${clickedUnit.name}`);
      return;
    }

    // 執行移動
    if (this.selectedUnitId) {
      const selectedUnit = this.gameService.getUnits().find((u) => u.id === this.selectedUnitId)!;
      const path = this.pathfindingService.findPath(
        this.gameService.getGameState(),
        { x: selectedUnit.x, y: selectedUnit.y },
        { x, y },
        selectedUnit.move
      );

      if (!path || path.length === 0) {
        console.log('無法到達');
        return;
      }

      const cmd: GameCommand = {
        id: 'cmd_' + Date.now(),
        type: 'MOVE',
        playerId: this.gameService.currentPlayerId,
        unitId: this.selectedUnitId,
        from: { x: selectedUnit.x, y: selectedUnit.y },
        to: { x, y },
        timestamp: Date.now(),
      };

      const result = this.gameService.execute(cmd);
      if (result.success) {
        this.clearMovableArea(); // 清除可移動範圍顯示
        this.moveUnitAlongPath(this.selectedUnitId, path);
        // this.updateUnitPosition(this.selectedUnitId, x, y);
        this.selectedUnitId = null;
      }
      console.log(result);

      // this.scene.restart();
    }
  }
  // 顯示可移動範圍
  private showMovableArea(unitId: string) {
    // 清除舊有的可移動範圍
    this.clearMovableArea();

    // 取的可移動範圍
    const movableArea = this.pathfindingService.getMovableArea(
      this.gameService.getGameState(),
      unitId
    );

    // 繪製可移動範圍
    this.movableAreaGraphics = this.add.graphics();
    this.movableAreaGraphics.fillStyle(0x00aaff, 0.3);
    movableArea.forEach((pos) => {
      this.movableAreaGraphics!.fillRect(
        pos.x * this.tileSize,
        pos.y * this.tileSize,
        this.tileSize,
        this.tileSize
      );
    });
  }
  // 清除可移動範圍顯示
  private clearMovableArea() {
    this.movableAreaGraphics?.clear();
    this.movableAreaGraphics?.destroy();
    this.movableAreaGraphics = undefined;
  }
}
