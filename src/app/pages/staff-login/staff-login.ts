import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

interface StaffLoginResponse {
  success: boolean;
  message: string;
  token: string;
  token_type: string;
  expires_in_hours: number;
}

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './staff-login.html',
  styleUrls: ['./staff-login.css']
})
export class StaffLogin {
  password = '';
  loading = false;
  error = '';

  private readonly apiUrl =
    'https://shirleys-backend.onrender.com/api/staff/login';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(): void {
    const cleanPassword = this.password.trim();

    if (!cleanPassword || this.loading) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post<StaffLoginResponse>(this.apiUrl, {
      password: cleanPassword
    }).subscribe({
      next: (response) => {
        this.loading = false;

        if (!response?.success || !response?.token) {
          this.error = response?.message || 'No se recibió un token válido.';
          return;
        }

        localStorage.setItem('shirleys_staff_token', response.token);
        this.router.navigate(['/staff']);
      },

      error: (err: HttpErrorResponse) => {
        this.loading = false;

        if (err.status === 401) {
          this.error = 'Contraseña incorrecta. Verifica la clave de acceso del staff.';
          return;
        }

        if (err.status === 0) {
          this.error = 'No se pudo conectar con el servidor. Revisa Render o la conexión.';
          return;
        }

        this.error =
          err.error?.detail ||
          err.error?.message ||
          'Ocurrió un error al validar el acceso.';
      }
    });
  }
}