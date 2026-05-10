import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  templateUrl: './customer-card.html',
  styleUrl: './customer-card.css'
})
export class CustomerCard {

  private route = inject(ActivatedRoute);

  customerCode = '';
  customerName = 'Shirley’s Customer';
  customerEmail = 'customer@email.com';
  customerPoints = 0;

  constructor() {
    this.customerCode = this.route.snapshot.paramMap.get('code') || 'UNKNOWN';

    // MOCK TEMPORAL
    // Luego esto vendrá del backend real
    this.customerName = 'José';
    this.customerEmail = 'jgartavia@example.com';
    this.customerPoints = 0;
  }
}