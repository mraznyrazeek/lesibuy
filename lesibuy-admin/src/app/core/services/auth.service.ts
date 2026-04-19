import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:7225/api/Auth';
  private readonly userKey = 'currentUser';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  setSession(user: AuthResponse): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getCurrentUser(): AuthResponse | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return this.getCurrentUser()?.token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'Admin';
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }
}