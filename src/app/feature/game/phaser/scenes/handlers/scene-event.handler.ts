import Phaser from 'phaser';
import { Subscription } from 'rxjs';
import {
  GameEventService,
  GameEventType,
} from '../../../state/game-event.service';
import { GameStateService } from '../../../state/game-state.service';
import { UnitRendererManager } from '../../managers/rendering/unit-renderer.manager';
import { HpBarManager } from '../../managers/rendering/hp-bar.manager';
import { EffectRendererManager } from '../../managers/rendering/effect-renderer.manager';

/**
 * 場景事件處理器
 * 職責：統一處理所有遊戲事件訂閱
 */
export class SceneEventHandler {
  private eventSubscription?: Subscription;

  constructor(
    private scene: Phaser.Scene,
    private eventService: GameEventService,
    private gameService: GameStateService,
    private unitRenderer: UnitRendererManager,
    private hpBarMgr: HpBarManager,
    private effectRenderer: EffectRendererManager
  ) {}

  public subscribeToEvents() {
    this.eventSubscription = this.eventService.events$.subscribe((event) => {
      switch (event.type) {
        case GameEventType.UNIT_MOVED:
          this.handleUnitMovement(event.data);
          break;
        case GameEventType.UNIT_ATTACKED:
          this.handleUnitAttack(event.data);
          break;
        case GameEventType.UNIT_DIED:
          this.handleUnitDeath(event.data);
          break;
        case GameEventType.UNIT_LEVEL_UP:
          this.handleUnitLevelUp(event.data);
          break;
        case GameEventType.SKILL_USED:
          this.handleSkillUsed(event.data);
          break;
        case GameEventType.TURN_ENDED:
          this.handleTurnEnded();
          break;
        case GameEventType.PLAYER_ACTION_MOVED:
        case GameEventType.PLAYER_ACTION_ATTACKED:
        case GameEventType.PLAYER_ACTION_WAIT:
        case GameEventType.PLAYER_ACTION_CANCELLED:
          // 這些由 SceneInputHandler 處理
          break;
      }
    });
  }

  /**
   * 處理單位移動
   * @param data 事件數據
   */
  private handleUnitMovement(data: any) {
    console.log('處理單位移動事件:', data);
    const unit = this.gameService.getUnitById(data.unitId);
    if (unit) {
      this.hpBarMgr.moveHpBar(unit);
      this.effectRenderer.moveEffectIcons(unit);
    }
  }

  /**
   * 處理單位攻擊
   * @param data 事件數據
   */
  private handleUnitAttack(data: any) {
    console.log('處理單位攻擊事件:', data);
    const defender = this.gameService.getUnitById(data.defenderId);
    if (!defender) return;

    // 更新血條
    this.hpBarMgr.updateHpBar(defender);

    // 獲取視覺效果處理器
    const visualHandler = (this.scene as any).getVisualHandler();

    // 顯示傷害數字
    if (data.defenderDamage) {
      visualHandler.showDamageNumber(
        defender.x,
        defender.y,
        data.defenderDamage,
        data.isCritical
      );
    }
    // 顯示特殊效果
    if (data.isCritical) {
      visualHandler.showCriticalEffect(defender.x, defender.y);
    }
    if (data.evaded) {
      visualHandler.showEvadeEffect(defender.x, defender.y);
    }
    if (data.reflectDamage && data.reflectDamage > 0) {
      const attacker = this.gameService.getUnitById(data.unitId);
      if (attacker) {
        visualHandler.showDamageNumber(
          attacker.x,
          attacker.y,
          data.reflectDamage,
          false
        );
      }
    }
  }

  /**
   * 處理單位死亡
   * @param data 事件數據
   */
  private handleUnitDeath(data: any) {
    console.log('處理單位死亡事件:', data);
    this.unitRenderer.removeUnit(data.unitId);
    this.hpBarMgr.removeHpBar(data.unitId);
    this.effectRenderer.removeEffectIcons(data.unitId);
  }
  /**
   * 處理單位升級
   * @param data 事件數據
   */
  private handleUnitLevelUp(data: any): void {
    console.log('處理單位升級事件:', data);
    const visualHandler = (this.scene as any).getVisualHandler();
    visualHandler.showLevelUpEffect(data.unitId);
  }
  /**
   * 處理技能使用
   * @param data 事件數據
   */
  private handleSkillUsed(data: any): void {
    console.log('處理技能使用事件:', data);
    const visualHandler = (this.scene as any).getVisualHandler();
    visualHandler.showSkillEffect(data.unitId, data.skillId);
  }
  /**
   * 處理回合結束
   */
  private handleTurnEnded(): void {
    console.log('處理回合結束事件');
    // 更新所有單位的效果圖示
    const gameState = this.gameService.getGameState();
    gameState.units.forEach((unit) => {
      if (unit.alive) {
        this.effectRenderer.updateEffectIcons(unit);
      }
    });
  }
  /**
   * 清理訂閱
   */
  public destroy() {
    this.eventSubscription?.unsubscribe();
  }
}
