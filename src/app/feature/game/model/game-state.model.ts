import { Player } from "./player.model";
import { Tile } from "./tile.model";
import { Unit } from "./unit.model";

export interface GameState {
  width: number;
  height: number;
  tiles: Tile[];
  units: Unit[];
  currentPlayerId: string;   // 現在行動的玩家
  turn: number;              // 第幾回合
  // phase: 'select' | 'move' | 'attack' | 'end';  // 階段
  // selectedUnitId?: string;   // 當前選取單位
  // players: Player[];
}