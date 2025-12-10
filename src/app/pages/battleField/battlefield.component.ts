import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GameStateService } from '../../feature/game/service/game-state.service';
import { PHASER_CONFIG } from '../../feature/game/phaser/phaser-config';
import { Subscription } from 'rxjs';
import {
  GameEventService,
  GameEventType,
} from '../../feature/game/service/game-event.service';
import { PathfindingService } from '../../feature/game/logic/path-finding.service';
import { Unit } from '../../feature/game/model/unit.model';
import { GameCommand } from '../../feature/game/command/command.interface';
import { CommonModule } from '@angular/common';
import {
  ActionMenuComponent,
  ActionType,
} from './components/action-menu/action-menu.component';
import { UnitInfoPanelComponent } from './components/unit-info-panel/unit-info-panel.component';
import { GameResultModalComponent } from './components/game-result-modal/game-result-modal.component';
import { VictoryService } from '../../feature/game/service/victory.service';

@Component({
  selector: 'app-battlefield',
  standalone: true,
  imports: [
    CommonModule,
    ActionMenuComponent,
    UnitInfoPanelComponent,
    GameResultModalComponent,
  ],
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.css'],
})
export class BattlefieldComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;

  private game?: Phaser.Game;
  private eventSubscription?: Subscription;
  // UI狀態
  selectedUnit: Unit | null = null;
  showActionMenu = false;
  menuPosition = { x: 0, y: 0 };

  // 遊戲結果狀態
  showResultModal = false;
  isVictory = false;
  winner = '';
  victoryReason = '';

  constructor(
    private gameService: GameStateService,
    private eventService: GameEventService,
    private pathfindingService: PathfindingService,
    private victoryServiec: VictoryService
  ) {}

  get currentPlayer() {
    return this.gameService.getCurrentPlayer();
  }

  get gameState() {
    return this.gameService.getGameState();
  }

  ngOnInit() {
    this.initPhaserGame();
    this.subscribeToGameEvents();
  }

  ngOnDestroy(): void {
    this.eventSubscription?.unsubscribe();
    this.game?.destroy(true);
  }

  public isCurrentPlayer(): boolean {
    return this.gameService.currentPlayerId === this.currentPlayer?.id;
  }

  public endTurn() {
    const cmd: GameCommand = {
      id: 'cmd_' + Date.now(),
      type: 'END_TURN',
      playerId: this.currentPlayer.id,
      timestamp: Date.now(),
    };

    const result = this.gameService.execute(cmd);
    console.log(result);

    // 關閉選單
    this.showActionMenu = false;
    this.selectedUnit = null;
  }

  /**
   * 處理命令選單的動作
   */
  onActionSelected(action: ActionType) {
    console.log('Action selected:', action);

    switch (action) {
      case 'move':
        // 進入移動模式
        this.showActionMenu = false;
        break;
      case 'attack':
        // 進入攻擊模式
        this.showActionMenu = false;
        break;
      case 'wait':
        // 待機 (標記單位已完成行動)
        if (this.selectedUnit) {
          // this.selectedUnit.actionState.hasMoved = true;
          // this.selectedUnit.actionState.hasAttacked = true;
          this.selectedUnit.actionState.canAct = false;
        }
        this.showActionMenu = false;
        this.selectedUnit = null;
        break;
      case 'cancel':
        // 取消選擇
        this.showActionMenu = false;
        this.selectedUnit = null;
        break;
    }
  }

  private initPhaserGame() {
    const config: Phaser.Types.Core.GameConfig = {
      ...PHASER_CONFIG,
      parent: this.gameContainer.nativeElement,
    };
    this.game = new Phaser.Game(config);
    this.game.scene.start('BattlefieldScene', {
      gameService: this.gameService,
      eventService: this.eventService,
      pathfindingService: this.pathfindingService,
    });
  }

  private subscribeToGameEvents() {
    this.eventSubscription = this.eventService.events$.subscribe((event) => {
      switch (event.type) {
        case GameEventType.UNIT_SELECTED:
          const unit = this.gameService.getUnitAt(event.data.x, event.data.y);
          if (unit && unit.ownerId === this.gameService.currentPlayerId) {
            this.selectedUnit = unit;
            // 計算選單位置 (單位右側)
            this.menuPosition = {
              x: event.data.x * 64 + 80,
              y: event.data.y * 64,
            };
            this.showActionMenu = true;
          }
          console.log('Unit selected:', this.selectedUnit?.name);
          break;
        case GameEventType.UNIT_MOVED:
          console.log('Unit moved:', event.data);
          this.showActionMenu = false;
          this.selectedUnit = null;
          break;
        case GameEventType.TURN_ENDED:
          console.log('Turn ended:', event.data);
          this.showActionMenu = false;
          this.selectedUnit = null;
          break;
        case GameEventType.UNIT_DIED:
          this.checkGameOver();
          break;
      }
    });
  }

  /**
   * 檢查遊戲是否結束
   */
  private checkGameOver(): void {
    const result = this.victoryServiec.checkVictory(
      this.gameService.getGameState()
    );

    if (result.isGameOver) {
      // 延遲顯示,讓死亡動畫播放完
      setTimeout(() => {
        this.showResultModal = true;
        this.winner = result.winner || '';
        this.victoryReason = result.reason || '';

        // 判斷當前玩家是否勝利
        const currentPlayerId = this.gameService.currentPlayerId;
        this.isVictory = this.winner === currentPlayerId;
      }, 1000);
    }
  }

  /**
   * 重新開始遊戲
   */
  onRestart(): void {
    this.showResultModal = false;
    window.location.reload(); // 簡單的重新載入頁面
  }
}
