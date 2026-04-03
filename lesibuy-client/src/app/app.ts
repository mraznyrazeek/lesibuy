import { Component } from '@angular/core';
import { ProductListComponent } from './components/product-list/product-list.component';

@Component({
  standalone:   true,
  selector:     'app-root',
  imports:      [ProductListComponent],
  template:     `<app-product-list></app-product-list>`
})
export class App {}
