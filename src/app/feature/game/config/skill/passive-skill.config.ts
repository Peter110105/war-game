import {
  Skill,
  SkillType,
  SkillEffectType,
  TriggerTiming,
  TargetType,
} from '../../model/skill.model';

/**
 * 被動技能配置
 */
export const PASSIVE_SKILLS: Record<string, Skill> = {
  /** 狂戰士：攻擊力提升，但防禦力降低 */
  BERSERKER: {
    id: 'berserker',
    name: '狂戰士',
    description: '攻擊力 +30%，防禦力 -10%',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ALWAYS,
    range: 0,
    effects: [
      {
        effectType: SkillEffectType.ATTACK_BOOST,
        value: 0.3,
        targetType: TargetType.SELF,
      },
      {
        effectType: SkillEffectType.DEFENSE_BOOST,
        value: -0.1,
        targetType: TargetType.SELF,
      },
    ],
  },

  /** 鐵壁：高防禦，移動力降低 */
  IRON_WALL: {
    id: 'iron_wall',
    name: '鐵壁',
    description: '防禦力 +40%，移動力 -1',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ALWAYS,
    range: 0,
    effects: [
      {
        effectType: SkillEffectType.DEFENSE_BOOST,
        value: 0.4,
        targetType: TargetType.SELF,
      },
      {
        effectType: SkillEffectType.MOVE_BOOST,
        value: -1,
        targetType: TargetType.SELF,
      },
    ],
  },

  /** 致命一擊：暴擊 + 破甲 */
  CRITICAL_STRIKE: {
    id: 'critical_strike',
    name: '致命一擊',
    description: '15% 機率暴擊並無視 50% 防禦',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ON_ATTACK,
    range: 0,
    effects: [
      {
        effectType: SkillEffectType.CRITICAL_HIT,
        value: 2.0,
        chance: 0.15,
        targetType: TargetType.ENEMY,
      },
      {
        effectType: SkillEffectType.ARMOR_PIERCE,
        value: 0.5,
        chance: 0.15,
        targetType: TargetType.ENEMY,
      },
    ],
  },

  /** 反擊：受到攻擊時反擊並恢復生命 */
  COUNTER: {
    id: 'counter',
    name: '反擊',
    description: '受到近戰攻擊時反擊並恢復 20% 造成傷害的生命',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ON_DEFEND,
    range: 1,
    effects: [
      {
        effectType: SkillEffectType.COUNTER_ATTACK,
        value: 1.0,
        targetType: TargetType.ENEMY,
      },
      {
        effectType: SkillEffectType.LIFE_STEAL,
        value: 0.2,
        targetType: TargetType.SELF,
      },
    ],
  },

  /** 地形適應：移動力提升 + 忽略地形懲罰 */
  TERRAIN_ADAPT: {
    id: 'terrain_adapt',
    name: '地形適應',
    description: '移動力 +1，忽略地形移動消耗',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ALWAYS,
    range: 0,
    effects: [
      {
        effectType: SkillEffectType.MOVE_BOOST,
        value: 1,
        targetType: TargetType.SELF,
      },
      {
        effectType: SkillEffectType.TERRAIN_MASTER,
        value: 1,
        targetType: TargetType.SELF,
      },
    ],
  },

  /** 神速：移動力大幅提升 + 先制攻擊 */
  SWIFT: {
    id: 'swift',
    name: '神速',
    description: '移動力 +2，總是先制攻擊',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ALWAYS,
    range: 0,
    effects: [
      {
        effectType: SkillEffectType.MOVE_BOOST,
        value: 2,
        targetType: TargetType.SELF,
      },
      {
        effectType: SkillEffectType.FIRST_STRIKE,
        value: 1,
        targetType: TargetType.SELF,
      },
    ],
  },

  /** 再生：每回合恢復生命 */
  REGENERATION: {
    id: 'regeneration',
    name: '再生',
    description: '每回合恢復 10% 最大生命值',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ON_TURN_START,
    range: 0,
    effects: [
      {
        effectType: SkillEffectType.REGENERATION,
        value: 0.1,
        targetType: TargetType.SELF,
      },
    ],
  },

  /** 吸血鬼：生命偷取 + 攻擊力提升 */
  VAMPIRE: {
    id: 'vampire',
    name: '吸血',
    description: '攻擊力 +15%，偷取 30% 造成傷害的生命',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ON_ATTACK,
    range: 0,
    effects: [
      {
        effectType: SkillEffectType.ATTACK_BOOST,
        value: 0.15,
        targetType: TargetType.SELF,
      },
      {
        effectType: SkillEffectType.LIFE_STEAL,
        value: 0.3,
        targetType: TargetType.SELF,
      },
    ],
  },
};
