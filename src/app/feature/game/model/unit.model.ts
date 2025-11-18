export type UnitType = 'soldier' | 'archer' | 'knight' | 'mage';

export interface Unit{
    id: string;
    name: string;
    type: UnitType;
    ownerId: string;
    x: number;
    y: number;

    // 戰鬥屬性
    maxHp: number;
    hp: number;
    attack: number;
    defense: number;
    move: number;
    range: number;

    alive: boolean;
    // 行動狀態
    actionState: {
        hasMoved: boolean;
        hasAttacked: boolean;
        canAct: boolean; // 綜合判斷
    };
}