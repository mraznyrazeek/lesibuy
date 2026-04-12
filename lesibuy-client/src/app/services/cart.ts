import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'lesibuy_cart';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    const items = this.loadCartFromStorage();
    this.cartItemsSubject.next(items);
  }

  addToCart(product: Product): void {
    const items = [...this.cartItemsSubject.value];
    const existingItem = items.find(i => i.product.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.push({ product, quantity: 1 });
    }

    this.updateCart(items);
  }

  increaseQuantity(productId: number): void {
    const items = [...this.cartItemsSubject.value];
    const item = items.find(i => i.product.id === productId);

    if (item) {
      item.quantity++;
      this.updateCart(items);
    }
  }

  decreaseQuantity(productId: number): void {
    const items = [...this.cartItemsSubject.value];
    const item = items.find(i => i.product.id === productId);

    if (!item) return;

    item.quantity--;

    const updated =
      item.quantity <= 0
        ? items.filter(i => i.product.id !== productId)
        : items;

    this.updateCart(updated);
  }

  removeFromCart(productId: number): void {
    const items = this.cartItemsSubject.value.filter(i => i.product.id !== productId);
    this.updateCart(items);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  getCartTotal(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  getCartCount(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);

    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }

  private loadCartFromStorage(): CartItem[] {
    if (!this.isBrowser) {
      return [];
    }

    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }
}