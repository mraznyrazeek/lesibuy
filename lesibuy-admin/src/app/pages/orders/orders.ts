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

  currentPage = 1;
  pageSize = 15;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getAllAdminOrders().subscribe({
      next: (res) => {
        this.orders = res ?? [];
        this.currentPage = 1;
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
        order.fullName?.toLowerCase().includes(term) ||
        order.email?.toLowerCase().includes(term) ||
        order.id?.toString().includes(term)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(
        order => this.normalizeStatus(order.status) === this.selectedStatus
      );
    }

    return filtered;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize) || 1;
  }

  get paginatedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredOrders.length);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onStatusChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
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

  getInitials(name: string | null | undefined): string {
    if (!name) return 'O';

    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
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

  viewOrder(order: Order): void {
    if (order.isSeenByAdmin) {
      this.openDetails(order);
      return;
    }

    this.orderService.markOrderAsSeen(order.id).subscribe({
      next: () => {
        order.isSeenByAdmin = true;
        this.openDetails(order);
      },
      error: (err) => {
        console.error(err);
        this.openDetails(order);
      }
    });
  }
}