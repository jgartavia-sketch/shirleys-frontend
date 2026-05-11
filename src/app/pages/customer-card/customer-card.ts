import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Customer {
  name: string;
  email: string;
  whatsapp: string;
  points: number;
}

interface Purchase {
  id?: number;
  invoice_number?: string;
  amount?: number;
  points_earned?: number;
  created_at?: string;
}

interface CustomerResponse {
  customer: Customer;
  purchases?: Purchase[];
}

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './customer-card.html',
  styleUrls: ['./customer-card.css']
})
export class CustomerCard implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  customerCode = '';
  customerName = 'Cargando cliente...';
  customerEmail = '';
  customerWhatsapp = '';
  customerPoints = 0;

  purchases: Purchase[] = [];

  loading = true;
  error = false;

  private readonly apiUrl = 'http://127.0.0.1:8000/api/customers';

  ngOnInit(): void {
    this.customerCode = this.route.snapshot.paramMap.get('code') || '';

    console.log('Código recibido desde la ruta:', this.customerCode);

    this.loadCustomer();
  }

  loadCustomer(): void {
    if (!this.customerCode) {
      console.error('No llegó ningún código en la ruta.');
      this.showError();
      return;
    }

    const requestUrl = `${this.apiUrl}/${this.customerCode}`;

    console.log('Consultando backend:', requestUrl);

    this.loading = true;
    this.error = false;

    this.http.get<CustomerResponse>(requestUrl).subscribe({
      next: (data) => {
        console.log('Respuesta del backend:', data);

        if (!data || !data.customer) {
          console.error('La respuesta no trae customer.');
          this.showError();
          return;
        }

        this.customerName = data.customer.name || 'Cliente Shirley’s';
        this.customerEmail = data.customer.email || '';
        this.customerWhatsapp = data.customer.whatsapp || '';
        this.customerPoints = data.customer.points || 0;
        this.purchases = data.purchases || [];

        this.loading = false;
        this.error = false;

        console.log('Cliente renderizado correctamente.');
      },
      error: (error) => {
        console.error('Error cargando cliente:', error);
        this.showError();
      }
    });
  }

  private showError(): void {
    this.error = true;
    this.loading = false;

    this.customerName = 'Cliente no encontrado';
    this.customerEmail = '';
    this.customerWhatsapp = '';
    this.customerPoints = 0;
    this.purchases = [];
  }
}