import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SecureStorageService } from './secure-storage';

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

  constructor(private secureStorage: SecureStorageService) {}

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
      
      // 2. Limpiar BehaviorSubject
      this.tokenSubject.next(null);
      
      console.log('✅ Token eliminado de forma segura');
    } catch (error) {
      console.error('❌ Error limpiando token:', error);
      throw error;
    }
  }
}
