import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unit } from '../../../../feature/game/model/unit.model';

export type ActionType = 'move' | 'attack' | 'wait' | 'cancel';

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
   * 發送動作事件
   */
  public selectAction(action: ActionType): void {
    this.actionSelected.emit(action);
  }
}
