import { TargetType } from '../model/skill.model';

export type CommandType = 'MOVE' | 'ATTACK' | 'SKILL' | 'END_TURN';

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

export interface SkillCommand extends BaseCommand {
  type: 'SKILL';
  unitId: string; // 施法者
  skillId: string; // 技能ID
  // targetType: TargetType; // 目標類型
  targetPosition?: { x: number; y: number }; // 目標位置（地格技能）
  // targetRange?: number; // 範圍半徑（範圍技能）
}

export type GameCommand =
  | MoveCommand
  | AttackCommand
  | SkillCommand
  | EndTurnCommand;
