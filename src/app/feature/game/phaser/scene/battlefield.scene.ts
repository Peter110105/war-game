import Phaser from 'phaser';
import { GameCommand } from '../../command/command.interface';
import { GameStateService } from '../../service/game-state.service';
import {
  GameEventService,
  GameEventType,
} from '../../service/game-event.service';
import { PathfindingService } from '../../logic/path-finding.service';
import { GAME_CONFIG } from '../../config/game.config';
import { UnitRendererManager } from '../manager/unit-renderer.manager';
import { AnimationManager } from '../manager/animation.manager';
import { InputManager } from '../manager/input.manager';

/**
 * 遊戲場景(協調者)
 */
export class BattlefieldScene extends Phaser.Scene {
  // service
  private gameService!: GameStateService;
  private eventService!: GameEventService;
  private pathfindingService!: PathfindingService;

  // Manger
  private unitRenderer!: UnitRendererManager;
  private animationMgr!: AnimationManager;
  private inputMgr!: InputManager;

  // 狀態
  private selectedUnitId: string | null = null;
  private movableAreaGraphics?: Phaser.GameObjects.Graphics; // 可移動範圍圖形
  private attackableAreaGraphics?: Phaser.GameObjects.Graphics; // 可攻擊範圍圖形
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
    // 初始化 Manager
    this.unitRenderer = new UnitRendererManager(this);
    this.animationMgr = new AnimationManager(this);
    this.inputMgr = new InputManager(this);

    // 繪製地圖和單位
    this.drawMap();
    this.unitRenderer.drawUnits(this.gameService.getGameState());

    // 訂閱事件
    this.subscribeToEvents();

