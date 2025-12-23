# WarGame

這是一個使用 Angular + Phaser 開發的回合制戰棋遊戲。

## 技術棧

- **Angular 20.1.3**: 前端框架，負責 UI 層和狀態管理
- **Phaser 3**: 遊戲渲染引擎，負責圖形渲染和動畫
- **RxJS**: 響應式編程，用於事件管理
- **TypeScript**: 開發語言

## 架構設計

採用 **Command Pattern** + **事件驅動** 架構：

- Angular 負責遊戲邏輯、狀態管理和 UI
- Phaser 負責圖形渲染、動畫和輸入處理
- 透過 EventBus (RxJS Subject) 實現雙向溝通

## 開發伺服器

啟動本地開發伺服器：

```bash
ng serve
```

在瀏覽器中訪問 `http://localhost:4200/`。

## 構建專案

```bash
ng build
```

構建產物將存儲在 `dist/` 目錄中。

## 執行測試

```bash
ng test
```

---

## 📁 專案目錄結構

```
src/
├─ app/
│   ├─ core/                          # 核心基礎設施層（整個 app 共用）
│   │  └─ service/
│   │     └─ game-state-loader.service.ts   # 負責: 從 JSON 載入初始遊戲狀態
│   │
│   ├─ feature/                       # 功能模組層
│   │  └─ game/
│   │     ├─ command/                 # Command Pattern 實現
│   │     │  └─ command.interface.ts       # 定義遊戲命令介面 (MOVE, ATTACK, END_TURN)
│   │     │
│   │     ├─ config/                  # 遊戲配置
│   │     │  ├─ game.config.ts            # 遊戲基礎配置 (畫布大小、顏色、動畫時間等)
│   │     │  ├─ terrain.config.ts         # 地形配置 (類型、移動消耗、防禦加成、視覺效果)
│   │     │  └─ unit.config.ts            # 單位配置 (各兵種屬性、技能、成長率、經驗值配置)
│   │     │
│   │     ├─ factory/                 # 工廠模式
│   │     │  └─ game-state.factory.ts     # 負責: 創建遊戲狀態、單位、玩家、地形
│   │     │
│   │     ├─ logic/                   # 遊戲邏輯層
│   │     │  ├─ path-finding.service.ts   # 負責: A* 尋路、計算可移動/攻擊範圍
│   │     │  └─ combat-calculator.service.ts  # 負責: 戰鬥傷害計算、暴擊、破甲、反擊判定
│   │     │
│   │     ├─ model/                   # 資料模型層
│   │     │  ├─ game-state.model.ts       # 遊戲狀態 (地圖、單位、玩家、回合)
│   │     │  ├─ player.model.ts           # 玩家模型 (ID、名稱、陣營、AI 控制)
│   │     │  ├─ tile.model.ts             # 地形模型 (座標、地形類型、移動消耗、防禦加成)
│   │     │  ├─ unit.model.ts             # 單位模型 (屬性、等級、技能、效果、行動狀態)
│   │     │  └─ skill.model.ts            # 技能模型 (類型、效果、觸發時機、目標、條件)
│   │     │
│   │     ├─ phaser/                  # Phaser 渲染層
│   │     │  ├─ manager/              # Phaser 管理器
│   │     │  │  ├─ animation.manager.ts    # 負責: 播放移動、攻擊、死亡動畫
│   │     │  │  ├─ input.manager.ts        # 負責: 處理滑鼠點擊和移動事件
│   │     │  │  ├─ unit-renderer.manager.ts     # 負責: 繪製和管理單位 Sprite
│   │     │  │  ├─ hp-bar.manager.ts       # 負責: 創建、更新、移動血條
│   │     │  │  ├─ terrain-renderer.manager.ts  # 負責: 繪製地形、地形高亮、提示資訊
│   │     │  │  └─ effect-renderer.manager.ts   # 負責: 顯示單位身上的 Buff/Debuff 圖示
│   │     │  ├─ scene/
│   │     │  │  └─ battlefield.scene.ts    # 負責: 遊戲場景協調、渲染、輸入處理、事件訂閱
│   │     │  └─ phaser-config.ts           # Phaser 初始化配置
│   │     │
│   │     ├─ processor/               # 命令處理器層
│   │     │  ├─ combat-processor.ts        # 負責: 處理攻擊命令、戰鬥流程、經驗值計算
│   │     │  └─ movement-processor.ts      # 負責: 處理移動命令、移動驗證
│   │     │
│   │     └─ service/                 # 遊戲服務層
│   │        ├─ game-event.service.ts      # 負責: 事件總線 (EventBus)，管理遊戲事件
│   │        ├─ game-state.service.ts      # 負責: 遊戲狀態管理、命令執行、回合切換
│   │        ├─ skill.service.ts           # 負責: 技能效果計算、主動技能使用、Buff/Debuff 管理
│   │        ├─ unit-level.service.ts      # 負責: 經驗值、升級、屬性成長
│   │        └─ victory.service.ts         # 負責: 勝利條件判定 (全殲、佔領等)
│   │
│   ├─ pages/                         # 路由頁面層 (薄層)
│   │  └─ battlefield/
│   │     ├─ battlefield.component.ts      # 負責: 整合 Phaser 與 Angular、UI 事件處理
│   │     ├─ battlefield.component.html    # 遊戲主頁面模板
│   │     ├─ battlefield.component.css     # 遊戲主頁面樣式
│   │     │
│   │     └─ components/              # 頁面子元件
│   │        ├─ action-menu/
│   │        │  ├─ action-menu.component.ts       # 負責: 單位行動選單 (移動、攻擊、待機、取消)
│   │        │  ├─ action-menu.component.html
│   │        │  └─ action-menu.component.css
│   │        │
│   │        ├─ unit-info-panel/
│   │        │  ├─ unit-info-panel.component.ts   # 負責: 顯示單位詳細資訊 (屬性、技能、狀態)
│   │        │  ├─ unit-info-panel.component.html
│   │        │  └─ unit-info-panel.component.css
│   │        │
│   │        ├─ game-result-modal/
│   │        │  ├─ game-result-modal.component.ts  # 負責: 顯示遊戲結果 (勝利/失敗)
│   │        │  ├─ game-result-modal.component.html
│   │        │  └─ game-result-modal.component.css
│   │        │
│   │        └─ level-up-animation/
│   │           ├─ level-up-animation.component.ts  # 負責: 顯示升級動畫效果
│   │           ├─ level-up-animation.component.html
│   │           └─ level-up-animation.component.css
│   │
│   ├─ shared/                        # 共用層
│   │  └─ util/
│   │     └─ help.ts                       # 工具函數 (目前為空)
│   │
│   ├─ app.ts                         # 根元件
│   ├─ app.html                       # 根元件模板
│   ├─ app.css                        # 根元件樣式
│   ├─ app.routes.ts                  # 路由配置
│   ├─ app.config.ts                  # 應用配置 (提供者設定)
│   └─ app.spec.ts                    # 根元件測試
│
├─ assets/
│   └─ data/
│      └─ initial-game-state.json     # 初始遊戲狀態資料 (地圖、單位、玩家配置)
│
├─ index.html                         # 主 HTML 檔案
├─ main.ts                            # 應用程式入口
└─ styles.css                         # 全域樣式
```

