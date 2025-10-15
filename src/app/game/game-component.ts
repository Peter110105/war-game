import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game-component',
  imports: [],
  templateUrl: './game-component.html',
  styleUrl: './game-component.css'
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;
  private game: any;

  constructor(private ngZone: NgZone) {}

  async ngOnInit() {
    // ✅ 僅在瀏覽器載入 Phaser
    const Phaser = await import('phaser');

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: this.gameContainer.nativeElement,
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      scene: {
        preload: this.preload,
        create: this.create,
        update: this.update
      }
    };

    // 在 Angular 區域外執行，避免變更檢測影響效能
    this.ngZone.runOutsideAngular(() => {
      this.game = new Phaser.Game(config);
    });
  }

  preload(this: any) {
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
  }

  create(this: any) {
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.cursors = this.input.keyboard?.createCursorKeys();
  }

  update(this: any) {
    if (!this.cursors || !this.player) return;
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left?.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right?.isDown) this.player.setVelocityX(speed);

    if (this.cursors.up?.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down?.isDown) this.player.setVelocityY(speed);
  }

  ngOnDestroy() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}
