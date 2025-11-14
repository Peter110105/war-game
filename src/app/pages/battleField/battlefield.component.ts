import { Component, ElementRef, ViewChild } from '@angular/core';
import { GameStateService } from '../../feature/game/service/game-state.service'
import { createPhaserGame } from '../../feature/game/phaser/phaser-config';

@Component({
    selector: 'app-battlefield',
    templateUrl: './battlefield.component.html',
    styleUrls: ['./battlefield.component.css']
})
export class BattlefieldComponent {

  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;

  constructor(private gameService: GameStateService) {}

  ngOnInit() {
    (window as any).ngGameService = this.gameService;
    createPhaserGame(this.gameContainer.nativeElement);
  }
}