---

## 🎮 遊戲功能

### ✅ 已完成功能

#### 基礎系統 (v0.0.1 - v0.2.0)

- ✅ Phaser + Angular 整合
- ✅ 地圖渲染 (網格)
- ✅ 單位渲染 (方塊)
- ✅ Command Pattern 實現
- ✅ 點擊選取單位
- ✅ 移動命令
- ✅ 移動動畫
- ✅ 移動範圍高亮
- ✅ A\* 路徑尋找
- ✅ 單位資訊面板
- ✅ 回合切換機制
- ✅ 回合資訊顯示

#### 戰鬥系統 (v0.3.0)

- ✅ 攻擊命令
- ✅ 攻擊範圍高亮
- ✅ 傷害計算系統
- ✅ 擊殺判定與單位移除
- ✅ 攻擊動畫
- ✅ 初始化資料外部化 (JSON)

#### UI 系統 (v0.4.0)

- ✅ 行動選單
- ✅ 單位血條
- ✅ 勝利/失敗畫面
- ✅ 工廠模式實現

#### 地形系統 (v0.5.0)

- ✅ 不同地形圖示 (草原/山/森林/水域/城堡)
- ✅ 地形移動消耗
- ✅ 地形防禦加成
- ✅ 地形視覺效果

#### 單位系統擴充 (v0.6.0)

