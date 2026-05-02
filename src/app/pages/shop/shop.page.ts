import { Component } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { LoggerService } from 'src/app/services/logger';
import { ErrorService } from 'src/app/services/error';
import { TokenService } from 'src/app/services/token';
import { Product } from 'src/app/models';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ShopPage {

  private http = inject(HttpClient);
  private navCtrl = inject(NavController);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);
  private tokenService = inject(TokenService);
  
  successMessage: string = '';

  products: Product[] = [];

  loading: boolean = true;
  errorMessage: string = '';

  ionViewWillEnter() {

    this.loading = true;
    this.errorMessage = '';

    const token = this.tokenService.getToken();

    if (!token) {
      this.logger.warn('No hay token - Redirigiendo a login');
      this.navCtrl.navigateRoot('/login');
      return;
    }

    // 📡 Peticion autenticada (token adjuntado automaticamente)
    this.http.get<Product[]>(
      `${environment.apiUrl}products`
    ).subscribe({

      next: (data) => {

        this.logger.log('Productos cargados exitosamente');

        this.products = data;
        this.loading = false;
      },

      error: (err) => {

        this.logger.error('Error cargando productos', err);

        this.errorMessage = this.errorService.getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  buyProduct(product: Product) {

    this.logger.log(`Producto comprado: ${product.name}`);

    this.successMessage = `✔ Has comprado: ${product.name}`;

    // opcional: que desaparezca solo
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  goHome() {
    this.navCtrl.navigateRoot('/home');
  }
}