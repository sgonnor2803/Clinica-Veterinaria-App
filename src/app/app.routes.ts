import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'shop',
    loadComponent: () => import('./pages/shop/shop.page').then( m => m.ShopPage),
    canActivate: [authGuard],
  },
  {
    path: 'adoptions',
    loadComponent: () => import('./pages/adoptions/adoptions.page').then( m => m.AdoptionsPage),
    canActivate: [authGuard],
  },
  {
    path: 'appointments',
    loadComponent: () => import('./pages/appointments/appointments.page').then( m => m.AppointmentsPage),
    canActivate: [authGuard],
  },
];