import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection?: signalR.HubConnection;

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
      Swal.fire({
        icon: 'info',
        title: data.title,
        text: data.message,
        timer: 3500,
        showConfirmButton: false
      });
    });
  }

  stopConnection(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
  }
}