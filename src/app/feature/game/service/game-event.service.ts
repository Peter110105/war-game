import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameEventService {
  private eventSubject = new Subject<GameEvent>();
  public events$ = this.eventSubject.asObservable();

  emit(event: GameEvent) {
    this.eventSubject.next(event);
  }
}

export interface GameEvent {
  type: GameEventType;
  data: any;
}

export enum GameEventType {
  UNIT_SELECTED = 'UNIT_SELECTED',
  UNIT_MOVED = 'UNIT_MOVED',
  UNIT_ATTACKED = 'UNIT_ATTACKED',
  UNIT_DIED = 'UNIT_DIED',
  UNIT_LEVEL_UP = 'UNIT_LEVEL_UP',
  UNIT_HEALED = 'UNIT_HEALED',
  SKILL_USED = 'SKILL_USED',
  PLAYER_ACTION_MOVED = 'PLAYER_ACTION_MOVED',
  PLAYER_ACTION_ATTACKED = 'PLAYER_ACTION_ATTACKED',
  PLAYER_ACTION_CANCELLED = 'PLAYER_ACTION_CANCELLED',
  PLAYER_ACTION_WAIT = 'PLAYER_ACTION_WAIT',
  TURN_ENDED = 'TURN_ENDED',
}
