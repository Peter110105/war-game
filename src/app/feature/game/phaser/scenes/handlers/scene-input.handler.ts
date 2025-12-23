import Phaser from 'phaser';
import { Subscription } from 'rxjs';
import { GameStateService } from '../../../state/game-state.service';
import {
  GameEventService,
  GameEventType,
} from '../../../state/game-event.service';
import { PathfindingService } from '../../../movement/path-finding.service';
import { GameCommand } from '../../../command/command.interface';
import { Unit } from '../../../model/unit.model';
import { UnitRendererManager } from '../../managers/rendering/unit-renderer.manager';
import { AnimationManager } from '../../managers/animation.manager';
import { InputManager } from '../../managers/input.manager';
import { GAME_CONFIG } from '../../../config/game/game.config';
import { SkillService } from '../../../skill/skill.service';
import { TerrainRendererManager } from '../../managers/rendering/terrain-renderer.manager';

/**
 * 場景輸入處理器
 * 職責：處理所有玩家輸入和模式切換
 */
export class SceneInputHandler {
  private currentMode: 'idle' | 'move' | 'attack' = 'idle'; // 模式
  private selectedUnitId: string | null = null;

  private movableAreaGraphics?: Phaser.GameObjects.Graphics; // 可移動範圍圖形
  private attackableAreaGraphics?: Phaser.GameObjects.Graphics; // 可攻擊範圍圖形
  private unitTooltip?: Phaser.GameObjects.Text; // 單位提示文字
  private terrainTooltip?: Phaser.GameObjects.Text; // 地形提示文字

  private eventSubscription?: Subscription;

  constructor(
    private scene: Phaser.Scene,
    private gameService: GameStateService,
    private eventService: GameEventService,
    private pathfindingService: PathfindingService,
    private skillService: SkillService,
    private unitRenderer: UnitRendererManager,
    private animationMgr: AnimationManager,
    private inputMgr: InputManager,
    private terrainRenderer: TerrainRendererManager
  ) {}

  /**
   * 設置輸入監聽器
   */
  public setupInputListeners(): void {
    // 點擊事件
    this.inputMgr.onPointerDown((x, y) => {
      this.handleClick(x, y);
    });

    // 滑鼠移動事件
    this.inputMgr.onPointerMove((x, y) => {
      this.showUnitTooltip(x, y);
      this.showTerrainTooltip(x, y);
    });

    // 訂閱玩家動作事件
    this.subscribeToPlayerActions();
  }

  /**
   * 訂閱玩家動作事件（模式切換）
   */
  private subscribeToPlayerActions(): void {
    this.eventSubscription = this.eventService.events$.subscribe((event) => {
      switch (event.type) {
        case GameEventType.PLAYER_ACTION_MOVED:
          this.currentMode = 'move';
          this.showMovableArea(event.data.unitId);
          this.clearAttackableArea();

          break;
        case GameEventType.PLAYER_ACTION_ATTACKED:
          this.currentMode = 'attack';
          this.showAttackableArea(event.data.unitId);
          this.clearMovableArea();
          break;
        case GameEventType.PLAYER_ACTION_WAIT:
        case GameEventType.PLAYER_ACTION_CANCELLED:
          this.resetMode();
          break;
        case GameEventType.TURN_ENDED:
          this.resetMode();
          break;
      }
    });
  }
  /**
   * 處理點擊
   */
  private handleClick(x: number, y: number) {
    const currentPlayerId = this.gameService.currentPlayerId;
    const clickedUnit = this.gameService.getUnitAt(x, y);

    if (this.currentMode === 'idle') {
      this.handleIdleClick(x, y, clickedUnit, currentPlayerId);
    } else if (this.currentMode === 'move') {
      this.handleMoveClick(x, y, clickedUnit);
    } else if (this.currentMode === 'attack') {
      this.handleAttackClick(clickedUnit, currentPlayerId);
    }
  }

