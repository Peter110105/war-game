import { Injectable } from '@angular/core';
import { GameCommand } from '../command/command.interface';
import { GameState } from '../model/game-state.model';
import { CombatCalculator } from '../combat/combat-calculator.service';
import { GameEventService, GameEventType } from '../state/game-event.service';
import { UnitLevelService } from '../unit/unit-level.service';
import { Unit } from '../model/unit.model';
import { TriggerTiming } from '../model/skill.model';

export interface CombatResult {
  success: boolean;
  message?: string;
  attackerDamage?: number;
  defenderDamage?: number;
  attackerLifeSteal?: number;
  defenderLifeSteal?: number;
  attackerDied?: boolean;
  defenderDied?: boolean;
  isCritical?: boolean;
  isCounterAttack?: boolean;
  expGained?: number;
  reflectDamage?: number;
  evaded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CombatProcessor {
  constructor(
    private eventService: GameEventService,
    private combatCalculator: CombatCalculator,
    private levelService: UnitLevelService
  ) {}

  execute(state: GameState, cmd: GameCommand): CombatResult {
    // 1.判斷處理器是否正確
    if (cmd.type != 'ATTACK')
      return { success: false, message: 'combat not implemented' };

    // 2.檢查是否有選單位
    if (cmd.unitId == null || cmd.targetId == null)
      return { success: false, message: 'combat missing unitId or targetId' };

    // 3.單位檢查
    const attacker = state.units.find((u) => u.id === cmd.unitId);
    // 3.1 檢查是否存在
    if (!attacker)
      return { success: false, message: 'attacker unit not found' };
    // 3.2 檢查是否已攻擊或無法行動
    if (!attacker.actionState.canAttacked || !attacker.actionState.canAct)
      return {
        success: false,
        message: 'attacker unit already attacked this turn',
      };
    // 3.3 檢查是否存活
    if (!attacker.alive)
      return { success: false, message: 'attacker unit dead' };
    // 3.4 檢查是否為玩家單位
    if (attacker.ownerId !== cmd.playerId)
      return { success: false, message: 'not your unit' };

    const defender = state.units.find((u) => u.id === cmd.targetId);
    if (!defender)
      return { success: false, message: 'defender unit not found' };
    if (!defender.alive)
      return { success: false, message: 'defender unit dead' };

    // 4.是否可攻擊檢查
    if (!this.combatCalculator.canAttack(attacker, defender)) {
      return { success: false, message: 'cannot attack target' };
    }
    // 5.執行完整戰鬥流程
    const result = this.executeCombat(state, attacker, defender);

    // 發送攻擊事件 (用於更新血條)
    attacker.actionState.canAttacked = false;
    this.eventService.emit({
      type: GameEventType.UNIT_ATTACKED,
      data: {
        unitId: attacker.id,
        defenderId: defender.id,
        ...result,
      },
    });

    return result;
  }

  /**
   * 執行完整戰鬥流程
   */
  private executeCombat(
    state: GameState,
    attacker: Unit,
    defender: Unit
  ): CombatResult {
    const result: CombatResult = {
      success: true,
      attackerDamage: 0,
      defenderDamage: 0,
      attackerLifeSteal: 0,
      defenderLifeSteal: 0,
      expGained: 0,
    };

    // 觸發攻擊時技能
    this.triggerSkillEffects(attacker, TriggerTiming.ON_ATTACK);

    // 檢查先制攻擊
    const attackerFirstStrike = this.combatCalculator.hasFirstStrike(attacker);
    const defenderFirstStrike = this.combatCalculator.hasFirstStrike(defender);
    const shouldCounterAttack = this.combatCalculator.shouldCounterAttack(
      attacker,
      defender
    );

    // 決定攻擊順序
    let attackOrder: Unit[];
    if (attackerFirstStrike && !defenderFirstStrike) {
      attackOrder = [attacker, defender];
    } else if (
      !attackerFirstStrike &&
      defenderFirstStrike &&
      shouldCounterAttack
    ) {
      attackOrder = [defender, attacker];
      result.isCounterAttack = true;
    } else {
      attackOrder = [attacker, defender];
    }

    // 執行主要攻擊
    const mainAttackResult = this.performAttack(
      state,
      attackOrder[0],
      attackOrder[1]
    );

    if (attackOrder[0] === attacker) {
      result.defenderDamage = mainAttackResult.damage;
      result.isCritical = mainAttackResult.isCritical;
      result.attackerLifeSteal = mainAttackResult.lifeSteal;
      result.evaded = mainAttackResult.evaded;
      result.reflectDamage = mainAttackResult.reflectDamage;
    } else {
      result.attackerDamage = mainAttackResult.damage;
      result.defenderLifeSteal = mainAttackResult.lifeSteal;
    }

    // 檢查目標是否死亡
    if (!attackOrder[1].alive) {
      this.handleUnitDeath(state, attackOrder[1], attackOrder[0]);

      if (attackOrder[0] === attacker) {
        result.defenderDied = true;
      } else {
        result.attackerDied = true;
      }
      return result;
    }
    // 檢查目標是否死亡
    if (!attackOrder[1].alive) {
      this.handleUnitDeath(state, attackOrder[1], attackOrder[0]);

      if (attackOrder[0] === attacker) {
        result.defenderDied = true;
      } else {
        result.attackerDied = true;
      }

      return result;
    }

    // 執行反擊（如果適用且防禦者還活著）
    if (shouldCounterAttack && !result.isCounterAttack && defender.alive) {
      const counterResult = this.performAttack(state, defender, attacker);
      result.attackerDamage = counterResult.damage;
      result.isCounterAttack = true;
      result.defenderLifeSteal = counterResult.lifeSteal;

      if (!attacker.alive) {
        result.attackerDied = true;
        this.handleUnitDeath(state, attacker, defender);
      }
    }

    // 檢查連續攻擊
    if (
      this.combatCalculator.hasDoubleAttack(attacker) &&
      attacker.alive &&
      defender.alive
    ) {
      const doubleAttackResult = this.performAttack(state, attacker, defender);
      result.defenderDamage =
        (result.defenderDamage || 0) + doubleAttackResult.damage;
      result.attackerLifeSteal =
        (result.attackerLifeSteal || 0) + doubleAttackResult.lifeSteal;

      if (!defender.alive) {
        result.defenderDied = true;
        this.handleUnitDeath(state, defender, attacker);
      }
    }

    // 計算經驗值
    const totalDamage =
      (result.defenderDamage || 0) + (result.attackerDamage || 0);
    const damageExp = this.levelService.calculateDamageExp(totalDamage);
    this.levelService.addExp(attacker, damageExp);
    result.expGained = damageExp;

    return result;
  }
  /**
   * 執行單次攻擊
   */
  private performAttack(
    state: GameState,
    attacker: Unit,
    defender: Unit
  ): {
    damage: number;
    isCritical: boolean;
    lifeSteal: number;
    evaded: boolean;
    reflectDamage: number;
  } {
    // 檢查閃避
    if (this.combatCalculator.checkEvasion(defender)) {
      return {
        damage: 0,
        isCritical: false,
        lifeSteal: 0,
        evaded: true,
        reflectDamage: 0,
      };
    }

    // 觸發防禦時技能
    this.triggerSkillEffects(defender, TriggerTiming.ON_DEFEND);

    // 計算地形加成
    const defenderTile = state.tiles.find(
      (t) => t.x === defender.x && t.y === defender.y
    );
    const terrainBonus = defenderTile?.terrain.defenseBonus ?? 0;

    // 計算傷害
    const damageResult = this.combatCalculator.calculateDamage(
      attacker,
      defender,
      terrainBonus
    );

    // 應用傷害
    defender.stats.hp = Math.max(0, defender.stats.hp - damageResult.damage);

    // 應用生命偷取
    if (damageResult.lifeSteal > 0) {
      attacker.stats.hp = Math.min(
        attacker.stats.maxHp,
        attacker.stats.hp + damageResult.lifeSteal
      );
    }

    // 計算反傷
    const reflectDamage = this.combatCalculator.calculateReflectDamage(
      defender,
      damageResult.damage
    );
    if (reflectDamage > 0) {
      attacker.stats.hp = Math.max(0, attacker.stats.hp - reflectDamage);
      if (attacker.stats.hp <= 0) {
        attacker.alive = false;
      }
    }

    // 觸發受傷時技能
    if (damageResult.damage > 0) {
      this.triggerSkillEffects(defender, TriggerTiming.ON_DAMAGED);
    }

    // 檢查是否死亡
    if (defender.stats.hp <= 0) {
      defender.alive = false;
    }

    return {
      damage: damageResult.damage,
      isCritical: damageResult.isCritical,
      lifeSteal: damageResult.lifeSteal,
      evaded: false,
      reflectDamage,
    };
  }

  /**
   * 處理單位死亡
   */
  private handleUnitDeath(
    state: GameState,
    deadUnit: Unit,
    killer: Unit
  ): void {
    // 觸發擊殺時技能
    this.triggerSkillEffects(killer, TriggerTiming.ON_KILL);

    // 擊殺獲得經驗
    const killExp = this.levelService.calculateKillExp(
      killer.levelInfo.level,
      deadUnit.levelInfo.level
    );
    this.levelService.addExp(killer, killExp);

    // 發送死亡事件
    this.eventService.emit({
      type: GameEventType.UNIT_DIED,
      data: {
        unitId: deadUnit.id,
        killerId: killer.id,
      },
    });
  }

  /**
   * 觸發特定時機的技能效果
   */
  private triggerSkillEffects(unit: Unit, timing: TriggerTiming): void {
    unit.skills.forEach((skill) => {
      if (skill.trigger === timing) {
        skill.effects.forEach((effect) => {
          // 這裡可以根據效果類型執行特定邏輯
          // 例如：ON_ATTACK 時提升攻擊力、ON_DEFEND 時提升防禦力等
          console.log(
            `觸發 ${unit.name} 的技能效果: ${effect.effectType} (時機: ${timing})`
          );
        });
      }
    });
  }
}
