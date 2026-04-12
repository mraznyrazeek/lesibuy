import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  cartCount: number = 0;

  constructor(
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartCount = items.reduce(
        (total: number, item: CartItem) => total + item.quantity,
        0
      );
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