  /**
   * 處理 Idle 模式點擊
   */
  private handleIdleClick(
    x: number,
    y: number,
    clickedUnit: Unit | undefined,
    currentPlayerId: string
  ): void {
    if (clickedUnit) {
      // 發送選擇事件（顯示資訊面板）
      this.eventService.emit({
        type: GameEventType.UNIT_SELECTED,
        data: { x, y },
      });

      // 只有我方單位才能操控
      if (clickedUnit.ownerId === currentPlayerId) {
        if (
          clickedUnit.actionState.hasMoved &&
          clickedUnit.actionState.hasAttacked
        ) {
          console.log('該單位本回合已行動過');
          return;
        }
        if (clickedUnit.actionState.isStunned) {
          console.log('該單位被暈眩，無法行動');
          return;
        }
        this.selectedUnitId = clickedUnit.id;
        this.showMovableArea(clickedUnit.id);
        this.showAttackableArea(clickedUnit.id);
        console.log(`選擇單位: ${clickedUnit.name}`);
        return;
      } else {
        console.log(`查看敵方單位: ${clickedUnit.name}`);
      }
    }
  }

  /**
   * 處理移動模式點擊
   */
  private handleMoveClick(
    x: number,
    y: number,
    clickedUnit: Unit | undefined
  ): void {
    if (!this.selectedUnitId) return;
    if (clickedUnit) {
      console.log('該位置有單位:', clickedUnit.name);
      return;
    }
    const selectedUnit = this.gameService.getUnitById(this.selectedUnitId)!;
    this.executeMove(selectedUnit, x, y);
  }

  /**
   * 處理攻擊模式點擊
   */
  private handleAttackClick(
    clickedUnit: Unit | undefined,
    currentPlayerId: string
  ): void {
    if (!this.selectedUnitId) return;

    if (!clickedUnit) {
      console.log('請點擊敵方單位');
      return;
    }
    if (clickedUnit.ownerId === currentPlayerId) {
      console.log('不能攻擊己方單位');
      return;
    }

    const selectedUnit = this.gameService.getUnitById(this.selectedUnitId)!;
    this.executeAttack(selectedUnit, clickedUnit);
  }

  /**
   * 執行移動
   */
  private executeMove(
    selectedUnit: Unit,
    targetX: number,
    targetY: number
  ): void {
    const path = this.pathfindingService.findPath(
      this.gameService.getGameState(),
      { x: selectedUnit.x, y: selectedUnit.y },
      { x: targetX, y: targetY },
      selectedUnit.id
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
      this.clearAllAreas();

      const sprite = this.unitRenderer.getUnitSprite(this.selectedUnitId!);
      if (sprite) {
        this.inputMgr.disable();
        this.animationMgr.playPathAnimation(sprite, path, () => {
          this.inputMgr.enable();
        });
      }
      this.resetMode();
    }
    console.log(result);
  }

