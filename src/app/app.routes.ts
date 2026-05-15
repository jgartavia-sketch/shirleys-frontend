import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },

  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio/inicio').then(m => m.Inicio)
  },

  {
    path: 'menu',
    loadComponent: () =>
      import('./pages/menu/menu').then(m => m.Menu)
  },

  {
    path: 'catering',
    loadComponent: () =>
      import('./pages/catering/catering').then(m => m.Catering)
  },

  {
    path: 'nosotros',
    loadComponent: () =>
      import('./pages/nosotros/nosotros').then(m => m.Nosotros)
  },

  {
    path: 'contacto',
    loadComponent: () =>
      import('./pages/contacto/contacto').then(m => m.Contacto)
  },

  {
    path: 'customers/:code',
    loadComponent: () =>
      import('./pages/customer-card/customer-card').then(m => m.CustomerCard)
  },

  {
    path: 'staff/login',
    loadComponent: () =>
      import('./pages/staff-login/staff-login').then(m => m.StaffLogin)
  },

  {
    path: 'staff',
    loadComponent: () =>
      import('./pages/staff/staff').then(m => m.Staff)
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin').then(m => m.Admin)
  },

  {
    path: '**',
    redirectTo: 'inicio'
  }
];