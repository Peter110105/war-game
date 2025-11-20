import { Injectable } from "@angular/core";
import { Unit } from "../model/unit.model";

@Injectable({ providedIn: 'root' })
export class CombatCalculator {
  // 計算傷害
  public calculateDamage(attacker: Unit, defender: Unit): number {
    // 基本傷害計算公式：攻擊力 - 防禦力
    const baseAttack = attacker.attack - defender.defense;
    // 為來可擴充其他因素，如地形、技能等
    // ...

    return Math.max(1, baseAttack); // 傷害至少為1
  }
  // 檢查是否可攻擊
  public canAttack(attacker: Unit, defender: Unit): boolean {
    const distance = Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);

    // 不能攻擊己方單位
    if (attacker.ownerId === defender.ownerId) return false;

    return distance <= attacker.range;
  }
}

