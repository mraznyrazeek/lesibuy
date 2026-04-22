import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
      this.total = this.cartService.getCartTotal();
    });
  }

  increase(productId: number): void {
    this.cartService.increaseQuantity(productId);
  }

  decrease(productId: number): void {
    this.cartService.decreaseQuantity(productId);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  getCartItemImage(imageUrl: string): string {
    if (!imageUrl) {
      return 'https://via.placeholder.com/120';
    }

    try {
      const parsed = JSON.parse(imageUrl);
      const firstImage = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;

      if (firstImage) {
        return `https://localhost:7225/uploads/${firstImage}`;
      }

      return 'https://via.placeholder.com/120';
    } catch (error) {
      console.error('Invalid imageUrl:', imageUrl);
      return 'https://via.placeholder.com/120';
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/120';
  }
}