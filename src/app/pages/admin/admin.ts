import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AdminStat {
  title: string;
  value: string;
  subtitle: string;
}

interface RecentCustomer {
  name: string;
  points: number;
  visits: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {

  stats: AdminStat[] = [
    {
      title: 'Clientes registrados',
      value: '128',
      subtitle: 'Base activa Shirley’s Customers'
    },
    {
      title: 'Puntos entregados',
      value: '2,430',
      subtitle: 'Programa de fidelización'
    },
    {
      title: 'Compras del mes',
      value: '₡1.8M',
      subtitle: 'Ventas vinculadas'
    },
    {
      title: 'Clientes frecuentes',
      value: '37',
      subtitle: 'Más de 5 visitas'
    }
  ];

  recentCustomers: RecentCustomer[] = [
    {
      name: 'José Gartavia',
      points: 48,
      visits: 7
    },
    {
      name: 'María Fernández',
      points: 22,
      visits: 3
    },
    {
      name: 'Daniel Rojas',
      points: 67,
      visits: 11
    }
  ];

}