import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CateringEvent {
  id: string;
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-catering',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catering.html',
  styleUrl: './catering.css',
})
export class Catering {
  private readonly apiUrl = 'http://localhost:3001/api/catering/quote';

  selectedEvent = 'baby-showers';
  loading = false;
  successMessage = '';
  errorMessage = '';

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

  get selectedEventName(): string {
    return this.events.find((event) => event.id === this.selectedEvent)?.title || '';
  }

  selectEvent(eventId: string): void {
    this.selectedEvent = eventId;
    this.successMessage = '';
    this.errorMessage = '';
  }

  async submitQuote(event: Event): Promise<void> {
    event.preventDefault();

    if (this.loading) return;

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
      event_type: this.selectedEventName,
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      whatsapp: String(formData.get('whatsapp') || '').trim(),
      event_date: String(formData.get('eventDate') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };

    this.successMessage = '';
    this.errorMessage = '';

    if (!payload.name || !payload.email || !payload.whatsapp || !payload.event_date) {
      this.errorMessage = 'Complete nombre, correo, WhatsApp y fecha del evento.';
      return;
    }

    try {
      this.loading = true;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'No se pudo enviar la solicitud.');
      }

      this.successMessage =
        'Solicitud enviada correctamente. Shirley’s le contactará pronto por WhatsApp.';

      form.reset();
      this.selectedEvent = 'baby-showers';
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No se pudo enviar la solicitud. Intente nuevamente.';
    } finally {
      this.loading = false;
    }
  }
}