    // 設置輸入
    this.inputMgr.onPointerDown((x, y) => {
      this.handleClick(x, y);
    });
    this.inputMgr.onPointerMove((x, y) => {
      this.showUnitTooltip(x, y);
    });
  }

  private drawMap() {
    const g = this.add.graphics();
    g.lineStyle(1, GAME_CONFIG.LINE_STYLE.COLOR);

    for (let i = 0; i <= GAME_CONFIG.CANVAS_WIDTH; i += GAME_CONFIG.TILE_SIZE) {
      g.lineBetween(i, 0, i, GAME_CONFIG.CANVAS_HEIGHT);
    }
    for (
      let j = 0;
      j <= GAME_CONFIG.CANVAS_HEIGHT;
      j += GAME_CONFIG.TILE_SIZE
    ) {
      g.lineBetween(0, j, GAME_CONFIG.CANVAS_WIDTH, j);
    }
  }

  private subscribeToEvents() {
    this.eventService.events$.subscribe((event) => {
      switch (event.type) {
        case GameEventType.UNIT_DIED:
          this.handleUnitDeath(event.data.unitId);
          break;
        case GameEventType.TURN_ENDED:
          this.selectedUnitId = null;
          this.clearMovableArea();
          this.clearAttackableArea();
          break;
      }
    });
  }

  // 顯示單位提示文字
  private showUnitTooltip(x: number, y: number) {
    const unit = this.gameService.getUnitAt(x, y);
    if (unit) {
      if (!this.unitTooltip) {
        this.unitTooltip = this.add.text(0, 0, '', {
          font: GAME_CONFIG.TEXT.FONT_FAMILY,
          fontSize: GAME_CONFIG.TEXT.FONT_SIZE,
          color: GAME_CONFIG.TEXT.COLOR,
          backgroundColor: GAME_CONFIG.TEXT.BACKGROUND,
        });
      }
      this.unitTooltip.setText(
        `名稱: ${unit.name}\nHP: ${unit.hp}/${unit.maxHp}\n攻擊: ${unit.attack}\n防禦: ${unit.defense}`
      );
      this.unitTooltip.setPosition(
        x * GAME_CONFIG.TILE_SIZE + 10,
        y * GAME_CONFIG.TILE_SIZE + 10
      );
      this.unitTooltip.setVisible(true);
    } else {
      this.unitTooltip?.setVisible(false);
    }
  }

  private handleClick(x: number, y: number) {
    const currentPlayerId = this.gameService.currentPlayerId;
    const clickedUnit = this.gameService.getUnitAt(x, y);

    // 選取我方單位
    if (clickedUnit && clickedUnit.ownerId === currentPlayerId) {
      // 如果該單位本回合已移動過，則不允許選取
      if (clickedUnit.actionState.hasMoved) {
        console.log('該單位本回合已移動過');
        return;
      }
      // 選取單位
      this.selectedUnitId = clickedUnit.id;
      this.showMovableArea(clickedUnit.id);
      this.showAttackableArea(clickedUnit.id);
      this.eventService.emit({
        type: GameEventType.UNIT_SELECTED,
        data: { x, y },
      });
      console.log(`選擇單位: ${clickedUnit.name}`);
      return;
    }

    // 執行命令
    if (this.selectedUnitId) {
      const selectedUnit = this.gameService.getUnitById(this.selectedUnitId)!;

      // 判斷攻擊或移動
      if (clickedUnit && clickedUnit?.ownerId !== currentPlayerId) {
        this.executeAttack(selectedUnit, clickedUnit);
      } else {
        this.executeMove(selectedUnit, x, y);
      }
      // this.scene.restart();
    }
  }

  private executeMove(selectedUnit: any, targetX: number, targetY: number) {
    const path = this.pathfindingService.findPath(
      this.gameService.getGameState(),
      { x: selectedUnit.x, y: selectedUnit.y },
      { x: targetX, y: targetY },
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
      unitId: this.selectedUnitId!,
      from: { x: selectedUnit.x, y: selectedUnit.y },
      to: { x: targetX, y: targetY },
      timestamp: Date.now(),
    };

    const result = this.gameService.execute(cmd);
    if (result.success) {
      this.clearMovableArea(); // 清除可移動範圍顯示
      this.clearAttackableArea(); // 清除可攻擊範圍顯示

      const sprite = this.unitRenderer.getUnitSprite(this.selectedUnitId!);
      if (sprite) {
        this.inputMgr.disable();
        this.animationMgr.playPathAnimation(sprite, path, () => {
          this.inputMgr.enable();
        });
      }
      this.selectedUnitId = null;
    }
    console.log(result);
  }

  private executeAttack(attacker: any, defender: any) {
    const cmd: GameCommand = {
      id: 'cmd_' + Date.now(),
      type: 'ATTACK',
      playerId: this.gameService.currentPlayerId,
      unitId: this.selectedUnitId!,
      targetId: defender.id,
      from: { x: attacker.x, y: attacker.y },
      to: { x: defender.x, y: defender.y },
      timestamp: Date.now(),
    };

    const result = this.gameService.execute(cmd);
    if (result.success) {
      this.clearMovableArea(); // 清除可移動範圍顯示
      this.clearAttackableArea(); // 清除可攻擊範圍顯示

      const attackerSprite = this.unitRenderer.getUnitSprite(
        this.selectedUnitId!
      );
      const defenderSprite = this.unitRenderer.getUnitSprite(defender.id);
      if (attackerSprite && defenderSprite) {
        this.inputMgr.disable();
        this.animationMgr.playAttackAnimation(
          attackerSprite,
          defenderSprite,
          () => {
            this.animationMgr.playDamageAnimation(defenderSprite);
            // 計算總動畫時間
            const totalTime = GAME_CONFIG.ANIMATION.ATTACK_DURATION * 2 + 200;
            this.time.delayedCall(totalTime, () => {
              this.inputMgr.enable();
            });
          }
        );
      }
      this.selectedUnitId = null;
    }
    console.log(result);
  }

  private handleUnitDeath(unitId: string) {
    const sprite = this.unitRenderer.getUnitSprite(unitId);
    if (sprite) {
      this.animationMgr.playDeathAnimation(sprite, () => {
        this.unitRenderer.removeUnit(unitId);
      });
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
    this.movableAreaGraphics.fillStyle(
      GAME_CONFIG.COLOR.MOVABLE_AREA,
      GAME_CONFIG.COLOR.MOVABLE_AREA_ALPHA
    );
    movableArea.forEach((pos) => {
      this.movableAreaGraphics!.fillRect(
        pos.x * GAME_CONFIG.TILE_SIZE,
        pos.y * GAME_CONFIG.TILE_SIZE,
        GAME_CONFIG.TILE_SIZE,
        GAME_CONFIG.TILE_SIZE
      );
    });
  }
  // 清除可移動範圍顯示
  private clearMovableArea() {
    this.movableAreaGraphics?.clear();
    this.movableAreaGraphics?.destroy();
    this.movableAreaGraphics = undefined;
  }
  // 顯示可攻擊範圍
  private showAttackableArea(unitId: string) {
    // 清除舊有的可攻擊範圍
    this.clearAttackableArea();
    // 取的可攻擊範圍
    const attackableArea = this.pathfindingService.getAttackableArea(
      this.gameService.getGameState(),
      unitId
    );
    // 繪製可攻擊範圍
    this.attackableAreaGraphics = this.add.graphics();
    this.attackableAreaGraphics.fillStyle(
      GAME_CONFIG.COLOR.ATTACKABLE_AREA,
      GAME_CONFIG.COLOR.ATTACKABLE_AREA_ALPHA
    );
    attackableArea.forEach((pos) => {
      this.attackableAreaGraphics!.fillRect(
        pos.x * GAME_CONFIG.TILE_SIZE,
        pos.y * GAME_CONFIG.TILE_SIZE,
        GAME_CONFIG.TILE_SIZE,
        GAME_CONFIG.TILE_SIZE
      );
    });
  }
  // 清除可攻擊範圍顯示
  private clearAttackableArea() {
    this.attackableAreaGraphics?.clear();
    this.attackableAreaGraphics?.destroy();
    this.attackableAreaGraphics = undefined;
  }
}
