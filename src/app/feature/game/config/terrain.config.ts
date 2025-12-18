import { Terrain } from '../model/tile.model';

export type TerrainType = 'plain' | 'forest' | 'mountain' | 'water';
/**
 * 地形配置
 */
export const TERRAIN_CONFIG: Record<
  TerrainType,
  Terrain & { color: number; emoji: string }
> = {
  plain: {
    terrainType: 'plain',
    moveCost: 1,
    defenseBonus: 0,
    color: 0x90ee90, // 淺綠色
    emoji: '🟢',
  },
  forest: {
    terrainType: 'forest',
    moveCost: 2,
    defenseBonus: 0.1,
    color: 0x228b22, // 深綠色
    emoji: '🌲',
  },
  mountain: {
    terrainType: 'mountain',
    moveCost: 3,
    defenseBonus: 0.2,
    color: 0x8b4513, // 棕色
    emoji: '⛰️',
  },
  water: {
    terrainType: 'water',
    moveCost: 999,
    defenseBonus: 0,
    color: 0x4682b4, // 藍色
    emoji: '🌊',
  },
};

/**
 * 取得地形配置
 */
export function getTerrainConfig(terrainType: TerrainType): Terrain {
  return TERRAIN_CONFIG[terrainType];
}

/**
 * 取得地形名稱 (中文)
 */
export function getTerrainName(terrainType: TerrainType): string {
  switch (terrainType) {
    case 'plain':
      return '平地';
    case 'forest':
      return '森林';
    case 'mountain':
      return '山地';
    case 'water':
      return '水域';
    default:
      return terrainType;
  }
}
