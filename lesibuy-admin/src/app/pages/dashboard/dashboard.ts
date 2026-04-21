import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';

import { Product } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  orders: Order[] = [];

  isLoading = false;
  errorMessage = '';

  totalProducts = 0;
  activeProducts = 0;
  totalOrders = 0;
  pendingOrders = 0;

  recentProducts: Product[] = [];
  recentOrders: Order[] = [];

  pendingCount = 0;
  cancelledCount = 0;
  completedCount = 0;
  processingCount = 0;

  constructor(
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let productsLoaded = false;
    let ordersLoaded = false;

    const finishLoading = () => {
      if (productsLoaded && ordersLoaded) {
        this.isLoading = false;
      }
    };

    this.productService.getAll().subscribe({
      next: (response) => {
        this.products = response ?? [];

        this.totalProducts = this.products.length;
        this.activeProducts = this.products.filter(p => p.isAvailable !== false).length;
        this.recentProducts = [...this.products].slice(0, 5);

        productsLoaded = true;
        finishLoading();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });

    this.orderService.getAllAdminOrders().subscribe({
      next: (response) => {
        this.orders = response ?? [];

        this.totalOrders = this.orders.length;
        this.pendingOrders = this.orders.filter(o => this.normalizeStatus(o.status) === 'pending').length;

        this.pendingCount = this.orders.filter(o => this.normalizeStatus(o.status) === 'pending').length;
        this.cancelledCount = this.orders.filter(o => this.normalizeStatus(o.status) === 'cancelled').length;
        this.completedCount = this.orders.filter(o => {
          const status = this.normalizeStatus(o.status);
          return status === 'completed' || status === 'delivered';
        }).length;
        this.processingCount = this.orders.filter(o => {
          const status = this.normalizeStatus(o.status);
          return status === 'processing' || status === 'confirmed';
        }).length;

        this.recentOrders = [...this.orders].slice(0, 5);

        ordersLoaded = true;
        finishLoading();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });
  }

  normalizeStatus(status: string | null | undefined): string {
    return (status ?? '').trim().toLowerCase();
  }

  getStatusClass(status: string | null | undefined): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'pending') return 'pending';
    if (normalized === 'cancelled') return 'cancelled';
    if (normalized === 'completed' || normalized === 'delivered') return 'completed';
    if (normalized === 'processing' || normalized === 'confirmed') return 'processing';

    return 'default';
  }

  getOrderItemsCount(order: Order): number {
    return order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
  }
}