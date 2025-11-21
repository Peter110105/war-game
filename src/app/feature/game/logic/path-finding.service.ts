// pathfinding.service.ts (新增)
import { Injectable } from '@angular/core';
import { GameState } from '../model/game-state.model';

type PathNode = {
  pos: { x: number; y: number }; // 節點位置
  g: number; // 從起點到目前節點的實際成本
  h: number; // 當前節點到終點的估計成本
  f: number; // 總成本 g + h
  parent?: PathNode; // 父節點位置
};

@Injectable({ providedIn: 'root' })
export class PathfindingService {
  // 計算可移動範圍 (BFS)
  getMovableArea(state: GameState, unitId: string): { x: number; y: number }[] {
    const unit = state.units.find((u) => u.id === unitId);
    if (!unit) return [];

    const visited = new Set<string>();
    const queue: { x: number; y: number; cost: number }[] = [];
    const result: { x: number; y: number }[] = [];

    queue.push({ x: unit.x, y: unit.y, cost: 0 });
    visited.add(`${unit.x},${unit.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.cost > 0) {
        // 不包含起點
        result.push({ x: current.x, y: current.y });
      }

      // 四個方向
      const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];

      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const key = `${nx},${ny}`;

        if (visited.has(key)) continue;
        if (nx < 0 || ny < 0 || nx >= state.width || ny >= state.height)
          continue;

        // 檢查是否有單位佔據
        const occupied = state.units.find(
          (u) => u.x === nx && u.y === ny && u.alive
        );
        if (occupied) continue;

        // TODO: 之後加入地形消耗計算
        const tile = state.tiles.find((t) => t.x === nx && t.y === ny);
        const moveCost = tile?.terrain.moveCost ?? 1;
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
    from: { x: number; y: number },
    to: { x: number; y: number },
    maxMove: number
  ): { x: number; y: number }[] | null {
    // TODO: v0.1.0 實作 A* 演算法
    const openSet: PathNode[] = []; // 待評估節點集合

    const closedSet = new Set<string>(); // 已評估節點集合

    openSet.push({
      pos: from,
      g: 0,
      h: this.heuristic(from, to),
      f: this.heuristic(from, to),
    });

    while (openSet.length > 0) {
      // 找出 f 值最小的節點
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;

      // 到達目標
      if (current.pos.x === to.x && current.pos.y === to.y) {
        return this.reconstructPath(current);
      }

      closedSet.add(`${current.pos.x},${current.pos.y}`);

      // 探索鄰居
      const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      for (const [dx, dy] of directions) {
        const nx = current.pos.x + dx;
        const ny = current.pos.y + dy;
        const neighborKey = `${nx},${ny}`;

        if (closedSet.has(neighborKey)) continue; // 已評估過
        if (nx < 0 || ny < 0 || nx >= state.width || ny >= state.height)
          continue; // 邊界檢查

        // 檢查是否有單位佔據
        const occupied = state.units.find(
          (u) => u.x === nx && u.y === ny && u.alive
        );
        if (occupied) continue;

        const tile = state.tiles.find((t) => t.x === nx && t.y === ny);
        const moveCost = tile?.terrain.moveCost ?? 1;
        const g = current.g + moveCost;

        if (g > maxMove) continue; // 超出最大移動範圍

        const h = this.heuristic({ x: nx, y: ny }, to);
        const f = g + h;

        const existingNode = openSet.find(
          (n) => n.pos.x === nx && n.pos.y === ny
        );
        if (!existingNode || g < existingNode.g) {
          if (existingNode) {
            // 更新節點
            openSet.splice(openSet.indexOf(existingNode), 1);
          }
          openSet.push({
            pos: { x: nx, y: ny },
            g,
            h,
            f,
            parent: current,
          });
        }
      }
    }

    return null; //找不到入徑
  }
  // 曼哈頓距離啟發式函數
  private heuristic(
    a: { x: number; y: number },
    b: { x: number; y: number }
  ): number {
    // 使用曼哈頓距離作為啟發式函數
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  // 重建路徑
  private reconstructPath(node: PathNode): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = [];
    let current: PathNode = node;

    while (current.parent) {
      path.unshift(current.pos);
      current = current.parent;
    }
    // 不包含起點，包含終點
    return path;
  }
  // 計算可攻擊範圍
  public getAttackableArea(
    state: GameState,
    unitId: string
  ): { x: number; y: number }[] {
    const unit = state.units.find((u) => u.id === unitId);
    if (!unit || unit.range <= 0) return [];

    const visited = new Set<string>();
    const queue: { x: number; y: number; dist: number }[] = [];
    const result: { x: number; y: number }[] = [];

    queue.push({ x: unit.x, y: unit.y, dist: 0 });
    visited.add(`${unit.x},${unit.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      // 不包含起點,但包含範圍內的所有格子
      if (current.dist > 0 && current.dist <= unit.range) {
        result.push({ x: current.x, y: current.y });
      }
      // 判斷是否超出攻擊範圍
      if (current.dist >= unit.range) continue;

      // 四個方向
      const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];

      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const key = `${nx},${ny}`;

        if (visited.has(key)) continue;
        if (nx < 0 || ny < 0 || nx >= state.width || ny >= state.height)
          continue;

        visited.add(key);
        queue.push({ x: nx, y: ny, dist: current.dist + 1 });
      }
    }

    return result;
  }
}
