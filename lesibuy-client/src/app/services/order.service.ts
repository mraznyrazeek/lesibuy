import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface OrderItem {
  id?: number;
  productId?: number;
  productName: string;
  productDescription?: string;
  productImageUrl?: string;
  productCondition?: string;
  sellerType?: string;
  specifications?: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface Order {
  id: number;
  createdAt: string;
  fullName: string;
  city: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  city: string;
  postalCode?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderResponse {
  id: number;
  createdAt: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  city: string;
  postalCode?: string;
  paymentMethod?: string;
  items: CreateOrderItemRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.withAccessToken(this.apiUrl));
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.withAccessToken(this.apiUrl));
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(this.withAccessToken(`${this.apiUrl}/${id}`));
  }

  createOrder(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.withAccessToken(this.apiUrl), payload);
  }

  cancelOrder(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      this.withAccessToken(`${this.apiUrl}/${id}/cancel`),
      {}
    );
  }

  private withAccessToken(url: string): string {
    const token = this.authService.getToken();

    if (!token) {
      return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}access_token=${encodeURIComponent(token)}`;
  }
}