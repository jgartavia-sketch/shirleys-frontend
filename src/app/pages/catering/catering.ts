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

interface EventGroup {
  icon: string;
  title: string;
  items: CateringOption[];
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
  openEventGroup: string | null = null;

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

  eventGroups: EventGroup[] = [
    {
      icon: '🎉',
      title: 'Eventos Sociales',
      items: [
        { id: 'evento-bodas', label: 'Bodas', category: 'Eventos Sociales' },
        { id: 'evento-bodas-civiles', label: 'Bodas civiles', category: 'Eventos Sociales' },
        { id: 'evento-recepciones-boda', label: 'Recepciones de boda', category: 'Eventos Sociales' },
        { id: 'evento-aniversarios-matrimonio', label: 'Aniversarios de matrimonio', category: 'Eventos Sociales' },
        { id: 'evento-renovacion-votos', label: 'Renovación de votos', category: 'Eventos Sociales' },
        { id: 'evento-cumpleanos-infantiles', label: 'Cumpleaños infantiles', category: 'Eventos Sociales' },
        { id: 'evento-cumpleanos-adultos', label: 'Cumpleaños de adultos', category: 'Eventos Sociales' },
        { id: 'evento-fiestas-15', label: 'Fiestas de 15 años', category: 'Eventos Sociales' },
        { id: 'evento-sweet-sixteen', label: 'Sweet Sixteen', category: 'Eventos Sociales' },
        { id: 'evento-fiestas-18', label: 'Fiestas de 18 años', category: 'Eventos Sociales' },
        { id: 'evento-graduacion-social', label: 'Fiestas de graduación', category: 'Eventos Sociales' },
        { id: 'evento-baby-shower', label: 'Baby Shower', category: 'Eventos Sociales' },
        { id: 'evento-gender-reveal', label: 'Gender Reveal', category: 'Eventos Sociales' },
        { id: 'evento-te-canastilla', label: 'Té de canastilla', category: 'Eventos Sociales' },
        { id: 'evento-primera-comunion-social', label: 'Primera comunión', category: 'Eventos Sociales' },
        { id: 'evento-bautizos-social', label: 'Bautizos', category: 'Eventos Sociales' },
        { id: 'evento-confirmaciones-social', label: 'Confirmaciones', category: 'Eventos Sociales' },
        { id: 'evento-despedida-soltera', label: 'Despedidas de soltera', category: 'Eventos Sociales' },
        { id: 'evento-despedida-soltero', label: 'Despedidas de soltero', category: 'Eventos Sociales' },
        { id: 'evento-reuniones-familiares', label: 'Reuniones familiares', category: 'Eventos Sociales' },
        { id: 'evento-reencuentros-familiares', label: 'Reencuentros familiares', category: 'Eventos Sociales' },
        { id: 'evento-fiestas-privadas', label: 'Fiestas privadas', category: 'Eventos Sociales' },
        { id: 'evento-jubilacion', label: 'Celebraciones de jubilación', category: 'Eventos Sociales' },
        { id: 'evento-fiestas-tematicas', label: 'Fiestas temáticas', category: 'Eventos Sociales' },
        { id: 'evento-pool-parties', label: 'Pool parties', category: 'Eventos Sociales' },
        { id: 'evento-fiestas-quintas', label: 'Fiestas en quintas', category: 'Eventos Sociales' },
        { id: 'evento-logros-personales', label: 'Celebraciones de logros personales', category: 'Eventos Sociales' },
      ],
    },
    {
      icon: '🏢',
      title: 'Eventos Corporativos',
      items: [
        { id: 'evento-inauguraciones', label: 'Inauguraciones', category: 'Eventos Corporativos' },
        { id: 'evento-lanzamientos-productos', label: 'Lanzamientos de productos', category: 'Eventos Corporativos' },
        { id: 'evento-conferencias', label: 'Conferencias', category: 'Eventos Corporativos' },
        { id: 'evento-congresos', label: 'Congresos', category: 'Eventos Corporativos' },
        { id: 'evento-seminarios', label: 'Seminarios', category: 'Eventos Corporativos' },
        { id: 'evento-capacitaciones', label: 'Capacitaciones', category: 'Eventos Corporativos' },
        { id: 'evento-talleres-empresariales', label: 'Talleres empresariales', category: 'Eventos Corporativos' },
        { id: 'evento-convenciones', label: 'Convenciones', category: 'Eventos Corporativos' },
        { id: 'evento-junta-directiva', label: 'Reuniones de junta directiva', category: 'Eventos Corporativos' },
        { id: 'evento-asambleas-accionistas', label: 'Asambleas de accionistas', category: 'Eventos Corporativos' },
        { id: 'evento-desayunos-ejecutivos', label: 'Desayunos ejecutivos', category: 'Eventos Corporativos' },
        { id: 'evento-almuerzos-corporativos', label: 'Almuerzos corporativos', category: 'Eventos Corporativos' },
        { id: 'evento-cenas-empresariales', label: 'Cenas empresariales', category: 'Eventos Corporativos' },
        { id: 'evento-networking', label: 'Eventos de networking', category: 'Eventos Corporativos' },
        { id: 'evento-ferias-comerciales', label: 'Ferias comerciales', category: 'Eventos Corporativos' },
        { id: 'evento-exposiciones-empresariales', label: 'Exposiciones empresariales', category: 'Eventos Corporativos' },
        { id: 'evento-integracion', label: 'Actividades de integración', category: 'Eventos Corporativos' },
        { id: 'evento-team-building', label: 'Team building', category: 'Eventos Corporativos' },
        { id: 'evento-aniversario-empresarial', label: 'Celebraciones de aniversario empresarial', category: 'Eventos Corporativos' },
        { id: 'evento-fin-ano', label: 'Fiestas de fin de año', category: 'Eventos Corporativos' },
        { id: 'evento-metas-alcanzadas', label: 'Celebraciones de metas alcanzadas', category: 'Eventos Corporativos' },
        { id: 'evento-reconocimientos-colaboradores', label: 'Reconocimientos a colaboradores', category: 'Eventos Corporativos' },
        { id: 'evento-open-house', label: 'Open House empresariales', category: 'Eventos Corporativos' },
      ],
    },
    {
      icon: '🎓',
      title: 'Eventos Educativos',
      items: [
        { id: 'evento-graduaciones-educativas', label: 'Graduaciones', category: 'Eventos Educativos' },
        { id: 'evento-actos-clausura', label: 'Actos de clausura', category: 'Eventos Educativos' },
        { id: 'evento-ferias-educativas', label: 'Ferias educativas', category: 'Eventos Educativos' },
        { id: 'evento-congresos-estudiantiles', label: 'Congresos estudiantiles', category: 'Eventos Educativos' },
        { id: 'evento-actividades-universitarias', label: 'Actividades universitarias', category: 'Eventos Educativos' },
        { id: 'evento-conferencias-academicas', label: 'Conferencias académicas', category: 'Eventos Educativos' },
        { id: 'evento-jornadas-estudiantiles', label: 'Jornadas estudiantiles', category: 'Eventos Educativos' },
        { id: 'evento-olimpiadas-academicas', label: 'Olimpiadas académicas', category: 'Eventos Educativos' },
        { id: 'evento-colegios-escuelas', label: 'Actividades de colegios y escuelas', category: 'Eventos Educativos' },
      ],
    },
    {
      icon: '⛪',
      title: 'Eventos Religiosos',
      items: [
        { id: 'evento-bautizos-religiosos', label: 'Bautizos', category: 'Eventos Religiosos' },
        { id: 'evento-primeras-comuniones-religiosas', label: 'Primeras comuniones', category: 'Eventos Religiosos' },
        { id: 'evento-confirmaciones-religiosas', label: 'Confirmaciones', category: 'Eventos Religiosos' },
        { id: 'evento-retiros-espirituales', label: 'Retiros espirituales', category: 'Eventos Religiosos' },
        { id: 'evento-encuentros-religiosos', label: 'Encuentros religiosos', category: 'Eventos Religiosos' },
        { id: 'evento-actividades-parroquiales', label: 'Actividades parroquiales', category: 'Eventos Religiosos' },
        { id: 'evento-convivencias-religiosas', label: 'Convivencias religiosas', category: 'Eventos Religiosos' },
        { id: 'evento-celebraciones-patronales', label: 'Celebraciones patronales', category: 'Eventos Religiosos' },
      ],
    },
    {
      icon: '⚽',
      title: 'Eventos Deportivos',
      items: [
        { id: 'evento-torneos-deportivos', label: 'Torneos deportivos', category: 'Eventos Deportivos' },
        { id: 'evento-campeonatos', label: 'Campeonatos', category: 'Eventos Deportivos' },
        { id: 'evento-carreras-atleticas', label: 'Carreras atléticas', category: 'Eventos Deportivos' },
        { id: 'evento-triatlones', label: 'Triatlones', category: 'Eventos Deportivos' },
        { id: 'evento-ciclismo', label: 'Ciclismo', category: 'Eventos Deportivos' },
        { id: 'evento-gimnasios', label: 'Eventos de gimnasios', category: 'Eventos Deportivos' },
        { id: 'evento-premiaciones-deportivas', label: 'Premiaciones deportivas', category: 'Eventos Deportivos' },
        { id: 'evento-actividades-recreativas', label: 'Actividades recreativas', category: 'Eventos Deportivos' },
        { id: 'evento-torneos-empresariales', label: 'Torneos empresariales', category: 'Eventos Deportivos' },
      ],
    },
    {
      icon: '🎵',
      title: 'Eventos de Entretenimiento',
      items: [
        { id: 'evento-conciertos', label: 'Conciertos', category: 'Eventos de Entretenimiento' },
        { id: 'evento-festivales', label: 'Festivales', category: 'Eventos de Entretenimiento' },
        { id: 'evento-musica-electronica', label: 'Eventos de música electrónica', category: 'Eventos de Entretenimiento' },
        { id: 'evento-culturales', label: 'Eventos culturales', category: 'Eventos de Entretenimiento' },
        { id: 'evento-presentaciones-artisticas', label: 'Presentaciones artísticas', category: 'Eventos de Entretenimiento' },
        { id: 'evento-obras-teatro', label: 'Obras de teatro', category: 'Eventos de Entretenimiento' },
        { id: 'evento-dj', label: 'Eventos de DJ', category: 'Eventos de Entretenimiento' },
        { id: 'evento-activaciones-marca', label: 'Activaciones de marca', category: 'Eventos de Entretenimiento' },
        { id: 'evento-gastronomicos', label: 'Eventos gastronómicos', category: 'Eventos de Entretenimiento' },
      ],
    },
    {
      icon: '🏛️',
      title: 'Eventos Institucionales y Públicos',
      items: [
        { id: 'evento-municipalidades', label: 'Municipalidades', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-asociaciones-desarrollo', label: 'Asociaciones de desarrollo', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-cooperativas', label: 'Cooperativas', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-instituciones-publicas', label: 'Instituciones públicas', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-universidades', label: 'Universidades', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-centros-educativos', label: 'Centros educativos', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-camaras-empresariales', label: 'Cámaras empresariales', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-fundaciones', label: 'Fundaciones', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-ong', label: 'ONG', category: 'Eventos Institucionales y Públicos' },
        { id: 'evento-actividades-comunales', label: 'Actividades comunales', category: 'Eventos Institucionales y Públicos' },
      ],
    },
    {
      icon: '🌾',
      title: 'Eventos Agroindustriales',
      items: [
        { id: 'evento-ferias-ganaderas', label: 'Ferias ganaderas', category: 'Eventos Agroindustriales' },
        { id: 'evento-ferias-agricolas', label: 'Ferias agrícolas', category: 'Eventos Agroindustriales' },
        { id: 'evento-exposiciones-agropecuarias', label: 'Exposiciones agropecuarias', category: 'Eventos Agroindustriales' },
        { id: 'evento-dias-campo', label: 'Días de campo', category: 'Eventos Agroindustriales' },
        { id: 'evento-lanzamiento-maquinaria', label: 'Lanzamiento de maquinaria', category: 'Eventos Agroindustriales' },
        { id: 'evento-productores', label: 'Eventos de productores', category: 'Eventos Agroindustriales' },
        { id: 'evento-cooperativas-agricolas', label: 'Actividades de cooperativas agrícolas', category: 'Eventos Agroindustriales' },
      ],
    },
    {
      icon: '🏗️',
      title: 'Eventos para Empresas y Construcción',
      items: [
        { id: 'evento-alimentacion-personal-proyectos', label: 'Alimentación de personal en proyectos', category: 'Eventos para Empresas y Construcción' },
        { id: 'evento-campamentos-obra', label: 'Campamentos de obra', category: 'Eventos para Empresas y Construcción' },
        { id: 'evento-inauguracion-proyectos', label: 'Inauguración de proyectos', category: 'Eventos para Empresas y Construcción' },
        { id: 'evento-entrega-obras', label: 'Entrega de obras', category: 'Eventos para Empresas y Construcción' },
        { id: 'evento-seguridad-ocupacional', label: 'Jornadas de seguridad ocupacional', category: 'Eventos para Empresas y Construcción' },
        { id: 'evento-contratistas', label: 'Actividades de contratistas', category: 'Eventos para Empresas y Construcción' },
        { id: 'evento-reuniones-produccion', label: 'Reuniones de producción', category: 'Eventos para Empresas y Construcción' },
        { id: 'evento-celebraciones-empresariales-construccion', label: 'Celebraciones empresariales', category: 'Eventos para Empresas y Construcción' },
      ],
    },
  ];

