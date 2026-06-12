import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface NotificationItem {
  id: number;
  userId: number;
  orderId?: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection?: signalR.HubConnection;

  private apiUrl = '/api/Notifications';
  private hubUrl = 'https://localhost:7225/hubs/notifications';

  notifications$ = new BehaviorSubject<NotificationItem[]>([]);
  unreadCount$ = new BehaviorSubject<number>(0);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  startConnection(): void {
    if (typeof window === 'undefined') return;

    const token = this.getToken();

    if (!token) {
      console.warn('No token found. SignalR connection not started.');
      this.notifications$.next([]);
      this.unreadCount$.next(0);
      return;
    }

    this.loadNotifications();

    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('OrderStatusUpdated', (data) => {
      console.log('SignalR notification received:', data);

      const newNotification: NotificationItem = {
        id: data.id ?? data.Id ?? 0,
        userId: data.userId ?? data.UserId ?? 0,
        orderId: data.orderId ?? data.OrderId,
        title: data.title ?? data.Title ?? 'Order Update',
        message: data.message ?? data.Message ?? 'Your order status has been updated.',
        isRead: data.isRead ?? data.IsRead ?? false,
        createdAt: data.createdAt ?? data.CreatedAt ?? new Date().toISOString()
      };

      const current = this.notifications$.value;

      const alreadyExists =
        newNotification.id !== 0 &&
        current.some(n => n.id === newNotification.id);

      const updated = alreadyExists
        ? current
        : [newNotification, ...current];

      this.notifications$.next(updated);
      this.unreadCount$.next(updated.filter(n => !n.isRead).length);

      this.showOrderPopup(data);
    });

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR connection error:', err));
  }

  loadNotifications(): void {
    const token = this.getToken();

    if (!token) {
      this.notifications$.next([]);
      this.unreadCount$.next(0);
      return;
    }

    this.http.get<NotificationItem[]>(this.withAccessToken(`${this.apiUrl}/my`)).subscribe({
      next: (res) => {
        console.log('Loaded notifications:', res);

        this.notifications$.next(res);
        this.unreadCount$.next(res.filter(n => !n.isRead).length);
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.notifications$.next([]);
        this.unreadCount$.next(0);
      }
    });
  }

  markAsRead(notification: NotificationItem): void {
    if (notification.isRead) {
      this.openNotification(notification);
      return;
    }

    this.http.put(this.withAccessToken(`${this.apiUrl}/${notification.id}/read`), {}).subscribe({
      next: () => {
        const updated = this.notifications$.value.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        );

        this.notifications$.next(updated);
        this.unreadCount$.next(updated.filter(n => !n.isRead).length);

        this.openNotification({ ...notification, isRead: true });
      },
      error: (err) => console.error('Failed to mark notification as read:', err)
    });
  }

  markAllAsRead(): void {
    this.http.put(this.withAccessToken(`${this.apiUrl}/mark-all-read`), {}).subscribe({
      next: () => {
        const updated = this.notifications$.value.map(n => ({
          ...n,
          isRead: true
        }));

        this.notifications$.next(updated);
        this.unreadCount$.next(0);
      },
      error: (err) => console.error('Failed to mark all notifications as read:', err)
    });
  }

  openNotification(notification: NotificationItem): void {
    if (notification.orderId) {
      this.router.navigate(['/order-details', notification.orderId]);
    }
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => console.log('SignalR disconnected'))
        .catch(err => console.error('SignalR disconnect error:', err));

      this.hubConnection = undefined;
    }

    this.notifications$.next([]);
    this.unreadCount$.next(0);
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('lesibuy_token');
  }

  private withAccessToken(url: string): string {
    const token = this.getToken();

    if (!token) {
      return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}access_token=${encodeURIComponent(token)}`;
  }

  private showOrderPopup(data: any): void {
    const orderId = data.orderId ?? data.OrderId;
    const statusValue = data.status ?? data.Status ?? '';
    const status = statusValue.toLowerCase();

    let icon: any = 'info';
    let color = '#3b82f6';

    if (status === 'approved') {
      icon = 'success';
      color = '#10b981';
    }

    if (status === 'processing') {
      icon = 'info';
      color = '#6366f1';
    }

    if (status === 'shipped') {
      icon = 'warning';
      color = '#f59e0b';
    }

    if (status === 'delivered') {
      icon = 'success';
      color = '#22c55e';
    }

    if (status === 'cancelled') {
      icon = 'error';
      color = '#ef4444';
    }

    Swal.fire({
      icon,
      title: `Order #${orderId}`,
      html: `
        <div style="font-size:14px; color:#475569;">
          Status updated to
          <strong style="color:${color}; text-transform:capitalize;">
            ${statusValue}
          </strong>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'View Order',
      confirmButtonColor: color,
      timer: 6000,
      timerProgressBar: true,
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed && orderId) {
        this.router.navigate(['/order-details', orderId]);
      }
    });
  }
}