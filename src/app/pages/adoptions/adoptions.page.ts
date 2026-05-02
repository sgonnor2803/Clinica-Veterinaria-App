import { Component } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { LoggerService } from 'src/app/services/logger';
import { ErrorService } from 'src/app/services/error';
import { TokenService } from 'src/app/services/token';
import { Pet } from 'src/app/models';

@Component({
  selector: 'app-adoptions',
  templateUrl: './adoptions.page.html',
  styleUrls: ['./adoptions.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AdoptionsPage {

  private http = inject(HttpClient);
  private navCtrl = inject(NavController);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);
  private tokenService = inject(TokenService);

  pets: Pet[] = [];

  loading = false;
  successMessage = '';
  errorMessage = '';

  ionViewWillEnter() {
    this.loadPets();
  }

  loadPets() {

    this.loading = true;
    this.errorMessage = '';

    const token = this.tokenService.getToken();

    if (!token) {
      this.navCtrl.navigateRoot('/login');
      return;
    }

    this.http.get<Pet[]>(`${environment.apiUrl}pets`).subscribe({

      next: (data) => {
        this.pets = data || [];
        this.loading = false;
        this.logger.log('Mascotas cargadas');
      },

      error: (err) => {
        this.loading = false;
        this.errorMessage = this.errorService.getErrorMessage(err);
        this.logger.error('Error cargando mascotas', err);
      }
    });
  }

  adoptPet(pet: Pet) {

    if (pet.adopted) return;

    const token = this.tokenService.getToken();

    if (!token) {
      this.navCtrl.navigateRoot('/login');
      return;
    }

    this.http.post(
      `${environment.apiUrl}pets/adopt/${pet.id}`,
      {}
    ).subscribe({

      next: () => {

        // update UI local (sin recargar API)
        this.pets = this.pets.map(p =>
          p.id === pet.id
            ? { ...p, adopted: true }
            : p
        );

        this.successMessage = `🐾 Has adoptado a ${pet.name}`;

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);

        this.logger.log(`Adopción OK: ${pet.name}`);
      },

      error: (err) => {
        this.errorMessage = this.errorService.getErrorMessage(err);
        this.logger.error('Error adoptando mascota', err);
      }
    });
  }

  goHome() {
    this.navCtrl.navigateRoot('/home');
  }

  /**
   * Icono seguro (evita crashes si species viene null)
   */
  getPetIcon(species?: string): string {

    if (!species) return 'paw';

    const key = species.toLowerCase();

    const map: Record<string, string> = {
      dog: 'paw',
      cat: 'paw',
      perro: 'paw',
      gato: 'paw',
      bird: 'bird',
      pájaro: 'bird',
      rabbit: 'paw',
      conejo: 'paw',
      hamster: 'paw',
      hámster: 'paw'
    };

    return map[key] || 'paw';
  }
}