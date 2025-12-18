import { Injectable } from '@angular/core';
import { Unit } from '../model/unit.model';

@Injectable({ providedIn: 'root' })
export class CombatCalculator {
  /**
   * 計算傷害 (含地形防禦加成)
   * @param attacker 攻擊者
   * @param defender 防禦者
   * @param terrainBonus 地形防禦加成百分比 (0.1 = 10%, 0.2 = 20%)
   */
  public calculateDamage(
    attacker: Unit,
    defender: Unit,
    terrainBonus: number = 0
  ): number {
    // TODO為來可擴充其他因素，如暴擊、技能等
    // 攻擊力
    const finalAttack = attacker.attack;

    // 防禦力 * (1 + 地形加成)
    const finalDefense = defender.defense * (1 + terrainBonus);

    // 計算最終傷害: 攻擊力 - 防禦力 * (1 + 地形加成)
    const damage = finalAttack - finalDefense;

    // 傷害至少為 1
    return Math.max(1, Math.floor(damage));
  }
  // 檢查是否可攻擊
  public canAttack(attacker: Unit, defender: Unit): boolean {
    const distance =
      Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);

    // 不能攻擊己方單位
    if (attacker.ownerId === defender.ownerId) return false;

    return distance <= attacker.range;
  }

  /**
   * 計算攻擊命中率 (未來擴充用)
   */
  public calculateHitRate(attacker: Unit, defender: Unit): number {
    // 基礎命中率 100%
    // 未來可以根據單位屬性、地形等調整
    return 100;
  }

  /**
   * 計算暴擊率 (未來擴充用)
   */
  public calculateCritRate(attacker: Unit): number {
    // 基礎暴擊率 0%
    // 未來可以根據單位屬性調整
    return 0;
  }
}
