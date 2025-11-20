import { Injectable } from '@angular/core';
import { GameState } from '../model/game-state.model'
import { GameCommand } from '../command/command.interface';
import { MovementProcessor } from '../processor/movement-processor';
import { Unit } from '../model/unit.model';
import { Player } from '../model/player.model';
import { GameEventService, GameEventType } from './game-event.service';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private state: GameState;

  constructor(private eventService: GameEventService, private movementProcessor: MovementProcessor) {
    this.state = {
      width: 10,
      height: 10,
      tiles: [],
      units: [
        {
          id: 'u1',
          name: '劍士',
          type: 'soldier',
          ownerId: 'p1',
          x: 1,
          y: 1,
          hp: 10,
          maxHp: 10,
          attack: 3,
          defense: 2,
          move: 3,
          range: 1,
          alive: true,
          actionState: { hasMoved: false, hasAttacked: false, canAct: true },
        },
        {
          id: 'u2',
          name: '弓兵',
          type: 'archer',
          ownerId: 'p2',
          x: 6,
          y: 4,
          hp: 8,
          maxHp: 8,
          attack: 2,
          defense: 1,
          move: 2,
          range: 2,
          alive: true,
          actionState: { hasMoved: false, hasAttacked: false, canAct: true },
        },
      ],
      currentPlayerIndex: 0,
      players: [
        {
          id: 'p1',
          name: 'Player 1',
          team: 'P1',
          aiControlled: false,
          isActive: true,
        },
        {
          id: 'p2',
          name: 'Player 2',
          team: 'P2',
          aiControlled: false,
          isActive: false,
        },
      ],
      turn: 1,
    };
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
}
