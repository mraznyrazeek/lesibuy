import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products-list/products-list').then(m => m.ProductsListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./pages/products/products').then(m => m.ProductsComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('./pages/products/products').then(m => m.ProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories').then(m => m.CategoriesComponent)
      },

      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/orders').then(m => m.OrdersComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];