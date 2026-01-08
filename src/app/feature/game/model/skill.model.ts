import { UnitType } from './unit.model';

/**
 * 技能類型
 */
export enum SkillType {
  PASSIVE = 'PASSIVE',
  ACTIVE = 'ACTIVE',
}
/**
 * 技能效果類型
 */
export enum SkillEffectType {
  // 屬性修改類
  ATTACK_BOOST = 'ATTACK_BOOST', // 攻擊力加成
  DEFENSE_BOOST = 'DEFENSE_BOOST', // 防禦力加成
  HP_BOOST = 'HP_BOOST', // 生命值加成
  MOVE_BOOST = 'MOVE_BOOST', // 移動力加成
  RANGE_BOOST = 'RANGE_BOOST', // 射程加成

  // 戰鬥效果類
  CRITICAL_HIT = 'CRITICAL_HIT', // 暴擊
  COUNTER_ATTACK = 'COUNTER_ATTACK', // 反擊
  FIRST_STRIKE = 'FIRST_STRIKE', // 先制攻擊
  DOUBLE_ATTACK = 'DOUBLE_ATTACK', // 連續攻擊
  LIFE_STEAL = 'LIFE_STEAL', // 生命偷取
  ARMOR_PIERCE = 'ARMOR_PIERCE', // 破甲

  // 地形和移動類
  TERRAIN_MASTER = 'TERRAIN_MASTER', // 地形大師
  IGNORE_TERRAIN = 'IGNORE_TERRAIN', // 忽略地形
  FLY = 'FLY', // 飛行
  TELEPORT_ABILITY = 'TELEPORT_ABILITY', // 傳送能力

  // 治療和輔助類
  HEAL = 'HEAL', // 治療
  REGENERATION = 'REGENERATION', // 再生
  BUFF_ATTACK = 'BUFF_ATTACK', // 提升攻擊力
  BUFF_DEFENSE = 'BUFF_DEFENSE', // 提升防禦力
  BUFF_MOVE = 'BUFF_MOVE', // 提升移動力
  CLEANSE = 'CLEANSE', // 淨化負面效果

  // 範圍和特殊效果類
  AREA_ATTACK = 'AREA_ATTACK', // 範圍攻擊
  SPLASH_DAMAGE = 'SPLASH_DAMAGE', // 濺射傷害
  CHAIN_ATTACK = 'CHAIN_ATTACK', // 連鎖攻擊
  STUN = 'STUN', // 暈眩
  SLOW = 'SLOW', // 減速
  POISON = 'POISON', // 中毒
  BURN = 'BURN', // 灼燒

  // 防禦和保護類
  SHIELD = 'SHIELD', // 護盾
  DAMAGE_REDUCTION = 'DAMAGE_REDUCTION', // 傷害減免
  EVASION = 'EVASION', // 閃避
  IMMUNITY = 'IMMUNITY', // 免疫
  REFLECT_DAMAGE = 'REFLECT_DAMAGE', // 反傷

  // 特殊機制類
  SUMMON = 'SUMMON', // 召喚
  SACRIFICE = 'SACRIFICE', // 犧牲
  TRANSFORM = 'TRANSFORM', // 變身
  RESURRECT = 'RESURRECT', // 復活
}

/**
 * 目標類型
 */
export enum TargetType {
  /** 自己 */
  SELF = 'SELF',
  /** 友軍單位 */
  ALLY = 'ALLY',
  /** 所有友軍 */
  ALLY_ALL = 'ALLY_ALL',
  /** 敵方單位 */
  ENEMY = 'ENEMY',
  /** 所有敵方 */
  ENEMY_ALL = 'ENEMY_ALL',
  /** 任意單位 */
  ANY = 'ANY',
  /** 範圍內所有單位 */
  AREA = 'AREA',
  /** 地格 */
  TILE = 'TILE',
}

/**
 * 觸發時機
 */
export enum TriggerTiming {
  /** 始終生效（被動） */
  ALWAYS = 'ALWAYS',
  /** 攻擊時 */
  ON_ATTACK = 'ON_ATTACK',
  /** 防禦時 */
  ON_DEFEND = 'ON_DEFEND',
  /** 擊殺時 */
  ON_KILL = 'ON_KILL',
  /** 受傷時 */
  ON_DAMAGED = 'ON_DAMAGED',
  /** 回合開始時 */
  ON_TURN_START = 'ON_TURN_START',
  /** 回合結束時 */
  ON_TURN_END = 'ON_TURN_END',
  /** 移動時 */
  ON_MOVE = 'ON_MOVE',
  /** 生命值低於閾值時 */
  ON_HP_LOW = 'ON_HP_LOW',
  /** 手動觸發（主動技能） */
  MANUAL = 'MANUAL',
}

/**
 * 技能效果（單個效果）
 */
export interface SkillEffect {
  /** 技能效果類型）*/
  effectType: SkillEffectType;
  /** 效果數值（加成、傷害、治療量等）*/
  value?: number;
  /** 持續回合數（buff/debuff）*/
  duration?: number;
  /** 觸發機率（0-1）*/
  chance?: number;
  /** 目標類型 */
  targetType: TargetType;

  /** 觸發條件 */
  condition?: SkillCondition;
}

/**
 * 技能條件
 */
export interface SkillCondition {
  /** 最低 HP 百分比 */
  minHpPercent?: number;
  /** 最高 HP 百分比 */
  maxHpPercent?: number;
  /** 需要的地形類型 */
  requiredTerrain?: string[];
  /** 需要的單位類型 */
  requiredUnitType?: UnitType[];
  /** 最低等級 */
  minLevel?: number;
  /** 附近友軍數量 */
  nearAllyCount?: number;
  /** 附近敵人數量 */
  nearEnemyCount?: number;
}

/**
 * 技能介面（支持多效果）
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;

  /** 技能效果列表（支持多個效果） */
  effects: SkillEffect[];

  /** 技能觸發時機 */
  trigger: TriggerTiming;

  /** 技能範圍 */
  range: number;

  // 主動技能相關
  /** 冷卻回合數 */
  cooldown?: number;
  /** 當前冷卻 */
  currentCooldown?: number;
  /** 魔力消耗 */
  manaCost?: number;

  // 技能等級（未來擴展）
  level?: number;
  maxLevel?: number;
}
