import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameStateService } from '../../feature/game/service/game-state.service'
import { PHASER_CONFIG } from '../../feature/game/phaser/phaser-config';
import { Subscription } from 'rxjs';
import { GameEventService } from '../../feature/game/service/game-event.service';
import { BattlefieldScene } from '../../feature/game/phaser/scene/battlefield.scene';
import { PathfindingService } from '../../feature/game/logic/path-finding.service';
import { Unit } from '../../feature/game/model/unit.model';
import { Game } from 'phaser';
import { GameCommand } from '../../feature/game/command/command.interface';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.css'],
})
export class BattlefieldComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;

  private game?: Phaser.Game;
  private eventSubscription?: Subscription;
  selectedUnit: Unit | null = null;

  constructor(
    private gameService: GameStateService,
    private eventService: GameEventService,
    private pathfindingService: PathfindingService
  ) {}

  get currentPlayer() {
    return this.gameService.getCurrentPlayer();
  }

  get gameState() {
    return this.gameService.getGameState();
  }

  ngOnInit() {
    this.initPhaserGame();
    this.subscribeToGameEvents();
  }

  ngOnDestroy(): void {
    this.eventSubscription?.unsubscribe();
    this.game?.destroy(true);
  }

  public isCurrentPlayer(): boolean {
    return this.gameService.currentPlayerId === this.currentPlayer?.id;
  }

  public endTurn() {
    const cmd: GameCommand = {
      id: 'cmd_' + Date.now(),
      type: 'END_TURN',
      playerId: this.currentPlayer.id,
      timestamp: Date.now(),
    };

    const result = this.gameService.execute(cmd);
    console.log(result);
  }

  private initPhaserGame() {
    const config: Phaser.Types.Core.GameConfig ={
      ...PHASER_CONFIG,
      parent: this.gameContainer.nativeElement,
    }
    this.game = new Phaser.Game(config);
    this.game.scene.start('BattlefieldScene', {
      gameService: this.gameService,
      eventService: this.eventService,
      pathfindingService: this.pathfindingService,
    });
  }

  private subscribeToGameEvents() {
    this.eventSubscription = this.eventService.events$.subscribe((event) => {
      switch (event.type) {
        case 'UNIT_SELECTED':
          this.selectedUnit =
            this.gameService.getUnitAt(event.data.x, event.data.y) || null;
          console.log('Unit selected:', this.selectedUnit?.name);
          break;
        case 'UNIT_MOVED':
          console.log('Unit moved:', event.data);
          break;
        case 'TURN_ENDED':
          console.log('Turn ended:', event.data);
          break;
      }
    });
  }
}
