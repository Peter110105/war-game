export interface Player{
    id: string;
    name: string
    team: 'P1' | 'P2' | 'P3' | 'P4';
    aiControlled: boolean;
    isActive: boolean; // 是否為當前行動玩家
}
