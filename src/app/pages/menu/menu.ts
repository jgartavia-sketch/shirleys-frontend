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

  private _searchTerm = '';

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this._searchTerm = value;
    this.applyMenuSearch();
  }

  readonly whatsappNumber = '50688335888';
  readonly packagingFee = 200;
  readonly doublePackagingFee = 400;

  readonly apiUrl = 'https://shirleys-backend.onrender.com/api/orders/';

  orderType: OrderType = 'pickup';
  customerLocation = '';

  isSendingOrder = false;
  orderError = '';

  cart: CartItem[] = [];

  pendingQuantities: Record<string, number> = {};

  constructor(private http: HttpClient) {}

  get hasSearchTerm(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  setQuickSearch(value: string): void {
    this.searchTerm = value;
    this.openSection = null;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.openSection = null;
    this.resetMenuSearch();
  }

  toggleSection(section: string): void {
    if (this.hasSearchTerm) {
      return;
    }

    const willOpenSection = this.openSection !== section;

    this.openSection = willOpenSection ? section : null;

    if (willOpenSection) {
      this.scrollSectionIntoView(section);
    }
  }

  isOpen(section: string): boolean {
    return this.hasSearchTerm || this.openSection === section;
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
    return this.cart.reduce(
      (sum, item) =>
        sum + this.getPackagingFeeForItem(item.name) * item.quantity,
      0
    );
  }

  get total(): number {
    return this.foodTotal + this.packagingTotal;
  }

  formatPrice(price: number): string {
    return `₡${price.toLocaleString('es-CR')}`;
  }

  getPackagingFeeForItem(name: string): number {
    const normalizedName = name.trim().toLowerCase();

    const doublePackagingItems = [
      'orden familiar (20 tacos)',
      'pizza birria',
    ];

    if (doublePackagingItems.includes(normalizedName)) {
      return this.doublePackagingFee;
    }

    return this.packagingFee;
  }

  sendOrderToWhatsApp(): void {
    if (!this.hasCartItems || this.isSendingOrder) {
      return;
    }

    this.isSendingOrder = true;
    this.orderError = '';

    const whatsappUrl = this.buildWhatsAppUrl();

    const whatsappWindow = window.open('', '_blank');

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
        this.redirectToWhatsApp(whatsappUrl, whatsappWindow);
        this.isSendingOrder = false;
      },

      error: (error) => {
        console.error('❌ Error creating WhatsApp order:', error);

        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.close();
        }

        this.orderError =
          'No pudimos registrar el pedido todavía. Inténtalo de nuevo.';

        this.isSendingOrder = false;
      },
    });
  }

  private applyMenuSearch(): void {
    window.setTimeout(() => {
      const term = this.normalize(this.searchTerm);

      if (!term) {
        this.resetMenuSearch();
        return;
      }

      const categories = Array.from(
        document.querySelectorAll<HTMLElement>('.menu-category')
      );

      categories.forEach((category) => {
        const categoryLabel =
          category.querySelector('.category-badge')?.textContent ?? '';

        const items = Array.from(
          category.querySelectorAll<HTMLElement>('.menu-item')
        );

        let visibleItems = 0;

        items.forEach((item) => {
          const itemName =
            item.querySelector('.item-info span')?.textContent ?? '';

          const itemPriceText =
            item.querySelector('.item-info strong')?.textContent ?? '';

          const shouldShow = this.matchesMenuSearch(
            itemName,
            itemPriceText,
            categoryLabel,
            term
          );

          item.style.display = shouldShow ? 'grid' : 'none';

          if (shouldShow) {
            visibleItems += 1;
          }
        });

        category.style.display = visibleItems > 0 ? 'block' : 'none';
      });
    }, 80);
  }

  private resetMenuSearch(): void {
    window.setTimeout(() => {
      const categories = Array.from(
        document.querySelectorAll<HTMLElement>('.menu-category')
      );

      categories.forEach((category) => {
        category.style.display = '';

        const items = Array.from(
          category.querySelectorAll<HTMLElement>('.menu-item')
        );

        items.forEach((item) => {
          item.style.display = '';
        });
      });
    }, 80);
  }

  private matchesMenuSearch(
    itemName: string,
    itemPriceText: string,
    categoryLabel: string,
    term: string
  ): boolean {
    const maxPrice = this.extractMaxPrice(term);
    const itemPrice = this.extractPriceFromText(itemPriceText);

    if (maxPrice !== null && itemPrice > maxPrice) {
      return false;
    }

    const expandedText = this.normalize(
      [
        itemName,
        categoryLabel,
        this.getIntentWords(itemName),
        this.getIntentWords(categoryLabel),
      ].join(' ')
    );

    const words = term
      .split(' ')
      .filter((word) => word.length > 1)
      .filter(
        (word) =>
          ![
            'quiero',
            'algo',
            'con',
            'sin',
            'para',
            'de',
            'del',
            'la',
            'el',
            'los',
            'las',
            'menos',
            'que',
            'un',
            'una',
          ].includes(word)
      )
      .filter((word) => !/^\d+$/.test(word));

    if (words.length === 0 && maxPrice !== null) {
      return true;
    }

    return words.every((word) => expandedText.includes(word));
  }

  private getIntentWords(value: string): string {
    const text = this.normalize(value);
    const words: string[] = [];

    if (text.includes('pollo')) {
      words.push('pollo carne blanca');
    }

    if (text.includes('carne') || text.includes('churrasco') || text.includes('rib eye') || text.includes('lomo') || text.includes('angus')) {
      words.push('carne res fuerte abundante');
    }

    if (text.includes('camarones') || text.includes('pescado') || text.includes('ceviche')) {
      words.push('mariscos pescado camarones liviano');
    }

    if (text.includes('taco') || text.includes('tacos') || text.includes('birria') || text.includes('pizza') || text.includes('nachos') || text.includes('orden familiar')) {
      words.push('compartir familiar grupo');
    }

    if (text.includes('hamburguesa') || text.includes('papas') || text.includes('salchipapas')) {
      words.push('rapido niños ninos casual');
    }

    if (text.includes('postre') || text.includes('chocolate') || text.includes('smoothie')) {
      words.push('dulce postre antojo');
    }

    if (text.includes('cafe') || text.includes('te') || text.includes('coca') || text.includes('fanta') || text.includes('soda') || text.includes('mojito') || text.includes('margarita') || text.includes('limonada') || text.includes('colada')) {
      words.push('bebida bebidas tomar beber fresco cafe coctel');
    }

    if (text.includes('ensalada') || text.includes('ceviche') || text.includes('natural')) {
      words.push('liviano ligero fresco');
    }

    if (text.includes('jalapena')) {
      words.push('picante');
    }

    return words.join(' ');
  }

  private extractMaxPrice(term: string): number | null {
    if (
      !term.includes('menos') &&
      !term.includes('barato') &&
      !term.includes('economico') &&
      !term.includes('económico')
    ) {
      return null;
    }

    const match = term.match(/\d+/);

    if (!match) {
      return 5000;
    }

    return Number(match[0]);
  }

  private extractPriceFromText(value: string): number {
    const numericValue = value.replace(/[^\d]/g, '');
    return Number(numericValue || 0);
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’']/g, '')
      .replace(/[₡,]/g, '')
      .trim();
  }

  private scrollSectionIntoView(section: string): void {
    window.setTimeout(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('.menu-category')
      );

      const targetSection = sections.find((menuSection) => {
        const categoryButton =
          menuSection.querySelector<HTMLButtonElement>('.category-badge');

        return categoryButton?.textContent
          ?.trim()
          .toLowerCase()
          .includes(this.getSectionLabel(section));
      });

      const fallbackTarget = document.querySelector<HTMLElement>(
        `.menu-category.is-open`
      );

      const target = targetSection || fallbackTarget;

      target?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }, 120);
  }

  private getSectionLabel(section: string): string {
    const sectionLabels: Record<string, string> = {
      tacos: 'tacos',
      fastFood: 'entradas',
      especiales: 'especiales',
      platosFuertes: 'platos fuertes',
      arroces: 'arroces',
      hamburguesas: 'hamburguesas',
      postres: 'postres',
      bebidas: 'bebidas',
    };

    return sectionLabels[section] ?? section.toLowerCase();
  }

  private buildWhatsAppUrl(): string {
    const orderLines = this.cart
      .map((item) => {
        const itemFoodTotal = item.price * item.quantity;
        const itemPackagingTotal =
          this.getPackagingFeeForItem(item.name) * item.quantity;

        return (
          `• ${item.quantity} x ${item.name} - ${this.formatPrice(itemFoodTotal)}` +
          `\n  Empaque: ${this.formatPrice(itemPackagingTotal)}`
        );
      })
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
      `Subtotal comida: ${this.formatPrice(this.foodTotal)}\n` +
      `Empaque: ${this.formatPrice(this.packagingTotal)}\n` +
      `Total: ${this.formatPrice(this.total)}`;

    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
  }

  private redirectToWhatsApp(
    whatsappUrl: string,
    whatsappWindow: Window | null
  ): void {
    if (whatsappWindow && !whatsappWindow.closed) {
      whatsappWindow.location.href = whatsappUrl;
      return;
    }

    window.location.href = whatsappUrl;
  }
}