import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface AdminSummary {
  total_customers: number;
  total_purchases: number;
  total_sales: number;
  total_points_delivered: number;
  average_ticket: number;
  new_customers_this_month: number;

  top_customers: TopCustomer[];
  recent_purchases: RecentPurchase[];
}

interface TopCustomer {
  code: string;
  name: string;
  email: string;
  whatsapp: string;
  points: number;
  purchases_count: number;
  total_spent: number;
  last_purchase: string;
}

interface RecentPurchase {
  invoice_number: string;
  amount: number;
  points_earned: number;
  created_at: string;

  customer: {
    code: string;
    name: string;
    email: string;
    whatsapp: string;
  };
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {

  private apiUrl = 'https://shirleys-backend.onrender.com/api/admin/summary';
  loading = true;
  error = '';

  summary: AdminSummary = {
    total_customers: 0,
    total_purchases: 0,
    total_sales: 0,
    total_points_delivered: 0,
    average_ticket: 0,
    new_customers_this_month: 0,
    top_customers: [],
    recent_purchases: [],
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAdminSummary();
  }

  loadAdminSummary(): void {

    this.loading = true;
    this.error = '';

    this.http.get<AdminSummary>(this.apiUrl).subscribe({
      next: (response) => {

        this.summary = response;

        this.loading = false;

        console.log('✅ Admin summary loaded:', response);
      },

      error: (error) => {

        console.error('❌ Error loading admin summary:', error);

        this.error = 'No se pudo cargar el panel administrativo.';

        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {

    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0,
    }).format(value);
  }
}