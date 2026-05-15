import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {

  email = '';
  password = '';

  loading = false;
  error = '';

  constructor(private router: Router) {}

  login() {

    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Complete todos los campos.';
      return;
    }

    this.loading = true;

    // MOCK TEMPORAL
    // Luego conectamos backend real

    setTimeout(() => {

      if (
        this.email === 'admin@shirleyscr.com' &&
        this.password === 'shirleysadmin123'
      ) {

        localStorage.setItem('shirleys_admin_token', 'admin_logged');

        this.router.navigate(['/admin']);

      } else {

        this.error = 'Credenciales incorrectas.';
      }

      this.loading = false;

    }, 1200);

  }

}