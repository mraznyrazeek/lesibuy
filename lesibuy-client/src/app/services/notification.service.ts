import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private hubConnection?: signalR.HubConnection;

    constructor(private router: Router) { }

    startConnection(): void {
        const token = localStorage.getItem('lesibuy_token');

        if (!token || this.hubConnection) return;

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
            const status = (data.status || '').toLowerCase();

            let icon: any = 'info';
            let color = '#3b82f6';

            if (status === 'approved') {
                icon = 'success';
                color = '#22c55e';
            }
            if (status === 'processing') {
                icon = 'info';
                color = '#22c55e';
            }
            if (status === 'shipped') {
                icon = 'warning';
                color = '#22c55e';
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
                background: '#ffffff',
                customClass: {
                    popup: 'rounded-xl shadow-lg'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    this.router.navigate(['/orders', data.orderId]);
                }
            });
        });
    }

    stopConnection(): void {
        if (this.hubConnection) {
            this.hubConnection.stop()
                .then(() => console.log('SignalR disconnected'))
                .catch(err => console.error('SignalR disconnect error:', err));

            this.hubConnection = undefined;
        }
    }
}