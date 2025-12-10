import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-result-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-result-modal.component.html',
  styleUrl: './game-result-modal.component.css',
})
export class GameResultModalComponent {
  @Input() isVisible = false;
  @Input() isVictory = false;
  @Input() winner = '';
  @Input() reason = '';
  @Output() restart = new EventEmitter<void>();

  /**
   * 重新開始遊戲
   */
  onRestart(): void {
    this.restart.emit();
  }
}
