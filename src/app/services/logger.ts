import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  log(message: string, data?: any) {
    if (!environment.production) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  error(message: string, error?: any) {
    if (!environment.production) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  }

  warn(message: string, data?: any) {
    if (!environment.production) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  debug(message: string, data?: any) {
    if (!environment.production) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}
