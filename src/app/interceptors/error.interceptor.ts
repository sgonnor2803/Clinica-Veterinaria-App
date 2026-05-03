import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../services/token';
import { LoggerService } from '../services/logger';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private logger = inject(LoggerService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        
        // 🔴 Error 401 - Token expirado o inválido
        if (error.status === 401) {
          this.logger.error('Token expirado (401) - Intentando refresh');

          // Intentar refresh antes de forzar logout
          return new Observable<HttpEvent<any>>(observer => {
            this.tokenService.attemptRefresh().then(async (ok) => {
              if (ok) {
                // Reintentar la request original con nuevo token
                const newToken = this.tokenService.getToken();
                const cloned = req.clone({
                  setHeaders: {
                    Authorization: newToken ? `Bearer ${newToken}` : ''
                  }
                });

                next.handle(cloned).subscribe({
                  next: (ev) => observer.next(ev),
                  error: (e) => observer.error(e),
                  complete: () => observer.complete()
                });
              } else {
                // No se pudo refrescar → limpiar y redirigir
                await this.tokenService.clearToken();
                this.router.navigate(['/login']);
                observer.error(error);
              }
            });
          });
        }

        // 🔴 Error 403 - Acceso denegado
        if (error.status === 403) {
          this.logger.error('Acceso denegado (403)');
        }

        // 🔴 Error 0 - Sin conexión
        if (error.status === 0) {
          this.logger.error('Error de conexión - Verifica tu internet');
        }

        return throwError(() => error);
      })
    );
  }
}
