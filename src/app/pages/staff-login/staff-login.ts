import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
    if (!this.password.trim() || this.loading) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post<StaffLoginResponse>(this.apiUrl, {
      password: this.password.trim()
    }).subscribe({
      next: (response) => {
        localStorage.setItem('shirleys_staff_token', response.token);

        this.loading = false;

        this.router.navigate(['/staff']);
      },

      error: () => {
        this.loading = false;
        this.error = 'Contraseña incorrecta o acceso no autorizado.';
      }
    });
  }
}