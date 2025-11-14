// command-processor.ts
import { GameState} from '../model/game-state.model';
import { GameCommand, MoveCommand } from '../command/command.interface';

export class MovementProcessor {
  
  execute(state: GameState, cmd: GameCommand){
    // 1.判斷處理器是否正確
    if(cmd.type != 'MOVE')return {success: false, message: 'wrong processor'};
    const moveCmd = cmd as MoveCommand;
    
    // 2.判斷是否有選單位
    if(!moveCmd.unitId) return {success: false, message: 'no unitId'};
    
    // 3.單位檢查
    const unit = state.units.find(u => u.id === moveCmd.unitId);
    if (!unit) return { success: false, message: 'unit not found' };
    if (!unit.alive) return { success: false, message: 'unit dead' };
    if (unit.ownerId !== moveCmd.playerId) return { success: false, message: 'not your unit' };
    
    // 4.邊界檢查
    const { x, y } = moveCmd.to;
    if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
      return { success: false, message: 'target out of bounds' };
    }
    // 5.距離檢查
    const distance = Math.abs(unit.x - x) + Math.abs(unit.y - y);
    if(distance > unit.move) return {success: false, message: 'too far'};
    
    // 6.格子是否被佔領檢查
    const occupied = state.units.find(u => u.x === x && u.y === y && u.alive);
    if (occupied) return { success: false, message: 'target occupied' };

    // 7. 移動
    unit.x = x;
    unit.y = y;
    
    return { success: true, message: 'move success' };
  }
}
