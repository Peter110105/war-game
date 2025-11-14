# WarGame

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## 目錄結構
src/app/
├─ core/                    // 核心基礎設施(整個 app 共用)
│  ├─ service/
│  │  └─ base-game.service.ts
│  ├─ guards/
│  └─ interceptors/
│
├─ shared/                  // 共用元件/工具
│  ├─ component/
│  ├─ pipe/
│  └─ util/
│     └─ helper.ts
│
├─ feature/                // ⭐ 主要功能模組
│  └─ game/
│     ├─ model/           // 遊戲資料模型
│     │  ├─ unit.model.ts
│     │  ├─ tile.model.ts
│     │  └─ game-state.model.ts
│     │
│     ├─ command/         // Command Pattern
│     │  ├─ command.interface.ts
│     │  ├─ move-command.ts
│     │  └─ attack-command.ts
│     │
│     ├─ processor/       // 遊戲邏輯處理器
│     │  ├─ combat-processor.ts
│     │  └─ movement-processor.ts
│     │
│     ├─ ai/               // AI 相關
│     │  ├─ ai-controller.ts
│     │  └─ pathfinding.ts
│     │
│     ├─ service/         // 遊戲服務
│     │  ├─ game-state.service.ts
│     │  └─ save-manager.service.ts
│     │
│     ├─ phaser/           // Phaser 渲染層
│     │  ├─ scene/
│     │  │  ├─ battlefield.scene.ts
│     │  │  └─ ui-overlay.scene.ts
│     │  ├─ entity/
│     │  │  ├─ unit-sprite.ts
│     │  │  └─ tile-sprite.ts
│     │  ├─ manager/
│     │  │  ├─ input-manager.ts
│     │  │  └─ animation-manager.ts
│     │  └─ phaser-config.ts
│     │
│     └─ config/
│        └─ game-config.ts
│
└─ pages/                   // 路由頁面(薄層)
   └─ battlefield/
      ├─ battlefield.component.ts
      ├─ battlefield.component.html
      └─ battlefield.component.scss
