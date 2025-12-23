import { Injectable } from '@angular/core';
import { SkillService } from '../skill/skill.service';
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

    // 不能攻擊己方單位（除非有治療技能）
    if (attacker.ownerId === defender.ownerId) {
      if (!attacker.characteristics?.canHeal) {
        return false;
      }
    }
    // 檢查射程（包含射程加成）
    const rangeBoost = this.skillService.getPassiveEffect(
      attacker,
      SkillEffectType.RANGE_BOOST
    );

    const effectiveRange = attacker.stats.range + Math.floor(rangeBoost);

    return distance <= effectiveRange;
  }

  /**
   * 檢查是否可以治療
   * @param healer 治療者
   * @param target 目標
   * @returns 是否能治療
   */
  public canHeal(healer: Unit, target: Unit): boolean {
    if (!healer.characteristics?.canHeal) {
      return false;
    }

    // 必須是友軍
    if (healer.ownerId !== target.ownerId) {
      return false;
    }

    // 目標必須受傷
    if (target.stats.hp >= target.stats.maxHp) {
      return false;
    }

    const distance =
      Math.abs(healer.x - target.x) + Math.abs(healer.y - target.y);

    // 檢查射程（包含射程加成）
    const rangeBoost = this.skillService.getPassiveEffect(
      healer,
      SkillEffectType.RANGE_BOOST
    );
    const effectiveRange = healer.stats.range + Math.floor(rangeBoost);

    return distance <= effectiveRange;
  }

  /**
   * 檢查是否會觸發反擊
   * @param attacker 攻擊者
   * @param defender 防禦者
   * @returns 是否能反擊
   */
  public shouldCounterAttack(attacker: Unit, defender: Unit): boolean {
    // 檢查防禦者是否有反擊技能
    if (
      !this.skillService.hasEffect(defender, SkillEffectType.COUNTER_ATTACK)
    ) {
      return false;
    }

    // 只有近戰攻擊才能被反擊
    const distance =
      Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);

    // 檢查反擊技能的範圍設定
    const counterSkill = defender.skills.find((skill) =>
      skill.effects.some((e) => e.effectType === SkillEffectType.COUNTER_ATTACK)
    );

    if (counterSkill) {
      const counterEffect = counterSkill.effects.find(
        (e) => e.effectType === SkillEffectType.COUNTER_ATTACK
      );
      const counterRange = counterEffect?.range || 1;
      return distance <= counterRange;
    }

    return distance <= 1;
  }

  /**
   * 檢查是否會先制攻擊
   * @param unit 單位
   * @returns 是否會先制攻擊
   */
  public hasFirstStrike(unit: Unit): boolean {
    return this.skillService.hasEffect(unit, SkillEffectType.FIRST_STRIKE);
  }

  /**
   * 檢查是否會連續攻擊
   * @param unit 單位
   * @returns 是否會連續攻擊
   */
  public hasDoubleAttack(unit: Unit): boolean {
    return this.skillService.hasEffect(unit, SkillEffectType.DOUBLE_ATTACK);
  }

  /**
   * 計算反傷傷害
   * @param defender 防禦者
   * @param incomingDamage 傷害值
   * @returns 反傷傷害
   */
  public calculateReflectDamage(
    defender: Unit,
    incomingDamage: number
  ): number {
    const reflectRate = this.skillService.getPassiveEffect(
      defender,
      SkillEffectType.REFLECT_DAMAGE
    );

    if (reflectRate > 0) {
      const reflectDamage = Math.floor(incomingDamage * reflectRate);
      console.log(`⚡ ${defender.name} 反彈 ${reflectDamage} 傷害`);
      return reflectDamage;
    }

    return 0;
  }

  /**
   * 檢查是否閃避攻擊
   * @param defender 防禦者
   * @returns 是否閃避成功
   */
  public checkEvasion(defender: Unit): boolean {
    const evasionRate = this.skillService.getPassiveEffect(
      defender,
      SkillEffectType.EVASION
    );

    if (evasionRate > 0 && Math.random() < evasionRate) {
      console.log(`💨 ${defender.name} 閃避了攻擊！`);
      return true;
    }

    return false;
  }

  /**
   * 計算攻擊命中率
   * @param attacker 攻擊者
   * @param defender 防禦者
   * @returns 命中率
   */
  public calculateHitRate(attacker: Unit, defender: Unit): number {
    // 基礎命中率 100%
    let hitRate = 1.0;

    // 扣除閃避率
    const evasionRate = this.skillService.getPassiveEffect(
      defender,
      SkillEffectType.EVASION
    );
    hitRate -= evasionRate;

    return Math.max(0, Math.min(1, hitRate)) * 100;
  }

  /**
   * 計算暴擊率 (未來擴充用)
   * @param attacker 攻擊者
   * @param defender 防禦者
   * @returns 暴擊率
   */
  public calculateCritRate(attacker: Unit): number {
    let totalCritRate = 0;

    attacker.skills.forEach((skill) => {
      skill.effects.forEach((effect) => {
        if (
          effect.effectType === SkillEffectType.CRITICAL_HIT &&
          effect.chance
        ) {
          totalCritRate += effect.chance;
        }
      });
    });

    return Math.min(1, totalCritRate) * 100;
  }

  /**
   * 檢查是否免疫某種效果
   * @param unit 單位
   * @param effectType 效果類型
   * @returns 是否免疫
   */
  public isImmuneToEffect(unit: Unit, effectType: SkillEffectType): boolean {
    // 檢查是否有免疫技能
    const hasImmunity = this.skillService.hasEffect(
      unit,
      SkillEffectType.IMMUNITY
    );

    if (hasImmunity) {
      // TODO 可以擴展為檢查特定效果的免疫
      const immuneEffects = [
        SkillEffectType.STUN,
        SkillEffectType.SLOW,
        SkillEffectType.POISON,
        SkillEffectType.BURN,
      ];
      return immuneEffects.includes(effectType);
    }

    return false;
  }
}
