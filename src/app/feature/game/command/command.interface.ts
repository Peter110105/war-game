export type CommandType = 'MOVE' | 'END_TURN';

export interface BaseCommand {
  // id: string;
  type: CommandType;
  playerId: string;
  // timestamp: number;
}

export interface MoveCommand extends BaseCommand {
  type: 'MOVE';
  unitId?: string;
  to: { x: number; y: number };
}

export interface EndTurnCommand extends BaseCommand {
  type: 'END_TURN';
}

export type GameCommand = MoveCommand | EndTurnCommand;
