import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameEventService {
  private eventSubject = new Subject<GameEvent>();
  public events$ = this.eventSubject.asObservable();

  emit(event: GameEvent) {
    this.eventSubject.next(event);
  }
}

export interface GameEvent{
  type:'UNIT_SELECTED' | 'UNIT_MOVED' | 'TURN_ENDED';
  data: any;
}
