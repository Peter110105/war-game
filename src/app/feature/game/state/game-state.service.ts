import { Injectable } from '@angular/core';
import { GameStateLoaderService } from '../../../core/service/game-state-loader.service';
import { GameEventService, GameEventType } from './game-event.service';
import { GameState } from '../model/game-state.model';
import { GameCommand } from '../command/command.interface';
import { MovementProcessor } from '../movement/movement-processor';
import { CombatProcessor } from '../combat/combat-processor';
import { Unit } from '../model/unit.model';
import { Player } from '../model/player.model';
import { GameStateFactory } from '../factory/game-state.factory';
import { SkillEffectType } from '../model/skill.model';
import { SkillService } from '../skill/skill.service';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private state!: GameState;

  constructor(
    private eventService: GameEventService,
    private movementProcessor: MovementProcessor,
    private combatProcessor: CombatProcessor,
    private gameStateLoaderService: GameStateLoaderService,
    private gameStateFactory: GameStateFactory,
    private skillService: SkillService
  ) {
    // this.state = this.gameStateFactory.createDefaultGame();

    // 確保所有單位都有 activeEffects 陣列
    // this.state.units.forEach((unit) => {
    //   if (!unit.activeEffects) {
    //     unit.activeEffects = [];
    //   }
    // });

    // 非同步加載資料
    this.gameStateLoaderService.loadInitialState().subscribe((loadedState) => {
      this.state = this.gameStateFactory.createGameFromConfig(loadedState);

      // 確保載入的單位也有 activeEffects
      // this.state.units.forEach((unit) => {
      //   if (!unit.activeEffects) {
      //     unit.activeEffects = [];
      //   }
      // });
    });
  }

  get turn(): number {
    return this.state.turn;
  }

  get currentPlayerId(): string {
    return this.getCurrentPlayer().id;
  }

  public getUnits(): Unit[] {
    return this.state.units;
  }

  /**
   * @param x 座標
   * @param y 座標
   * @returns 單位 或 undefined
   */
  public getUnitAt(x: number, y: number): Unit | undefined {
    return this.state.units.find((u) => u.x === x && u.y === y && u.alive);
  }

  /**
   * 透過ID取得單位
   * @param unitId 單位ID
   * @returns 單位 或 undefined
   */
  public getUnitById(unitId: string): Unit | undefined {
    return this.state.units.find((u) => u.id === unitId);
  }

  /**
   * 取得遊戲狀態
   */
  public getGameState(): GameState {
    return this.state;
  }

  /**
   * @returns 當前行動玩家
   */
  public getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  /**
   * 結束回合
   */
  public endTurn() {
    const currentPlayer = this.getCurrentPlayer();

    // 1. 處理當前玩家所有單位的回合結束效果
    this.state.units
      .filter((u) => u.ownerId === currentPlayer.id && u.alive)
      .forEach((u) => {
        // 減少技能冷卻
        this.skillService.reduceCooldowns(u);

        // 恢復魔力
        this.skillService.restoreMana(u);
      });

    // 2. 切換玩家
    this.state.currentPlayerIndex =
      (this.state.currentPlayerIndex + 1) % this.state.players.length;

    // 3. 增加回合數（每當 P1 回合開始時增加）
    if (this.state.currentPlayerIndex === 0) {
      this.state.turn++;
    }

    const nextPlayer = this.getCurrentPlayer();

    // 4. 處理下一個玩家的回合開始效果
    this.state.units
      .filter((u) => u.ownerId === nextPlayer.id && u.alive)
      .forEach((u) => {
        // 重置行動狀態
        u.actionState = {
          hasMoved: false,
          hasAttacked: false,
          canAct: true,
          isStunned: false,
        };

        // 檢查是否被暈眩
        const isStunned = u.activeEffects.some(
          (e) => e.effectType === SkillEffectType.STUN
        );
        if (isStunned) {
          u.actionState.isStunned = true;
          u.actionState.canAct = false;
          console.log(`😵 ${u.name} 被暈眩，無法行動！`);
        }

        // 觸發回合開始時的技能效果
        this.skillService.triggerTurnStartEffects(u);

        // 檢查單位是否因持續傷害死亡
        if (!u.alive) {
          this.eventService.emit({
            type: GameEventType.UNIT_DIED,
            data: {
              unitId: u.id,
              cause: 'dot', // damage over time
            },
          });
        }
      });

    // 5. 發出回合結束事件
    this.eventService.emit({
      type: GameEventType.TURN_ENDED,
      data: {
        turn: this.state.turn,
        currentPlayerId: this.getCurrentPlayer().id,
      },
    });
  }

  public execute(cmd: GameCommand) {
    if (cmd.type === 'MOVE') {
      return this.movementProcessor.execute(this.state, cmd);
    }

    if (cmd.type === 'ATTACK') {
      return this.combatProcessor.execute(this.state, cmd);
    }

    if (cmd.type === 'END_TURN') {
      // 1. 檢查是否輪到該玩家
      if (cmd.playerId !== this.getCurrentPlayer().id) {
        return { success: false, message: 'not your turn' };
      }

      // 2. 結束回合
      this.endTurn();
      return { success: true, message: 'end turn success' };
    }

    return { success: false, message: 'unknown command' };
  }

  /**
   * 重置該玩家所有單位的行動狀態
   * @param playerId 玩家ID
   */
  public resetPlayerActions(playerId: string) {
    this.state.units
      .filter((u) => u.ownerId === playerId && u.alive)
      .forEach((u) => {
        u.actionState = {
          hasMoved: false,
          hasAttacked: false,
          canAct: true,
          isStunned: false,
        };
      });
  }

  /**
   * 標記單位為已移動
   */
  public setUnitMoved(unitId: string) {
    const unit = this.state.units.find((u) => u.id === unitId);
    if (unit) {
      unit.actionState.hasMoved = true;
    }
  }

  /**
   * @param unitId 單位ID
   * @returns 單位是否可行動
   */
  public canUnitAct(unitId: string): boolean {
    const unit = this.state.units.find((u) => u.id === unitId);
    return unit?.actionState.canAct ?? false;
  }

  /**
   * @param unitId 單位ID
   * @returns 單位是否可移動
   */
  public canUnitMove(unitId: string): boolean {
    const unit = this.state.units.find((u) => u.id === unitId);
    if (!unit) return false;

    // 檢查是否被暈眩或減速
    const isStunned = unit.actionState.isStunned;
    if (isStunned) return false;

    return unit.actionState.canAct && !unit.actionState.hasMoved;
  }

  /**
   * 取得單位的實際移動力（包含 buff/debuff）
   */
  public getUnitEffectiveMove(unitId: string): number {
    const unit = this.state.units.find((u) => u.id === unitId);
    if (!unit) return 0;

    let move = unit.stats.move;

    // 應用移動力加成/減免
    const moveBoost = this.skillService.getPassiveEffect(
      unit,
      SkillEffectType.MOVE_BOOST
    );
    move += Math.floor(moveBoost);

    // 應用減速效果
    const slowValue = this.skillService.getPassiveEffect(
      unit,
      SkillEffectType.SLOW
    );
    move -= Math.floor(slowValue);

    return Math.max(0, move);
  }

  /**
   * 檢查單位是否可以飛行
   */
  public canUnitFly(unitId: string): boolean {
    const unit = this.state.units.find((u) => u.id === unitId);
    if (!unit) return false;

    return (
      unit.characteristics?.canFly ||
      this.skillService.hasEffect(unit, SkillEffectType.FLY)
    );
  }

  /**
   * 檢查單位是否忽略地形
   */
  public doesUnitIgnoreTerrain(unitId: string): boolean {
    const unit = this.state.units.find((u) => u.id === unitId);
    if (!unit) return false;

    return (
      unit.characteristics?.ignoresTerrain ||
      this.skillService.hasEffect(unit, SkillEffectType.IGNORE_TERRAIN) ||
      this.skillService.hasEffect(unit, SkillEffectType.TERRAIN_MASTER)
    );
  }
}
