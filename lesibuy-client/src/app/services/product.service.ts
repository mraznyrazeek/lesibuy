import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5065/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // getProductById(id: number): Observable<Product> {
  //   return this.http.get<Product>(`${this.apiUrl}/${id}`);
  // }

  getProductById(id: number) {
  return this.http.get<Product>(`${this.apiUrl}/${id}`);
}

}