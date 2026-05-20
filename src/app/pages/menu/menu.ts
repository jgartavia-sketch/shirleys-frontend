import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  openSection: string | null = null;

  readonly whatsappNumber = '50688335888';

  cart: CartItem[] = [];

  toggleSection(section: string): void {
    this.openSection = this.openSection === section ? null : section;
  }

  isOpen(section: string): boolean {
    return this.openSection === section;
  }

  addToCart(name: string, price: number): void {
    const existingItem = this.cart.find((item) => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
      return;
    }

    this.cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  removeFromCart(name: string): void {
    this.cart = this.cart
      .map((item) =>
        item.name === name
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);
  }

  clearCart(): void {
    this.cart = [];
  }

  get hasCartItems(): boolean {
    return this.cart.length > 0;
  }

  get total(): number {
    return this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  formatPrice(price: number): string {
    return `₡${price.toLocaleString('es-CR')}`;
  }

  sendOrderToWhatsApp(): void {
    if (!this.hasCartItems) {
      return;
    }

    const orderLines = this.cart
      .map(
        (item) =>
          `• ${item.quantity} x ${item.name} - ${this.formatPrice(
            item.price * item.quantity
          )}`
      )
      .join('\n');

    const message = `Hola Shirley's, quiero hacer este pedido:\n\n${orderLines}\n\nTotal: ${this.formatPrice(
      this.total
    )}\n\n*Precios no incluyen 10% de servicio.*`;

    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, '_blank');
  }
}