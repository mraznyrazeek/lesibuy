import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products.component';
import { ProductDetailsComponent } from './pages/product-details/product-details';
import { CartComponent } from './pages/cart/cart';
import { CheckoutComponent } from './pages/checkout/checkout';
import { OrderSuccessComponent } from './pages/order-success/order-success';
import { MyOrdersComponent } from './pages/my-orders/my-orders';

export const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-success/:id', component: OrderSuccessComponent },
  { path: 'my-orders', component: MyOrdersComponent }
];