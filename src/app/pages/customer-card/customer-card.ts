import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
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
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  customerCode = '';
  customerName = 'Cargando cliente...';
  customerEmail = '';
  customerWhatsapp = '';
  customerPoints = 0;

  purchases: Purchase[] = [];

  loading = true;
  error = false;

  private readonly apiUrl = 'https://shirleys-backend.onrender.com/api/customers';

  ngOnInit(): void {
    this.customerCode = this.route.snapshot.paramMap.get('code') || '';
    this.loadCustomer();
  }

  loadCustomer(): void {
    if (!this.customerCode) {
      this.showError();
      return;
    }

    const requestUrl = `${this.apiUrl}/${this.customerCode}`;

    this.loading = true;
    this.error = false;
    this.cdr.detectChanges();

    this.http.get<CustomerResponse>(requestUrl).subscribe({
      next: (data) => {
        this.zone.run(() => {
          if (!data || !data.customer) {
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

          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.showError();
          this.cdr.detectChanges();
        });
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