  /**
   * 執行攻擊
   */
  private executeAttack(attacker: Unit, defender: Unit): void {
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
      this.clearAllAreas();

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
            const totalTime = GAME_CONFIG.ANIMATION.ATTACK_DURATION * 2 + 200; // TEST
            this.scene.time.delayedCall(totalTime, () => {
              this.inputMgr.enable();
            });
          }
        );
      }
      this.resetMode();
    }
    console.log(result);
  }

  /**
   * 顯示可移動範圍
   */
  private showMovableArea(unitId: string): void {
    this.clearMovableArea();

    // 取的可移動範圍
    const movableArea = this.pathfindingService.getMovableArea(
      this.gameService.getGameState(),
      unitId
    );

    // 繪製可移動範圍
    this.movableAreaGraphics = this.scene.add.graphics();
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

  /**
   * 顯示可攻擊範圍
   */
  private showAttackableArea(unitId: string): void {
    this.clearAttackableArea();

    // 取的可攻擊範圍
    const attackableArea = this.pathfindingService.getAttackableArea(
      this.gameService.getGameState(),
      unitId
    );
    // 繪製可攻擊範圍
    this.attackableAreaGraphics = this.scene.add.graphics();
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

  /**
   * 顯示單位提示文字
   */
  private showUnitTooltip(x: number, y: number) {
    const unit = this.gameService.getUnitAt(x, y);
    if (unit) {
      if (!this.unitTooltip) {
        this.unitTooltip = this.scene.add.text(0, 0, '', {
          font: GAME_CONFIG.TEXT.FONT_FAMILY,
          fontSize: GAME_CONFIG.TEXT.FONT_SIZE,
          color: GAME_CONFIG.TEXT.COLOR,
          backgroundColor: GAME_CONFIG.TEXT.BACKGROUND,
          padding: { x: 8, y: 6 },
        });
        this.unitTooltip.setDepth(1000);
      }
      // 計算增強後的屬性
      const enhancedAttack = this.skillService.getEnhancedAttack(unit);
      const enhancedDefense = this.skillService.getEnhancedDefense(unit);

      // 構建提示文字
      let tooltipText = `${unit.name} Lv.${unit.levelInfo.level}\n`;
      tooltipText += `HP: ${unit.stats.hp}/${unit.stats.maxHp}\n`;
      tooltipText += `攻擊: ${enhancedAttack}`;
      if (enhancedAttack !== unit.stats.attack) {
        tooltipText += ` (${unit.stats.attack})`;
      }
      tooltipText += `\n防禦: ${enhancedDefense}`;
      if (enhancedDefense !== unit.stats.defense) {
        tooltipText += ` (${unit.stats.defense})`;
      }

      // 顯示當前效果
      if (unit.activeEffects.length > 0) {
        tooltipText += '\n---';
        const effectDescriptions =
          this.skillService.getActiveEffectsDescription(unit);
        effectDescriptions.forEach((desc) => {
          tooltipText += `\n${desc}`;
        });
      }
      this.unitTooltip.setText(tooltipText);
      this.unitTooltip.setPosition(
        x * GAME_CONFIG.TILE_SIZE + 10,
        y * GAME_CONFIG.TILE_SIZE + 10
      );
      this.unitTooltip.setVisible(true);
    } else {
      this.unitTooltip?.setVisible(false);
    }
  }

  /**
   * 顯示地形提示文字
   */
  private showTerrainTooltip(x: number, y: number) {
    // 如果該位置有單位，不顯示地形資訊
    const unit = this.gameService.getUnitAt(x, y);
    if (unit) {
      this.terrainTooltip?.setVisible(false);
      return;
    }

    const gameState = this.gameService.getGameState();
    const tile = gameState.tiles.find((tile) => tile.x === x && tile.y === y);
    if (tile) {
      if (!this.terrainTooltip) {
        this.terrainTooltip = this.scene.add.text(0, 0, '', {
          font: GAME_CONFIG.TEXT.FONT_FAMILY,
          fontSize: 14,
          color: GAME_CONFIG.TEXT.COLOR,
          backgroundColor: '#1a1a1a',
          padding: { x: 8, y: 6 },
        });
        this.terrainTooltip.setDepth(999);
      }

      const terrainInfo = this.terrainRenderer.getTerrainInfo(
        tile.terrain.terrainType
      );
      const defenseText =
        terrainInfo.defenseBonus > 0
          ? `+${(terrainInfo.defenseBonus * 100).toFixed(0)}%`
          : '0%';
      this.terrainTooltip.setText(
        `${terrainInfo.emoji} ${terrainInfo.name}\n移動消耗: ${terrainInfo.moveCost}\n防禦加成: ${defenseText}`
      );
      this.terrainTooltip.setPosition(
        x * GAME_CONFIG.TILE_SIZE + 10,
        y * GAME_CONFIG.TILE_SIZE + 40
      );
      this.terrainTooltip.setVisible(true);
    } else {
      this.terrainTooltip?.setVisible(false);
    }
  }

  /**
   * 清除可移動範圍
   */
  private clearMovableArea(): void {
    this.movableAreaGraphics?.clear();
    this.movableAreaGraphics?.destroy();
    this.movableAreaGraphics = undefined;
  }

  /**
   * 清除可攻擊範圍
   */
  private clearAttackableArea(): void {
    this.attackableAreaGraphics?.clear();
    this.attackableAreaGraphics?.destroy();
    this.attackableAreaGraphics = undefined;
  }

  /**
   * 清除所有範圍顯示
   */
  private clearAllAreas(): void {
    this.clearMovableArea();
    this.clearAttackableArea();
  }

  /**
   * 重置模式
   */
  private resetMode(): void {
    this.currentMode = 'idle';
    this.selectedUnitId = null;
    this.clearAllAreas();
  }

  /**
   * 清理訂閱
   */
  public destroy(): void {
    this.eventSubscription?.unsubscribe();
  }
}
