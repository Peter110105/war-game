// pathfinding.service.ts (新增)
import { Injectable } from '@angular/core';
import { GameState } from '../model/game-state.model';
import { SkillService } from '../skill/skill.service';
import { SkillEffectType } from '../model/skill.model';

type PathNode = {
  pos: { x: number; y: number }; // 節點位置
  g: number; // 從起點到目前節點的實際成本
  h: number; // 當前節點到終點的估計成本
  f: number; // 總成本 g + h
  parent?: PathNode; // 父節點位置
};

@Injectable({ providedIn: 'root' })
export class PathfindingService {
  constructor(private skillService: SkillService) {}

  // 計算可移動範圍 (BFS)
  getMovableArea(state: GameState, unitId: string): { x: number; y: number }[] {
    const unit = state.units.find((u) => u.id === unitId);
    if (!unit) return [];

    // 計算實際移動力（包含技能加成）
    let effectiveMove = unit.stats.move;
    const moveBoost = this.skillService.getPassiveEffect(
      unit,
      SkillEffectType.MOVE_BOOST
    );
    effectiveMove += Math.floor(moveBoost);

    // 檢查是否被減速
    const slowValue = this.skillService.getPassiveEffect(
      unit,
      SkillEffectType.SLOW
    );
    effectiveMove -= Math.floor(slowValue);
    effectiveMove = Math.max(0, effectiveMove);

    // 檢查特殊移動能力
    const canFly =
      unit.movementType === 'FLY' ||
      this.skillService.hasEffect(unit, SkillEffectType.FLY);
    const ignoresTerrain =
      this.skillService.hasEffect(unit, SkillEffectType.IGNORE_TERRAIN) ||
      this.skillService.hasEffect(unit, SkillEffectType.TERRAIN_MASTER);

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

        // 計算移動消耗
        let moveCost = 1;
        if (!canFly && !ignoresTerrain) {
          const tile = state.tiles.find((t) => t.x === nx && t.y === ny);
          moveCost = tile?.terrain.moveCost ?? 1;

          // 地形大師減少移動消耗
          if (
            this.skillService.hasEffect(unit, SkillEffectType.TERRAIN_MASTER)
          ) {
            moveCost = Math.max(1, moveCost - 1);
          }
        } else if (canFly || ignoresTerrain) {
          // 飛行或忽略地形的單位移動消耗固定為 1
          moveCost = 1;
        }
        const newCost = current.cost + moveCost;

        if (newCost <= effectiveMove) {
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
    unitId: string
  ): { x: number; y: number }[] | null {
    const unit = state.units.find((u) => u.id === unitId);
    if (!unit) return null;

    // 計算實際移動力
    let maxMove = unit.stats.move;
    const moveBoost = this.skillService.getPassiveEffect(
      unit,
      SkillEffectType.MOVE_BOOST
    );
    maxMove += Math.floor(moveBoost);

    const slowValue = this.skillService.getPassiveEffect(
      unit,
      SkillEffectType.SLOW
    );
    maxMove -= Math.floor(slowValue);
    maxMove = Math.max(0, maxMove);
    // 檢查特殊能力
    const canFly =
      unit.movementType === 'FLY' ||
      this.skillService.hasEffect(unit, SkillEffectType.FLY);
    const ignoresTerrain =
      this.skillService.hasEffect(unit, SkillEffectType.IGNORE_TERRAIN) ||
      this.skillService.hasEffect(unit, SkillEffectType.TERRAIN_MASTER);

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

        // 檢查目標位置（終點可以通過）
        if (nx !== to.x || ny !== to.y) {
          const occupied = state.units.find(
            (u) => u.x === nx && u.y === ny && u.alive
          );
          if (occupied) continue;
        }
        // 計算移動消耗
        let moveCost = 1;
        if (!canFly && !ignoresTerrain) {
          const tile = state.tiles.find((t) => t.x === nx && t.y === ny);
          moveCost = tile?.terrain.moveCost ?? 1;

          if (
            this.skillService.hasEffect(unit, SkillEffectType.TERRAIN_MASTER)
          ) {
            moveCost = Math.max(1, moveCost - 1);
          }
        } else {
          moveCost = 1;
        }

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
    if (!unit) return [];

    // 計算實際射程（包含射程加成）
    let effectiveRange = unit.stats.range;
    const rangeBoost = this.skillService.getPassiveEffect(
      unit,
      SkillEffectType.RANGE_BOOST
    );
    effectiveRange += Math.floor(rangeBoost);

    if (effectiveRange <= 0) return [];
    const visited = new Set<string>();
    const queue: { x: number; y: number; dist: number }[] = [];
    const result: { x: number; y: number }[] = [];

    queue.push({ x: unit.x, y: unit.y, dist: 0 });
    visited.add(`${unit.x},${unit.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      // 不包含起點,但包含範圍內的所有格子
      if (current.dist > 0 && current.dist <= effectiveRange) {
        result.push({ x: current.x, y: current.y });
      }
      // 判斷是否超出攻擊範圍
      if (current.dist >= effectiveRange) continue;

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
