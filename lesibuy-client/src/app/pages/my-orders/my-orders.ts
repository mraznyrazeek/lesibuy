import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: AuthResponse | null) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}