  quoteOptions: CateringOption[] = [
    { id: 'servicio-catering-buffet', label: 'Catering tradicional tipo buffet', category: 'Servicios Especiales' },
    { id: 'servicio-catering-premium', label: 'Catering premium', category: 'Servicios Especiales' },
    { id: 'servicio-estaciones-vivo', label: 'Estaciones gastronómicas en vivo', category: 'Servicios Especiales' },
    { id: 'servicio-tacos-birria-vivo', label: 'Tacos de birria en vivo', category: 'Servicios Especiales' },
    { id: 'servicio-parrilladas-vivo', label: 'Parrilladas en vivo', category: 'Servicios Especiales' },
    { id: 'servicio-coffee-break', label: 'Coffee break', category: 'Servicios Especiales' },
    { id: 'servicio-desayunos-corporativos', label: 'Desayunos corporativos', category: 'Servicios Especiales' },
    { id: 'servicio-brunch', label: 'Brunch', category: 'Servicios Especiales' },
    { id: 'servicio-almuerzos-ejecutivos', label: 'Almuerzos ejecutivos', category: 'Servicios Especiales' },
    { id: 'servicio-cenas-formales', label: 'Cenas formales', category: 'Servicios Especiales' },
    { id: 'servicio-bocadillos-canapes', label: 'Bocadillos y canapés', category: 'Servicios Especiales' },
    { id: 'servicio-mesa-postres', label: 'Mesa de postres', category: 'Servicios Especiales' },
    { id: 'servicio-barra-bebidas-sin-alcohol', label: 'Barra de bebidas sin alcohol', category: 'Servicios Especiales' },
    { id: 'servicio-saloneros', label: 'Servicio de saloneros', category: 'Servicios Especiales' },
    { id: 'servicio-menaje-cristaleria', label: 'Menaje y cristalería', category: 'Servicios Especiales' },
    { id: 'servicio-montaje-mobiliario', label: 'Montaje de mobiliario', category: 'Servicios Especiales' },
    { id: 'servicio-coordinacion-logistica', label: 'Coordinación logística del evento', category: 'Servicios Especiales' },

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
    const selectedEvents = this.selectedEventLabels;

    if (selectedEvents.length) {
      return selectedEvents.join(', ');
    }

    return this.events.find((event) => event.id === this.selectedEvent)?.title || 'Catering Service';
  }

  get selectedEventLabels(): string[] {
    return this.eventGroups
      .flatMap((group) => group.items)
      .filter((option) => this.selectedOptions.includes(option.id))
      .map((option) => option.label);
  }

  get selectedOptionLabels(): string[] {
    const selectedEventItems = this.eventGroups
      .flatMap((group) => group.items)
      .filter((option) => this.selectedOptions.includes(option.id))
      .map((option) => `${option.category}: ${option.label}`);

    const selectedServiceItems = this.quoteOptions
      .filter((option) => this.selectedOptions.includes(option.id))
      .map((option) => `${option.category}: ${option.label}`);

    return [...selectedEventItems, ...selectedServiceItems];
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

  toggleEventGroup(groupTitle: string): void {
    this.openEventGroup = this.openEventGroup === groupTitle ? null : groupTitle;
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
      this.openEventGroup = null;
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

Opciones que me interesan cotizar:
${items}

Detalles adicionales:
${payload.message || 'Sin detalles adicionales por el momento.'}`;
  }
}