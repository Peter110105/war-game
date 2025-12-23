// src/app/feature/game/config/terrain.config.ts
import { Terrain, TerrainType } from '../../model/tile.model';

/**
 * 地形配置介面
 */
export interface TerrainConfig extends Terrain {
  color: number; // Phaser 顏色
  emoji: string; // 地形圖示
  name: string; // 中文名稱
}

/**
 * 地形配置表
 */
export const TERRAIN_CONFIG: Record<TerrainType, TerrainConfig> = {
  [TerrainType.PLAIN]: {
    terrainType: TerrainType.PLAIN,
    moveCost: 1,
    defenseBonus: 0,
    color: 0x90ee90, // 淺綠色
    emoji: '🟢',
    name: '平地',
  },
  [TerrainType.FOREST]: {
    terrainType: TerrainType.FOREST,
    moveCost: 2,
    defenseBonus: 0.1, // 10% 防禦加成
    color: 0x228b22, // 深綠色
    emoji: '🌲',
    name: '森林',
  },
  [TerrainType.MOUNTAIN]: {
    terrainType: TerrainType.MOUNTAIN,
    moveCost: 3,
    defenseBonus: 0.2, // 20% 防禦加成
    color: 0x8b4513, // 棕色
    emoji: '⛰️',
    name: '高山',
  },
  [TerrainType.WATER]: {
    terrainType: TerrainType.WATER,
    moveCost: 99, // 基本上無法通過
    defenseBonus: 0,
    color: 0x4682b4, // 藍色
    emoji: '🌊',
    name: '水域',
  },
  [TerrainType.CASTLE]: {
    terrainType: TerrainType.CASTLE,
    moveCost: 1,
    defenseBonus: 0.3, // 30% 防禦加成
    color: 0xd3d3d3, // 灰色
    emoji: '🏰',
    name: '城堡',
  },
};

/**
 * 取得地形配置
 */
export function getTerrainConfig(terrainType: TerrainType): TerrainConfig {
  return TERRAIN_CONFIG[terrainType];
}

/**
 * 取得地形名稱
 */
export function getTerrainName(terrainType: TerrainType): string {
  return TERRAIN_CONFIG[terrainType]?.name || terrainType;
}

/**
 * 取得地形顏色
 */
export function getTerrainColor(terrainType: TerrainType): number {
  return TERRAIN_CONFIG[terrainType]?.color || 0xffffff;
}

/**
 * 取得地形圖示
 */
export function getTerrainEmoji(terrainType: TerrainType): string {
  return TERRAIN_CONFIG[terrainType]?.emoji || '❓';
}
