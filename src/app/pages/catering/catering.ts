import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CateringEvent {
  id: string;
  number: string;
  title: string;
  description: string;
}

interface CateringOption {
  id: string;
  label: string;
  category: string;
}

@Component({
  selector: 'app-catering',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catering.html',
  styleUrl: './catering.css',
})
export class Catering {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly apiUrl = 'http://localhost:3001/api/catering/quote';
  private readonly whatsappNumber = '50688335888';

  selectedEvent = 'baby-showers';
  loading = false;
  successMessage = '';
  errorMessage = '';

  selectedOptions: string[] = [];

  events: CateringEvent[] = [
    {
      id: 'baby-showers',
      number: '01',
      title: 'Baby Showers',
      description: 'Menús y presentación especial para celebrar momentos inolvidables.',
    },
    {
      id: 'cumpleanos',
      number: '02',
      title: 'Cumpleaños',
      description: 'Comida deliciosa y ambiente cálido para compartir con familia y amigos.',
    },
    {
      id: 'reuniones',
      number: '03',
      title: 'Reuniones',
      description: 'Opciones ideales para encuentros empresariales y sociales.',
    },
    {
      id: 'bodas-eventos',
      number: '04',
      title: 'Bodas & Eventos',
      description: 'Servicio elegante y personalizado para fechas especiales.',
    },
  ];

  quoteOptions: CateringOption[] = [
    { id: 'cafe-reposteria', label: 'Estación de café y repostería', category: 'Gastronomía' },
    { id: 'mesa-dulce', label: 'Mesa dulce', category: 'Gastronomía' },
    { id: 'plato-fuerte', label: 'Plato fuerte', category: 'Gastronomía' },
    { id: 'refrescos', label: 'Refrescos gaseosos por mesa', category: 'Gastronomía' },
    { id: 'rotafolio', label: 'Rotafolio', category: 'Montaje y detalles' },
    { id: 'espejo-bienvenida', label: 'Espejo de bienvenida', category: 'Montaje y detalles' },
    { id: 'alfombra-roja', label: 'Alfombra roja', category: 'Montaje y detalles' },
    { id: 'pergola-tunel', label: 'Pérgola túnel', category: 'Montaje y detalles' },
    { id: 'centros-mesa', label: 'Centros de mesa', category: 'Montaje y detalles' },
    { id: 'manteleria', label: 'Mantelería para mesas y sillas', category: 'Montaje y detalles' },
    { id: 'servilletas-tela', label: 'Servilletas de tela', category: 'Montaje y detalles' },
    { id: 'manteles', label: 'Manteles', category: 'Montaje y detalles' },
    { id: 'forros-silla', label: 'Forros de silla', category: 'Montaje y detalles' },
    { id: 'platos-base', label: 'Platos base', category: 'Montaje y detalles' },
    { id: 'numeros-mesa', label: 'Números de mesa', category: 'Montaje y detalles' },
    { id: 'cristaleria', label: 'Cristalería', category: 'Montaje y detalles' },
    { id: 'maestra-ceremonia', label: 'Maestra de ceremonia', category: 'Entretenimiento' },
    { id: 'truss', label: 'Truss', category: 'Entretenimiento' },
    { id: 'cabezas-moviles', label: 'Cabezas móviles', category: 'Entretenimiento' },
    { id: 'pantallas', label: 'Pantallas', category: 'Entretenimiento' },
    { id: 'audio-profesional', label: 'Audio profesional', category: 'Entretenimiento' },
    { id: 'dj', label: 'DJ', category: 'Entretenimiento' },
    { id: 'maquina-humo', label: 'Máquina de humo', category: 'Entretenimiento' },
    { id: 'polvora-fria', label: 'Pólvora fría: 2 cañones con durabilidad de 45 segundos', category: 'Entretenimiento' },
    { id: 'comparsa', label: 'Comparsa', category: 'Extras premium' },
    { id: 'mesa-principal', label: 'Montaje de mesa principal con silla trono de lujo', category: 'Extras premium' },
    { id: 'set-fotografico', label: 'Montaje de set fotográfico con sillón tipo Aladino de lujo', category: 'Extras premium' },
    { id: 'baul-carino', label: 'Baúl para muestras de cariño', category: 'Extras premium' },
    { id: 'musica-vivo', label: 'Música en vivo', category: 'Extras premium' },
  ];

  get selectedEventName(): string {
    return this.events.find((event) => event.id === this.selectedEvent)?.title || '';
  }

  get selectedOptionLabels(): string[] {
    return this.quoteOptions
      .filter((option) => this.selectedOptions.includes(option.id))
      .map((option) => option.label);
  }

  selectEvent(eventId: string): void {
    this.selectedEvent = eventId;
    this.successMessage = '';
    this.errorMessage = '';
  }

  toggleOption(optionId: string): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.selectedOptions.includes(optionId)) {
      this.selectedOptions = this.selectedOptions.filter((id) => id !== optionId);
      return;
    }

    this.selectedOptions = [...this.selectedOptions, optionId];
  }

  isOptionSelected(optionId: string): boolean {
    return this.selectedOptions.includes(optionId);
  }

  async submitQuote(event: Event): Promise<void> {
    event.preventDefault();

    if (this.loading) return;

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const selectedItems = this.selectedOptionLabels;

    const payload = {
      event_type: this.selectedEventName,
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      whatsapp: String(formData.get('whatsapp') || '').trim(),
      event_date: String(formData.get('eventDate') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      quote_items: selectedItems,
    };

    this.successMessage = '';
    this.errorMessage = '';

    if (!payload.name || !payload.email || !payload.whatsapp || !payload.event_date) {
      this.errorMessage = 'Complete nombre, correo, WhatsApp y fecha del evento.';
      this.cdr.detectChanges();
      return;
    }

    if (!selectedItems.length) {
      this.errorMessage = 'Seleccione al menos una opción para cotizar.';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.loading = true;
      this.cdr.detectChanges();

      await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      const whatsappMessage = this.buildWhatsappMessage(payload);
      const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      window.open(whatsappUrl, '_blank');

      form.reset();
      this.selectedEvent = 'baby-showers';
      this.selectedOptions = [];
      this.successMessage = 'Solicitud preparada correctamente. WhatsApp se abrirá para enviar la cotización.';
    } catch {
      this.errorMessage = 'No se pudo preparar la solicitud. Intente nuevamente.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private buildWhatsappMessage(payload: {
    event_type: string;
    name: string;
    email: string;
    whatsapp: string;
    event_date: string;
    message: string;
    quote_items: string[];
  }): string {
    const items = payload.quote_items.map((item) => `- ${item}`).join('\n');

    return `Hola Shirley's, quiero solicitar una cotización de catering.

Tipo de evento: ${payload.event_type}
Nombre: ${payload.name}
Correo: ${payload.email}
WhatsApp: ${payload.whatsapp}
Fecha del evento: ${payload.event_date}

Cosas que me llaman la atención cotizar:
${items}

Detalles adicionales:
${payload.message || 'Sin detalles adicionales por el momento.'}`;
  }
}