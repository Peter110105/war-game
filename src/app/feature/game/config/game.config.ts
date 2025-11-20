interface GameConfig {
  // 遊戲基本配置
  TILE_SIZE: number;    // 格子像素大小
  CANVAS_WIDTH: number; // 遊戲寬度(像素)
  CANVAS_HEIGHT: number; // 遊戲高度(像素)
  GRID_COLS: number; // 網格列數
  GRID_ROWS: number;  // 網格行數
  BACKGROUND: string; // 背景顏色
  LINE_STYLE: {
    COLOR: number; // 線條顏色
  };
  // 玩家配置
  COLOR: {
    P1: number; // 玩家一顏色
    P2: number; // 玩家二顏色
    NEUTRAL: number; // 中立單位顏色
    MOVABLE_AREA: number; // 可移動範圍顏色
    MOVABLE_AREA_ALPHA: number; // 可移動範圍透明度
  };
  // 文字配置
  TEXT: {
    FONT_FAMILY: string; // 字體
    FONT_SIZE: string; // 字體大小
    COLOR: string; // 文字顏色
    BACKGROUND: string; // 文字背景顏色
  };
  // 動畫配置
  ANIMATION: {
    MOVE_DURATION: number; // 移動動畫持續時間（毫秒）
    ATTACK_DURATION: number; // 攻擊動畫持續時間（毫秒）
    DELAY_BETWEEN_ACTIONS: number; // 動作之間的延遲（毫秒）
  };
}

export const GAME_CONFIG: GameConfig = {
  TILE_SIZE: 64,
  CANVAS_WIDTH: 640,
  CANVAS_HEIGHT: 640,
  GRID_COLS: 8,
  GRID_ROWS: 6,
  BACKGROUND: '#000000',
  LINE_STYLE: {
    COLOR: 0xffffff,
  },
  COLOR: {
    P1: 0xff0000,
    P2: 0x00ff00,
    NEUTRAL: 0xffff00,
    MOVABLE_AREA: 0x00aaff,
    MOVABLE_AREA_ALPHA: 0.3,
  },
  TEXT: {
    FONT_FAMILY: 'Arial',
    FONT_SIZE: '16px',
    COLOR: '#ffffff',
    BACKGROUND: '#000000',
  },
  ANIMATION: {
    MOVE_DURATION: 300,
    ATTACK_DURATION: 500,
    DELAY_BETWEEN_ACTIONS: 200,
  },
};
