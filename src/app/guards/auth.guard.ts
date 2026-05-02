import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  try {
    // 1. Verificar si token existe en BehaviorSubject (ya cargado en memoria)
    let token = tokenService.getToken();

    // 2. Si no existe en memoria, inicializar desde Preferences encriptado
    if (!token) {
      await tokenService.initializeToken();
      token = tokenService.getToken();
    }

    // 3. Si después de inicializar sigue sin token → redirigir a login
    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error en authGuard:', error);
    router.navigate(['/login']);
    return false;
  }
};
