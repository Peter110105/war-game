import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'game', pathMatch: 'full' },
    { path: 'game', loadComponent: () => import('../app/pages/battleField/battlefield.component').then(m => m.BattlefieldComponent) }
];
