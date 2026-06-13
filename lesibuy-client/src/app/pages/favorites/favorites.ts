import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Product } from '../../models/product.model';
import { FavoriteService } from '../../services/favorite.service';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class FavoritesComponent implements OnInit {
  favorites: Product[] = [];

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.favoriteService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
    });
  }

  getProductImage(product: Product): string {
    if (!product.imageUrl) {
      return 'https://via.placeholder.com/250';
    }

    try {
      const parsed = JSON.parse(product.imageUrl);

      const firstImage =
        Array.isArray(parsed) && parsed.length > 0
          ? parsed[0]
          : null;

      return firstImage
        ? `https://localhost:7225/uploads/${firstImage}`
        : 'https://via.placeholder.com/250';
    } catch {
      return 'https://via.placeholder.com/250';
    }
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = 'https://via.placeholder.com/250';
  }

  removeFavorite(productId: number): void {
    this.favoriteService.removeFromFavorites(productId);
  }

  addToCart(product: Product): void {
    if (!product.isAvailable) {
      return;
    }

    this.cartService.addToCart(product);
  }

  viewDetails(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
}