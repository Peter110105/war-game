import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GameStateService } from '../../feature/game/state/game-state.service';
import { PHASER_CONFIG } from '../../feature/game/phaser/config/phaser-config';
import { Subscription } from 'rxjs';
import {
  GameEventService,
  GameEventType,
} from '../../feature/game/state/game-event.service';
import { PathfindingService } from '../../feature/game/movement/path-finding.service';
import { Unit } from '../../feature/game/model/unit.model';
import { GameCommand } from '../../feature/game/command/command.interface';
import { CommonModule } from '@angular/common';
import {
  ActionMenuComponent,
  ActionType,
} from './components/action-menu/action-menu.component';
import { UnitInfoPanelComponent } from './components/unit-info-panel/unit-info-panel.component';
import { GameResultModalComponent } from './components/game-result-modal/game-result-modal.component';
import { VictoryService } from '../../feature/game/level/victory.service';
import { SkillService } from '../../feature/game/skill/skill.service';
import {
  SkillMenuComponent,
  SkillMenuAction,
} from './components/skill-menu/skill-menu.component';

@Component({
  selector: 'app-battlefield',
  standalone: true,
  imports: [
    CommonModule,
    ActionMenuComponent,
    SkillMenuComponent,
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
  hoveredUnit: Unit | null = null; // 用於顯示資訊的單位
  showActionMenu = false;
  showSkillMenu = false;
  menuPosition = { x: 0, y: 0 };

  // 當前模式
  currentMode: 'idle' | 'move' | 'attack' | 'skill' = 'idle';
  selectedSkillId: string | null = null;

  // 遊戲結果狀態
  showResultModal = false;
  isVictory = false;
  winner = '';
  victoryReason = '';

  constructor(
    private gameService: GameStateService,
    private eventService: GameEventService,
    private pathfindingService: PathfindingService,
    private victoryService: VictoryService,
    private skillService: SkillService
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
    this.showSkillMenu = false;
    this.selectedUnit = null;
  }

  /**
   * 處理命令選單的動作
   */
  public onActionSelected(action: ActionType) {
    console.log('Action selected:', action);
    switch (action) {
      case 'move':
        // 進入移動模式
        this.currentMode = 'move';
        this.showActionMenu = false;

        // 發送事件給 Phaser,只顯示移動範圍
        this.eventService.emit({
          type: GameEventType.PLAYER_ACTION_MOVED,
          data: { unitId: this.selectedUnit?.id },
        });
        break;
      case 'attack':
        // 進入攻擊模式
        this.currentMode = 'attack';
        this.showActionMenu = false;

        // 發送事件給 Phaser,只顯示攻擊範圍
        this.eventService.emit({
          type: GameEventType.PLAYER_ACTION_ATTACKED,
          data: { unitId: this.selectedUnit?.id },
        });
        break;
      case 'skill':
        // 切換到技能選單
        this.showActionMenu = false;
        this.showSkillMenu = true;
        break;
      case 'wait':
        // 待機 (標記單位已完成行動)
        if (this.selectedUnit) {
          this.selectedUnit.actionState.hasMoved = true;
          this.selectedUnit.actionState.hasAttacked = true;
          this.selectedUnit.actionState.canAct = false;
        }

        this.eventService.emit({
          type: GameEventType.PLAYER_ACTION_WAIT,
          data: { unitId: this.selectedUnit?.id },
        });

        this.showActionMenu = false;
        this.selectedUnit = null;
        this.currentMode = 'idle';
        break;
      case 'cancel':
        // 取消選擇
        this.eventService.emit({
          type: GameEventType.PLAYER_ACTION_CANCELLED,
          data: { unitId: this.selectedUnit?.id },
        });

        this.showActionMenu = false;
        this.selectedUnit = null;
        this.hoveredUnit = null;
        this.currentMode = 'idle';
        break;
    }
  }

  /**
   * 處理技能選單的動作
   */
  public onSkillMenuAction(action: SkillMenuAction) {
    switch (action.type) {
      case 'cancel':
        // 返回命令選單
        this.showSkillMenu = false;
        this.showActionMenu = true;
        this.selectedSkillId = null;
        break;
      case 'use-skill':
        this.selectedSkillId = action.skillId;
        this.currentMode = 'skill';
        this.showSkillMenu = false;

        // 發送事件給 Phaser 顯示技能範圍
        this.eventService.emit({
          type: GameEventType.SKILL_USED,
          data: {
            unitId: this.selectedUnit?.id,
            skillId: action.skillId,
            selectingTarget: true,
          },
        });
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
      skillService: this.skillService,
    });
  }

  private subscribeToGameEvents() {
    this.eventSubscription = this.eventService.events$.subscribe((event) => {
      switch (event.type) {
        case GameEventType.UNIT_SELECTED:
          const unit = this.gameService.getUnitAt(event.data.x, event.data.y);
          if (unit) {
            this.hoveredUnit = unit;
            if (unit.ownerId === this.gameService.currentPlayerId) {
              this.selectedUnit = unit;
              // 計算選單位置 (單位右側)
              this.menuPosition = {
                x: event.data.x * 64 + 80,
                y: event.data.y * 64,
              };
              this.showActionMenu = true;
              this.showSkillMenu = false;
            } else {
              this.selectedUnit = null;
              this.showActionMenu = false;
              this.showSkillMenu = false;
            }
          }
          console.log('Unit selected:', this.selectedUnit?.name);
          break;

        case GameEventType.UNIT_MOVED:
          console.log('Unit moved:', event.data);
          this.showActionMenu = false;
          this.showSkillMenu = false;
          this.selectedUnit = null;
          this.hoveredUnit = null;
          this.currentMode = 'idle';
          break;

        case GameEventType.UNIT_ATTACKED:
          console.log('Unit attacked:', event.data);
          // 顯示戰鬥結果訊息
          if (event.data.isCritical) {
            console.log('💥 暴擊！');
          }
          if (event.data.evaded) {
            console.log('💨 閃避！');
          }
          if (event.data.isCounterAttack) {
            console.log('↩️ 反擊！');
          }
          if (event.data.reflectDamage && event.data.reflectDamage > 0) {
            console.log(`⚡ 反傷 ${event.data.reflectDamage} 點傷害！`);
          }
          if (
            event.data.attackerLifeSteal &&
            event.data.attackerLifeSteal > 0
          ) {
            console.log(`🩸 吸血 ${event.data.attackerLifeSteal} HP！`);
          }
          this.showActionMenu = false;
          this.showSkillMenu = false;
          this.selectedUnit = null;
          this.hoveredUnit = null;
          this.currentMode = 'idle';
          break;
        case GameEventType.UNIT_HEALED:
          console.log('Unit healed:', event.data);
          break;

        case GameEventType.UNIT_LEVEL_UP:
          console.log('🎉 Unit leveled up:', event.data);
          const leveledUnit = this.gameService.getUnitById(event.data.unitId);
          if (leveledUnit) {
            console.log(`${leveledUnit.name} 升級到 Lv.${event.data.level}！`);
          }
          break;

        case GameEventType.SKILL_USED:
          if (!event.data.selectingTarget) {
            console.log('✨ 技能使用:', event.data);
            this.showSkillMenu = false;
            this.selectedSkillId = null;
            this.selectedUnit = null;
            this.currentMode = 'idle';
          }
          break;

        case GameEventType.TURN_ENDED:
          console.log('Turn ended:', event.data);
          this.showActionMenu = false;
          this.showSkillMenu = false;
          this.selectedUnit = null;
          this.hoveredUnit = null;
          this.currentMode = 'idle';
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
    const result = this.victoryService.checkVictory(
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
