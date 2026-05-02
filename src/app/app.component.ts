import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TokenService } from './services/token';
import { RootDetectionService } from './services/root-detection';
import { DebugProtectionService } from './services/debug-protection';
import { CertificatePinningService } from './services/certificate-pinning';
import { AntiTamperingService } from './services/anti-tampering';
import { LoggerService } from './services/logger';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private tokenService = inject(TokenService);
  private rootDetection = inject(RootDetectionService);
  private debugProtection = inject(DebugProtectionService);
  private certificatePinning = inject(CertificatePinningService);
  private antiTampering = inject(AntiTamperingService);
  private logger = inject(LoggerService);

  ngOnInit() {
    this.initializeSecurityServices();
  }

  /**
   * 🔒 Inicializar todos los servicios de seguridad
   */
  private async initializeSecurityServices() {
    try {
      this.logger.log('🔒 Inicializando servicios de seguridad...');

      // 1️⃣ Cargar token encriptado
      await this.tokenService.initializeToken();
      const token = this.tokenService.getToken();
      
      if (token) {
        this.logger.log('✅ Token cargado desde almacenamiento seguro');
      } else {
        this.logger.log('ℹ️ No hay token guardado - Usuario necesita login');
      }

      // 2️⃣ Verificar integridad del dispositivo
      const isCompromised = await this.rootDetection.checkDeviceSecurity();
      if (isCompromised) {
        this.rootDetection.handleCompromisedDevice();
      }

      // 3️⃣ Validar certificado del servidor
      const certValid = await this.certificatePinning.validateServerCertificate();
      if (!certValid) {
        this.logger.error('❌ Certificado del servidor inválido');
      }

      this.logger.log('✅ Servicios de seguridad inicializados correctamente');
    } catch (error) {
      this.logger.error('❌ Error inicializando servicios de seguridad:', error);
    }
  }
}
