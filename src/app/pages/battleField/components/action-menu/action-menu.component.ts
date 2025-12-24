import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unit } from '../../../../feature/game/model/unit.model';
import { SkillType } from '../../../../feature/game/model/skill.model';

export type ActionType = 'move' | 'attack' | 'skill' | 'wait' | 'cancel';

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-menu.component.html',
  styleUrl: './action-menu.component.css',
})
export class ActionMenuComponent {
  @Input() selectedUnit: Unit | null = null;
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };
  @Output() actionSelected = new EventEmitter<ActionType>();

  /**
   * 檢查是否可以移動
   */
  get canMove(): boolean {
    return (
      (this.selectedUnit?.actionState.canAct &&
        !this.selectedUnit?.actionState.hasMoved) ||
      false
    );
  }
  /**
   * 檢查是否可以攻擊
   */
  get canAttack(): boolean {
    return (
      (this.selectedUnit?.actionState.canAct &&
        !this.selectedUnit?.actionState.hasAttacked) ||
      false
    );
  }
  /**
   * 檢查是否有可用的主動技能
   */
  get hasActiveSkills(): boolean {
    if (!this.selectedUnit) return false;

    return this.selectedUnit.skills.some((skill) => {
      // 必須是主動技能
      if (skill.type !== SkillType.ACTIVE) return false;

      // 不能在冷卻中
      if (skill.currentCooldown && skill.currentCooldown > 0) return false;

      // 魔力必須足夠
      if (skill.manaCost && this.selectedUnit?.stats.mana !== undefined) {
        if (this.selectedUnit.stats.mana < skill.manaCost) return false;
      }

      return true;
    });
  }
  /**
   * 發送動作事件
   */
  public selectAction(action: ActionType): void {
    this.actionSelected.emit(action);
  }
}
