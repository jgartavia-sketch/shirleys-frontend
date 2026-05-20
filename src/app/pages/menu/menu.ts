import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface MenuItem {
  name: string;
  price: number;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface CartItem extends MenuItem {
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
  activeSectionId = 'fast-food';

  readonly whatsappNumber = '50688335888';

  readonly sections: MenuSection[] = [
    {
      id: 'fast-food',
      title: 'Fast Food',
      items: [
        { name: 'Ceviche Pequeño', price: 2500 },
        { name: 'Ceviche Grande', price: 3500 },
        { name: 'Canasta de Patacón', price: 4500 },
        { name: 'Orden de 4 Camarones', price: 4500 },
        { name: 'Orden de 4 Carne-Pollo', price: 4000 },
        { name: 'Fajitas de Pollo', price: 3800 },
        { name: 'Fajitas de Pescado', price: 4500 },
        { name: 'Nachos', price: 3500 },
        { name: 'Papanachos', price: 4000 },
        { name: 'Chifrijo', price: 3500 },
        { name: 'Burrito', price: 3500 },
        { name: 'Salchipapas', price: 3500 },
        { name: 'Taco Corriente', price: 2500 },
        { name: 'Quesadilla', price: 3500 },
        { name: 'Orden de papas', price: 2500 },
      ],
    },
    {
      id: 'hamburguesas-empanadas',
      title: 'Hamburguesas / Empanadas',
      items: [
        { name: 'Hamburguesa de Carne', price: 4000 },
        { name: 'Hamburguesa de Pollo', price: 4000 },
        { name: 'Hamburguesa de Birria', price: 4000 },
        { name: 'Empanada Arreglada', price: 2500 },
        { name: 'Empanada Sencilla', price: 2000 },
      ],
    },
    {
      id: 'arroces',
      title: 'Arroces',
      items: [
        { name: 'Arroz con Pollo', price: 3800 },
        { name: 'Arroz Cantonés', price: 3800 },
        { name: 'Arroz con Camarones', price: 4500 },
        { name: 'Arroz de la casa', price: 3800 },
      ],
    },
    {
      id: 'especiales',
      title: 'Especiales',
      items: [
        { name: 'Papanachos Shirley’s', price: 4900 },
        { name: 'Ensalada Shirley’s plancha', price: 4000 },
        { name: 'Ensalada Shirley’s empanizado', price: 4300 },
        { name: 'Hamburguesa Shirley’s', price: 4800 },
        { name: 'Pizza Birria', price: 8950 },
        { name: 'Empabirria', price: 3500 },
      ],
    },
    {
      id: 'tacos-birria',
      title: 'Tacos de Birria',
      items: [
        { name: 'Orden de 3', price: 4000 },
        { name: 'Orden de 4', price: 4500 },
        { name: 'Orden de 5', price: 5000 },
        { name: 'Orden Familiar (20 tacos)', price: 18900 },
        { name: 'Taco adicional', price: 1500 },
      ],
    },
    {
      id: 'bebidas',
      title: 'Refrescos y Cócteles',
      items: [
        { name: 'Coca Cola', price: 800 },
        { name: 'Coca Cola Zero', price: 1000 },
        { name: 'Fresca', price: 800 },
        { name: 'Gin', price: 800 },
        { name: 'Fanta Naranja', price: 800 },
        { name: 'Fanta Uva', price: 800 },
        { name: 'Té Melocotón o té Blanco', price: 800 },
        { name: 'Fanta Kolita', price: 800 },
        { name: 'Café', price: 1000 },
        { name: 'Café con leche', price: 1500 },
        { name: 'Chocolate frío/Caliente', price: 2000 },
        { name: 'Piña Colada', price: 3000 },
        { name: 'Margarita de mango', price: 3000 },
        { name: 'Limonada de coco', price: 3000 },
        { name: 'Café Cremoso', price: 2500 },
      ],
    },
  ];

  cart: CartItem[] = [];

  setActiveSection(sectionId: string): void {
    this.activeSectionId = sectionId;
  }

  addToCart(item: MenuItem): void {
    const existingItem = this.cart.find(
      (cartItem) => cartItem.name === item.name
    );

    if (existingItem) {
      existingItem.quantity += 1;
      return;
    }

    this.cart.push({
      ...item,
      quantity: 1,
    });
  }

  removeFromCart(itemName: string): void {
    this.cart = this.cart
      .map((item) =>
        item.name === itemName
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);
  }

  clearCart(): void {
    this.cart = [];
  }

  get activeSection(): MenuSection {
    return (
      this.sections.find((section) => section.id === this.activeSectionId) ??
      this.sections[0]
    );
  }

  get total(): number {
    return this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  get hasCartItems(): boolean {
    return this.cart.length > 0;
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