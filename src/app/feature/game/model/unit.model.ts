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
    status?: 'idle' | 'moved' | 'acted'; // 該回合狀態

}