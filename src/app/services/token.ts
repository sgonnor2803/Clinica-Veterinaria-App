import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SecureStorageService } from './secure-storage';
import { AuthService } from './auth';

/**
 * 🔐 TOKEN SERVICE
 * 
 * Gestiona tokens JWT:
 * - Almacenamiento encriptado (SecureStorageService)
 * - Acceso sincrónico para interceptor (BehaviorSubject)
 * - Persistencia entre recargas (Preferences encriptado)
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  private secureStorage = inject(SecureStorageService);
  private authService = inject(AuthService);
  private refreshing: Promise<boolean> | null = null;

  // Refresh token storage key
  private readonly REFRESH_KEY = 'refresh_token';

  /**
   * 🔐 Guardar token encriptado
   * IMPORTANTE: Llama a SecureStorageService que encripta con AES-256
   */
  async setToken(token: string): Promise<void> {
    try {
      // 1. Guardar encriptado en Preferences
      await this.secureStorage.setSecure('auth_token', token);
      
      // 2. Guardar en BehaviorSubject para acceso sincrónico
      this.tokenSubject.next(token);
      
      console.log('✅ Token guardado de forma segura');
    } catch (error) {
      console.error('❌ Error guardando token:', error);
      throw error;
    }
  }

  /**
   * 📖 Obtener token sincronamente
   * Se usa en AuthInterceptor para adjuntar header
   * NOTA: Debe estar inicializado primero con initializeToken()
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * 🔓 Inicializar token desde Preferences encriptado
   * Se llama en AppComponent.ngOnInit()
   */
  async initializeToken(): Promise<void> {
    try {
      // 1. Obtener token desencriptado de Preferences
      const token = await this.secureStorage.getSecure('auth_token');
      
      if (token) {
        // 2. Cargar en BehaviorSubject
        this.tokenSubject.next(token);
        console.log('✅ Token inicializado desde almacenamiento seguro');
      } else {
        console.log('ℹ️ No hay token previo guardado');
      }
    } catch (error) {
      console.error('❌ Error inicializando token:', error);
    }
  }

  /**
   * 🚪 Limpiar token (logout)
   * Elimina de Preferences encriptado Y BehaviorSubject
   */
  async clearToken(): Promise<void> {
    try {
      // 1. Eliminar de Preferences
      await this.secureStorage.removeSecure('auth_token');
      await this.secureStorage.removeSecure(this.REFRESH_KEY);
      
      // 2. Limpiar BehaviorSubject
      this.tokenSubject.next(null);
      
      console.log('✅ Token eliminado de forma segura');
    } catch (error) {
      console.error('❌ Error limpiando token:', error);
      throw error;
    }
  }

  /**
   * Guardar refresh token en almacenamiento seguro
   */
  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await this.secureStorage.setSecure(this.REFRESH_KEY, refreshToken);
    } catch (error) {
      console.error('❌ Error guardando refresh token:', error);
      throw error;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await this.secureStorage.getSecure(this.REFRESH_KEY);
      return token || null;
    } catch (error) {
      console.error('❌ Error obteniendo refresh token:', error);
      return null;
    }
  }

  /**
   * Intentar refrescar el token con el backend. Evita llamadas concurrentes.
   */
  async attemptRefresh(): Promise<boolean> {
    // If a refresh is already in progress, return that promise
    if (this.refreshing) return this.refreshing;

    this.refreshing = (async () => {
      try {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) return false;

        const resp: any = await this.authService.refreshToken(refreshToken).toPromise();
        const newAccess = resp?.session?.accessToken || resp?.accessToken || resp?.token;
        const newRefresh = resp?.session?.refreshToken || resp?.refreshToken;

        if (newAccess) {
          await this.setToken(newAccess);
          if (newRefresh) {
            await this.setRefreshToken(newRefresh);
          }
          return true;
        }

        return false;
      } catch (err) {
        console.error('❌ Error refrescando token:', err);
        return false;
      } finally {
        this.refreshing = null;
      }
    })();

    return this.refreshing;
  }
}
