import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  selectedStatus = '';

  selectedOrder: Order | null = null;
  statusUpdateValue = '';
  isUpdatingStatus = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getAllAdminOrders().subscribe({
      next: (res) => {
        this.orders = res ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load orders.';
        this.isLoading = false;
      }
    });
  }

  get filteredOrders(): Order[] {
    let filtered = [...this.orders];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();

      filtered = filtered.filter(order =>
        order.fullName.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term) ||
        order.id.toString().includes(term)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(
        order => this.normalizeStatus(order.status) === this.selectedStatus
      );
    }

    return filtered;
  }

  normalizeStatus(status: string | null | undefined): string {
    return (status ?? '').trim().toLowerCase();
  }

  getStatusClass(status: string | null | undefined): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'pending') return 'pending';
    if (normalized === 'cancelled') return 'cancelled';
    if (normalized === 'completed' || normalized === 'delivered') return 'completed';
    if (
      normalized === 'processing' ||
      normalized === 'confirmed' ||
      normalized === 'approved'
    ) return 'processing';

    return 'default';
  }

  getItemCount(order: Order): number {
    return order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
  }

  openDetails(order: Order): void {
    this.selectedOrder = order;
    this.statusUpdateValue = order.status;
  }

  closeDetails(): void {
    this.selectedOrder = null;
    this.statusUpdateValue = '';
    this.isUpdatingStatus = false;
  }

  updateStatus(): void {
    if (!this.selectedOrder || !this.statusUpdateValue.trim()) return;

    this.isUpdatingStatus = true;

    this.orderService.updateOrderStatus(this.selectedOrder.id, this.statusUpdateValue).subscribe({
      next: (updated) => {
        const index = this.orders.findIndex(o => o.id === updated.id);
        if (index !== -1) {
          this.orders[index] = updated;
        }

        this.selectedOrder = updated;
        this.statusUpdateValue = updated.status;
        this.isUpdatingStatus = false;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update order status.');
        this.isUpdatingStatus = false;
      }
    });
  }
}