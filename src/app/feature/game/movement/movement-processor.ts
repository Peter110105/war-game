import { Injectable } from '@angular/core';
import { GameState } from '../model/game-state.model';
import { GameCommand, MoveCommand } from '../command/command.interface';
import { GameEventService, GameEventType } from '../state/game-event.service';

@Injectable({
  providedIn: 'root',
})
export class MovementProcessor {
  constructor(private eventService: GameEventService) {}

  private dist(
    unit: { x: number; y: number },
    target: { x: number; y: number }
  ): number {
    return Math.abs(unit.x - target.x) + Math.abs(unit.y - target.y);
  }

  execute(
    state: GameState,
    cmd: GameCommand
  ): { success: boolean; message?: string } {
    // 1.判斷處理器是否正確
    if (cmd.type != 'MOVE')
      return { success: false, message: 'MovementProcessor: not MOVE command' };
    const moveCmd = cmd as MoveCommand;

    // 2.判斷是否有選單位
    if (!moveCmd.unitId) return { success: false, message: 'no unitId' };

    // 3.單位檢查
    const unit = state.units.find((u) => u.id === moveCmd.unitId);
    if (!unit) return { success: false, message: 'unit not found' };
    if (!unit.actionState.canMoved || !unit.actionState.canAct)
      return { success: false, message: 'unit already moved this turn' };
    if (!unit.alive) return { success: false, message: 'unit dead' };
    if (unit.ownerId !== moveCmd.playerId)
      return { success: false, message: 'not your unit' };

    // 4.邊界檢查
    const { x, y } = moveCmd.to;
    if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
      return { success: false, message: 'target out of bounds' };
    }
    // 5.距離檢查
    const distance = this.dist({ x: unit.x, y: unit.y }, { x, y });
    if (distance > unit.stats.move)
      return { success: false, message: 'too far' };

    // 6.格子是否被佔領檢查
    const occupied = state.units.find(
      (unit) => unit.x === x && unit.y === y && unit.alive
    );
    if (occupied) return { success: false, message: 'target occupied' };

    // 7. 移動並標記單位為已移動
    unit.x = x;
    unit.y = y;
    unit.actionState.canMoved = false;

    // 發送攻擊事件 (用於更新血條)
    this.eventService.emit({
      type: GameEventType.UNIT_MOVED,
      data: {
        unitId: unit.id,
        x,
        y,
      },
    });
    return { success: true, message: 'move success' };
  }
}
