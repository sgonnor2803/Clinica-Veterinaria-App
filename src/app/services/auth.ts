import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}auth/login`, {
      email,
      password
    });
  }

  async saveToken(token: string) {
    await Preferences.set({
      key: 'token',
      value: token
    });
  }

  async getToken() {
    const { value } = await Preferences.get({ key: 'token' });
    return value;
  }

  async logout() {
    await Preferences.remove({ key: 'token' });
  }
}