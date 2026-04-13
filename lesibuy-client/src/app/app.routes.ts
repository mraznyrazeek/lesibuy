import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products.component';
import { ProductDetailsComponent } from './pages/product-details/product-details';
import { CartComponent } from './pages/cart/cart';
import { CheckoutComponent } from './pages/checkout/checkout';
import { OrderSuccessComponent } from './pages/order-success/order-success';
import { MyOrdersComponent } from './pages/my-orders/my-orders';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-success/:id', component: OrderSuccessComponent },
  { path: 'my-orders', component: MyOrdersComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard] },
  {
    path: 'my-profile',
    loadComponent: () =>
      import('./pages/my-profile/my-profile').then(m => m.MyProfile)
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./pages/change-password/change-password').then(m => m.ChangePassword)
  },

  {
    path: 'change-password',
    loadComponent: () =>
      import('./pages/change-password/change-password').then(m => m.ChangePassword)
  },

  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./pages/order-details/order-details').then(m => m.OrderDetails)
  }
];