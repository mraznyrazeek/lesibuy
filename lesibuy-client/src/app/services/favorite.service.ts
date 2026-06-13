import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly storageKey = 'lesibuy_favorites';

  private favoritesSubject = new BehaviorSubject<Product[]>(
    this.loadFavorites()
  );

  readonly favorites$ = this.favoritesSubject.asObservable();

  private loadFavorites(): Product[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const storedFavorites = localStorage.getItem(this.storageKey);

      return storedFavorites
        ? (JSON.parse(storedFavorites) as Product[])
        : [];
    } catch (error) {
      console.error('Unable to load favorites:', error);
      return [];
    }
  }

  private saveFavorites(favorites: Product[]): void {
    this.favoritesSubject.next(favorites);

    if (this.isBrowser) {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(favorites)
      );
    }
  }

  getFavorites(): Product[] {
    return this.favoritesSubject.value;
  }

  addToFavorites(product: Product): void {
    if (this.isFavorite(product.id)) {
      return;
    }

    this.saveFavorites([
      ...this.getFavorites(),
      product
    ]);
  }

  removeFromFavorites(productId: number): void {
    const updatedFavorites = this.getFavorites().filter(
      product => product.id !== productId
    );

    this.saveFavorites(updatedFavorites);
  }

  toggleFavorite(product: Product): void {
    if (this.isFavorite(product.id)) {
      this.removeFromFavorites(product.id);
      return;
    }

    this.addToFavorites(product);
  }

  isFavorite(productId: number): boolean {
    return this.getFavorites().some(
      product => product.id === productId
    );
  }

  clearFavorites(): void {
    this.saveFavorites([]);
  }
}