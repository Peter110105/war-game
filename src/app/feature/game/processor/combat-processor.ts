import { Injectable } from '@angular/core';
import { GameCommand } from '../command/command.interface';
import { GameState } from '../model/game-state.model';
import { CombatCalculator } from '../logic/combat-calculator.service';
import { GameEventService, GameEventType } from '../service/game-event.service';

@Injectable({
  providedIn: 'root',
})
export class CombatProcessor {
  constructor(private eventService: GameEventService) {}

  execute(
    state: GameState,
    cmd: GameCommand
  ): { success: boolean; message?: string; damage?: number; isDead?: boolean } {
    // 1.判斷處理器是否正確
    if (cmd.type != 'ATTACK')
      return { success: false, message: 'combat not implemented' };

    // 2.檢查是否有選單位
    if (cmd.unitId == null || cmd.targetId == null)
      return { success: false, message: 'combat missing unitId or targetId' };

    // 3.單位檢查
    const attacker = state.units.find((u) => u.id === cmd.unitId);
    if (!attacker)
      return { success: false, message: 'attacker unit not found' };
    if (attacker.actionState.hasAttacked || !attacker.actionState.canAct)
      return {
        success: false,
        message: 'attacker unit already attacked this turn',
      };
    if (!attacker.alive)
      return { success: false, message: 'attacker unit dead' };
    if (attacker.ownerId !== cmd.playerId)
      return { success: false, message: 'not your unit' };

    const defender = state.units.find((u) => u.id === cmd.targetId);
    if (!defender)
      return { success: false, message: 'defender unit not found' };
    if (!defender.alive)
      return { success: false, message: 'defender unit dead' };

    // 4.是否可攻擊檢查
    const calculator = new CombatCalculator();
    if (!calculator.canAttack(attacker, defender)) {
      return { success: false, message: 'cannot attack target' };
    }

    // 5.計算傷害並更新hp
    const damage = calculator.calculateDamage(attacker, defender);
    defender.hp -= damage;

    // 6.檢查目標是否死亡
    let isDead = false;
    if (defender.hp <= 0) {
      defender.alive = false;
      defender.hp = 0;
      isDead = true;

      this.eventService.emit({
        type: GameEventType.UNIT_DIED,
        data: {
          unitId: defender.id,
          damage,
        },
      });
    }
    // 發送攻擊事件 (用於更新血條)
    attacker.actionState.hasAttacked = true;
    this.eventService.emit({
      type: GameEventType.UNIT_ATTACKED,
      data: {
        unitId: attacker.id,
        defenderId: defender.id,
        damage,
      },
    });

    return { success: true, message: 'combat success', damage, isDead };
  }
}
