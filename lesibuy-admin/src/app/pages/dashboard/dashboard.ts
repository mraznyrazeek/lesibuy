import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];

  isLoading = false;
  errorMessage = '';

  totalProducts = 0;
  activeProducts = 0;
  inactiveProducts = 0;
  lowStockProducts = 0;

  recentProducts: Product[] = [];
  lowStockList: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getAll().subscribe({
      next: (response) => {
        this.products = response ?? [];

        this.totalProducts = this.products.length;
        this.activeProducts = this.products.filter(p => p.isAvailable !== false).length;
        this.inactiveProducts = this.products.filter(p => p.isAvailable === false).length;
        this.lowStockProducts = this.products.filter(p => (p.stockQuantity ?? 0) <= 5).length;

        this.recentProducts = [...this.products].slice(0, 5);
        this.lowStockList = this.products
          .filter(p => (p.stockQuantity ?? 0) <= 5)
          .slice(0, 5);

        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });
  }

  getStockLabel(stock: number | null | undefined): string {
    const value = stock ?? 0;
    return value <= 5 ? 'Low stock' : 'In stock';
  }
}