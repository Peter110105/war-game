import { Injectable } from '@angular/core';
import { GameState } from '../../model/game-state.model';

export type VictoryResult = {
  isGameOver: boolean;
  winner?: string; // 玩家 ID
  reason?: string; // 勝利原因
};

@Injectable({ providedIn: 'root' })
export class VictoryService {
  /**
   * 檢查遊戲是否結束
   * @param state 遊戲狀態
   */
  public checkVictory(state: GameState): VictoryResult {
    // 檢查全殲條件
    const eliminationResult = this.checkElimination(state);
    if (eliminationResult.isGameOver) {
      return eliminationResult;
    }
    // TODO: 未來可以加入其他勝利條件
    // - 佔領特定地點
    // - 保護目標存活 N 回合
    // - 收集特定道具
    return { isGameOver: false };
  }

  /**
   * 檢查全殲條件
   */
  private checkElimination(state: GameState): VictoryResult {
    // 統計每個玩家的存活單位
    const aliveCounts = new Map<string, number>();

    state.units.forEach((unit) => {
      if (unit.alive) {
        const count = aliveCounts.get(unit.ownerId) || 0;
        aliveCounts.set(unit.ownerId, count + 1);
      }
    });

    // 找出還有單位存活的玩家
    const alivePlayers = Array.from(aliveCounts.entries()).filter(
      ([_, count]) => count > 0
    );
    // 只剩一個玩家 → 遊戲結束
    if (alivePlayers.length === 1) {
      const [winnerId] = alivePlayers[0];
      return {
        isGameOver: true,
        winner: winnerId,
        reason: '全殲敵方單位',
      };
    }
    // 沒有玩家存活 → 平局
    if (alivePlayers.length === 0) {
      return {
        isGameOver: true,
        reason: '所有單位全滅',
      };
    }

    return { isGameOver: false };
  }
}
