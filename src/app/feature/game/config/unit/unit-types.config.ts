import { UnitType } from '../../model/unit.model';

/**
 * 單位類型中文名稱映射
 */
export const UNIT_TYPE_NAMES: Record<UnitType, string> = {
  [UnitType.SOLDIER]: '劍士',
  [UnitType.ARCHER]: '弓兵',
  [UnitType.KNIGHT]: '騎士',
  [UnitType.MAGE]: '法師',
  [UnitType.CAVALRY]: '騎兵',
  [UnitType.FLYER]: '飛兵',
  [UnitType.HEALER]: '牧師',
};

/**
 * 單位類型描述
 */
export const UNIT_TYPE_DESCRIPTIONS: Record<UnitType, string> = {
  [UnitType.SOLDIER]: '均衡型近戰單位，具有暴擊能力',
  [UnitType.ARCHER]: '遠程輸出單位，射程較遠但防禦較弱',
  [UnitType.KNIGHT]: '重裝坦克單位，高血量高防禦',
  [UnitType.MAGE]: '法術輸出單位，擁有範圍傷害技能',
  [UnitType.CAVALRY]: '高機動性單位，忽略地形懲罰',
  [UnitType.FLYER]: '空中單位，可以飛越障礙',
  [UnitType.HEALER]: '輔助單位，可以治療友軍',
};

/**
 * 獲取單位類型名稱
 */
export function getUnitTypeName(type: UnitType): string {
  return UNIT_TYPE_NAMES[type] || type;
}

/**
 * 獲取單位類型描述
 */
export function getUnitTypeDescription(type: UnitType): string {
  return UNIT_TYPE_DESCRIPTIONS[type] || '';
}
