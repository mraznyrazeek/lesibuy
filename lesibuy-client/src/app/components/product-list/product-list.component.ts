import { Component, OnInit }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { ProductService }         from '../../services/product.service';
import { Product }                from '../../models/product';

@Component({
  standalone:   true,
  selector:     'app-product-list',
  imports:      [CommonModule],
  templateUrl:  './product-list.component.html',
  styleUrls:    ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading  = true;
  error    = '';

  constructor(private svc: ProductService) {}

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: list => {
        this.products = list;
        this.loading  = false;
      },
      error: err => {
        this.error   = 'Failed to load products';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
