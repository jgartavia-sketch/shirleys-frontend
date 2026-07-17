import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

type WhatsappOrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'cancelled'
  | 'modified';

interface AdminSummary {
  total_customers: number;
  total_purchases: number;
  total_sales: number;
  total_points_delivered: number;
  average_ticket: number;
  new_customers_this_month: number;

  whatsapp_orders_received: number;
  whatsapp_orders_confirmed: number;
  whatsapp_orders_cancelled: number;
  whatsapp_total_confirmed: number;
  whatsapp_packaging_confirmed: number;
  whatsapp_average_confirmed_ticket: number;

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

interface WhatsappOrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface WhatsappOrder {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  order_type: 'pickup' | 'express';
  location_text: string | null;
  items: WhatsappOrderItem[];
  food_total: number;
  packaging_total: number;
  total: number;
  status: WhatsappOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
}

interface WhatsappOrdersResponse {
  orders: WhatsappOrder[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {

  private readonly apiBaseUrl =
    'https://shirleys-backend.onrender.com/api/admin';

  loading = true;
  loadingOrders = true;

  error = '';
  ordersError = '';

  updatingOrderId: string | null = null;
  pendingOrdersExpanded = false;
  updatingCustomerCode: string | null = null;
  customerActionError = '';

  summary: AdminSummary = {
    total_customers: 0,
    total_purchases: 0,
    total_sales: 0,
    total_points_delivered: 0,
    average_ticket: 0,
    new_customers_this_month: 0,

    whatsapp_orders_received: 0,
    whatsapp_orders_confirmed: 0,
    whatsapp_orders_cancelled: 0,
    whatsapp_total_confirmed: 0,
    whatsapp_packaging_confirmed: 0,
    whatsapp_average_confirmed_ticket: 0,

    top_customers: [],
    recent_purchases: [],
  };

  whatsappOrders: WhatsappOrder[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAdminSummary();
    this.loadWhatsappOrders();
  }

  get pendingWhatsappOrders(): WhatsappOrder[] {
    return this.whatsappOrders.filter(
      (order) => order.status === 'pending_confirmation'
    );
  }

  get processedWhatsappOrders(): WhatsappOrder[] {
    return this.whatsappOrders.filter(
      (order) => order.status !== 'pending_confirmation'
    );
  }

  togglePendingOrders(): void {
    this.pendingOrdersExpanded = !this.pendingOrdersExpanded;
  }

  deleteCustomer(customer: TopCustomer): void {
    if (this.updatingCustomerCode) return;

    const customerName = customer.name || 'este cliente';
    const confirmed = window.confirm(
      `¿Eliminar definitivamente a ${customerName} del registro de clientes? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    this.updatingCustomerCode = customer.code;
    this.customerActionError = '';

    this.http
      .delete(`${this.apiBaseUrl}/customers/${encodeURIComponent(customer.code)}`)
      .subscribe({
        next: () => {
          this.updatingCustomerCode = null;
          this.loadAdminSummary();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error deleting customer:', error);
          this.customerActionError =
            'No se pudo eliminar el cliente. Inténtalo nuevamente.';
          this.updatingCustomerCode = null;
          this.cdr.detectChanges();
        },
      });
  }

  redeemCustomerPoints(customer: TopCustomer): void {
    if (this.updatingCustomerCode) return;

    if (customer.points <= 0) {
      window.alert('Este cliente no tiene puntos disponibles para canjear.');
      return;
    }

    const enteredValue = window.prompt(
      `¿Cuántos puntos deseas rebajar a ${customer.name || 'este cliente'}?\nDisponibles: ${customer.points} puntos.`
    );
    if (enteredValue === null) return;

    const pointsToRedeem = Number(enteredValue.trim());
    if (
      !Number.isInteger(pointsToRedeem) ||
      pointsToRedeem <= 0 ||
      pointsToRedeem > customer.points
    ) {
      window.alert(`Ingresa una cantidad entera entre 1 y ${customer.points}.`);
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmas el canje de ${pointsToRedeem} puntos para ${customer.name || 'este cliente'}? Su nuevo saldo será de ${customer.points - pointsToRedeem} puntos.`
    );
    if (!confirmed) return;

    this.updatingCustomerCode = customer.code;
    this.customerActionError = '';

    this.http
      .patch(
        `${this.apiBaseUrl}/customers/${encodeURIComponent(customer.code)}/redeem-points`,
        { points: pointsToRedeem }
      )
      .subscribe({
        next: () => {
          this.updatingCustomerCode = null;
          this.loadAdminSummary();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error redeeming customer points:', error);
          this.customerActionError =
            'No se pudieron rebajar los puntos. Inténtalo nuevamente.';
          this.updatingCustomerCode = null;
          this.cdr.detectChanges();
        },
      });
  }

  isUpdatingCustomer(customerCode: string): boolean {
    return this.updatingCustomerCode === customerCode;
  }

  loadAdminSummary(): void {
    this.loading = true;
    this.error = '';

    this.http.get<AdminSummary>(`${this.apiBaseUrl}/summary`).subscribe({
      next: (response) => {
        this.summary = response;

        this.loading = false;
        this.error = '';

        console.log('✅ Admin summary loaded:', response);

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('❌ Error loading admin summary:', error);

        this.error = 'No se pudo cargar el panel administrativo.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  loadWhatsappOrders(): void {
    this.loadingOrders = true;
    this.ordersError = '';

    this.http
      .get<WhatsappOrdersResponse>(
        `${this.apiBaseUrl}/whatsapp-orders`
      )
      .subscribe({
        next: (response) => {

          this.whatsappOrders = response.orders || [];

          this.loadingOrders = false;
          this.ordersError = '';

          console.log('✅ WhatsApp orders loaded:', response);

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('❌ Error loading WhatsApp orders:', error);

          this.ordersError =
            'No se pudieron cargar los pedidos de WhatsApp.';

          this.loadingOrders = false;

          this.cdr.detectChanges();
        }
      });
  }

  updateWhatsappOrderStatus(
    order: WhatsappOrder,
    status: WhatsappOrderStatus
  ): void {

    if (this.updatingOrderId) {
      return;
    }

    this.updatingOrderId = order.id;
    this.ordersError = '';

    const payload = {
      status,
      total: order.total,
      notes: order.notes,
    };

    this.http
      .patch(
        `${this.apiBaseUrl}/whatsapp-orders/${order.id}`,
        payload
      )
      .subscribe({
        next: () => {

          order.status = status;

          this.loadAdminSummary();
          this.loadWhatsappOrders();

          this.updatingOrderId = null;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            '❌ Error updating WhatsApp order:',
            error
          );

          this.ordersError =
            'No se pudo actualizar el estado del pedido.';

          this.updatingOrderId = null;

          this.cdr.detectChanges();
        }
      });
  }

  confirmWhatsappOrder(order: WhatsappOrder): void {
    this.updateWhatsappOrderStatus(order, 'confirmed');
  }

  cancelWhatsappOrder(order: WhatsappOrder): void {
    this.updateWhatsappOrderStatus(order, 'cancelled');
  }

  markWhatsappOrderModified(order: WhatsappOrder): void {
    this.updateWhatsappOrderStatus(order, 'modified');
  }

  isUpdatingOrder(orderId: string): boolean {
    return this.updatingOrderId === orderId;
  }

  getStatusLabel(status: WhatsappOrderStatus): string {
    const labels: Record<WhatsappOrderStatus, string> = {
      pending_confirmation: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      modified: 'Modificada',
    };

    return labels[status];
  }

  getOrderTypeLabel(orderType: 'pickup' | 'express'): string {
    return orderType === 'express'
      ? 'Express'
      : 'Recoger en el local';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
