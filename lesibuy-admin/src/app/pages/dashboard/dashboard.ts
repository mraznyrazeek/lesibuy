import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';

type RevenueRange = 'weekly' | 'monthly' | 'yearly';

type RevenueChartItem = {
  label: string;
  value: number;
};

type ChartDot = {
  cx: number;
  cy: number;
  value: number;
  label: string;
  index: number;
};

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
  revenueChartData: RevenueChartItem[] = [];
  revenueTotal = 0;
  revenueAverage = 0;
  revenueTrend = 0;
  chartWidth = 100;
  chartHeight = 100;

  private readonly chartLeftPadding = 8;
  private readonly chartRightPadding = 4;
  private readonly chartTopPadding = 18;
  private readonly chartBottomPadding = 88;

  displayTotalProducts = 0;
  displayActiveProducts = 0;
  displayTotalOrders = 0;
  displayPendingOrders = 0;
  displayPendingCount = 0;
  displayApprovedCount = 0;
  displayProcessingCount = 0;
  displayCompletedCount = 0;
  displayCancelledCount = 0;
  displayRevenueTotal = 0;
  displayRevenueAverage = 0;
  displayMaxRevenueValue = 0;
  activeRevenuePointIndex = 0;

  private animationFrameIds: number[] = [];

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
        this.animateDashboardNumbers();
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

        this.setRevenueRange('monthly', false);

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

  setRevenueRange(range: RevenueRange, animate = true): void {
    this.revenueRange = range;
    this.generateRevenueData();
    this.setDefaultActivePoint();

    if (animate && !this.isLoading) {
      this.animateRevenueNumbers();
    }
  }

  generateRevenueData(): void {
    const now = new Date();

    if (this.revenueRange === 'weekly') {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = labels.map(label => ({ label, value: 0 }));

      const currentDay = now.getDay();
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
        ? (secondHalf > 0 ? 100 : 0)
        : ((secondHalf - firstHalf) / firstHalf) * 100;
  }

  setActiveRevenuePoint(index: number): void {
    if (!this.revenueChartData.length) {
      this.activeRevenuePointIndex = 0;
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, this.revenueChartData.length - 1));
    this.activeRevenuePointIndex = safeIndex;
  }

  private setDefaultActivePoint(): void {
    if (!this.revenueChartData.length) {
      this.activeRevenuePointIndex = 0;
      return;
    }

    let maxIndex = 0;

    for (let i = 1; i < this.revenueChartData.length; i++) {
      if (this.revenueChartData[i].value >= this.revenueChartData[maxIndex].value) {
        maxIndex = i;
      }
    }

    this.activeRevenuePointIndex = maxIndex;
  }

  get revenueRangeTitle(): string {
    if (this.revenueRange === 'weekly') return 'This Week';
    if (this.revenueRange === 'monthly') return 'This Month';
    return 'This Year';
  }

  get activeRevenuePoint(): ChartDot | null {
    return this.chartDots[this.activeRevenuePointIndex] ?? null;
  }

  get activeRevenueData(): RevenueChartItem | null {
    return this.revenueChartData[this.activeRevenuePointIndex] ?? null;
  }

  get maxRevenueValue(): number {
    const max = Math.max(...this.revenueChartData.map(item => item.value), 0);
    return max <= 0 ? 1 : max;
  }

  private getScaledY(value: number): number {
    const drawableTop = this.chartTopPadding;
    const drawableBottom = this.chartBottomPadding;
    const drawableHeight = drawableBottom - drawableTop;
    const max = this.maxRevenueValue;
    const normalized = max > 0 ? value / max : 0;
    const eased = Math.pow(normalized, 0.82);

    return drawableBottom - eased * drawableHeight;
  }

  get chartDots(): ChartDot[] {
    if (!this.revenueChartData.length) return [];

    const left = this.chartLeftPadding;
    const right = this.chartWidth - this.chartRightPadding;
    const usableWidth = right - left;

    const count = this.revenueChartData.length;

    return this.revenueChartData.map((item, index) => {
      const cx =
        count === 1
          ? left + usableWidth / 2
          : left + (usableWidth / (count - 1)) * index;

      const cy = this.getScaledY(item.value);

      return {
        cx: Number(cx.toFixed(2)),
        cy: Number(cy.toFixed(2)),
        value: item.value,
        label: item.label,
        index
      };
    });
  }

  get chartCoordinates(): { x: number; y: number }[] {
    return this.chartDots.map(dot => ({
      x: dot.cx,
      y: dot.cy
    }));
  }

  get chartSmoothPath(): string {
    const points = this.chartCoordinates;
    if (!points.length) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i === 0 ? points[i] : points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;

      const tension = 0.18;

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;

      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    return d;
  }

  get chartAreaPath(): string {
    const points = this.chartCoordinates;
    if (!points.length) return '';

    const bottomY = this.chartBottomPadding;
    let d = this.chartSmoothPath;

    d += ` L ${points[points.length - 1].x} ${bottomY}`;
    d += ` L ${points[0].x} ${bottomY}`;
    d += ' Z';

    return d;
  }

  get activeTooltipLeftPercent(): number {
    const point = this.activeRevenuePoint;
    if (!point) return 50;
    return point.cx;
  }

  private animateDashboardNumbers(): void {
    this.cancelAnimations();

    this.animateValue('displayTotalProducts', this.totalProducts, 1100, false);
    this.animateValue('displayActiveProducts', this.activeProducts, 1150, false);
    this.animateValue('displayTotalOrders', this.totalOrders, 1200, false);
    this.animateValue('displayPendingOrders', this.pendingOrders, 1250, false);

    this.animateValue('displayPendingCount', this.pendingCount, 1200, false);
    this.animateValue('displayApprovedCount', this.approvedCount, 1200, false);
    this.animateValue('displayProcessingCount', this.processingCount, 1200, false);
    this.animateValue('displayCompletedCount', this.completedCount, 1200, false);
    this.animateValue('displayCancelledCount', this.cancelledCount, 1200, false);

    this.animateRevenueNumbers();
  }

  private animateRevenueNumbers(): void {
    this.animateValue('displayRevenueTotal', this.revenueTotal, 1200, true);
    this.animateValue('displayRevenueAverage', this.revenueAverage, 1200, true);
    this.animateValue('displayMaxRevenueValue', this.maxRevenueValue, 1200, true);
  }

  private animateValue(
    property: keyof DashboardComponent,
    endValue: number,
    duration = 1000,
    isDecimal = false
  ): void {
    const startValue = 0;
    const startTime = performance.now();

    (this[property] as number) = 0;

    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const updateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;

      (this[property] as number) = isDecimal
        ? Number(currentValue.toFixed(2))
        : Math.round(currentValue);

      if (progress < 1) {
        const frameId = requestAnimationFrame(updateFrame);
        this.animationFrameIds.push(frameId);
      } else {
        (this[property] as number) = isDecimal
          ? Number(endValue.toFixed(2))
          : Math.round(endValue);
      }
    };

    const frameId = requestAnimationFrame(updateFrame);
    this.animationFrameIds.push(frameId);
  }

  private cancelAnimations(): void {
    this.animationFrameIds.forEach(id => cancelAnimationFrame(id));
    this.animationFrameIds = [];
  }
}