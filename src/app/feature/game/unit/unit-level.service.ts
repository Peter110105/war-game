// src/app/feature/game/service/unit-level.service.ts
import { Injectable } from '@angular/core';
import { Unit } from '../model/unit.model';
import { EXP_CONFIG, getExpToNextLevel } from '../config/unit';
import { GameEventService, GameEventType } from '../state/game-event.service';

@Injectable({ providedIn: 'root' })
export class UnitLevelService {
  constructor(private eventService: GameEventService) {}

  /**
   * 增加經驗值
   * @param unit 單位
   * @param exp 經驗值
   */
  addExp(unit: Unit, exp: number): void {
    if (unit.levelInfo.level >= unit.levelInfo.maxLevel) {
      return; // 已達最高等級
    }

    unit.levelInfo.exp += exp;

    // 檢查是否升級
    while (
      unit.levelInfo.exp >= unit.levelInfo.expToNext &&
      unit.levelInfo.level < unit.levelInfo.maxLevel
    ) {
      this.levelUp(unit);
    }
  }

  /**
   * 升級
   * @param unit 單位
   */
  private levelUp(unit: Unit): void {
    // 扣除升級所需經驗
    unit.levelInfo.exp -= unit.levelInfo.expToNext;
    unit.levelInfo.level++;

    // 計算下一級所需經驗
    unit.levelInfo.expToNext = getExpToNextLevel(unit.levelInfo.level);

    // 成長屬性
    this.growStats(unit);

    // 發送升級事件
    this.eventService.emit({
      type: GameEventType.UNIT_LEVEL_UP,
      data: {
        unitId: unit.id,
        level: unit.levelInfo.level,
      },
    });

    console.log(`${unit.name} 升級到 Lv.${unit.levelInfo.level}!`);
  }

  /**
   * 成長屬性
   * @param unit 單位
   */
  private growStats(unit: Unit): void {
    // 增加基礎屬性
    unit.stats.maxHp += unit.growthRates.hp;
    unit.stats.hp += unit.growthRates.hp; // 升級時恢復 HP
    unit.stats.attack += unit.growthRates.attack;
    unit.stats.defense += unit.growthRates.defense;

    // 確保 HP 不超過最大值
    if (unit.stats.hp > unit.stats.maxHp) {
      unit.stats.hp = unit.stats.maxHp;
    }

    console.log(
      `${unit.name} 屬性成長: HP+${unit.growthRates.hp}, ATK+${unit.growthRates.attack}, DEF+${unit.growthRates.defense}`
    );
  }

  /**
   * 計算擊殺獲得經驗
   * @param killerLevel 擊殺者等級
   * @param targetLevel 目標等級
   */
  calculateKillExp(killerLevel: number, targetLevel: number): number {
    // 基礎經驗
    let exp = EXP_CONFIG.KILL_EXP;

    // 等級差調整（擊殺高等級單位獲得更多經驗）
    const levelDiff = targetLevel - killerLevel;
    if (levelDiff > 0) {
      exp += levelDiff * 10;
    } else if (levelDiff < 0) {
      // 擊殺低等級單位獲得較少經驗
      exp = Math.max(10, exp + levelDiff * 5);
    }

    return exp;
  }

  /**
   * 計算造成傷害獲得經驗
   * @param damage 造成傷害
   */
  calculateDamageExp(damage: number): number {
    return Math.floor(damage * EXP_CONFIG.DAMAGE_EXP_RATE);
  }

  /**
   * 檢查是否可以升級
   */
  canLevelUp(unit: Unit): boolean {
    return (
      unit.levelInfo.level < unit.levelInfo.maxLevel &&
      unit.levelInfo.exp >= unit.levelInfo.expToNext
    );
  }

  /**
   * 取得升級進度百分比
   */
  getLevelProgress(unit: Unit): number {
    if (unit.levelInfo.level >= unit.levelInfo.maxLevel) {
      return 100;
    }
    return (unit.levelInfo.exp / unit.levelInfo.expToNext) * 100;
  }
}
