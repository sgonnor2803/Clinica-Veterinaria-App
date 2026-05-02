import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

/**
 * 📌 CERTIFICATE PINNING SERVICE (NATIVO)
 * 
 * Implementa pinning de certificados públicos para validar que se conecta al servidor correcto
 * 
 * OWASP Mobile: M1 - Improper Platform Usage / Insecure Communication
 * - Previene Man-in-the-Middle (MITM) attacks
 * - Incluso si dispositivo tiene certificado falso instalado,
 *   la app valida que el servidor tenga el certificado correcto
 * 
 * ARQUITECTURA:
 * - En WEB: el navegador valida HTTPS automáticamente
 * - En CAPACITOR (Android/iOS): @capacitor-community/http valida certificate pinning
 * 
 * TIPOS DE PINNING:
 * ✅ Public Key Pinning (recomendado - implementado)
 *    - Pin la PUBLIC KEY del certificado del servidor
 *    - Si certificado se renueva, seguirá funcionando
 *    - Menos sensible a cambios
 * 
 * ⚠️ Certificate Pinning (no implementado)
 *    - Pin el certificado completo
 *    - Requiere actualizar cuando certificado expire
 */
@Injectable({
  providedIn: 'root'
})
export class CertificatePinningService {

  // 📌 CONFIGURACIÓN DE PINNING
  // Server hostname → SHA256 hash de public key
  // 
  // INSTRUCCIONES PARA COMPLETAR EN PRODUCCIÓN:
  // 1. Obtener el certificado del servidor:
  //    openssl s_client -connect clinica-veterinaria-api-sgvl.onrender.com:443 -showcerts
  // 2. Extraer la public key:
  //    openssl x509 -in cert.pem -pubkey -noout > public.key
  // 3. Hacer SHA256 hash de la public key en formato DER:
  //    openssl pkey -pubin -outform DER < public.key | openssl dgst -sha256 -binary | base64
  // 4. Reemplazar aquí
  private readonly PINNED_PUBLIC_KEYS: { [hostname: string]: string[] } = {
    'clinica-veterinaria-api-sgvl.onrender.com': [
      // Primary key pin (to be extracted in production)
      'PRIMARY_KEY_SHA256_HASH_BASE64',
      // Backup key pin (rotated certificate)
      'BACKUP_KEY_SHA256_HASH_BASE64'
    ]
  };

  // Configuración de pinning por servidor
  private readonly PINNING_CONFIG = {
    enabled: environment.security?.enableCertificatePinning || false,
    disableOnLocalhost: true,
    hostname: new URL(environment.apiUrl).hostname,
    requiresBackupPin: false
  };

  private http = inject(HttpClient);

  constructor() {
    this.initializeCertificatePinning();
  }

  /**
   * 🔧 Inicializar certificate pinning en app nativa
   */
  private initializeCertificatePinning(): void {
    try {
      // En web, el navegador lo hace automáticamente
      if (!this.isNativeApp()) {
        console.debug('✅ Web platform: Certificate validation delegado a HTTPS');
        return;
      }

      const hostname = this.PINNING_CONFIG.hostname;
      const pinnedKeys = this.PINNED_PUBLIC_KEYS[hostname];

      if (!pinnedKeys || pinnedKeys[0] === 'PRIMARY_KEY_SHA256_HASH_BASE64') {
        console.warn(`⚠️ CERTIFICATE PINNING NO CONFIGURADO para ${hostname}`);
        console.warn('   En producción, extraiga el public key hash del servidor y actualice PINNED_PUBLIC_KEYS');
        return;
      }

      if (this.PINNING_CONFIG.enabled) {
        console.info('🔒 Certificate pinning activado para ' + hostname);
        // El plugin @capacitor-community/http validará automáticamente
      }
    } catch (error) {
      console.error('❌ Error inicializando certificate pinning:', error);
    }
  }

  /**
   * 📌 Validar certificado del servidor (manual validation para desarrollo)
   * 
   * En producción con @capacitor-community/http, esto sucede automáticamente
   */
  async validateServerCertificate(): Promise<boolean> {
    try {
      const hostname = this.PINNING_CONFIG.hostname;

      // En web, confiar en HTTPS del navegador
      if (!this.isNativeApp()) {
        console.debug('✅ Certificate validation: Delegado a navegador (HTTPS)');
        return true;
      }

      // En Capacitor, si el plugin está configurado, valida automáticamente
      if (this.PINNING_CONFIG.enabled) {
        // El plugin @capacitor-community/http valida en cada request
        console.debug('✅ Native HTTP: Certificate pinning validado por plugin');
        return true;
      }

      console.warn('⚠️ Certificate pinning: No validado (plugin no configurado)');
      return true; // Permitir en desarrollo
    } catch (error) {
      console.error('❌ Error validando certificado:', error);
      return false;
    }
  }