- ✅ 多種單位類型 (劍士/弓兵/騎士/法師/騎兵/飛兵/牧師)
- ✅ 單位屬性差異化
- ✅ 單位特殊技能系統 (被動/主動)
- ✅ 單位升級系統
- ✅ 經驗值獲取 (擊殺、造成傷害)
- ✅ 屬性成長機制

#### 技能系統 (多效果)

- ✅ 被動技能 (狂戰士、鐵壁、致命一擊、反擊、地形適應、神速、再生、吸血)
- ✅ 主動技能 (治療術、強力一擊、盾擊、連鎖閃電、群體治療、狂暴、火焰風暴)
- ✅ 技能效果系統 (攻防加成、暴擊、破甲、生命偷取、範圍攻擊、Buff/Debuff)
- ✅ 技能冷卻機制
- ✅ 魔力消耗系統
- ✅ 持續效果 (灼燒、中毒、減速、暈眩)
- ✅ 效果圖示顯示

### 🚧 開發中功能

#### 遊戲模式與關卡 (v0.7.0)

- ⏳ 勝利條件擴充 (佔領/存活/保護人質)
- ⏳ 關卡編輯器
- ⏳ 教學關卡
- ⏳ 主線關卡

#### AI 系統 (v0.8.0)

- ⏳ 基礎 AI (優先攻擊)
- ⏳ 中級 AI (評分系統)
- ⏳ 高級 AI (Minimax)
- ⏳ 難度選擇

### 📋 待開發功能

#### v1.0.0 第一版完成

- 10+ 種單位
- 5+ 種關卡
- 成就系統
- 數據平衡調整

#### v1.3.0 養成系統

- 金錢資源
- 招募單位
- 單位進階

#### v1.5.0 連線準備

- Client-Server 架構重構
- 遊戲狀態序列化/反序列化
- 房間系統
- 斷線重連機制

#### v2.0.0 線上對戰

- WebSocket 整合
- 配對系統

---

## 🔧 核心設計模式

### 1. Command Pattern

所有玩家操作都封裝成命令物件，便於：

- 命令的驗證和執行
- 撤銷/重做功能 (未來擴展)
- 命令序列化 (用於網路對戰)

### 2. Event-Driven Architecture

使用 RxJS Subject 作為事件總線：

- Angular 與 Phaser 解耦
- 易於追蹤遊戲事件
- 便於調試和擴展

### 3. Service-Oriented Architecture

遊戲邏輯分散到各個服務：

- `GameStateService`: 狀態管理
- `SkillService`: 技能計算
- `CombatCalculator`: 戰鬥計算
- `PathfindingService`: 尋路演算法

### 4. Factory Pattern

使用工廠模式創建遊戲物件：

- 單位創建
- 遊戲狀態初始化
- 便於從 JSON 載入關卡

---

## 📝 開發備註

### 重要限制

- Phaser Scene 中不可使用 localStorage (不支援)
- Three.js 不可使用 `THREE.CapsuleGeometry` (r128 版本未支援)
- 外部腳本只能從 `https://cdnjs.cloudflare.com` 導入

### 資料流向

```
使用者輸入 (Phaser InputManager)
    ↓
發送事件 (GameEventService)
    ↓
Angular Component 處理
    ↓
建立 Command
    ↓
GameStateService 執行
    ↓
更新遊戲狀態
    ↓
發送更新事件
    ↓
Phaser Scene 渲染
```
