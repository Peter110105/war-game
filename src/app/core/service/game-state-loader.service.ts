// game-state-loader.service.ts
import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { GameState } from '../../feature/game/model/game-state.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameStateLoaderService {
  constructor(private http: HttpClient) {}

  loadInitialState(): Observable<GameState> {
    return this.http.get<GameState>('assets/data/initial-game-state.json');
  }
}
