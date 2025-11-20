import { Injectable } from '@angular/core';
import { GameStateLoaderService } from '../../../core/service/game-state-loader.service';
import { GameEventService, GameEventType } from './game-event.service';
import { GameState } from '../model/game-state.model'
import { GameCommand } from '../command/command.interface';
import { MovementProcessor } from '../processor/movement-processor';
import { CombatProcessor } from '../processor/combat-processor';
import { Unit } from '../model/unit.model';
import { Player } from '../model/player.model';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private state!: GameState;

  constructor(
    private eventService: GameEventService,
    private movementProcessor: MovementProcessor,
    private combatProcessor: CombatProcessor,
    private gameStateLoaderService: GameStateLoaderService
  ) {
    this.state = this.createDefaultState(); // 先給預設值
    // 非同步加載資料
    this.gameStateLoaderService.loadInitialState().subscribe((state) => {
      this.state = state;
    });
  }

  get turn(): number {
    return this.state.turn;
  }
  get currentPlayerId(): string {
    return this.getCurrentPlayer().id;
  }

  public getUnits(): Unit[] {
    return this.state.units;
  }
  /**
   * @param x 座標
   * @param y 座標
   * @returns 單位 或 undefined
   */
  public getUnitAt(x: number, y: number): Unit | undefined {
    return this.state.units.find((u) => u.x === x && u.y === y && u.alive);
  }
  /**
   * 透過ID取得單位
   * @param unitId 單位ID
   * @returns 單位 或 undefined
   */
  public getUnitById(unitId: string): Unit | undefined {
    return this.state.units.find((u) => u.id === unitId);
  }
  /**
   * 取得遊戲狀態
   */
  public getGameState(): GameState {
    return this.state;
  }

  /**
   *
   * @returns 當前行動玩家
   */
  public getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  // 結束回合
  public endTurn() {
    // 1. 切換玩家
    this.state.currentPlayerIndex =
      (this.state.currentPlayerIndex + 1) % this.state.players.length;

    // 2. 增加回合數（每當 P1 回合開始時增加）
    if (this.state.currentPlayerIndex === 0) {
      this.state.turn++;
    }
    // 3. 重置單位狀態
    this.resetPlayerActions(this.getCurrentPlayer().id);

    // 4. 發出回合結束事件
    this.eventService.emit({
      type: GameEventType.TURN_ENDED,
      data: {
        turn: this.state.turn,
        currentPlayerId: this.getCurrentPlayer().id,
      },
    });
  }

  public execute(cmd: GameCommand) {
    if (cmd.type === 'MOVE') {
      return this.movementProcessor.execute(this.state, cmd);
    }
    if (cmd.type === 'ATTACK') {
      return this.combatProcessor.execute(this.state, cmd);
    }

    if (cmd.type === 'END_TURN') {
      // 1. 檢查是否輪到該玩家
      if (cmd.playerId !== this.getCurrentPlayer().id)
        return { success: false, message: 'not your turn' };

      // 2. 結束回合
      this.endTurn();
      return { success: true, message: 'end turn success' };
    }

    return { success: false, message: 'unknown command' };
  }

  /**
   * 重置該玩家所有單位的行動狀態
   * @param playerId 玩家ID
   */
  public resetPlayerActions(playerId: string) {
    this.state.units
      .filter((u) => u.ownerId === playerId && u.alive)
      .forEach((u) => {
        u.actionState = {
          hasMoved: false,
          hasAttacked: false,
          canAct: true,
        };
      });
  }

  // 標記單位為已移動
  public setUnitMoved(unitId: string) {
    const unit = this.state.units.find((u) => u.id === unitId);
    if (unit) {
      unit.actionState.hasMoved = true;
    }
  }

  /**
   * @param unitId 單位ID
   * @returns 單位是否可行動
   */
  public canUnitAct(unitId: string): boolean {
    const unit = this.state.units.find((u) => u.id === unitId);
    return unit?.actionState.canAct ?? false;
  }
  /**
   * @param unitId 單位ID
   * @returns 單位是否可移動
   */
  public canUnitMove(unitId: string): boolean {
    const unit = this.state.units.find((u) => u.id === unitId);
    if (!unit) return false;

    return unit.actionState.canAct && !unit.actionState.hasMoved;
  }
  private createDefaultState(): GameState {
    return {
      width: 8,
      height: 6,
      tiles: [],
      units: [],
      players: [],
      currentPlayerIndex: 0,
      turn: 1,
    };
  }
}
