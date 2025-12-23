// src/app/feature/game/phaser/manager/effect-renderer.manager.ts
import Phaser from 'phaser';
import { Unit } from '../../../model/unit.model';
import { SkillEffectType } from '../../../model/skill.model';
import { GAME_CONFIG } from '../../../config/game/game.config';

interface EffectIcon {
  container: Phaser.GameObjects.Container;
  icons: Phaser.GameObjects.Text[];
}

/**
 * 效果渲染管理器
 * 負責: 顯示單位身上的 Buff/Debuff 圖示
 */
export class EffectRendererManager {
  private effectIcons: Map<string, EffectIcon> = new Map();
  private tileSize = GAME_CONFIG.TILE_SIZE;

  constructor(private scene: Phaser.Scene) {}

  /**
   * 更新單位的效果圖示
   */
  public updateEffectIcons(unit: Unit): void {
    // 移除舊的圖示
    this.removeEffectIcons(unit.id);

    // 如果沒有效果，直接返回
    if (!unit.activeEffects || unit.activeEffects.length === 0) {
      return;
    }

    const pixelX = unit.x * this.tileSize + this.tileSize / 2;
    const pixelY = unit.y * this.tileSize - this.tileSize / 2 + 50;

    // 創建容器
    const container = this.scene.add.container(pixelX, pixelY);
    container.setDepth(100);

    const icons: Phaser.GameObjects.Text[] = [];
    const iconSize = 16;
    const spacing = 18;

    // 為每個效果創建圖示
    unit.activeEffects.forEach((effect, index) => {
      const icon = this.getEffectIcon(effect.effectType);
      const isDebuff = this.isDebuff(effect.effectType);

      const offsetX =
        (index - unit.activeEffects.length / 2) * spacing + spacing / 2;

      const iconText = this.scene.add.text(offsetX, 0, icon, {
        fontSize: `${iconSize}px`,
        backgroundColor: isDebuff ? '#8b0000' : '#006400',
        padding: { x: 2, y: 2 },
      });
      iconText.setOrigin(0.5);

      // 如果有持續時間，顯示剩餘回合數
      if (effect.duration > 0) {
        const durationText = this.scene.add.text(
          offsetX + 6,
          6,
          effect.duration.toString(),
          {
            fontSize: '10px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2,
          }
        );
        durationText.setOrigin(0.5);
        container.add(durationText);
      }

      container.add(iconText);
      icons.push(iconText);
    });

    this.effectIcons.set(unit.id, { container, icons });
  }

  /**
   * 移除單位的效果圖示
   */
  public removeEffectIcons(unitId: string): void {
    const effectIcon = this.effectIcons.get(unitId);
    if (effectIcon) {
      effectIcon.container.destroy();
      this.effectIcons.delete(unitId);
    }
  }

  /**
   * 移動效果圖示（當單位移動時）
   */
  public moveEffectIcons(unit: Unit): void {
    const effectIcon = this.effectIcons.get(unit.id);
    if (effectIcon) {
      const pixelX = unit.x * this.tileSize + this.tileSize / 2;
      const pixelY = unit.y * this.tileSize - this.tileSize / 2 + 50;
      effectIcon.container.setPosition(pixelX, pixelY);
    }
  }

  /**
   * 清除所有效果圖示
   */
  public clearAll(): void {
    this.effectIcons.forEach((icon) => {
      icon.container.destroy();
    });
    this.effectIcons.clear();
  }

  /**
   * 取得效果類型的圖示
   */
  private getEffectIcon(effectType: SkillEffectType): string {
    const iconMap: { [key: string]: string } = {
      [SkillEffectType.BUFF_ATTACK]: '⚔️',
      [SkillEffectType.BUFF_DEFENSE]: '🛡️',
      [SkillEffectType.BUFF_MOVE]: '🚶',
      [SkillEffectType.STUN]: '😵',
      [SkillEffectType.SLOW]: '🐌',
      [SkillEffectType.BURN]: '🔥',
      [SkillEffectType.POISON]: '☠️',
      [SkillEffectType.SHIELD]: '🛡️',
      [SkillEffectType.REGENERATION]: '💚',
      [SkillEffectType.REFLECT_DAMAGE]: '⚡',
    };
    return iconMap[effectType] || '✨';
  }

  /**
   * 判斷是否為負面效果
   */
  private isDebuff(effectType: SkillEffectType): boolean {
    const debuffTypes = [
      SkillEffectType.STUN,
      SkillEffectType.SLOW,
      SkillEffectType.POISON,
      SkillEffectType.BURN,
    ];
    return debuffTypes.includes(effectType);
  }
}
