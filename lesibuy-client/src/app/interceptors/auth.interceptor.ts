import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isBrowser = isPlatformBrowser(this.platformId);
    const token = isBrowser ? localStorage.getItem('lesibuy_token') : null;

    console.log('CLASS INTERCEPTOR HIT');
    console.log('Request URL:', req.url);
    console.log('Is browser:', isBrowser);
    console.log('Token found:', token);

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Authorization header attached');
      console.log('Outgoing Authorization:', authReq.headers.get('Authorization'));

      return next.handle(authReq);
    }

    console.log('No token found or not browser');
    return next.handle(req);
  }
}