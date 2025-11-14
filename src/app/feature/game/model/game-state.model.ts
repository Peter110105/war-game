import { Player } from "./player.model";
import { Tile } from "./tile.model";
import { Unit } from "./unit.model";

export interface GameState {
  turn: number;              // 第幾回合
  currentPlayerId: string;   // 現在行動的玩家
  // phase: 'select' | 'move' | 'attack' | 'end';  // 階段
  selectedUnitId?: string;   // 當前選取單位
  tiles: Tile[];
  units: Unit[];
  players: Player[];
  width: number;
  height: number;
}