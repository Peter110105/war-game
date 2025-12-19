import { UnitConfig, UnitType } from '../model/unit.model';
import {
  SkillType,
  SkillEffectType,
  Skill,
  TriggerTiming,
  TargetType,
} from '../model/skill.model';

/**
 * 技能配置（支持多效果）
 */
export const SKILLS: Record<string, Skill> = {
  // ===== 被動技能 =====

  // 狂戰士：攻擊力提升，但防禦力降低
  BERSERKER: {
    id: 'berserker',
    name: '狂戰士',
    description: '攻擊力 +30%，防禦力 -10%',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ALWAYS,
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

  // 鐵壁：高防禦，移動力降低
  IRON_WALL: {
    id: 'iron_wall',
    name: '鐵壁',
    description: '防禦力 +40%，移動力 -1',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ALWAYS,
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

  // 致命一擊：暴擊 + 破甲
  CRITICAL_STRIKE: {
    id: 'critical_strike',
    name: '致命一擊',
    description: '15% 機率暴擊並無視 50% 防禦',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ON_ATTACK,
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

  // 反擊：受到攻擊時反擊並恢復生命
  COUNTER: {
    id: 'counter',
    name: '反擊',
    description: '受到近戰攻擊時反擊並恢復 20% 造成傷害的生命',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ON_DEFEND,
    effects: [
      {
        effectType: SkillEffectType.COUNTER_ATTACK,
        value: 1.0,
        targetType: TargetType.ENEMY,
        range: 1,
      },
      {
        effectType: SkillEffectType.LIFE_STEAL,
        value: 0.2,
        targetType: TargetType.SELF,
      },
    ],
  },

  // 地形適應：移動力提升 + 忽略地形懲罰
  TERRAIN_ADAPT: {
    id: 'terrain_adapt',
    name: '地形適應',
    description: '移動力 +1，忽略地形移動消耗',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ALWAYS,
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

  // 神速：移動力大幅提升 + 先制攻擊
  SWIFT: {
    id: 'swift',
    name: '神速',
    description: '移動力 +2，總是先制攻擊',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ALWAYS,
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

  // 再生：每回合恢復生命
  REGENERATION: {
    id: 'regeneration',
    name: '再生',
    description: '每回合恢復 10% 最大生命值',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ON_TURN_START,
    effects: [
      {
        effectType: SkillEffectType.REGENERATION,
        value: 0.1,
        targetType: TargetType.SELF,
      },
    ],
  },

  // 吸血鬼：生命偷取 + 攻擊力提升
  VAMPIRE: {
    id: 'vampire',
    name: '吸血',
    description: '攻擊力 +15%，偷取 30% 造成傷害的生命',
    type: SkillType.PASSIVE,
    trigger: TriggerTiming.ON_ATTACK,
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

  // ===== 主動技能 =====

  // 治療術：治療 + 淨化負面效果
  HEAL: {
    id: 'heal',
    name: '治療術',
    description: '恢復目標 40 HP 並淨化所有負面效果',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    cooldown: 2,
    currentCooldown: 0,
    manaCost: 15,
    effects: [
      {
        effectType: SkillEffectType.HEAL,
        value: 40,
        targetType: TargetType.ALLY,
        range: 2,
      },
      {
        effectType: SkillEffectType.CLEANSE,
        value: 1,
        targetType: TargetType.ALLY,
        range: 2,
      },
    ],
  },

  // 強力一擊：高傷害 + 擊退效果
  POWER_STRIKE: {
    id: 'power_strike',
    name: '強力一擊',
    description: '造成 200% 傷害並有 50% 機率暈眩目標 1 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
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
        range: 1,
      },
    ],
  },

  // 盾擊：防禦提升 + 反傷
  SHIELD_BASH: {
    id: 'shield_bash',
    name: '盾擊',
    description: '防禦力 +50% 並反彈 30% 受到的傷害，持續 2 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
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

  // 連鎖閃電：範圍傷害 + 減速
  CHAIN_LIGHTNING: {
    id: 'chain_lightning',
    name: '連鎖閃電',
    description: '對範圍內所有敵人造成 80% 傷害並降低移動力 1，持續 2 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    cooldown: 4,
    currentCooldown: 0,
    manaCost: 25,
    effects: [
      {
        effectType: SkillEffectType.AREA_ATTACK,
        value: 0.8,
        targetType: TargetType.ENEMY_ALL,
        range: 2,
      },
      {
        effectType: SkillEffectType.SLOW,
        value: 1,
        targetType: TargetType.ENEMY_ALL,
        range: 2,
        duration: 2,
      },
    ],
  },

  // 群體治療：範圍治療 + 提升防禦
  GROUP_HEAL: {
    id: 'group_heal',
    name: '群體治療',
    description: '治療範圍內所有友軍 25 HP 並提升防禦力 20%，持續 2 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    cooldown: 5,
    currentCooldown: 0,
    manaCost: 30,
    effects: [
      {
        effectType: SkillEffectType.HEAL,
        value: 25,
        targetType: TargetType.ALLY_ALL,
        range: 2,
      },
      {
        effectType: SkillEffectType.BUFF_DEFENSE,
        value: 0.2,
        targetType: TargetType.ALLY_ALL,
        range: 2,
        duration: 2,
      },
    ],
  },

  // 狂暴：大幅提升攻擊力但降低防禦
  BERSERK: {
    id: 'berserk',
    name: '狂暴',
    description: '攻擊力 +60%，防禦力 -30%，持續 3 回合',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
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

  // 火焰風暴：範圍傷害 + 持續灼燒
  FIRE_STORM: {
    id: 'fire_storm',
    name: '火焰風暴',
    description:
      '對範圍內敵人造成 90% 傷害，並造成持續 3 回合的灼燒（每回合 10 傷害）',
    type: SkillType.ACTIVE,
    trigger: TriggerTiming.MANUAL,
    cooldown: 5,
    currentCooldown: 0,
    manaCost: 35,
    effects: [
      {
        effectType: SkillEffectType.AREA_ATTACK,
        value: 0.9,
        targetType: TargetType.ENEMY_ALL,
        range: 2,
      },
      {
        effectType: SkillEffectType.BURN,
        value: 10,
        targetType: TargetType.ENEMY_ALL,
        range: 2,
        duration: 3,
      },
    ],
  },
};

/**
 * 單位類型配置（使用多效果技能）
 */
export const UNIT_CONFIGS: Record<string, UnitConfig> = {
  soldier: {
    type: UnitType.SOLDIER,
    name: '劍士',
    baseStats: {
      maxHp: 100,
      hp: 100,
      attack: 50,
      defense: 10,
      move: 4,
      range: 1,
    },
    growthRates: {
      hp: 5,
      attack: 3,
      defense: 2,
    },
    skills: [{ ...SKILLS['CRITICAL_STRIKE'] }, { ...SKILLS['POWER_STRIKE'] }],
  },

  archer: {
    type: UnitType.ARCHER,
    name: '弓兵',
    baseStats: {
      maxHp: 80,
      hp: 80,
      attack: 40,
      defense: 6,
      move: 3,
      range: 2,
    },
    growthRates: {
      hp: 3,
      attack: 4,
      defense: 1,
    },
    skills: [{ ...SKILLS['CRITICAL_STRIKE'] }, { ...SKILLS['SWIFT'] }],
  },

  knight: {
    type: UnitType.KNIGHT,
    name: '騎士',
    baseStats: {
      maxHp: 120,
      hp: 120,
      attack: 45,
      defense: 15,
      move: 5,
      range: 1,
    },
    growthRates: {
      hp: 6,
      attack: 3,
      defense: 3,
    },
    skills: [
      { ...SKILLS['IRON_WALL'] },
      { ...SKILLS['COUNTER'] },
      { ...SKILLS['SHIELD_BASH'] },
    ],
  },

  cavalry: {
    type: UnitType.CAVALRY,
    name: '騎兵',
    baseStats: {
      maxHp: 110,
      hp: 110,
      attack: 55,
      defense: 8,
      move: 6,
      range: 1,
    },
    growthRates: {
      hp: 5,
      attack: 4,
      defense: 1,
    },
    skills: [{ ...SKILLS['SWIFT'] }, { ...SKILLS['BERSERKER'] }],
    characteristics: {
      ignoresTerrain: true,
    },
  },

  mage: {
    type: UnitType.MAGE,
    name: '法師',
    baseStats: {
      maxHp: 70,
      hp: 70,
      attack: 60,
      defense: 5,
      move: 3,
      range: 3,
      mana: 50,
      maxMana: 50,
    },
    growthRates: {
      hp: 2,
      attack: 5,
      defense: 1,
    },
    skills: [{ ...SKILLS['CHAIN_LIGHTNING'] }, { ...SKILLS['FIRE_STORM'] }],
  },

  flyer: {
    type: UnitType.FLYER,
    name: '飛兵',
    baseStats: {
      maxHp: 90,
      hp: 90,
      attack: 35,
      defense: 7,
      move: 5,
      range: 1,
    },
    growthRates: {
      hp: 4,
      attack: 3,
      defense: 1,
    },
    skills: [{ ...SKILLS['TERRAIN_ADAPT'] }],
    characteristics: {
      canFly: true,
    },
  },

  healer: {
    type: UnitType.HEALER,
    name: '牧師',
    baseStats: {
      maxHp: 75,
      hp: 75,
      attack: 20,
      defense: 8,
      move: 3,
      range: 1,
      mana: 40,
      maxMana: 40,
    },
    growthRates: {
      hp: 3,
      attack: 1,
      defense: 2,
    },
    skills: [
      { ...SKILLS['HEAL'] },
      { ...SKILLS['GROUP_HEAL'] },
      { ...SKILLS['REGENERATION'] },
    ],
    characteristics: {
      canHeal: true,
    },
  },
};

/**
 * 經驗值配置
 */
export const EXP_CONFIG = {
  BASE_EXP_TO_NEXT: 100,
  EXP_MULTIPLIER: 1.5,
  MAX_LEVEL: 20,
  KILL_EXP: 50,
  DAMAGE_EXP_RATE: 0.5,
};

export function getExpToNextLevel(currentLevel: number): number {
  if (currentLevel >= EXP_CONFIG.MAX_LEVEL) {
    return 0;
  }
  return Math.floor(
    EXP_CONFIG.BASE_EXP_TO_NEXT *
      Math.pow(EXP_CONFIG.EXP_MULTIPLIER, currentLevel - 1)
  );
}

export function getUnitConfig(type: string): UnitConfig {
  return UNIT_CONFIGS[type] || UNIT_CONFIGS['soldier'];
}
