import Phaser from 'phaser';
import { GAME_CONFIG } from '../../config/game/game.config';
import { GameStateService } from '../../core/state/game-state.service';
import { GameEventService } from '../../core/state/game-event.service';
import { UnitRendererManager } from '../managers/rendering/unit-renderer.manager';
import { AnimationManager } from '../managers/animation.manager';
import { InputManager } from '../managers/input.manager';
import { HpBarManager } from '../managers/rendering/hp-bar.manager';
import { TerrainRendererManager } from '../managers/rendering/terrain-renderer.manager';
import { EffectRendererManager } from '../managers/rendering/effect-renderer.manager';
import { SceneEventHandler } from './handlers/scene-event.handler';
import { SceneInputHandler } from './handlers/scene-input.handler';
import { SceneVisualHandler } from './handlers/scene-visual.handler';
import { PathfindingService, SkillService } from '../../system';
import {} from '../../system/skill/skill.service';
/**
 * 戰場場景 (簡化後的協調者)
 * 職責：
 * 1. 初始化場景和管理器
 * 2. 協調各個 Handler
 * 3. 繪製基礎地圖網格
 */
export class BattlefieldScene extends Phaser.Scene {
  // service
  private gameStateService!: GameStateService;
  private gameEventService!: GameEventService;
  private pathfindingService!: PathfindingService;
  private skillService!: SkillService;

  // Manger
  private unitRenderer!: UnitRendererManager;
  private animationMgr!: AnimationManager;
  private inputMgr!: InputManager;
  private hpBarMgr!: HpBarManager;
  private terrainRenderer!: TerrainRendererManager;
  private effectRenderer!: EffectRendererManager;

  // Handlers
  private eventHandler!: SceneEventHandler;
  private inputHandler!: SceneInputHandler;
  private visualHandler!: SceneVisualHandler;

  constructor() {
    super('BattlefieldScene');
  }

  /**
   * 初始化 (接收依賴注入的服務)
   */

  init(data: {
    gameStateService: GameStateService;
    gameEventService: GameEventService;
    pathfindingService: PathfindingService;
    skillService: SkillService;
  }) {
    this.gameStateService = data.gameStateService;
    this.gameEventService = data.gameEventService;
    this.pathfindingService = data.pathfindingService;
    this.skillService = data.skillService;
  }

  /**
   * 創建場景
   */
  create() {
    this.initializeManagers();
    this.initializeHandlers();
    this.setupScene();
    this.setupInputHandling();
  }

  /**
   * 初始化所有管理器
   */
  private initializeManagers(): void {
    this.unitRenderer = new UnitRendererManager(this);
    this.animationMgr = new AnimationManager(this);
    this.inputMgr = new InputManager(this);
    this.hpBarMgr = new HpBarManager(this);
    this.terrainRenderer = new TerrainRendererManager(this);
    this.effectRenderer = new EffectRendererManager(this);
  }

  /**
   * 初始化所有處理器
   */
  private initializeHandlers(): void {
    // 事件處理器
    this.eventHandler = new SceneEventHandler(
      this,
      this.gameEventService,
      this.gameStateService,
      this.unitRenderer,
      this.hpBarMgr,
      this.effectRenderer
    );

    // 輸入處理器
    this.inputHandler = new SceneInputHandler(
      this,
      this.gameStateService,
      this.gameEventService,
      this.pathfindingService,
      this.skillService,
      this.unitRenderer,
      this.animationMgr,
      this.inputMgr,
      this.terrainRenderer
    );

    // 視覺效果處理器
    this.visualHandler = new SceneVisualHandler(this, this.gameStateService);
  }

  /**
   * 設置場景 (繪製初始畫面)
   */
  private setupScene(): void {
    this.drawMap();
    this.drawTerrain();
    this.drawUnitsWithHpBars();

    // 訂閱遊戲事件
    this.eventHandler.subscribeToEvents();
  }

  /**
   * 設置輸入處理
   */
  private setupInputHandling(): void {
    this.inputHandler.setupInputListeners();
  }

  /**
   * 繪製地圖網格
   */
  private drawMap() {
    const g = this.add.graphics();
    g.lineStyle(1, GAME_CONFIG.LINE_STYLE.COLOR);

    for (let i = 0; i <= GAME_CONFIG.CANVAS_WIDTH; i += GAME_CONFIG.TILE_SIZE) {
      g.lineBetween(i, 0, i, GAME_CONFIG.CANVAS_HEIGHT);
    }
    for (
      let j = 0;
      j <= GAME_CONFIG.CANVAS_HEIGHT;
      j += GAME_CONFIG.TILE_SIZE
    ) {
      g.lineBetween(0, j, GAME_CONFIG.CANVAS_WIDTH, j);
    }
  }

  /**
   * 繪製地形
   */
  private drawTerrain() {
    const gameState = this.gameStateService.getGameState();
    this.terrainRenderer.drawTerrain(gameState);
  }

  /**
   * 繪製單位和血條
   */
  private drawUnitsWithHpBars() {
    const gameState = this.gameStateService.getGameState();
    this.unitRenderer.drawUnits(gameState);

    // 為每個單位創建血條
    gameState.units.forEach((unit) => {
      this.hpBarMgr.createHpBar(unit);
      this.effectRenderer.updateEffectIcons(unit);
    });
  }

  /**
   * 公開方法：給 Handler 使用
   */
  public getVisualHandler(): SceneVisualHandler {
    return this.visualHandler;
  }
}