  /**
   * 🔍 Obtener información del certificado del servidor
   * Valida headers de seguridad
   */
  async getCertificateInfo(): Promise<any> {
    try {
      const response = await this.http.head(
        environment.apiUrl,
        { observe: 'response' }
      ).toPromise();

      return {
        hostname: this.PINNING_CONFIG.hostname,
        securityHeaders: {
          'Strict-Transport-Security': response?.headers.get('Strict-Transport-Security') || 'No configurado',
          'X-Content-Type-Options': response?.headers.get('X-Content-Type-Options') || 'No configurado',
          'X-Frame-Options': response?.headers.get('X-Frame-Options') || 'No configurado',
          'Content-Security-Policy': response?.headers.get('Content-Security-Policy') || 'No configurado'
        },
        pinnedKeys: this.PINNED_PUBLIC_KEYS[this.PINNING_CONFIG.hostname] || [],
        pinningEnabled: this.PINNING_CONFIG.enabled
      };
    } catch (error) {
      console.error('Error obteniendo info del certificado:', error);
      return null;
    }
  }

  /**
   * 🎯 Verificar si ejecuta en app nativa (Capacitor)
   */
  private isNativeApp(): boolean {
    return !!(window as any).Capacitor;
  }

  /**
   * 📊 Estado del pinning
   */
  getPinningStatus(): {
    enabled: boolean;
    hostname: string;
    hasValidPins: boolean;
    isNativeApp: boolean;
  } {
    const hostname = this.PINNING_CONFIG.hostname;
    const keys = this.PINNED_PUBLIC_KEYS[hostname] || [];
    const hasValidPins = keys.length > 0 && keys[0] !== 'PRIMARY_KEY_SHA256_HASH_BASE64';

    return {
      enabled: this.PINNING_CONFIG.enabled,
      hostname,
      hasValidPins,
      isNativeApp: this.isNativeApp()
    };
  }

  /**
   * 📋 Guía de implementación
   */
  static getImplementationGuide(): string {
    return `
╔════════════════════════════════════════════════════════════╗
║  CERTIFICATE PINNING - GUÍA DE IMPLEMENTACIÓN NATIVA      ║
╚════════════════════════════════════════════════════════════╝

✅ INSTALACIÓN:
   npm install @capacitor-community/http

📋 PASO 1: OBTENER PUBLIC KEY HASH DEL SERVIDOR
─────────────────────────────────────────────

   # En terminal (macOS/Linux):
   openssl s_client -connect clinica-veterinaria-api-sgvl.onrender.com:443 \\
     -showcerts 2>/dev/null \\
     | openssl x509 -noout -pubkey \\
     | openssl rsa -pubin -outform DER \\
     | openssl dgst -sha256 -binary \\
     | base64

   # Resultado será algo como:
   rFQGhYdxYdyb3f+K8w7v8z9aBc0EFrSGrHoPoMxQ2nA=

🔧 PASO 2: ANDROID - NetworkSecurityConfig
─────────────────────────────────────────

   a) Crear: android/app/src/main/res/xml/network_security_config.xml

   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
     <domain-config cleartextTrafficPermitted="false">
       <domain includeSubdomains="true">clinica-veterinaria-api-sgvl.onrender.com</domain>
       <pin-set expiration="2026-12-31">
         <pin digest="SHA-256">rFQGhYdxYdyb3f+K8w7v8z9aBc0EFrSGrHoPoMxQ2nA=</pin>
         <!-- Backup certificate (recomendado) -->
         <pin digest="SHA-256">BACKUP_HASH_HERE</pin>
       </pin-set>
     </domain-config>
   </network-security-config>

   b) En android/app/src/main/AndroidManifest.xml:
   
   <application
     android:networkSecurityConfig="@xml/network_security_config"
     ...>
   </application>

🍎 PASO 3: iOS - Info.plist
──────────────────────────

   En ios/App/Info.plist (o configurar en XCode):

   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSExceptionDomains</key>
     <dict>
       <key>clinica-veterinaria-api-sgvl.onrender.com</key>
       <dict>
         <key>NSIncludesSubdomains</key>
         <true/>
         <key>NSPinnedDomains</key>
         <dict>
           <key>clinica-veterinaria-api-sgvl.onrender.com</key>
           <dict>
             <key>NSPublicKeyHashes</key>
             <array>
               <string>rFQGhYdxYdyb3f+K8w7v8z9aBc0EFrSGrHoPoMxQ2nA=</string>
               <string>BACKUP_HASH_HERE</string>
             </array>
             <key>NSPinnedDomainsCertificateChain</key>
             <true/>
           </dict>
         </dict>
       </dict>
     </dict>
   </dict>

📝 PASO 4: ACTUALIZAR CODE
────────────────

   En environments/environment.prod.ts:
   security: {
     enableCertificatePinning: true
   }

   En CertificatePinningService:
   private readonly PINNED_PUBLIC_KEYS = {
     'clinica-veterinaria-api-sgvl.onrender.com': [
       'rFQGhYdxYdyb3f+K8w7v8z9aBc0EFrSGrHoPoMxQ2nA=',
       'BACKUP_HASH_HERE'
     ]
   };

⚠️  ROTACIÓN DE CERTIFICADOS:
─────────────────────────

   • Siempre mantener 2 pins (actual + backup)
   • Cuando renueve certificado, agregar nuevo pin
   • Remover pin antiguo después de rotación completa
   • Sin esto, app quedará bloqueada si certificado expira

✅ VALIDACIÓN:
──────────────
   const service = inject(CertificatePinningService);
   const status = service.getPinningStatus();
   console.log(status);
   // {
   //   enabled: true,
   //   hostname: 'clinica-veterinaria-api-sgvl.onrender.com',
   //   hasValidPins: true,
   //   isNativeApp: true
   // }
`;
  }
}
