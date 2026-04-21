import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://localhost:7225/api/orders'; // change if your API port is different

  constructor(private http: HttpClient) {}

  getAllAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/all`);
  }
}