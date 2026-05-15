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
  selectedEvent = 'baby-showers';

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
  }

  submitQuote(event: Event): void {
    event.preventDefault();

    alert(
      `Solicitud registrada para: ${this.selectedEventName}\n\nPronto conectaremos este formulario al backend.`
    );
  }
}