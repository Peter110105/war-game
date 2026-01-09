import { Injectable } from '@angular/core';
import { getTerrainConfig } from '../config/terrain/terrain.config';
import { getExpToNextLevel, getUnitConfig } from '../config/unit';
import { Unit, UnitType } from '../model/unit.model';
import { Player } from '../model/player.model';
import { GameState } from '../model/game-state.model';
import { TerrainType, Tile } from '../model/tile.model';

@Injectable({ providedIn: 'root' })
export class GameStateFactory {
  constructor() {}

  /**
   * 建立新遊戲狀態
   * @param width 地圖寬度
   * @param height 地圖高度
   * @param units 單位列表
   * @param players 玩家列表
   */
  public createNewGame(
    width: number = 8,
    height: number = 8,
    units: Unit[] = [],
    players: Player[] = [],
    tiles: Tile[] = []
  ): GameState {
    return {
      width,
      height,
      tiles:
        tiles.length > 0 ? tiles : this.createDefaultTerrain(width, height),
      units,
      players,
      currentPlayerIndex: 0,
      turn: 0,
    };
  }
  /**
   * 從配置創建單位
   */
  public createUnitFromConfig(
    id: string,
    type: UnitType,
    ownerId: string,
    x: number,
    y: number,
    level: number = 1
  ): Unit {
    const config = getUnitConfig(type);

    // 深拷貝技能（避免共享引用）
    const skills = config.skills.map((skill) => ({ ...skill }));

    const unit: Unit = {
      id,
      name: config.name,
      type: config.type,
      ownerId,
      x,
      y,
      stats: { ...config.baseStats },
      levelInfo: {
        level,
        exp: 0,
        expToNext: getExpToNextLevel(level),
        maxLevel: 20,
      },
      growthRates: { ...config.growthRates },
      skills,
      activeEffects: [],
      alive: true,
      actionState: {
        canMoved: true,
        canAttacked: true,
        canAct: true,
      },
      movementType: config.movementType,
    };

    // 如果不是 1 級，應用成長
    if (level > 1) {
      this.applyLevelGrowth(unit, level);
    }

    return unit;
  }

  /**
   * 應用等級成長
   */
  private applyLevelGrowth(unit: Unit, targetLevel: number): void {
    const levelsToGrow = targetLevel - 1;

    unit.stats.maxHp += unit.growthRates.hp * levelsToGrow;
    unit.stats.hp = unit.stats.maxHp;
    unit.stats.attack += unit.growthRates.attack * levelsToGrow;
    unit.stats.defense += unit.growthRates.defense * levelsToGrow;
  }

  /**
   * 建立預設單位
   */
  public createDefaultUnits(): Unit[] {
    return [
      this.createUnitFromConfig('u1', UnitType.SOLDIER, 'P1', 1, 1, 1),
      this.createUnitFromConfig('u2', UnitType.ARCHER, 'P1', 2, 2, 1),
      this.createUnitFromConfig('u3', UnitType.KNIGHT, 'P1', 0, 2, 1),
      this.createUnitFromConfig('e1', UnitType.SOLDIER, 'P2', 6, 4, 1),
      this.createUnitFromConfig('e2', UnitType.ARCHER, 'P2', 7, 4, 1),
      this.createUnitFromConfig('e3', UnitType.MAGE, 'P2', 5, 5, 1),
    ];
  }
  /**
   * 建立預設玩家
   */
  public createDefaultPlayers(): Player[] {
    return [
      {
        id: 'p1',
        name: 'Player 1',
        team: 'P1',
        aiControlled: false,
        isActive: true,
      },
      {
        id: 'p2',
        name: 'Player 2',
        team: 'P2',
        aiControlled: false,
        isActive: false,
      },
    ];
  }
  /**
   * 建立預設地形
   */
  public createDefaultTerrain(width: number, height: number): any[] {
    const tiles: Tile[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let terrainType: TerrainType = TerrainType.PLAIN;

        // 邊緣為水域
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          terrainType = TerrainType.WATER;
        }
        // 中心點附近有山地
        else if (Math.abs(x - width / 2) < 2 && Math.abs(y - height / 2) < 1) {
          terrainType = TerrainType.MOUNTAIN;
        }
        // 中間偶爾有森林
        else if (Math.random() < 0.3) {
          terrainType = TerrainType.FOREST;
        }

        tiles.push({
          x,
          y,
          terrain: {
            terrainType,
            moveCost: getTerrainConfig(terrainType).moveCost,
            defenseBonus: getTerrainConfig(terrainType).defenseBonus,
          },
        });
      }
    }
    return tiles;
  }

  /**
   * 從配置建立遊戲狀態 (用於關卡系統)
   * @param config 關卡配置
   */
  public createGameFromConfig(config: any): GameState {
    const width = config.width || 8;
    const height = config.height || 8;
    const players = config.players || this.createDefaultPlayers();
    const tiles = config.tiles || this.createDefaultTerrain(width, height);
    // 從配置創建單位
    const units: Unit[] = [];
    if (config.units && Array.isArray(config.units)) {
      config.units.forEach((unitConfig: any) => {
        const unit = this.createUnitFromConfig(
          unitConfig.id,
          unitConfig.type,
          unitConfig.ownerId,
          unitConfig.x,
          unitConfig.y,
          unitConfig.level || 1
        );
        units.push(unit);
      });
    } else {
      units.push(...this.createDefaultUnits());
    }
    console.log('createGameFromConfig', {
      width,
      height,
      units,
      players,
      tiles,
    });
    return this.createNewGame(width, height, units, players, tiles);
  }

  /**
   * 建立完整預設遊戲
   */
  public createDefaultGame(): GameState {
    return this.createNewGame(
      8,
      8,
      this.createDefaultUnits(),
      this.createDefaultPlayers(),
      this.createDefaultTerrain(8, 8)
    );
  }
}
