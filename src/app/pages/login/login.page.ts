import { Component } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { LoggerService } from 'src/app/services/logger';
import { ErrorService } from 'src/app/services/error';
import { TokenService } from 'src/app/services/token';
import { LoginResponse } from 'src/app/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule]
})
export class LoginPage {

  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  private http = inject(HttpClient);
  private navCtrl = inject(NavController);
  private fb = inject(FormBuilder);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);
  private tokenService = inject(TokenService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    this.errorMessage = '';

    // Validación del formulario
    if (!this.loginForm.valid) {
      if (this.loginForm.get('email')?.hasError('required')) {
        this.errorMessage = 'El email es requerido';
      } else if (this.loginForm.get('email')?.hasError('email')) {
        this.errorMessage = 'Ingresa un email válido';
      } else if (this.loginForm.get('password')?.hasError('required')) {
        this.errorMessage = 'La contraseña es requerida';
      } else if (this.loginForm.get('password')?.hasError('minlength')) {
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      }
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.http.post<LoginResponse>(
      `${environment.apiUrl}auth/login`,
      { email, password }
    ).subscribe({
      next: async (res) => {
        try {
          this.logger.log('✅ Login exitoso');

          // 🔐 Extraer token JWT
          const token = res.session?.accessToken;
          if (!token) {
            this.errorMessage = 'Error: No se recibió token del servidor';
            this.isLoading = false;
            return;
          }

          // 🧠 Extraer rol
          const role = res.user?.role || res.user?.user_metadata?.role || 'client';

          // 1️⃣ Guardar token en TokenService (que ya lo guarda en Preferences)
          // IMPORTANTE: ESPERAR A QUE COMPLETE ANTES DE NAVEGAR
          await this.tokenService.setToken(token);
          this.logger.log('✅ Token guardado de forma segura');

          // 2️⃣ Guardar rol en Preferences para RBAC
          await Preferences.set({
            key: 'role',
            value: role
          });
          this.logger.log('✅ Rol guardado');

          // 3️⃣ Solo DESPUÉS de guardar todo, navegar a home
          // ESPERAR un pequeño delay para asegurar que todo está guardado
          await new Promise(resolve => setTimeout(resolve, 500));
          
          this.isLoading = false;
          this.navCtrl.navigateRoot('/home');
        } catch (error) {
          this.logger.error('❌ Error al guardar sesión:', error);
          this.errorMessage = 'Error al guardar la sesión. Intenta de nuevo.';
          this.isLoading = false;
        }
      },

      error: (err) => {
        this.logger.error('❌ Error en login:', err);
        this.errorMessage = this.errorService.getErrorMessage(err);
        this.isLoading = false;
      }
    });
  }

}