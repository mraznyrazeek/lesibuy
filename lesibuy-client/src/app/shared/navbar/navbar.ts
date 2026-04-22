import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  cartCount = 0;
  currentUser: AuthResponse | null = null;
  isUserMenuOpen = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    this.authService.currentUser$.subscribe((user: AuthResponse | null) => {
      this.currentUser = user;
    });
  }

  @HostListener('document:click')
  closeMenuOnOutsideClick(): void {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onMenuClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  goHome(): void {
    this.router.navigate(['/'], {
      queryParams: {},
      fragment: 'top'
    });
  }

  goToCategory(category: string): void {
    this.router.navigate(['/'], {
      queryParams: { category },
      fragment: 'featured-products'
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToorders(): void {
    this.closeUserMenu();
    this.router.navigate(['/my-orders']);
  }

  goToProfile(): void {
    this.closeUserMenu();
    this.router.navigate(['/my-profile']);
  }

  goToChangePassword(): void {
    this.closeUserMenu();
    this.router.navigate(['/change-password']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  search(value: string): void {
    const trimmed = value.trim();

    if (!trimmed) {
      this.router.navigate(['/'], {
        queryParams: {},
        fragment: 'top'
      });
      return;
    }

    this.router.navigate(['/'], {
      queryParams: { search: trimmed },
      fragment: 'featured-products'
    });
  }
}