import { Injectable } from '@angular/core';
import { GameState } from '../model/game-state.model'
import { GameCommand } from '../command/command.interface';
import { MovementProcessor } from '../processor/movement-processor';
import { Unit } from '../model/unit.model';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private state: GameState;
  private movement = new MovementProcessor();

  constructor() {
    this.state = {
      width: 8,
      height: 6,
      tiles: [],
      units: [
        { id: 'u1', name: '劍士', type: 'soldier', ownerId: 'p1', x: 1, y: 1, hp: 10, maxHp: 10, attack: 3, defense: 2, move: 3, range: 1, alive: true, actionState: { hasMoved: false, hasAttacked: false, canAct: true }},
        { id: 'u2', name: '弓兵', type: 'archer', ownerId: 'p2', x: 6, y: 4, hp: 8, maxHp: 8, attack: 2, defense: 1, move: 2, range: 2, alive: true, actionState: { hasMoved: false, hasAttacked: false, canAct: true } },
      ],
      currentPlayerId: 'p1',
      // players: [
      //   { id: 'p1', name: 'Player 1', team: 'P1', aiControlled: false },
      //   { id: 'p2', name: 'Player 2', team: 'P2', aiControlled: false }
      // ],
      turn: 1,
    };
  }

  getUnits(): Unit[]{
    return this.state.units;
  }

  getUnitAt(x: number, y: number): Unit | undefined {
    return this.state.units.find(u => u.x === x && u.y === y && u.alive);
  }

  // 重置所有單位狀態 (回合開始時呼叫)
  resetUnitsActionState(playerId: string) {
    this.state.units
      .filter(u => u.ownerId === playerId && u.alive)
      .forEach(u => {
        u.actionState = {
          hasMoved: false,
          hasAttacked: false,
          canAct: true
        };
      });
  }
  
  // 檢查單位是否可行動
  canUnitAct(unitId: string): boolean {
    const unit = this.state.units.find(u => u.id === unitId);
    return unit?.actionState.canAct ?? false;
  }

  get currentPlayerId(): string {
    return this.state.currentPlayerId;
  }

  get turn(): number {
    return this.state.turn;
  }

  execute(cmd: GameCommand) {
    if(cmd.type === 'MOVE'){
      return this.movement.execute(this.state, cmd);
    }
    
    if(cmd.type === 'END_TURN'){
      this.state.turn++;
      this.state.currentPlayerId = this.state.currentPlayerId === 'p1' ? 'p2' : 'p1';
      return {success: true, message: 'end turn success'};
    }

    return {success: false, message: 'unknown command'}
  }
}
