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
  private apiUrl = 'https://localhost:7225/api/Notifications';

  notifications$ = new BehaviorSubject<NotificationItem[]>([]);
  unreadCount$ = new BehaviorSubject<number>(0);

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  startConnection(): void {
    if (typeof window === 'undefined') return;

    const userJson = localStorage.getItem('currentUser');
    const user = userJson ? JSON.parse(userJson) : null;
    const token = user?.token;

    if (!token || this.hubConnection) return;

    if (!token || this.hubConnection) return;

    this.loadNotifications();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7225/hubs/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR error:', err));

    this.hubConnection.on('OrderStatusUpdated', (data) => {
      const newNotification: NotificationItem = {
        id: data.id ?? 0,
        userId: data.userId ?? 0,
        orderId: data.orderId,
        title: data.title,
        message: data.message,
        isRead: false,
        createdAt: data.createdAt
      };

      const current = this.notifications$.value;
      this.notifications$.next([newNotification, ...current]);
      this.unreadCount$.next(this.unreadCount$.value + 1);

      this.showOrderPopup(data);
    });
  }

  loadNotifications(): void {
    this.http.get<NotificationItem[]>(`${this.apiUrl}/my`).subscribe({
      next: (res) => {
        this.notifications$.next(res);
        this.unreadCount$.next(res.filter(n => !n.isRead).length);
      },
      error: (err) => console.error('Failed to load notifications:', err)
    });
  }

  markAsRead(notification: NotificationItem): void {
    if (notification.isRead) {
      this.openNotification(notification);
      return;
    }

    this.http.put(`${this.apiUrl}/${notification.id}/read`, {}).subscribe({
      next: () => {
        const updated = this.notifications$.value.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        );

        this.notifications$.next(updated);
        this.unreadCount$.next(updated.filter(n => !n.isRead).length);

        this.openNotification(notification);
      },
      error: (err) => console.error('Failed to mark as read:', err)
    });
  }

  markAllAsRead(): void {
    this.http.put(`${this.apiUrl}/mark-all-read`, {}).subscribe({
      next: () => {
        const updated = this.notifications$.value.map(n => ({
          ...n,
          isRead: true
        }));

        this.notifications$.next(updated);
        this.unreadCount$.next(0);
      },
      error: (err) => console.error('Failed to mark all as read:', err)
    });
  }

  openNotification(notification: NotificationItem): void {
    if (notification.orderId) {
      this.router.navigate(['/orders', notification.orderId]);
    }
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR disconnected'))
        .catch(err => console.error('SignalR disconnect error:', err));

      this.hubConnection = undefined;
    }

    this.notifications$.next([]);
    this.unreadCount$.next(0);
  }

  private showOrderPopup(data: any): void {
    const status = (data.status || '').toLowerCase();

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
      title: `Order #${data.orderId}`,
      html: `
        <div style="font-size:14px; color:#475569;">
          Status updated to 
          <strong style="color:${color}; text-transform:capitalize;">
            ${data.status}
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
      if (result.isConfirmed) {
        this.router.navigate(['/orders', data.orderId]);
      }
    });
  }
}