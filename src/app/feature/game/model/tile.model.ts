import { TerrainType } from '../config/terrain.config';

export interface Tile {
  x: number;
  y: number;
  terrain: Terrain;
  occupantId?: string;
}

export interface Terrain {
  terrainType: TerrainType;
  moveCost: number;
  defenseBonus: number; // 防禦加成 (0.1 = +10%)
}
