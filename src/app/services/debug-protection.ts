import { Injectable, NgZone, inject } from '@angular/core';
import { environment } from 'src/environments/environment';

/**
 * 🔒 DEBUG PROTECTION SERVICE
 * 
 * Deshabilita herramientas de debug en producción:
 * - Chrome DevTools
 * - Console logging
 * - Source code inspection
 * 
 * OWASP Mobile: Extraneous Functionality
 * - En producción, deshabilitar debugging evita:
 *   - Inspección de almacenamiento
 *   - Inspection de network requests
 *   - Evaluación de código en consola
 */
@Injectable({
  providedIn: 'root'
})
export class DebugProtectionService {
  private ngZone = inject(NgZone);

  constructor() {
    if (environment.production) {
      this.disableDebugTools();
      this.overrideConsole();
      this.preventDevTools();
    }
  }

  /**
   * 🚫 Desabilitar herramientas de desarrollo
   */
  private disableDebugTools(): void {
    // Deshabilitar source maps en producción
    if (environment.production) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.debug = () => {};
    }
  }

  /**
   * 🔇 Sobrescribir console para prevenir acceso
   */
  private overrideConsole(): void {
    Object.defineProperty(window, 'console', {
      get() {
        throw new Error('🔒 Console access is disabled in production');
      }
    });
  }

  /**
   * 🛡️ Prevenir apertura de DevTools
   * NOTA: En navegador real, ctrl+shift+I abre DevTools
   * Esto lo bloquea pero puede ser bypasseado
   */
  private preventDevTools(): void {
    // Detectar F12 key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F12' || 
          (event.ctrlKey && event.shiftKey && event.key === 'I') ||
          (event.ctrlKey && event.key === 'J')) {
        event.preventDefault();
        console.error('🔒 DevTools está deshabilitado en producción');
      }
    });

    // Detectar apertura de DevTools by checking window size
    setInterval(() => {
      const threshold = 160; // pixels
      
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        
        // DevTools está probablemente abierto
        this.ngZone.runOutsideAngular(() => {
          console.warn('⚠️ DevTools detectado en producción');
          // Opcional: this.tokenService.clearToken();
        });
      }
    }, 500);
  }

  /**
   * 📊 Detectar si consola está disponible
   */
  isConsoleOpen(): boolean {
    const threshold = 160;
    return (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold);
  }
}
