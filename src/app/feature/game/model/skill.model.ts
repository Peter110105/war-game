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
  SELF = 'SELF', // 自己
  ALLY = 'ALLY', // 友軍單位
  ALLY_ALL = 'ALLY_ALL', // 所有友軍
  ENEMY = 'ENEMY', // 敵方單位
  ENEMY_ALL = 'ENEMY_ALL', // 所有敵方
  ANY = 'ANY', // 任意單位
  AREA = 'AREA', // 範圍內所有單位
  TILE = 'TILE', // 地格
}

/**
 * 觸發時機
 */
export enum TriggerTiming {
  ALWAYS = 'ALWAYS', // 始終生效（被動）
  ON_ATTACK = 'ON_ATTACK', // 攻擊時
  ON_DEFEND = 'ON_DEFEND', // 防禦時
  ON_KILL = 'ON_KILL', // 擊殺時
  ON_DAMAGED = 'ON_DAMAGED', // 受傷時
  ON_TURN_START = 'ON_TURN_START', // 回合開始時
  ON_TURN_END = 'ON_TURN_END', // 回合結束時
  ON_MOVE = 'ON_MOVE', // 移動時
  ON_HP_LOW = 'ON_HP_LOW', // 生命值低於閾值時
  MANUAL = 'MANUAL', // 手動觸發（主動技能）
}

/**
 * 技能效果（單個效果）
 */
export interface SkillEffect {
  effectType: SkillEffectType;
  value?: number; // 效果數值（加成、傷害、治療量等）
  duration?: number; // 持續回合數（buff/debuff）
  chance?: number; // 觸發機率（0-1）
  targetType: TargetType; // 目標類型
  range?: number; // 效果範圍
  condition?: SkillCondition; // 觸發條件
}

/**
 * 技能條件
 */
export interface SkillCondition {
  minHpPercent?: number; // 最低 HP 百分比
  maxHpPercent?: number; // 最高 HP 百分比
  requiredTerrain?: string[]; // 需要的地形類型
  requiredUnitType?: UnitType[]; // 需要的單位類型
  minLevel?: number; // 最低等級
  nearAllyCount?: number; // 附近友軍數量
  nearEnemyCount?: number; // 附近敵人數量
}

/**
 * 技能介面（支持多效果）
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;

  // 技能效果列表（支持多個效果）
  effects: SkillEffect[];

  // 技能觸發時機
  trigger: TriggerTiming;

  // 主動技能相關
  cooldown?: number; // 冷卻回合數
  currentCooldown?: number; // 當前冷卻
  manaCost?: number; // 魔力消耗

  // 技能等級（未來擴展）
  level?: number;
  maxLevel?: number;
}
