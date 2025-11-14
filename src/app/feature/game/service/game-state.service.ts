import { Injectable } from '@angular/core';
import { GameState } from '../model/game-state.model'
import { GameCommand } from '../command/command.interface';
import { MovementProcessor } from '../processor/movement-processor';

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
        { id: 'u1', name: '劍士', type: 'soldier', ownerId: 'p1', x: 1, y: 1, hp: 10, maxHp: 10, attack: 3, defense: 2, move: 3, range: 1, alive: true },
        { id: 'u2', name: '弓兵', type: 'archer', ownerId: 'p2', x: 6, y: 4, hp: 8, maxHp: 8, attack: 2, defense: 1, move: 2, range: 2, alive: true },
      ],
      currentPlayerId: 'p1',
      players: [
        { id: 'p1', name: 'Player 1', team: 'P1', aiControlled: false },
        { id: 'p2', name: 'Player 2', team: 'P2', aiControlled: false }
      ],
      turn: 1,
    };
  }

  getUnits() {
    return this.state.units;
  }

  getUnitAt(x: number, y: number) {
    return this.state.units.find(u => u.x === x && u.y === y && u.alive);
  }

  get currentPlayerId() {
    return this.state.currentPlayerId;
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
