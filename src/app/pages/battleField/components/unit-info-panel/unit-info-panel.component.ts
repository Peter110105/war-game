import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unit } from '../../../../feature/game/model/unit.model';

@Component({
  selector: 'app-unit-info-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unit-info-panel.component.html',
  styleUrl: './unit-info-panel.component.css',
})
export class UnitInfoPanelComponent {
  @Input() unit: Unit | null = null;

  /**
   * 取得 HP 百分比
   */
  get hpPercentage(): number {
    if (!this.unit) return 0;

    return (this.unit.hp / this.unit.maxHp) * 100;
  }

  /**
   * 取得 HP 顏色
   */
  get hpColor(): string {
    const percentage = this.hpPercentage;
    if (percentage > 60) return '#00ff00';
    if (percentage > 30) return '#ffaa00';
    return '#ff0000';
  }

  /**
   * 取得單位類型名稱
   */
  get unitTypeName(): string {
    const typeMap: { [key: string]: string } = {
      soldier: '劍士',
      archer: '弓兵',
      knight: '騎士',
      mage: '法師',
    };
    return this.unit ? typeMap[this.unit.type] || this.unit.type : '';
  }

  /**
   * 取得行動狀態文字
   */
  get actionStatusText(): string {
    if (!this.unit) return '';

    const { hasMoved, hasAttacked } = this.unit.actionState;

    if (hasMoved && hasAttacked) return '行動完畢';
    if (hasMoved) return '已移動';
    if (hasAttacked) return '已攻擊';
    return '可行動';
  }

  /**
   * 取得行動狀態顏色
   */
  get actionStatusColor(): string {
    if (!this.unit) return '#999';

    const { hasMoved, hasAttacked } = this.unit.actionState;

    if (hasMoved && hasAttacked) return '#999';
    if (hasMoved || hasAttacked) return '#ffaa00';
    return '#00ff00';
  }
}
