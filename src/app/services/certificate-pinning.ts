import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

/**
 * 📌 CERTIFICATE PINNING SERVICE
 * 
 * Implementa pinning de certificados para validar que se conecta al servidor correcto
 * 
 * OWASP Mobile: Insecure Communication
 * - Previene Man-in-the-Middle (MITM) attacks
 * - Incluso si dispositivo tiene certificado falso instalado,
 *   la app valida que el servidor tenga el certificado correcto
 * 
 * IMPLEMENTACIÓN:
 * En producción hay dos opciones:
 * 
 * OPCIÓN 1: Public Key Pinning (recomendado)
 *   - Pin la PUBLIC KEY del certificado del servidor
 *   - Si certificado se renueva, seguirá funcionando
 *   - Menos sensible a cambios
 * 
 * OPCIÓN 2: Certificate Pinning  
 *   - Pin el certificado completo
 *   - Requiere actualizar cuando certificado expire
 * 
 * PASOS PARA IMPLEMENTAR:
 * 
 * 1. Obtener el certificado del servidor:
 *    openssl s_client -connect clinica-veterinaria-api-sgvl.onrender.com:443
 * 
 * 2. Extraer la public key:
 *    openssl x509 -in cert.pem -pubkey -noout > public.key
 * 
 * 3. Convertir a base64 para hardcodear en app:
 *    cat public.key | base64
 * 
 * 4. En cada request HTTP, validar que el certificado tiene esta public key
 * 
 * NOTA: En Angular Web, la validación la hace el navegador
 * En Capacitor (móvil), hay que hacerlo manualmente
 */
@Injectable({
  providedIn: 'root'
})
export class CertificatePinningService {

  // 📌 Public key pinned del servidor (SHA256 hash)
  // NOTA: Este es un ejemplo. En producción:
  // 1. Obtener el certificado real del servidor
  // 2. Extraer la public key
  // 3. Hacer SHA256 hash
  // 4. Guardar aquí
  private readonly PINNED_PUBLIC_KEYS: { [key: string]: string } = {
    'clinica-veterinaria-api-sgvl.onrender.com': 
      'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='  // Ejemplo
  };

  // Datos del certificado esperado
  private readonly EXPECTED_CERT_INFO = {
    issuer: 'Let\'s Encrypt',
    subject: 'clinica-veterinaria-api-sgvl.onrender.com',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2025-01-01')
  };

  constructor(private http: HttpClient) {
    this.validateCertificateConfiguration();
  }

  /**
   * ✅ Validar que la configuración de pinning está correcta
   */
  private validateCertificateConfiguration(): void {
    const apiHost = new URL(environment.apiUrl).hostname;
    
    if (!this.PINNED_PUBLIC_KEYS[apiHost]) {
      console.warn(
        `⚠️ CERTIFICATE PINNING: No hay public key pinned para ${apiHost}`
      );
      console.warn(
        '   En producción, agregue el certificado public key a PINNED_PUBLIC_KEYS'
      );
    }
  }

  /**
   * 📌 Validar certificado del servidor
   * 
   * NOTA: En navegador web, esto lo hace HTTPS automáticamente
   * En Capacitor (móvil), hay que hacerlo manualmente
   */
  async validateServerCertificate(): Promise<boolean> {
    try {
      const apiHost = new URL(environment.apiUrl).hostname;
      
      // En ambiente web, el navegador valida automáticamente
      if (!this.isNativeApp()) {
        console.debug('✅ Certificate validation: Delegado a navegador (HTTPS)');
        return true;
      }

      // En APP nativa (Capacitor):
      // 1. Obtener certificado del servidor
      // 2. Extraer public key
      // 3. Comparar con PINNED_PUBLIC_KEYS
      // 4. Si no coincide → BLOQUEAR conexión
      
      console.warn(
        '⚠️ Certificate pinning: Implementación manual requerida en Capacitor'
      );

      // Para Android con Capacitor, usar @capacitor-community/http
      // que permite custom certificate pinning
      
      return true; // Por ahora permitir (implementar después)
    } catch (error) {
      console.error('❌ Error validando certificado:', error);
      return false;
    }
  }

  /**
   * 🔎 Obtener información del certificado
   * En desarrollo, loguear info del servidor
   */
  async getCertificateInfo(): Promise<any> {
    try {
      // Hacer request HEAD para obtener headers de seguridad
      const response = await this.http.head(
        environment.apiUrl,
        { observe: 'response' }
      ).toPromise();

      return {
        headers: response?.headers,
        securityHeaders: {
          'Strict-Transport-Security': response?.headers.get('Strict-Transport-Security'),
          'X-Content-Type-Options': response?.headers.get('X-Content-Type-Options'),
          'X-Frame-Options': response?.headers.get('X-Frame-Options'),
          'Content-Security-Policy': response?.headers.get('Content-Security-Policy')
        }
      };
    } catch (error) {
      console.error('Error obteniendo info del certificado:', error);
      return null;
    }
  }

  /**
   * 🎯 Verificar si ejecuta en app nativa
   */
  private isNativeApp(): boolean {
    return !!(window as any).Capacitor;
  }

  /**
   * 📋 Documentación de implementación
   */
  static getImplementationGuide(): string {
    return `
CERTIFICATE PINNING - GUÍA DE IMPLEMENTACIÓN
==============================================

1. PARA ANDROID (Usando capacitor-http):
   
   npm install @capacitor-community/http
   
   En interceptor:
   const cert = { 
     hashes: ['sha256/XXXXXXXXX...'],
     hostname: 'clinica-veterinaria-api-sgvl.onrender.com'
   };
   
2. PARA iOS:
   
   Configurar en Info.plist:
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSPinnedDomains</key>
     <dict>
       <key>clinica-veterinaria-api-sgvl.onrender.com</key>
       <dict>
         <key>NSPublicKeyHashes</key>
         <array>
           <string>XXXXXXXXXX</string>
         </array>
       </dict>
     </dict>
   </dict>

3. CÓMO OBTENER EL PUBLIC KEY HASH:

   openssl s_client -connect clinica-veterinaria-api-sgvl.onrender.com:443 \\
     | openssl x509 -noout -pubkey \\
     | openssl rsa -pubin -outform DER \\
     | openssl dgst -sha256 -binary \\
     | base64

4. VALIDAR QUE FUNCIONA:
   
   - Instalar app en dispositivo real
   - Si certificado no coincide → conexión bloqueada
   - Verificar logs: "Certificate pinning validation"
    `;
  }
}
