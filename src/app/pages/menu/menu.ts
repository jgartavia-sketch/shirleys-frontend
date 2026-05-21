import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

type OrderType = 'pickup' | 'express';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface CreateWhatsappOrderPayload {
  customer_name?: string | null;
  customer_phone?: string | null;
  order_type: OrderType;
  location_text?: string | null;
  items: CartItem[];
  food_total: number;
  packaging_total: number;
  total: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  openSection: string | null = null;

  readonly whatsappNumber = '50688335888';
  readonly packagingFee = 200;

  readonly apiUrl = 'https://shirleys-backend.onrender.com/api/orders/';

  orderType: OrderType = 'pickup';
  customerLocation = '';

  isSendingOrder = false;
  orderError = '';

  cart: CartItem[] = [];

  pendingQuantities: Record<string, number> = {};

  constructor(private http: HttpClient) {}

  toggleSection(section: string): void {
    this.openSection = this.openSection === section ? null : section;
  }

  isOpen(section: string): boolean {
    return this.openSection === section;
  }

  setOrderType(type: OrderType): void {
    this.orderType = type;

    if (type === 'pickup') {
      this.customerLocation = '';
    }
  }

  getPendingQuantity(name: string): number {
    return this.pendingQuantities[name] ?? 1;
  }

  increasePendingQuantity(name: string): void {
    this.pendingQuantities[name] = this.getPendingQuantity(name) + 1;
  }

  decreasePendingQuantity(name: string): void {
    const currentQuantity = this.getPendingQuantity(name);

    if (currentQuantity <= 1) {
      this.pendingQuantities[name] = 1;
      return;
    }

    this.pendingQuantities[name] = currentQuantity - 1;
  }

  addQuantityToCart(name: string, price: number): void {
    const quantity = this.getPendingQuantity(name);
    const existingItem = this.cart.find((item) => item.name === name);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        name,
        price,
        quantity,
      });
    }

    this.pendingQuantities[name] = 1;
  }

  addToCart(name: string, price: number): void {
    this.addQuantityToCart(name, price);
  }

  removeFromCart(name: string): void {
    this.cart = this.cart
      .map((item) =>
        item.name === name ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
  }

  clearCart(): void {
    this.cart = [];
    this.pendingQuantities = {};
    this.orderType = 'pickup';
    this.customerLocation = '';
    this.orderError = '';
    this.isSendingOrder = false;
  }

  isInCart(name: string): boolean {
    return this.cart.some((item) => item.name === name);
  }

  get hasCartItems(): boolean {
    return this.cart.length > 0;
  }

  get totalItemsQuantity(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get foodTotal(): number {
    return this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  get packagingTotal(): number {
    return this.totalItemsQuantity * this.packagingFee;
  }

  get total(): number {
    return this.foodTotal + this.packagingTotal;
  }

  formatPrice(price: number): string {
    return `₡${price.toLocaleString('es-CR')}`;
  }

  sendOrderToWhatsApp(): void {
    if (!this.hasCartItems || this.isSendingOrder) {
      return;
    }

    this.isSendingOrder = true;
    this.orderError = '';

    const payload: CreateWhatsappOrderPayload = {
      customer_name: null,
      customer_phone: null,
      order_type: this.orderType,
      location_text:
        this.orderType === 'express'
          ? this.customerLocation.trim() || null
          : null,
      items: this.cart,
      food_total: this.foodTotal,
      packaging_total: this.packagingTotal,
      total: this.total,
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        this.openWhatsApp();
        this.isSendingOrder = false;
      },

      error: (error) => {
        console.error('❌ Error creating WhatsApp order:', error);

        this.orderError =
          'No pudimos registrar el pedido todavía. Inténtalo de nuevo.';

        this.isSendingOrder = false;
      },
    });
  }

  private openWhatsApp(): void {
    const orderLines = this.cart
      .map(
        (item) =>
          `• ${item.quantity} x ${item.name} - ${this.formatPrice(
            item.price * item.quantity
          )}`
      )
      .join('\n');

    const orderTypeText =
      this.orderType === 'express' ? 'Express' : 'Recoger en el local';

    const locationText =
      this.orderType === 'express'
        ? `\nUbicación para express: ${
            this.customerLocation.trim() ||
            'Por favor enviar ubicación por WhatsApp.'
          }`
        : '';

    const message =
      `Hola Shirley's, quiero hacer este pedido:\n\n` +
      `${orderLines}\n\n` +
      `Tipo de pedido: ${orderTypeText}` +
      `${locationText}\n\n` +
      `Subtotal platillos: ${this.formatPrice(this.foodTotal)}\n` +
      `Empaque (${this.totalItemsQuantity} x ${this.formatPrice(
        this.packagingFee
      )}): ${this.formatPrice(this.packagingTotal)}\n` +
      `Total: ${this.formatPrice(this.total)}`;

    const whatsappUrl = `https://wa.me/${
      this.whatsappNumber
    }?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  }
}