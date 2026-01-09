import { Injectable } from '@angular/core';
import {
  GameEventService,
  GameEventType,
} from '../../core/state/game-event.service';
import {
  Skill,
  SkillEffect,
  SkillEffectType,
  SkillType,
  TargetType,
  TriggerTiming,
} from '../../model/skill.model';
import { ActiveEffect, Unit } from '../../model/unit.model';

@Injectable({ providedIn: 'root' })
export class SkillService {
  constructor(private gameEventService: GameEventService) {}

  /**
   * 獲取被動技能的總效果值（支持多效果）
   * @param unit 單位
   * @param effectType 效果類型
   * @returns 總效果值
   */
  public getPassiveEffect(unit: Unit, effectType: SkillEffectType): number {
    let total = 0;

    // 從技能中獲取被動效果
    const passiveSkills = unit.skills.filter(
      (skill) =>
        skill.type === SkillType.PASSIVE &&
        skill.trigger === TriggerTiming.ALWAYS
    );
    passiveSkills.forEach((skill) => {
      skill.effects.forEach((effect) => {
        if (
          effect.effectType === effectType &&
          effect.targetType === TargetType.SELF
        ) {
          total += effect.value || 0;
        }
      });
    });

    // 從當前生效的 buff/debuff 中獲取
    unit.activeEffects.forEach((effect) => {
      if (effect.effectType === effectType) {
        total += effect.value;
      }
    });

    return total;
  }

  /**
   * 檢查單位是否有特定效果類型的技能
   */
  public hasEffect(unit: Unit, effectType: SkillEffectType): boolean {
    return unit.skills.some((skill) =>
      skill.effects.some((effect) => effect.effectType === effectType)
    );
  }

  /**
   * 獲取可用的主動技能
   */
  public getAvailableActiveSkills(unit: Unit): Skill[] {
    return unit.skills.filter(
      (s) =>
        s.type === SkillType.ACTIVE &&
        (s.currentCooldown === undefined || s.currentCooldown === 0) &&
        (!s.manaCost || (unit.stats.mana && unit.stats.mana >= s.manaCost))
    );
  }

  /**
   * 使用主動技能（應用所有效果）
   */
  public useSkill(
    caster: Unit,
    skill: Skill,
    targets: Unit[] = []
  ): { success: boolean; message?: string } {
    if (skill.type !== SkillType.ACTIVE) {
      return { success: false, message: '不是主動技能' };
    }

    if (skill.currentCooldown && skill.currentCooldown > 0) {
      return { success: false, message: '技能冷卻中' };
    }

    if (
      skill.manaCost &&
      caster.stats.mana &&
      caster.stats.mana < skill.manaCost
    ) {
      return { success: false, message: '魔力不足' };
    }

    // 消耗魔力
    if (skill.manaCost && caster.stats.mana !== undefined) {
      caster.stats.mana -= skill.manaCost;
    }

    // 設置冷卻
    if (skill.cooldown) {
      skill.currentCooldown = skill.cooldown;
    }

    // 應用所有效果
    skill.effects.forEach((effect) => {
      this.applyEffect(caster, effect, targets);
    });

    // 發送技能使用事件
    // this.gameEventService.emit({
    //   type: GameEventType.SKILL_USED,
    //   data: {
    //     unitId: caster.id,
    //     skillId: skill.id,
    //     targetIds: targets.map((t) => t.id),
    //   },
    // });

    return { success: true };
  }

