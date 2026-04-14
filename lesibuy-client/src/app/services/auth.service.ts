import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  token: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = this.getUserFromStorage();
    this.currentUserSubject.next(user);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  getMe(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(this.withAccessToken(`${this.apiUrl}/me`));
  }

  updateProfile(data: UpdateProfileRequest): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(this.withAccessToken(`${this.apiUrl}/profile`), data);
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      this.withAccessToken(`${this.apiUrl}/change-password`),
      data
    );
  }

  setSession(user: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem('lesibuy_user', JSON.stringify(user));
      localStorage.setItem('lesibuy_token', user.token);
    }

    this.currentUserSubject.next(user);
  }

  updateCurrentUser(user: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem('lesibuy_user', JSON.stringify(user));
    }

    this.currentUserSubject.next(user);
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('lesibuy_user');
      localStorage.removeItem('lesibuy_token');
    }

    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('lesibuy_token');
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private withAccessToken(url: string): string {
    const token = this.getToken();

    if (!token) {
      return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}access_token=${encodeURIComponent(token)}`;
  }

  private getUserFromStorage(): AuthResponse | null {
    if (!this.isBrowser()) return null;

    const raw = localStorage.getItem('lesibuy_user');
    return raw ? JSON.parse(raw) : null;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}