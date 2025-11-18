// pathfinding.service.ts (新增)
import { Injectable } from '@angular/core';
import { GameState } from '../model/game-state.model';

@Injectable({ providedIn: 'root' })
export class PathfindingService {
  
  // 計算可移動範圍 (BFS)
  getMovableArea(state: GameState, unitId: string): {x: number, y: number}[] {
    const unit = state.units.find(u => u.id === unitId);
    if (!unit) return [];

    const visited = new Set<string>();
    const queue: {x: number, y: number, cost: number}[] = [];
    const result: {x: number, y: number}[] = [];

    queue.push({ x: unit.x, y: unit.y, cost: 0 });
    visited.add(`${unit.x},${unit.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.cost > 0) { // 不包含起點
        result.push({ x: current.x, y: current.y });
      }

      // 四個方向
      const directions = [[0,1], [0,-1], [1,0], [-1,0]];
      
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const key = `${nx},${ny}`;

        if (visited.has(key)) continue;
        if (nx < 0 || ny < 0 || nx >= state.width || ny >= state.height) continue;

        // 檢查是否有單位佔據
        const occupied = state.units.find(u => u.x === nx && u.y === ny && u.alive);
        if (occupied) continue;

        // TODO: 之後加入地形消耗計算
        const moveCost = 1;
        const newCost = current.cost + moveCost;

        if (newCost <= unit.move) {
          visited.add(key);
          queue.push({ x: nx, y: ny, cost: newCost });
        }
      }
    }

    return result;
  }

  // 找最短路徑 (A*)
  findPath(
    state: GameState, 
    from: {x: number, y: number}, 
    to: {x: number, y: number}
  ): {x: number, y: number}[] | null {
    // TODO: v0.1.0 實作 A* 演算法
    return null;
  }
}