  /**
   * 應用單個技能效果
   */
  private applyEffect(
    caster: Unit,
    effect: SkillEffect,
    targets: Unit[]
  ): void {
    // 根據目標類型過濾目標
    const validTargets = this.filterTargetsByType(
      caster,
      effect.targetType,
      targets
    );

    validTargets.forEach((target) => {
      // 檢查觸發機率
      if (effect.chance && Math.random() > effect.chance) {
        return;
      }

      // 檢查條件
      if (effect.condition && !this.checkCondition(target, effect.condition)) {
        return;
      }

      // 根據效果類型應用
      this.applyEffectToTarget(caster, target, effect);
    });
  }
  /**
   * 應用效果到單個目標
   */
  private applyEffectToTarget(
    caster: Unit,
    target: Unit,
    effect: SkillEffect
  ): void {
    const value = effect.value || 0;

    switch (effect.effectType) {
      case SkillEffectType.HEAL:
        this.healTarget(target, value);
        break;

      case SkillEffectType.BUFF_ATTACK:
      case SkillEffectType.BUFF_DEFENSE:
      case SkillEffectType.BUFF_MOVE:
      case SkillEffectType.SLOW:
      case SkillEffectType.STUN:
      case SkillEffectType.BURN:
      case SkillEffectType.POISON:
        this.addActiveEffect(target, effect, caster.id, 'temp_skill_id');
        break;

      case SkillEffectType.CLEANSE:
        this.cleanseDebuffs(target);
        break;

      case SkillEffectType.AREA_ATTACK:
        // 範圍攻擊的實際傷害計算會在 CombatCalculator 中處理
        break;

      default:
        console.log(`未處理的效果類型: ${effect.effectType}`);
    }
  }
  /**
   * 治療目標
   */
  private healTarget(target: Unit, amount: number): void {
    const actualHeal = Math.min(amount, target.stats.maxHp - target.stats.hp);
    target.stats.hp += actualHeal;

    this.gameEventService.emit({
      type: GameEventType.UNIT_HEALED,
      data: {
        targetId: target.id,
        amount: actualHeal,
      },
    });
  }

  /**
   * 添加持續效果
   */
  private addActiveEffect(
    target: Unit,
    effect: SkillEffect,
    sourceUnitId: string,
    sourceSkillId: string
  ): void {
    const activeEffect: ActiveEffect = {
      effectType: effect.effectType,
      value: effect.value || 0,
      duration: effect.duration || 1,
      sourceSkillId,
      sourcUnitId: sourceUnitId,
    };

    target.activeEffects.push(activeEffect);
  }

  /**
   * 淨化負面效果
   */
  private cleanseDebuffs(target: Unit): void {
    const debuffTypes = [
      SkillEffectType.SLOW,
      SkillEffectType.STUN,
      SkillEffectType.POISON,
      SkillEffectType.BURN,
    ];

    target.activeEffects = target.activeEffects.filter(
      (effect) => !debuffTypes.includes(effect.effectType)
    );
  }

  /**
   * 根據目標類型過濾目標
   */
  private filterTargetsByType(
    caster: Unit,
    targetType: TargetType,
    targets: Unit[]
  ): Unit[] {
    switch (targetType) {
      case TargetType.SELF:
        return [caster];

      case TargetType.ALLY:
        return targets.filter(
          (t) => t.ownerId === caster.ownerId && t.id !== caster.id
        );

      case TargetType.ALLY_ALL:
        return targets.filter((t) => t.ownerId === caster.ownerId);

      case TargetType.ENEMY:
      case TargetType.ENEMY_ALL:
        return targets.filter((t) => t.ownerId !== caster.ownerId);

      case TargetType.ANY:
      case TargetType.AREA:
        return targets;

      default:
        return [];
    }
  }

  /**
   * 檢查技能條件
   */
  private checkCondition(target: Unit, condition: any): boolean {
    if (condition.minHpPercent) {
      const hpPercent = (target.stats.hp / target.stats.maxHp) * 100;
      if (hpPercent < condition.minHpPercent) return false;
    }

    if (condition.maxHpPercent) {
      const hpPercent = (target.stats.hp / target.stats.maxHp) * 100;
      if (hpPercent > condition.maxHpPercent) return false;
    }

    if (condition.minLevel && target.levelInfo.level < condition.minLevel) {
      return false;
    }

    // 可以添加更多條件檢查

    return true;
  }

