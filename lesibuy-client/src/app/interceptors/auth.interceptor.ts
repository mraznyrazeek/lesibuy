import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('lesibuy_token')
      : null;

  console.log('Interceptor token:', token);
  console.log('Request URL:', req.url);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Authorization header added');
  }

  return next(req);
};