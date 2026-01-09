import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unit } from '../../../../feature/game/model/unit.model';
import {
  SkillEffectType,
  SkillType,
} from '../../../../feature/game/model/skill.model';
import {
  SkillService,
  UnitLevelService,
} from '../../../../feature/game/system';

@Component({
  selector: 'app-unit-info-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unit-info-panel.component.html',
  styleUrl: './unit-info-panel.component.css',
})
export class UnitInfoPanelComponent {
  @Input() unit: Unit | null = null;

  SkillType = SkillType;

  constructor(
    private skillService: SkillService,
    private levelService: UnitLevelService
  ) {}

  get hpPercentage(): number {
    if (!this.unit) return 0;
    return (this.unit.stats.hp / this.unit.stats.maxHp) * 100;
  }

  get hpColor(): string {
    const percentage = this.hpPercentage;
    if (percentage > 60) return '#00ff00';
    if (percentage > 30) return '#ffaa00';
    return '#ff0000';
  }

  get manaPercentage(): number {
    if (!this.unit || !this.unit.stats.mana || !this.unit.stats.maxMana)
      return 0;
    return (this.unit.stats.mana / this.unit.stats.maxMana) * 100;
  }

  get expPercentage(): number {
    if (!this.unit) return 0;
    return this.levelService.getLevelProgress(this.unit);
  }

  get unitTypeName(): string {
    const typeMap: { [key: string]: string } = {
      soldier: '劍士',
      archer: '弓兵',
      knight: '騎士',
      mage: '法師',
      cavalry: '騎兵',
      flyer: '飛兵',
      healer: '牧師',
    };
    return this.unit ? typeMap[this.unit.type] || this.unit.type : '';
  }

  get actionStatusText(): string {
    if (!this.unit) return '';

    const { canMoved, canAttacked } = this.unit.actionState;

    if (!canMoved && !canAttacked) return '行動完畢';
    if (!canMoved) return '已移動';
    if (!canAttacked) return '已攻擊';
    return '可行動';
  }

  get actionStatusColor(): string {
    if (!this.unit) return '#999';

    const { canMoved, canAttacked } = this.unit.actionState;

    if (!canMoved && !canAttacked) return '#999';
    if (!canMoved || !canAttacked) return '#ffaa00';
    return '#00ff00';
  }

  /**
   * 取得增強後的屬性
   */
  get enhancedAttack(): number {
    if (!this.unit) return 0;
    return this.skillService.getEnhancedAttack(this.unit);
  }

  get enhancedDefense(): number {
    if (!this.unit) return 0;
    return this.skillService.getEnhancedDefense(this.unit);
  }

  get effectiveMove(): number {
    if (!this.unit) return 0;
    let move = this.unit.stats.move;
    const moveBoost = this.skillService.getPassiveEffect(
      this.unit,
      SkillEffectType.MOVE_BOOST
    );
    const slowValue = this.skillService.getPassiveEffect(
      this.unit,
      SkillEffectType.SLOW
    );
    return Math.max(0, move + Math.floor(moveBoost) - Math.floor(slowValue));
  }

  get effectiveRange(): number {
    if (!this.unit) return 0;
    let range = this.unit.stats.range;
    const rangeBoost = this.skillService.getPassiveEffect(
      this.unit,
      SkillEffectType.RANGE_BOOST
    );
    return range + Math.floor(rangeBoost);
  }

  /**
   * 取得技能描述
   */
  getSkillDescriptions(): string[] {
    if (!this.unit) return [];
    return this.skillService.getSkillDescriptions(this.unit);
  }

  /**
   * 取得當前生效的效果
   */
  getActiveEffects(): string[] {
    if (!this.unit) return [];
    return this.skillService.getActiveEffectsDescription(this.unit);
  }

  /**
   * 檢查技能是否有多個效果
   */
  hasMultipleEffects(skill: any): boolean {
    return skill.effects && skill.effects.length > 1;
  }

  /**
   * 取得技能效果數量
   */
  getEffectCount(skill: any): number {
    return skill.effects ? skill.effects.length : 0;
  }

  /**
   * 取得技能圖示
   */
  getSkillIcon(skillId: string): string {
    const iconMap: { [key: string]: string } = {
      berserker: '⚔️',
      iron_wall: '🛡️',
      critical_strike: '💥',
      counter: '↩️',
      terrain_adapt: '🗺️',
      swift: '⚡',
      regeneration: '💚',
      vampire: '🧛',
      heal: '💚',
      power_strike: '💪',
      shield_bash: '🛡️',
      chain_lightning: '⚡',
      group_heal: '✨',
      berserk: '😡',
      fire_storm: '🔥',
    };
    return iconMap[skillId] || '✨';
  }

  /**
   * 取得效果類型圖示
   */
  getEffectIcon(effectType: SkillEffectType): string {
    const iconMap: { [key: string]: string } = {
      [SkillEffectType.ATTACK_BOOST]: '⚔️',
      [SkillEffectType.DEFENSE_BOOST]: '🛡️',
      [SkillEffectType.MOVE_BOOST]: '🚶',
      [SkillEffectType.RANGE_BOOST]: '🎯',
      [SkillEffectType.CRITICAL_HIT]: '💥',
      [SkillEffectType.COUNTER_ATTACK]: '↩️',
      [SkillEffectType.LIFE_STEAL]: '🩸',
      [SkillEffectType.ARMOR_PIERCE]: '🔨',
      [SkillEffectType.HEAL]: '💚',
      [SkillEffectType.REGENERATION]: '💚',
      [SkillEffectType.STUN]: '😵',
      [SkillEffectType.SLOW]: '🐌',
      [SkillEffectType.BURN]: '🔥',
      [SkillEffectType.POISON]: '☠️',
      [SkillEffectType.SHIELD]: '🛡️',
      [SkillEffectType.REFLECT_DAMAGE]: '⚡',
      [SkillEffectType.AREA_ATTACK]: '💣',
      [SkillEffectType.CLEANSE]: '✨',
    };
    return iconMap[effectType] || '✨';
  }

  /**
   * 檢查是否為負面效果
   */
  isDebuff(effectType: SkillEffectType): boolean {
    const debuffTypes = [
      SkillEffectType.STUN,
      SkillEffectType.SLOW,
      SkillEffectType.POISON,
      SkillEffectType.BURN,
    ];
    return debuffTypes.includes(effectType);
  }

  /**
   * 取得暴擊率
   */
  getCritRate(): number {
    if (!this.unit) return 0;
    let totalRate = 0;
    this.unit.skills.forEach((skill) => {
      skill.effects.forEach((effect) => {
        if (
          effect.effectType === SkillEffectType.CRITICAL_HIT &&
          effect.chance
        ) {
          totalRate += effect.chance;
        }
      });
    });
    return Math.min(100, totalRate * 100);
  }
}
