import { Component } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';
import { LoggerService } from 'src/app/services/logger';
import { ErrorService } from 'src/app/services/error';
import { TokenService } from 'src/app/services/token';
import { Appointment } from 'src/app/models';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AppointmentsPage {

  private http = inject(HttpClient);
  private navCtrl = inject(NavController);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);
  private tokenService = inject(TokenService);

  appointments: Appointment[] = [];
  loading: boolean = true;

  role: string = '';
  canCreate: boolean = false;

  vet_id: string = '';
  date: string = '';
  description: string = '';

  successMessage: string = '';
  errorMessage: string = '';

  ionViewWillEnter() {
    this.loadAppointments();
  }

  async loadAppointments() {

    this.loading = true;

    const token = this.tokenService.getToken();
    
    const { value: roleValue } = await Preferences.get({ key: 'role' });
    this.role = roleValue || 'client';
    this.canCreate = this.role === 'client';

    if (!token) {
      this.logger.warn('No hay token - Redirigiendo a login');
      this.navCtrl.navigateRoot('/login');
      return;
    }

    const url =
      this.role === 'vet' || this.role === 'admin'
        ? `${environment.apiUrl}appointments`
        : `${environment.apiUrl}appointments/me`;

    this.http.get<Appointment[]>(url).subscribe({

      next: (data) => {
        this.appointments = data;
        this.loading = false;
        this.logger.log('Citas cargadas exitosamente');
      },

      error: (err) => {
        this.logger.error('Error cargando citas', err);
        this.errorMessage = this.errorService.getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  async createAppointment() {

    this.successMessage = '';
    this.errorMessage = '';

    const token = this.tokenService.getToken();

    this.http.post(
      `${environment.apiUrl}appointments`,
      {
        vet_id: this.vet_id,
        date: this.date,
        description: this.description
      }
    ).subscribe({

      next: () => {

        this.successMessage = '✔ Cita creada correctamente';

        this.vet_id = '';
        this.date = '';
        this.description = '';

        this.loadAppointments();

        this.logger.log('Cita creada exitosamente');

        setTimeout(() => this.successMessage = '', 3000);
      },

      error: (err) => {
        this.logger.error('Error creando cita', err);
        this.errorMessage = this.errorService.getErrorMessage(err);
      }
    });
  }

  goHome() {
    this.navCtrl.navigateRoot('/home');
  }
}