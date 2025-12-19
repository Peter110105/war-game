import { Injectable } from '@angular/core';
import { SkillService } from '../service/skill.service';
import { Unit } from '../model/unit.model';
import { SkillEffectType } from '../model/skill.model';

@Injectable({ providedIn: 'root' })
export class CombatCalculator {
  constructor(private skillService: SkillService) {}

  /**
   * 計算傷害 (含多效果技能和地形加成）
   * @param attacker 攻擊者
   * @param defender 防禦者
   * @param terrainBonus 地形防禦加成百分比 (0.1 = 10%, 0.2 = 20%)
   * @returns 傷害(最小為1)
   */
  public calculateDamage(
    attacker: Unit,
    defender: Unit,
    terrainBonus: number = 0
  ): {
    damage: number;
    isCritical: boolean;
    isArmorPierced: boolean;
    lifeSteal: number;
  } {
    // 1.取得技能強化後的攻擊力
    let finalAttack = this.skillService.getEnhancedAttack(attacker);

    // 2.取得技能強化後的防禦力
    let finalDefense = this.skillService.getEnhancedDefense(
      defender,
      terrainBonus
    );
    // 3.檢查暴擊（支持多效果）
    const { isCritical, multiplier } =
      this.skillService.checkCriticalHit(attacker);
    if (isCritical) {
      finalAttack = Math.floor(finalAttack * multiplier);
      console.log(`💥 ${attacker.name} 觸發暴擊！倍率: ${multiplier}x`);
    }

    // 4.檢查破甲效果
    const armorPierceValue = this.skillService.getPassiveEffect(
      attacker,
      SkillEffectType.ARMOR_PIERCE
    );
    const isArmorPierced = armorPierceValue > 0;

    if (isArmorPierced) {
      finalDefense = Math.floor(finalDefense * (1 - armorPierceValue));
      console.log(
        `🔨 ${attacker.name} 觸發破甲！無視 ${(armorPierceValue * 100).toFixed(
          0
        )}% 防禦`
      );
    }

    // 5.計算傷害: 攻擊力 - 防禦力 * (1 + 地形加成)
    let damage = finalAttack - finalDefense;

    // 6.檢查傷害減免
    const damageReduction = this.skillService.getPassiveEffect(
      defender,
      SkillEffectType.DAMAGE_REDUCTION
    );

    if (damageReduction > 0) {
      damage = Math.floor(damage * (1 - damageReduction));
      console.log(
        `🛡️ ${defender.name} 觸發傷害減免 ${(damageReduction * 100).toFixed(
          0
        )}%`
      );
    }

    // 7.傷害至少為 1
    damage = Math.max(1, Math.floor(damage));

    // 8.計算生命偷取
    const lifeStealRate = this.skillService.getPassiveEffect(
      attacker,
      SkillEffectType.LIFE_STEAL
    );
    const lifeSteal =
      lifeStealRate > 0 ? Math.floor(damage * lifeStealRate) : 0;

    if (lifeSteal > 0) {
      console.log(`🩸 ${attacker.name} 吸血 ${lifeSteal} HP`);
    }

    return {
      damage,
      isCritical,
      isArmorPierced,
      lifeSteal,
    };
  }

  /**
   *  檢查能否攻擊
   * @param attacker 攻擊者
   * @param defender 防禦者
   * @returns 是否能攻擊
   */
  public canAttack(attacker: Unit, defender: Unit): boolean {
    const distance =
      Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);

    // 不能攻擊己方單位
    if (attacker.ownerId === defender.ownerId) return false;

    return distance <= attacker.stats.range;
  }

  /**
   * 計算攻擊命中率 (未來擴充用)
   * @param attacker 攻擊者
   * @param defender 防禦者
   * @returns 命中率
   */
  public calculateHitRate(attacker: Unit, defender: Unit): number {
    // 基礎命中率 100%
    // 未來可以根據單位屬性、地形等調整
    return 100;
  }

  /**
   * 計算暴擊率 (未來擴充用)
   * @param attacker 攻擊者
   * @param defender 防禦者
   * @returns 暴擊率
   */
  public calculateCritRate(attacker: Unit): number {
    // 基礎暴擊率 0%
    // 未來可以根據單位屬性調整
    return this.skillService.getPassiveEffect(
      attacker,
      SkillEffectType.CRITICAL_HIT
    );
  }
}
