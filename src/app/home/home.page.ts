import { Component } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoggerService } from 'src/app/services/logger';
import { TokenService } from 'src/app/services/token';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class HomePage {

  private navCtrl = inject(NavController);
  private logger = inject(LoggerService);
  private tokenService = inject(TokenService);

  // 🔐 Comprobar sesión al entrar
  ionViewWillEnter() {
    // El authGuard ya verificó que existe token
    // Aquí solo hacemos doble-check
    const token = this.tokenService.getToken();
    
    if (!token) {
      this.logger.warn('No hay token - Redirigiendo a login');
      this.navCtrl.navigateRoot('/login');
    } else {
      this.logger.log('✅ Sesión válida');
    }
  }

  // 🚪 Cerrar sesión
  async logout() {
    this.logger.log('🚪 Cerrando sesión...');
    
    // Limpiar token de AMBAS ubicaciones (Preferences + BehaviorSubject)
    await this.tokenService.clearToken();
    
    this.logger.log('✅ Sesión cerrada');
    
    // Redirigir a login
    this.navCtrl.navigateRoot('/login');
  }
}