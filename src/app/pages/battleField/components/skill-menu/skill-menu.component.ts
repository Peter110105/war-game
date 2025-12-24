import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unit } from '../../../../feature/game/model/unit.model';
import { Skill, SkillType } from '../../../../feature/game/model/skill.model';

export type SkillMenuAction =
  | {
      type: 'use-skill';
      skillId: string;
    }
  | {
      type: 'cancel';
    };

@Component({
  selector: 'app-skill-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-menu.component.html',
  styleUrl: './skill-menu.component.css',
})
export class SkillMenuComponent {
  @Input() unit: Unit | null = null;
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };
  @Output() actionSelected = new EventEmitter<SkillMenuAction>();

  SkillType = SkillType;

  /**
   * 獲取可用的主動技能
   */
  get availableSkills(): Skill[] {
    if (!this.unit) return [];

    return this.unit.skills.filter((skill) => {
      // 只顯示主動技能
      if (skill.type !== SkillType.ACTIVE) return false;

      // 檢查冷卻
      if (skill.currentCooldown && skill.currentCooldown > 0) return false;

      // 檢查魔力
      if (skill.manaCost && this.unit?.stats.mana !== undefined) {
        if (skill.manaCost > this.unit.stats.mana) return false;
      }

      return true;
    });
  }

  /**
   * 獲取冷卻中的技能
   */
  get cooldownSkills(): Skill[] {
    if (!this.unit) return [];

    return this.unit.skills.filter((skill) => {
      skill.type === SkillType.ACTIVE &&
        skill.currentCooldown &&
        skill.currentCooldown > 0;
    });
  }

  /**
   * 選擇技能
   */
  public selectSkill(skillId: string): void {
    this.actionSelected.emit({
      type: 'use-skill',
      skillId: skillId,
    });
  }

  /**
   * 取消選擇
   */
  public cancel(): void {
    this.actionSelected.emit({
      type: 'cancel',
    });
  }

  /**
   * 獲取技能圖示
   */
  public getSkillIcon(skillId: string): string {
    const iconMap: { [key: string]: string } = {
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
   * 檢查魔力是否足夠
   */
  public canAffordSkill(skill: Skill): boolean {
    if (!skill.manaCost || !this.unit?.stats.mana) return true;
    return this.unit.stats.mana >= skill.manaCost;
  }
  /**
   * 獲取技能效果數量
   */
  public getEffectCount(skill: Skill): number {
    return skill.effects?.length || 0;
  }
}