  /**
   * 減少技能冷卻和持續效果（回合結束時調用）
   */
  public reduceCooldowns(unit: Unit): void {
    // 減少技能冷卻
    unit.skills.forEach((skill) => {
      if (
        skill.type === SkillType.ACTIVE &&
        skill.currentCooldown &&
        skill.currentCooldown > 0
      ) {
        skill.currentCooldown--;
      }
    });
  }
  /**
   * 恢復魔力
   */
  public restoreMana(unit: Unit, amount: number = 10): void {
    if (unit.stats.mana !== undefined && unit.stats.maxMana !== undefined) {
      unit.stats.mana = Math.min(unit.stats.mana + amount, unit.stats.maxMana);
    }
  }
  /**
   * 計算技能強化後的攻擊力
   */
  public getEnhancedAttack(unit: Unit): number {
    let attack = unit.stats.attack;
    const boost = this.getPassiveEffect(unit, SkillEffectType.ATTACK_BOOST);
    if (boost !== 0) {
      attack = Math.floor(attack * (1 + boost));
    }
    return attack;
  }
  /**
   * 計算技能強化後的防禦力
   */
  public getEnhancedDefense(unit: Unit, terrainBonus: number = 0): number {
    let defense = unit.stats.defense * (1 + terrainBonus);
    const boost = this.getPassiveEffect(unit, SkillEffectType.DEFENSE_BOOST);
    if (boost !== 0) {
      defense = Math.floor(defense * (1 + boost));
    }
    return defense;
  }
  /**
   * 檢查是否觸發暴擊
   */
  public checkCriticalHit(unit: Unit): {
    isCritical: boolean;
    multiplier: number;
  } {
    const critEffects = unit.skills
      .flatMap((skill) => skill.effects)
      .filter((effect) => effect.effectType === SkillEffectType.CRITICAL_HIT);

    for (const effect of critEffects) {
      const chance = effect.chance || 0;
      if (Math.random() < chance) {
        return {
          isCritical: true,
          multiplier: effect.value || 2.0,
        };
      }
    }

    return { isCritical: false, multiplier: 1.0 };
  }
  /**
   * 觸發回合開始時的技能效果
   */
  public triggerTurnStartEffects(unit: Unit): void {
    unit.skills.forEach((skill) => {
      if (skill.trigger === TriggerTiming.ON_TURN_START) {
        skill.effects.forEach((effect) => {
          this.applyEffect(unit, effect, [unit]);
        });
      }
    });

    // 處理持續傷害（灼燒、中毒等）
    unit.activeEffects.forEach((effect) => {
      if (
        effect.effectType === SkillEffectType.BURN ||
        effect.effectType === SkillEffectType.POISON
      ) {
        unit.stats.hp = Math.max(0, unit.stats.hp - effect.value);

        if (unit.stats.hp <= 0) {
          unit.alive = false;
        }
      }
    });
  }
  /**
   * 獲取技能描述
   */
  public getSkillDescriptions(unit: Unit): string[] {
    return unit.skills.map((skill) => {
      let desc = `${skill.name}: ${skill.description}`;

      if (skill.type === SkillType.ACTIVE) {
        if (skill.cooldown) {
          const cd = skill.currentCooldown || 0;
          desc += cd > 0 ? ` (冷卻: ${cd})` : ' (就緒)';
        }
        if (skill.manaCost) {
          desc += ` [消耗: ${skill.manaCost} MP]`;
        }
      }

      return desc;
    });
  }

  /**
   * 獲取單位當前所有生效的效果描述
   */
  public getActiveEffectsDescription(unit: Unit): string[] {
    return unit.activeEffects.map((effect) => {
      const effectName = this.getEffectTypeName(effect.effectType);
      const value = effect.value > 0 ? `+ ${effect.value}` : effect.value;
      return `${effectName} ${value} (${effect.duration} 回合)`;
    });
  }
  /**
   * 獲取效果類型的中文名稱
   */
  private getEffectTypeName(effectType: SkillEffectType): string {
    const nameMap: { [Key: string]: string } = {
      [SkillEffectType.ATTACK_BOOST]: '攻擊',
      [SkillEffectType.DEFENSE_BOOST]: '防禦',
      [SkillEffectType.MOVE_BOOST]: '移動',
      [SkillEffectType.SLOW]: '減速',
      [SkillEffectType.STUN]: '暈眩',
      [SkillEffectType.BURN]: '灼燒',
      [SkillEffectType.POISON]: '中毒',
      [SkillEffectType.SHIELD]: '護盾',
      //TODO 可以繼續擴充
    };
    return nameMap[effectType] || effectType;
  }
}
