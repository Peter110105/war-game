// game-state-loader.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameState } from '../../feature/game/model/game-state.model';
import { catchError, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameStateLoaderService {
  constructor(private http: HttpClient) {}

  loadInitialState(): Observable<GameState> {
    return this.http.get<GameState>('assets/data/initial-game-state.json').pipe(
      catchError((error) => {
        console.error('Failed to load game state:', error);
        console.log('Using default game state');
        return of(this.getDefaultState());
      })
    );
  }
  private getDefaultState(): GameState {
    return {
      width: 8,
      height: 6,
      tiles: [],
      units: [],
      players: [],
      currentPlayerIndex: 0,
      turn: 1,
    };
  }
}
