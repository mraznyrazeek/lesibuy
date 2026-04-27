import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent implements OnInit {

  unseenOrderCount = 0;

  constructor(
    public authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadUnseenOrders();

    setInterval(() => {
      this.loadUnseenOrders();
    }, 10000); // every 10 sec
  }

  loadUnseenOrders(): void {
    this.orderService.getUnseenOrderCount().subscribe({
      next: (count) => this.unseenOrderCount = count,
      error: (err) => console.error(err)
    });
  }

  logout(): void {
    this.authService.logout();
  }
}