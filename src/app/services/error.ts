import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  getErrorMessage(error: any): string {
    // Errores de HTTP status
    if (error.status === 0) {
      return 'Error de conexión - Verifica tu internet';
    } else if (error.status === 400) {
      return 'Solicitud inválida - Revisa los datos';
    } else if (error.status === 401) {
      return 'No autorizado - Por favor inicia sesión nuevamente';
    } else if (error.status === 403) {
      return 'Acceso denegado - No tienes permisos para esta acción';
    } else if (error.status === 404) {
      return 'Recurso no encontrado';
    } else if (error.status === 409) {
      return 'Conflicto - El recurso ya existe';
    } else if (error.status === 500) {
      return 'Error del servidor - Intenta de nuevo más tarde';
    } else if (error.status === 503) {
      return 'Servicio no disponible - Intenta de nuevo más tarde';
    }

    // Error por timeout
    if (error.name === 'TimeoutError') {
      return 'La solicitud tardó demasiado - Intenta de nuevo';
    }

    // Mensaje de error del servidor
    if (error.error?.message) {
      return error.error.message;
    }

    // Error genérico
    return 'Ocurrió un error inesperado - Por favor intenta de nuevo';
  }
}
