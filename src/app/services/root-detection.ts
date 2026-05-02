import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

/**
 * 🔍 ROOT/JAILBREAK DETECTION SERVICE
 * 
 * Detecta si el dispositivo está comprometido:
 * - iOS: Jailbreak detection
 * - Android: Root detection
 * 
 * OWASP Mobile: Code Tampering & Unwanted Modifications
 * - Si dispositivo está rooteado, atacante puede:
 *   - Inyectar código
 *   - Modificar storage
 *   - Interceptar tráfico
 *   - Bypassear protecciones
 */
@Injectable({
  providedIn: 'root'
})
export class RootDetectionService {

  private isDeviceCompromised = false;

  constructor(private platform: Platform) {}

  /**
   * Verificar si dispositivo está compromised
   */
  async checkDeviceSecurity(): Promise<boolean> {
    if (!this.platform.is('hybrid')) {
      // En desarrollo web, no verificamos
      return false;
    }

    if (this.platform.is('ios')) {
      return await this.checkJailbreak();
    } else if (this.platform.is('android')) {
      return await this.checkRoot();
    }

    return false;
  }

  /**
   * 🍎 Detectar Jailbreak en iOS
   * Verifica archivos/procesos típicos de jailbreak
   */
  private async checkJailbreak(): Promise<boolean> {
    const jailbreakIndicators = [
      '/Applications/Cydia.app',
      '/Applications/SBSettings.app',
      '/Applications/MobileSubstrate.dylib',
      '/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist',
      '/System/Library/LaunchDaemons/com.ikey.bbot.plist',
      '/System/Library/LaunchDaemons/com.spike.ntr.plist',
      '/var/lib/cydia',
      '/private/var/lib/cydia',
      '/usr/sbin/sshd',
      '/private/var/tmp/cydia.log',
      '/usr/bin/ssh',
      '/usr/libexec/ssh-keysign',
      '/Applications/FakeCarrier.app',
      '/Library/MobileSubstrate',
      '/Applications/SBSettings.app',
      '/Applications/MxTube.app',
      '/Applications/Icy.app',
      '/Applications/IntelliScreen.app',
      '/Applications/WinterBoard.app'
    ];

    // En JS puro no podemos acceder al sistema de archivos
    // Esta es una verificación teórica
    // En producción, usar Capacitor Filesystem + native bindings
    
    console.warn('⚠️ Jailbreak detection: Verificación teórica en JS');
    return false;
  }

  /**
   * 🤖 Detectar Root en Android
   * Busca indicadores de acceso root/su binaries
   */
  private async checkRoot(): Promise<boolean> {
    const rootIndicators = [
      'su',
      'Superuser.apk',
      '/system/xbin/su',
      '/system/app/Superuser.apk',
      '/system/app/superuser.apk',
      '/system/bin/su',
      '/data/local/tmp/su',
      '/data/local/su',
      '/system/xbin/daemonsu',
      '/system/app/Magisk.apk',
      '/system/app/magisk.apk',
      '/magisk.d',
      '/magisk',
      '/vendor/bin/magisk',
      '/system/bin/app_process32_realpath'
    ];

    // Similar a iOS: verificación teórica en JS
    console.warn('⚠️ Root detection: Verificación teórica en JS');
    return false;

    // En producción usar:
    // const result = await Filesystem.readdir({ path: '/system/xbin' });
    // return result.files.some(f => f.name === 'su');
  }

  /**
   * 🚨 Si dispositivo está comprometido: 
   * - Registrar evento de seguridad
   * - Bloquear funcionalidad sensible (opcional)
   * - Notificar al usuario
   */
  handleCompromisedDevice(): void {
    console.error('🚨 ALERTA DE SEGURIDAD: Dispositivo comprometido detectado');
    
    // Opciones:
    // 1. this.navCtrl.navigateRoot('/security-warning');
    // 2. await this.analyticsService.logSecurityEvent('device_compromised');
    // 3. this.tokenService.clearToken(); // Logout forzado
    
    // Por ahora solo loguear
    this.isDeviceCompromised = true;
  }

  /**
   * 📊 Obtener estado de seguridad del dispositivo
   */
  isCompromised(): boolean {
    return this.isDeviceCompromised;
  }
}
