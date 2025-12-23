/**
 * 經驗值系統配置
 */
export const EXP_CONFIG = {
  /** 基礎升級所需經驗值 */
  BASE_EXP_TO_NEXT: 100,

  /** 每級經驗值增長倍率 */
  EXP_MULTIPLIER: 1.5,

  /** 最高等級 */
  MAX_LEVEL: 20,

  /** 擊殺獲得的基礎經驗值 */
  KILL_EXP: 50,

  /** 造成傷害轉換為經驗值的比率 */
  DAMAGE_EXP_RATE: 0.5,
};

/**
 * 計算升級所需經驗值
 * @param currentLevel 當前等級
 * @returns 升級所需經驗值
 */
export function getExpToNextLevel(currentLevel: number): number {
  if (currentLevel >= EXP_CONFIG.MAX_LEVEL) {
    return 0; // 已達最高等級
  }
  return Math.floor(
    EXP_CONFIG.BASE_EXP_TO_NEXT *
      Math.pow(EXP_CONFIG.EXP_MULTIPLIER, currentLevel - 1)
  );
}

/**
 * 計算擊殺獲得的經驗值
 * @param killerLevel 擊殺者等級
 * @param targetLevel 目標等級
 * @returns 獲得的經驗值
 */
export function calculateKillExp(
  killerLevel: number,
  targetLevel: number
): number {
  let exp = EXP_CONFIG.KILL_EXP;

  // 等級差調整
  const levelDiff = targetLevel - killerLevel;
  if (levelDiff > 0) {
    exp += levelDiff * 10; // 擊殺高等級獲得更多經驗
  } else if (levelDiff < 0) {
    exp = Math.max(10, exp + levelDiff * 5); // 擊殺低等級減少經驗
  }

  return exp;
}

/**
 * 計算造成傷害獲得的經驗值
 * @param damage 造成的傷害值
 * @returns 獲得的經驗值
 */
export function calculateDamageExp(damage: number): number {
  return Math.floor(damage * EXP_CONFIG.DAMAGE_EXP_RATE); // FIXME: 調整經驗獲取率
}
