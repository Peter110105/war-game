import { UnitConfig, UnitType } from '../../model/unit.model';
import { getSkillsByIds } from '../skill/skill-registry';

/**
 * 單位基礎配置
 */
export const UNIT_BASE_CONFIGS: Record<string, UnitConfig> = {
  [UnitType.SOLDIER]: {
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
    skills: getSkillsByIds(['critical_strike', 'power_strike']),
  },

  [UnitType.ARCHER]: {
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
    skills: getSkillsByIds(['critical_strike', 'swift']),
  },

  [UnitType.KNIGHT]: {
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
    skills: getSkillsByIds(['iron_wall', 'counter', 'shield_bash']),
  },

  [UnitType.CAVALRY]: {
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
    skills: getSkillsByIds(['swift', 'berserker']),
    characteristics: {
      ignoresTerrain: true,
    },
  },

  [UnitType.MAGE]: {
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
    skills: getSkillsByIds(['chain_lightning', 'fire_storm']),
  },

  [UnitType.FLYER]: {
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
    skills: getSkillsByIds(['terrain_adapt']),
    characteristics: {
      canFly: true,
    },
  },

  [UnitType.HEALER]: {
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
    skills: getSkillsByIds(['heal', 'group_heal', 'regeneration']),
    characteristics: {
      canHeal: true,
    },
  },
};

/**
 * 獲取單位配置
 * @param type 單位類型
 * @returns 單位配置(如果找不到則返回預設劍士配置)
 */
export function getUnitConfig(type: UnitType | string): UnitConfig {
  const config = UNIT_BASE_CONFIGS[type];
  if (!config) {
    console.warn(
      `Unit config not found for type: ${type}, using SOLDIER as default`
    );
    return UNIT_BASE_CONFIGS[UnitType.SOLDIER];
  }
  return config;
}
