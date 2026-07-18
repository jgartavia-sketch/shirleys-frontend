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
  operationalHistoryExpanded = false;
  registeredCustomersExpanded = false;
  recentPurchasesExpanded = false;
  updatingCustomerCode: string | null = null;
  customerActionError = '';

selectedCustomer: TopCustomer | null = null;
pointsModalOpen = false;
deleteModalOpen = false;
pointsModalMode: 'add' | 'redeem' = 'add';
pointsInput = '';
modalValidationError = '';
modalSubmitting = false;
toastMessage = '';
toastType: 'success' | 'error' = 'success';
private toastTimer: ReturnType<typeof setTimeout> | null = null;

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

  toggleOperationalHistory(): void {
    this.operationalHistoryExpanded = !this.operationalHistoryExpanded;
  }

  toggleRegisteredCustomers(): void {
    this.registeredCustomersExpanded = !this.registeredCustomersExpanded;
  }

  toggleRecentPurchases(): void {
    this.recentPurchasesExpanded = !this.recentPurchasesExpanded;
  }


openPointsModal(mode: 'add' | 'redeem', customer: TopCustomer): void {
  if (this.updatingCustomerCode) return;

  this.selectedCustomer = customer;
  this.pointsModalMode = mode;
  this.pointsInput = '';
  this.modalValidationError = '';
  this.pointsModalOpen = true;
  this.deleteModalOpen = false;
}

closePointsModal(): void {
  if (this.modalSubmitting) return;

  this.pointsModalOpen = false;
  this.selectedCustomer = null;
  this.pointsInput = '';
  this.modalValidationError = '';
}

onPointsInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.pointsInput = input.value;
  this.modalValidationError = '';
}

get projectedPointsBalance(): number {
  const currentPoints = this.selectedCustomer?.points || 0;
  const amount = Number(this.pointsInput);

  if (!Number.isFinite(amount) || amount <= 0) {
    return currentPoints;
  }

  return this.pointsModalMode === 'add'
    ? currentPoints + Math.trunc(amount)
    : Math.max(0, currentPoints - Math.trunc(amount));
}

submitPointsModal(): void {
  const customer = this.selectedCustomer;
  if (!customer || this.modalSubmitting) return;

  const points = Number(this.pointsInput);

  if (!Number.isInteger(points) || points <= 0) {
    this.modalValidationError =
      'Ingresa una cantidad entera mayor que cero.';
    return;
  }

  if (this.pointsModalMode === 'redeem' && points > customer.points) {
    this.modalValidationError =
      `No puedes rebajar más de ${customer.points} puntos.`;
    return;
  }

  this.modalSubmitting = true;
  this.updatingCustomerCode = customer.code;
  this.customerActionError = '';

  const endpoint =
    this.pointsModalMode === 'add'
      ? 'add-points'
      : 'redeem-points';

  this.http
    .patch(
      `${this.apiBaseUrl}/customers/${encodeURIComponent(customer.code)}/${endpoint}`,
      { points }
    )
    .subscribe({
      next: () => {
        const actionLabel =
          this.pointsModalMode === 'add'
            ? `${points} puntos agregados correctamente.`
            : `${points} puntos rebajados correctamente.`;

        this.modalSubmitting = false;
        this.updatingCustomerCode = null;
        this.pointsModalOpen = false;
        this.selectedCustomer = null;
        this.pointsInput = '';
        this.showToast(actionLabel, 'success');
        this.loadAdminSummary();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error updating customer points:', error);

        this.modalSubmitting = false;
        this.updatingCustomerCode = null;
        this.modalValidationError =
          this.pointsModalMode === 'add'
            ? 'No se pudieron sumar los puntos. Inténtalo nuevamente.'
            : 'No se pudieron rebajar los puntos. Inténtalo nuevamente.';

        this.cdr.detectChanges();
      },
    });
}

openDeleteCustomerModal(customer: TopCustomer): void {
  if (this.updatingCustomerCode) return;

  this.selectedCustomer = customer;
  this.deleteModalOpen = true;
  this.pointsModalOpen = false;
  this.modalValidationError = '';
}

closeDeleteCustomerModal(): void {
  if (this.modalSubmitting) return;

  this.deleteModalOpen = false;
  this.selectedCustomer = null;
}

confirmDeleteCustomer(): void {
  const customer = this.selectedCustomer;
  if (!customer || this.modalSubmitting) return;

  this.modalSubmitting = true;
  this.updatingCustomerCode = customer.code;
  this.customerActionError = '';

  this.http
    .delete(`${this.apiBaseUrl}/customers/${encodeURIComponent(customer.code)}`)
    .subscribe({
      next: () => {
        this.modalSubmitting = false;
        this.updatingCustomerCode = null;
        this.deleteModalOpen = false;
        this.selectedCustomer = null;
        this.showToast('Cliente eliminado correctamente.', 'success');
        this.loadAdminSummary();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error deleting customer:', error);

        this.modalSubmitting = false;
        this.updatingCustomerCode = null;
        this.deleteModalOpen = false;
        this.selectedCustomer = null;
        this.customerActionError =
          'No se pudo eliminar el cliente. Inténtalo nuevamente.';
        this.showToast(
          'No se pudo eliminar el cliente. Inténtalo nuevamente.',
          'error'
        );

        this.cdr.detectChanges();
      },
    });
}

private showToast(
  message: string,
  type: 'success' | 'error' = 'success'
): void {
  if (this.toastTimer) {
    clearTimeout(this.toastTimer);
  }

  this.toastMessage = message;
  this.toastType = type;

  this.toastTimer = setTimeout(() => {
    this.toastMessage = '';
    this.cdr.detectChanges();
  }, 3200);
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
