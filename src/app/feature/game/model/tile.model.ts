export enum TerrainType {
  PLAIN = 'PLAIN',
  FOREST = 'FOREST',
  MOUNTAIN = 'MOUNTAIN',
  WATER = 'WATER',
  CASTLE = 'CASTLE',
}

export interface Tile {
  x: number;
  y: number;
  terrain: Terrain;
  occupantId?: string;
}

export interface Terrain {
  terrainType: TerrainType;
  moveCost: number;
  defenseBonus: number; // 百分比形式 (0.1 = 10%, 0.2 = 20%)
}
