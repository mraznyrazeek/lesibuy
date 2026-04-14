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

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'order-success/:id', component: OrderSuccessComponent, canActivate: [authGuard] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard] },

  {
    path: 'my-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-profile/my-profile').then(m => m.MyProfile)
  },
  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/change-password/change-password').then(m => m.ChangePassword)
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/order-details/order-details').then(m => m.OrderDetails)
  },
  {
    path: 'contact-us',
    loadComponent: () =>
      import('./pages/contact-us/contact-us').then(m => m.ContactUsComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'terms-and-conditions',
    loadComponent: () =>
      import('./pages/terms-and-conditions/terms-and-conditions').then(m => m.TermsAndConditionsComponent)
  },

  { path: '**', redirectTo: '' }
];