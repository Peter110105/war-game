export type CommandType = 'MOVE' | 'ATTACK' | 'END_TURN';

export interface BaseCommand {
  id: string;
  type: CommandType;
  playerId: string;
  timestamp?: number;
}

export interface MoveCommand extends BaseCommand {
  type: 'MOVE';
  unitId: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface EndTurnCommand extends BaseCommand {
  type: 'END_TURN';
  playerId: string;
}

export interface AttackCommand extends BaseCommand {
  type: 'ATTACK';
  unitId: string;
  targetId: string; // 被攻擊的單位 ID
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export type GameCommand = MoveCommand | AttackCommand| EndTurnCommand;
