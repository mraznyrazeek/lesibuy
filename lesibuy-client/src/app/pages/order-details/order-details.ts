import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {
  order?: Order;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid order ID.';
      return;
    }

    this.loadOrder(id);
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load order details:', err);
        this.errorMessage = 'Failed to load order details.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  formatSpecKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  }

  parseSpecifications(specifications?: string): { key: string; value: string }[] {
    if (!specifications) return [];

    try {
      const parsed = JSON.parse(specifications);

      const preferredOrder = [
        'model',
        'yearOrGeneration',
        'processor',
        'ram',
        'storage',
        'screen',
        'color',
        'batteryHealth',
        'sim',
        'box',
        'accessories',
        'caseType',
        'noiseCancellation'
      ];

      const entries = Object.entries(parsed);

      entries.sort(([a], [b]) => {
        const indexA = preferredOrder.indexOf(a);
        const indexB = preferredOrder.indexOf(b);

        const safeA = indexA === -1 ? 999 : indexA;
        const safeB = indexB === -1 ? 999 : indexB;

        return safeA - safeB;
      });

      return entries.map(([key, value]) => ({
        key: this.formatSpecKey(key),
        value: String(value)
      }));
    } catch {
      return [];
    }
  }
}