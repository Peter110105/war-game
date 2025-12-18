import { Skill, SkillEffectType } from './skill.model';

/**
 * 單位類型
 */
export enum UnitType {
  SOLDIER = 'SOLDIER',
  ARCHER = 'ARCHER',
  KNIGHT = 'KNIGHT',
  MAGE = 'MAGE',
  CAVALRY = 'CAVALRY',
  FLYER = 'FLYER',
  HEALER = 'HEALER',
}

/**
 * 單位經驗和等級
 */
export interface UnitLevel {
  level: number; // 當前等級
  exp: number; // 當前經驗值
  expToNext: number; // 升級所需經驗
  maxLevel: number; // 最高等級
}

/**
 * 單位成長率（每次升級的成長）
 */
export interface GrowthRates {
  hp: number; // HP 成長
  attack: number; // 攻擊力成長
  defense: number; // 防禦力成長
  mana: number; // 魔力成長
}

/**
 * 單位屬性
 */
export interface UnitStats {
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  move: number;
  range: number;
  mana?: number; // 魔力值（某些單位）
  maxMana?: number; // 最大魔力值
}

/**
 * 當前生效的 Buff/Debuff
 */
export interface ActiveEffect {
  effectType: SkillEffectType;
  value: number;
  duration: number; // 剩餘回合數
  sourceSkillId: string; // 來源技能 ID
  sourcUnitId: string; // 來源單位 ID
}

/**
 * 單位介面
 */
export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  ownerId: string;
  x: number;
  y: number;

  stats: UnitStats;
  levelInfo: UnitLevel;
  growthRates: GrowthRates;

  // 技能列表
  skills: Skill[];

  // 當前生效的效果
  activeEffects: ActiveEffect[];

  alive: boolean;

  actionState: {
    hasMoved: boolean;
    hasAttacked: boolean;
    canAct: boolean;
    isStunned?: boolean; // 是否被暈眩
  };

  characteristics?: {
    canFly?: boolean;
    ignoresTerrain?: boolean;
    canHeal?: boolean;
  };
}

/**
 * 單位配置
 */
export interface UnitConfig {
  type: UnitType;
  name: string;
  baseStats: UnitStats;
  growthRates: GrowthRates;
  skills: Skill[];
  characteristics?: {
    canFly?: boolean;
    ignoresTerrain?: boolean;
    canHeal?: boolean;
  };
}
