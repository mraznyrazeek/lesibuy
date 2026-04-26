import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { NotificationService, NotificationItem } from '../../services/notification.service';

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

  notifications: NotificationItem[] = [];
  unreadCount = 0;

  isUserMenuOpen = false;
  isNotificationOpen = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    this.authService.currentUser$.subscribe((user: AuthResponse | null) => {
      this.currentUser = user;
    });

    this.notificationService.notifications$.subscribe((items) => {
      this.notifications = items;
    });

    this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: MouseEvent): void {
    const clickedInsideUser = this.elementRef.nativeElement
      .querySelector('.user-menu-wrapper')
      ?.contains(event.target);

    const clickedInsideNotification = this.elementRef.nativeElement
      .querySelector('.notification-wrapper')
      ?.contains(event.target);

    if (!clickedInsideUser) {
      this.isUserMenuOpen = false;
    }

    if (!clickedInsideNotification) {
      this.isNotificationOpen = false;
    }
  }

  toggleNotificationMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isUserMenuOpen = false;
  }

  closeNotificationMenu(): void {
    this.isNotificationOpen = false;
  }

  openNotification(notification: NotificationItem): void {
    this.closeNotificationMenu();
    this.notificationService.markAsRead(notification);
  }

  markAllNotificationsAsRead(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isNotificationOpen = false;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  goHome(): void {
    this.closeUserMenu();
    this.closeNotificationMenu();
    this.router.navigate(['/'], {
      queryParams: {},
      fragment: 'top'
    });
  }

  goToCategory(category: string): void {
    this.closeUserMenu();
    this.closeNotificationMenu();
    this.router.navigate(['/'], {
      queryParams: { category },
      fragment: 'featured-products'
    });
  }

  goToCart(): void {
    this.closeUserMenu();
    this.closeNotificationMenu();
    this.router.navigate(['/cart']);
  }

  goToorders(): void {
    this.closeUserMenu();
    this.closeNotificationMenu();
    this.router.navigate(['/my-orders']);
  }

  goToProfile(): void {
    this.closeUserMenu();
    this.closeNotificationMenu();
    this.router.navigate(['/my-profile']);
  }

  goToChangePassword(event?: MouseEvent): void {
    event?.stopPropagation();
    this.closeUserMenu();
    this.closeNotificationMenu();
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
    this.closeNotificationMenu();
    this.notificationService.stopConnection();
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