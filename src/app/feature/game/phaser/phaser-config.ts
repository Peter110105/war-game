import Phaser from "phaser";
import { BattlefieldScene } from './scene/battlefield.scene';

export function createPhaserGame(container: HTMLElement): Phaser.Game{
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: container,
        scene: [BattlefieldScene],
        backgroundColor: '#222222',
    };
    return new Phaser.Game(config);

}