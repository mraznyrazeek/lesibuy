import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';

import { Product } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';

type RevenueRange = 'weekly' | 'monthly' | 'yearly';

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
  approvedCount = 0;
  processingCount = 0;
  completedCount = 0;
  cancelledCount = 0;

  revenueRange: RevenueRange = 'weekly';
  revenueChartData: { label: string; value: number }[] = [];
  revenueTotal = 0;
  revenueAverage = 0;
  revenueTrend = 0;

  chartWidth = 100;
  chartHeight = 220;

  constructor(
    private productService: ProductService,
    private orderService: OrderService
  ) { }

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

        this.recentProducts = [...this.products]
          .sort((a: any, b: any) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
          )
          .slice(0, 4);

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

        this.orders = [...this.orders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.totalOrders = this.orders.length;
        this.pendingOrders = this.orders.filter(
          o => this.normalizeStatus(o.status) === 'pending'
        ).length;

        this.pendingCount = this.orders.filter(
          o => this.normalizeStatus(o.status) === 'pending'
        ).length;

        this.approvedCount = this.orders.filter(
          o => this.normalizeStatus(o.status) === 'approved'
        ).length;

        this.processingCount = this.orders.filter(
          o =>
            this.normalizeStatus(o.status) === 'processing' ||
            this.normalizeStatus(o.status) === 'confirmed'
        ).length;

        this.completedCount = this.orders.filter(
          o =>
            this.normalizeStatus(o.status) === 'completed' ||
            this.normalizeStatus(o.status) === 'delivered'
        ).length;

        this.cancelledCount = this.orders.filter(
          o => this.normalizeStatus(o.status) === 'cancelled'
        ).length;

        this.recentOrders = [...this.orders].slice(0, 4);

        this.setRevenueRange('weekly');

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

  isRevenueStatusIncluded(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized !== 'cancelled';
  }

  getStatusClass(status: string | null | undefined): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'pending') return 'pending';
    if (normalized === 'cancelled') return 'cancelled';
    if (normalized === 'completed' || normalized === 'delivered') return 'completed';
    if (normalized === 'processing' || normalized === 'confirmed') return 'processing';
    if (normalized === 'approved') return 'approved';

    return 'default';
  }

  getOrderItemsCount(order: Order): number {
    return order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
  }

  setRevenueRange(range: RevenueRange): void {
    this.revenueRange = range;
    this.generateRevenueData();
  }

  generateRevenueData(): void {
    const now = new Date();

    if (this.revenueRange === 'weekly') {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = labels.map(label => ({ label, value: 0 }));

      const currentDay = now.getDay(); // Sun=0
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(now.getDate() + mondayOffset);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      this.orders
        .filter(order => this.isRevenueStatusIncluded(order.status))
        .forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate >= weekStart && orderDate < weekEnd) {
            const jsDay = orderDate.getDay();
            const index = jsDay === 0 ? 6 : jsDay - 1;
            data[index].value += Number(order.totalAmount ?? 0);
          }
        });

      this.revenueChartData = data;
    }

    if (this.revenueRange === 'monthly') {
      const labels = ['W1', 'W2', 'W3', 'W4'];
      const data = labels.map(label => ({ label, value: 0 }));

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      this.orders
        .filter(order => this.isRevenueStatusIncluded(order.status))
        .forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate >= monthStart && orderDate < nextMonthStart) {
            const day = orderDate.getDate();
            let index = 0;
            if (day >= 8 && day <= 14) index = 1;
            else if (day >= 15 && day <= 21) index = 2;
            else if (day >= 22) index = 3;

            data[index].value += Number(order.totalAmount ?? 0);
          }
        });

      this.revenueChartData = data;
    }

    if (this.revenueRange === 'yearly') {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = labels.map(label => ({ label, value: 0 }));

      this.orders
        .filter(order => this.isRevenueStatusIncluded(order.status))
        .forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate.getFullYear() === now.getFullYear()) {
            const monthIndex = orderDate.getMonth();
            data[monthIndex].value += Number(order.totalAmount ?? 0);
          }
        });

      this.revenueChartData = data;
    }

    this.revenueTotal = this.revenueChartData.reduce((sum, item) => sum + item.value, 0);
    this.revenueAverage = this.revenueChartData.length
      ? this.revenueTotal / this.revenueChartData.length
      : 0;

    const firstHalf = this.revenueChartData
      .slice(0, Math.floor(this.revenueChartData.length / 2))
      .reduce((sum, item) => sum + item.value, 0);

    const secondHalf = this.revenueChartData
      .slice(Math.floor(this.revenueChartData.length / 2))
      .reduce((sum, item) => sum + item.value, 0);

    this.revenueTrend =
      firstHalf === 0
        ? secondHalf > 0 ? 100 : 0
        : ((secondHalf - firstHalf) / firstHalf) * 100;
  }

  get maxRevenueValue(): number {
    const max = Math.max(...this.revenueChartData.map(item => item.value), 0);
    return max === 0 ? 1 : max;
  }

  get chartPoints(): string {
    if (!this.revenueChartData.length) return '';

    const stepX =
      this.revenueChartData.length > 1
        ? this.chartWidth / (this.revenueChartData.length - 1)
        : this.chartWidth;

    return this.revenueChartData
      .map((item, index) => {
        const x = index * stepX;
        const y = this.chartHeight - (item.value / this.maxRevenueValue) * this.chartHeight;
        return `${x},${y}`;
      })
      .join(' ');
  }

  get chartAreaPoints(): string {
    if (!this.revenueChartData.length) return '';

    const stepX =
      this.revenueChartData.length > 1
        ? this.chartWidth / (this.revenueChartData.length - 1)
        : this.chartWidth;

    const linePoints = this.revenueChartData
      .map((item, index) => {
        const x = index * stepX;
        const y = this.chartHeight - (item.value / this.maxRevenueValue) * this.chartHeight;
        return `${x},${y}`;
      })
      .join(' ');

    return `0,${this.chartHeight} ${linePoints} ${this.chartWidth},${this.chartHeight}`;
  }

  get chartDots(): { cx: number; cy: number; value: number; label: string }[] {
    if (!this.revenueChartData.length) return [];

    const stepX =
      this.revenueChartData.length > 1
        ? this.chartWidth / (this.revenueChartData.length - 1)
        : this.chartWidth;

    return this.revenueChartData.map((item, index) => ({
      cx: index * stepX,
      cy: this.chartHeight - (item.value / this.maxRevenueValue) * this.chartHeight,
      value: item.value,
      label: item.label
    }));
  }

  get revenueRangeTitle(): string {
    if (this.revenueRange === 'weekly') return 'This Week';
    if (this.revenueRange === 'monthly') return 'This Month';
    return 'This Year';
  }

  get chartCoordinates(): { x: number; y: number }[] {
    if (!this.revenueChartData.length) return [];

    const stepX =
      this.revenueChartData.length > 1
        ? this.chartWidth / (this.revenueChartData.length - 1)
        : this.chartWidth;

    return this.revenueChartData.map((item, index) => ({
      x: index * stepX,
      y: this.chartHeight - (item.value / this.maxRevenueValue) * this.chartHeight
    }));
  }

  get chartSmoothPath(): string {
    const points = this.chartCoordinates;
    if (!points.length) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;

      d += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    return d;
  }

  get chartAreaPath(): string {
    const points = this.chartCoordinates;
    if (!points.length) return '';

    let d = this.chartSmoothPath;
    d += ` L ${points[points.length - 1].x} ${this.chartHeight}`;
    d += ` L ${points[0].x} ${this.chartHeight}`;
    d += ' Z';

    return d;
  }
}