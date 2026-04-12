import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  cartCount: number = 0;
  currentUser: AuthResponse | null = null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartCount = items.reduce(
        (total: number, item: CartItem) => total + item.quantity,
        0
      );
    });

    this.authService.currentUser$.subscribe((user: AuthResponse | null) => {
      this.currentUser = user;
    });
  }

  goHome(): void {
    this.router.navigate(['/'], { queryParams: {} });
  }

  goToCategory(category: string): void {
    this.router.navigate(['/'], {
      queryParams: { category }
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToOrders(): void {
    this.router.navigate(['/my-orders']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  search(value: string): void {
    const trimmed = value.trim();

    if (!trimmed) {
      this.router.navigate(['/'], { queryParams: {} });
      return;
    }

    this.router.navigate(['/'], {
      queryParams: { search: trimmed }
    });
  }
}