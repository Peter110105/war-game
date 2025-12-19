import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-level-up-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './level-up-animation.component.html',
  styleUrl: './level-up-animation.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class LevelUpAnimationComponent implements OnInit, OnDestroy {
  @Input() unitId: string = '';
  @Input() level: number = 1;
  @Input() hpIncrease: number = 0;
  @Input() atkIncrease: number = 0;
  @Input() defIncrease: number = 0;

  isVisible = false;
  private hideTimer?: any;

  ngOnInit() {
    this.isVisible = true;

    // 3 秒後自動隱藏
    this.hideTimer = setTimeout(() => {
      this.isVisible = false;
    }, 3000);
  }

  ngOnDestroy() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  }
}
