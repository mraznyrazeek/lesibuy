import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products.component';
import { ProductDetailsComponent } from './pages/product-details/product-details';

export const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent }
];