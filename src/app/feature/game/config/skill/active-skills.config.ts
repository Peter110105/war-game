import {
  Skill,
  SkillType,
  SkillEffectType,
  TriggerTiming,
  TargetType,
} from '../../model/skill.model';

/**
 * 主動技能配置
 */
export const ACTIVE_SKILLS: Record<string, Skill> = {
  /** 治療術：治療 + 淨化負面效果 */
  HEAL: {
    id: 'heal',
    name: '治療術',
    description: '恢復目標 40 HP 並淨化所有負面效果',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    range: 2,
    cooldown: 2,
    currentCooldown: 0,
    manaCost: 15,
    effects: [
      {
        effectType: SkillEffectType.HEAL,
        value: 40,
        targetType: TargetType.ALLY,
      },
      {
        effectType: SkillEffectType.CLEANSE,
        value: 1,
        targetType: TargetType.ALLY,
      },
    ],
  },

  /** 強力一擊：高傷害 + 擊退效果 */
  POWER_STRIKE: {
    id: 'power_strike',
    name: '強力一擊',
    description: '造成 200% 傷害並有 50% 機率暈眩目標 1 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    range: 1,
    cooldown: 3,
    currentCooldown: 0,
    manaCost: 20,
    effects: [
      {
        effectType: SkillEffectType.BUFF_ATTACK,
        value: 2.0,
        targetType: TargetType.SELF,
        duration: 1,
      },
      {
        effectType: SkillEffectType.STUN,
        value: 1,
        chance: 0.5,
        targetType: TargetType.ENEMY,
        duration: 1,
      },
    ],
  },

  /** 盾擊：防禦提升 + 反傷 */
  SHIELD_BASH: {
    id: 'shield_bash',
    name: '盾擊',
    description: '防禦力 +50% 並反彈 30% 受到的傷害，持續 2 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    range: 1,
    cooldown: 4,
    currentCooldown: 0,
    manaCost: 15,
    effects: [
      {
        effectType: SkillEffectType.BUFF_DEFENSE,
        value: 0.5,
        targetType: TargetType.SELF,
        duration: 2,
      },
      {
        effectType: SkillEffectType.REFLECT_DAMAGE,
        value: 0.3,
        targetType: TargetType.SELF,
        duration: 2,
      },
    ],
  },

  /** 連鎖閃電：範圍傷害 + 減速 */
  CHAIN_LIGHTNING: {
    id: 'chain_lightning',
    name: '連鎖閃電',
    description: '對範圍內所有敵人造成 80% 傷害並降低移動力 1，持續 2 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    range: 2,
    cooldown: 4,
    currentCooldown: 0,
    manaCost: 25,
    effects: [
      {
        effectType: SkillEffectType.AREA_ATTACK,
        value: 0.8,
        targetType: TargetType.ENEMY_ALL,
      },
      {
        effectType: SkillEffectType.SLOW,
        value: 1,
        targetType: TargetType.ENEMY_ALL,
        duration: 2,
      },
    ],
  },

  /** 群體治療：範圍治療 + 提升防禦 */
  GROUP_HEAL: {
    id: 'group_heal',
    name: '群體治療',
    description: '治療範圍內所有友軍 25 HP 並提升防禦力 20%，持續 2 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    range: 2,
    cooldown: 5,
    currentCooldown: 0,
    manaCost: 30,
    effects: [
      {
        effectType: SkillEffectType.HEAL,
        value: 25,
        targetType: TargetType.ALLY_ALL,
      },
      {
        effectType: SkillEffectType.BUFF_DEFENSE,
        value: 0.2,
        targetType: TargetType.ALLY_ALL,
        duration: 2,
      },
    ],
  },

  /** 狂暴：大幅提升攻擊力但降低防禦 */
  BERSERK: {
    id: 'berserk',
    name: '狂暴',
    description: '攻擊力 +60%，防禦力 -30%，持續 3 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    range: 0,
    cooldown: 5,
    currentCooldown: 0,
    manaCost: 20,
    effects: [
      {
        effectType: SkillEffectType.BUFF_ATTACK,
        value: 0.6,
        targetType: TargetType.SELF,
        duration: 3,
      },
      {
        effectType: SkillEffectType.BUFF_DEFENSE,
        value: -0.3,
        targetType: TargetType.SELF,
        duration: 3,
      },
    ],
  },

  /** 火焰風暴：範圍傷害 + 持續灼燒 */
  FIRE_STORM: {
    id: 'fire_storm',
    name: '火焰風暴',
    description:
      '對範圍內敵人造成 90% 傷害，並造成持續 3 回合的灼燒（每回合 10 傷害）',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    range: 2,
    cooldown: 5,
    currentCooldown: 0,
    manaCost: 35,
    effects: [
      {
        effectType: SkillEffectType.AREA_ATTACK,
        value: 0.9,
        targetType: TargetType.ENEMY_ALL,
      },
      {
        effectType: SkillEffectType.BURN,
        value: 10,
        targetType: TargetType.ENEMY_ALL,
        duration: 3,
      },
    ],
  },
};
