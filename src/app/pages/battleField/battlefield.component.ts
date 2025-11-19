import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameStateService } from '../../feature/game/service/game-state.service'
import { createPhaserGame } from '../../feature/game/phaser/phaser-config';
import { Subscription } from 'rxjs';
import { GameEventService } from '../../feature/game/service/game-event.service';
import { BattlefieldScene } from '../../feature/game/phaser/scene/battlefield.scene';
import { PathfindingService } from '../../feature/game/logic/path-finding.service';

@Component({
    selector: 'app-battlefield',
    templateUrl: './battlefield.component.html',
    styleUrls: ['./battlefield.component.css']
})
export class BattlefieldComponent implements OnInit, OnDestroy{
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;
  
  private game?: Phaser.Game;
  private eventSubscription?: Subscription;

  constructor(private gameService: GameStateService, private eventService: GameEventService, private pathfindingService: PathfindingService) {}

  ngOnInit() {
      this.initPhaserGame();
      this.subscribeToGameEvents();
  }

  ngOnDestroy(): void {
      this.eventSubscription?.unsubscribe();
      this.game?.destroy(true);
  }

  private initPhaserGame(){
      const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: this.gameContainer.nativeElement,
          scene: [BattlefieldScene],
          backgroundColor: '#2f9710ff',
      };
      this.game = new Phaser.Game(config);
      this.game.scene.start('BattlefieldScene', { 
        gameService: this.gameService, 
        eventService: this.eventService, 
        pathfindingService: this.pathfindingService 
      });
  }

  private subscribeToGameEvents(){
    this.eventSubscription = this.eventService.events$.subscribe(event => {
        switch(event.type){
          case 'UNIT_SELECTED':
            console.log('Unit selected:', event.data);
            break;
          case 'UNIT_MOVED':
            console.log('Unit moved:', event.data);
            break;
          case 'UNIT_CLICKED':
            console.log('Unit clicked:', event.data);
            break;
        }
    });
  }
}