export type TerrainType = '平地' |'高山' | '水' | '城堡'

export interface Tile{
    x: number;
    y: number;
    terrain: Terrain;
    occupantId?: string; 
    
}
export interface Terrain{
    terrainType: TerrainType;
    moveCost: number;
    defenseBonus: number;
}