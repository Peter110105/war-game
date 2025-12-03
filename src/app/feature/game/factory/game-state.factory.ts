import { Injectable } from '@angular/core';
import { Unit } from '../model/unit.model';
import { Player } from '../model/player.model';
import { GameState } from '../model/game-state.model';

@Injectable({ providedIn: 'root' })
export class GameStateFactory {
  constructor() {}

  /**
   * 建立新遊戲狀態
   * @param width 地圖寬度
   * @param height 地圖高度
   * @param units 單位列表
   * @param players 玩家列表
   */
  public createNewGame(
    width: number = 8,
    height: number = 8,
    units: Unit[] = [],
    players: Player[] = []
  ): GameState {
    return {
      width,
      height,
      tiles: [],
      units,
      players,
      currentPlayerIndex: 0,
      turn: 0,
    };
  }

  /**
   * 建立預設單位
   */
  public createDefaultUnits(): Unit[] {
    return [
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
    ];
  }
  /**
   * 建立預設玩家
   */
  public createDefaultPlayers(): Player[] {
    return [
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
    ];
  }

  /**
   * 從配置建立遊戲狀態 (用於關卡系統)
   * @param config 關卡配置
   */
  public createGameFromConfig(config: any): GameState {
    const width = config.width || 8;
    const height = config.height || 8;
    const units = config.units || this.createDefaultUnits();
    const players = config.players || this.createDefaultPlayers();

    return this.createNewGame(width, height, units, players);
  }

  /**
   * 建立完整預設遊戲
   */
  public createDefaultGame(): GameState {
    return this.createNewGame(
      8,
      8,
      this.createDefaultUnits(),
      this.createDefaultPlayers()
    );
  }
}
