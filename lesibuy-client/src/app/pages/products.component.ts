import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getCategoryName(id: number): string {
    switch (id) {
      case 1:
        return 'iPhone';
      case 2:
        return 'iPad';
      case 3:
        return 'MacBook';
      case 4:
        return 'Apple Watch';
      case 5:
        return 'Audio';
      default:
        return 'Unknown';
    }
  }
}


