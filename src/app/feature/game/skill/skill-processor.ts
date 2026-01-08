import { Injectable } from '@angular/core';
import { GameEventService, GameEventType } from '../state/game-event.service';
import { SkillService } from './skill.service';
import { GameState } from '../model/game-state.model';
import { GameCommand, SkillCommand } from '../command/command.interface';
import { Skill, TargetType } from '../model/skill.model';
import { Unit } from '../model/unit.model';

export interface SkillExecutionResult {
  success: boolean;
  message?: string;
  affectedUnitIds?: string[];
  healAmount?: number;
  damageAmount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SkillProcessor {
  constructor(
    private eventService: GameEventService,
    private skillService: SkillService
  ) {}

  execute(state: GameState, cmd: GameCommand): SkillExecutionResult {
    // 1.判斷處理器是否正確
    if (cmd.type != 'SKILL')
      return { success: false, message: 'skill not implemented' };

    // 2.驗證施放者
    const caster = state.units.find((u) => u.id === cmd.unitId);
    if (!caster) {
      return { success: false, message: 'caster unit not found' };
    }
    if (caster.ownerId !== cmd.playerId) {
      return { success: false, message: 'not your unit' };
    }
    if (caster.actionState.hasAttacked || !caster.actionState.canAct) {
      return {
        success: false,
        message: 'caster unit already attacked this turn',
      };
    }

    // 3.驗證技能
    const skill = caster.skills.find((s) => s.id === cmd.skillId);
    if (!skill) {
      return { success: false, message: 'skill not found' };
    }

    // 4.驗證射程
    const skillRange = skill.range || 1;
    if (!this.validateRange(caster, skill, cmd)) {
      return { success: false, message: 'target out of range' };
    }

    // 5. 根據目標類型收集目標單位
    const targets = this.collectTargets(state, caster, skill, cmd);
    if (targets.length === 0) {
      return { success: false, message: 'no valid targets' };
    }

    // 6. 執行技能
    const result = this.skillService.useSkill(caster, skill, targets);
    if (!result.success) {
      return result;
    }

    // 7. 標記單位已使用技能
    caster.actionState.hasAttacked = true;

    // 8. 發送技能使用事件
    this.eventService.emit({
      type: GameEventType.SKILL_ACTIVATED,
      data: {
        unitId: caster.id,
        skillId: skill.id,
        targetIds: targets.map((t) => t.id),
        targetPosition: cmd.targetPosition,
      },
    });

    return {
      success: true,
      message: 'skill executed successfully',
      affectedUnitIds: targets.map((t) => t.id),
    };
  }

  /**
   * 根據目標類型收集目標單位
   *
   * 統一使用 targetPosition 來定位：
   * - SELF: 施放者自己
   * - ALLY/ENEMY: targetPosition 位置的單位
   * - ALLY_ALL/ENEMY_ALL: 所有符合條件的單位
   * - AREA: targetPosition 為中心，targetRange 為半徑的範圍內單位
   * - TILE: targetPosition 位置的單位（或地格本身）
   */
  private collectTargets(
    state: GameState,
    caster: Unit,
    skill: Skill,
    cmd: SkillCommand
  ): Unit[] {
    const targets: Unit[] = [];

    switch (skill.effects[0].targetType) {
      case TargetType.SELF:
        targets.push(caster);
        break;
      case TargetType.ALLY:
        if (cmd.targetPosition) {
          const unit = state.units.find(
            (u) =>
              u.x === cmd.targetPosition!.x &&
              u.y === cmd.targetPosition!.y &&
              u.ownerId === caster.ownerId &&
              u.alive
          );
          if (unit) {
            targets.push(unit);
          }
        }
        break;
      case TargetType.ENEMY:
        if (cmd.targetPosition) {
          const unit = state.units.find(
            (u) =>
              u.x === cmd.targetPosition!.x &&
              u.y === cmd.targetPosition!.y &&
              u.ownerId !== caster.ownerId &&
              u.alive
          );
          if (unit) {
            targets.push(unit);
          }
        }
        break;
      case TargetType.ALLY_ALL:
        state.units.forEach((u) => {
          if (u.ownerId === caster.ownerId && u.alive) {
            targets.push(u);
          }
        });
        break;
      case TargetType.ENEMY_ALL:
        state.units.forEach((u) => {
          if (u.ownerId !== caster.ownerId && u.alive) {
            targets.push(u);
          }
        });
        break;
      case TargetType.AREA:
        if (cmd.targetPosition && skill.range) {
          state.units.forEach((u) => {
            if (!u.alive) {
              return;
            }
            const distance =
              Math.abs(u.x - cmd.targetPosition!.x) +
              Math.abs(u.y - cmd.targetPosition!.y);
            if (distance <= skill.range!) {
              targets.push(u);
            }
          });
        }
        break;
      case TargetType.TILE:
        if (cmd.targetPosition) {
          const unit = state.units.find(
            (u) =>
              u.x === cmd.targetPosition!.x &&
              u.y === cmd.targetPosition!.y &&
              u.alive
          );
          if (unit) {
            targets.push(unit);
          }
        }
        break;
      case TargetType.ANY:
        if (cmd.targetPosition) {
          const unit = state.units.find((u) => {
            u.x === cmd.targetPosition!.x &&
              u.y === cmd.targetPosition!.y &&
              u.alive;
          });
          if (unit) {
            targets.push(unit);
          }
        }
        break;
    }
    return targets;
  }

  /**
   * 驗證射程
   *
   * SELF 不需要驗證射程
   * 其他類型都檢查 targetPosition 是否在範圍內
   */
  private validateRange(
    caster: Unit,
    skill: Skill,
    cmd: SkillCommand
  ): boolean {
    if (!cmd.targetPosition) {
      return false;
    }
    const distance =
      Math.abs(caster.x - cmd.targetPosition.x) +
      Math.abs(caster.y - cmd.targetPosition.y);
    return distance <= skill.range;
  }
}
