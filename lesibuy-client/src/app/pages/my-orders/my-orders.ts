import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { orderservice, Order } from '../../services/order.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyordersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  errorMessage = '';

  constructor(private orderservice: orderservice) {}

  ngOnInit(): void {
    this.loadorders();
  }

  loadorders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderservice.getorders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load orders:', err);
        this.errorMessage = 'Failed to load orders.';
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
}