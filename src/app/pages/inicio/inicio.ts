import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RegisterCustomerResponse {
  success: boolean;
  message?: string;
  detail?: string;
  customer_code?: string;
  email_sent?: boolean;
  customer_whatsapp_url?: string;
  shirleys_whatsapp_url?: string;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  private readonly cdr = inject(ChangeDetectorRef);

  showQrPopup = false;
  popupMessage = '';
  popupTitle = 'QR enviado exitosamente';
  isSendingQr = false;

  async sendMockQr(
    name: string,
    email: string,
    whatsapp: string
  ): Promise<void> {
    if (this.isSendingQr) {
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanWhatsapp = whatsapp.trim();

    if (!cleanName || !cleanEmail || !cleanWhatsapp) {
      this.popupTitle = 'Faltan datos';
      this.popupMessage =
        'Por favor complete nombre, correo y WhatsApp para generar su QR.';
      this.showQrPopup = true;
      this.cdr.detectChanges();
      return;
    }

    this.isSendingQr = true;
    this.showQrPopup = false;
    this.cdr.detectChanges();

    const customerWhatsappWindow = window.open('', '_blank');
    const shirleysWhatsappWindow = window.open('', '_blank');

    try {
      const response = await fetch(
        'https://shirleys-backend.onrender.com/api/customers/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            whatsapp: cleanWhatsapp,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as RegisterCustomerResponse | null;

      if (response.status === 409) {
        customerWhatsappWindow?.close();
        shirleysWhatsappWindow?.close();

        this.popupTitle = 'Cliente ya registrado';
        this.popupMessage =
          data?.detail ||
          'Este cliente ya está registrado. Use otro correo o consulte su tarjeta digital.';

        this.showQrPopup = true;
        return;
      }

      if (!response.ok || !data) {
        customerWhatsappWindow?.close();
        shirleysWhatsappWindow?.close();

        this.popupTitle = 'No se pudo completar el registro';
        this.popupMessage =
          data?.detail ||
          data?.message ||
          'No se pudo completar el registro.';

        this.showQrPopup = true;
        return;
      }

      if (data.customer_whatsapp_url && customerWhatsappWindow) {
        customerWhatsappWindow.location.href = data.customer_whatsapp_url;
      } else {
        customerWhatsappWindow?.close();
      }

      if (data.shirleys_whatsapp_url && shirleysWhatsappWindow) {
        shirleysWhatsappWindow.location.href = data.shirleys_whatsapp_url;
      } else {
        shirleysWhatsappWindow?.close();
      }

      this.popupTitle = 'QR enviado exitosamente';
      this.popupMessage =
        `${data.message || 'Cliente registrado correctamente.'} ` +
        `Código de cliente: ${data.customer_code}. ` +
        `También enviamos el QR al correo: ${cleanEmail}.`;

      this.showQrPopup = true;
    } catch (error) {
      customerWhatsappWindow?.close();
      shirleysWhatsappWindow?.close();

      this.popupTitle = 'Error de conexión';
      this.popupMessage =
        error instanceof Error
          ? error.message
          : 'No se pudo conectar con el backend. Verifique que Shirley’s Backend esté encendido.';

      this.showQrPopup = true;
    } finally {
      this.isSendingQr = false;
      this.cdr.detectChanges();
    }
  }

  closeQrPopup(): void {
    this.showQrPopup = false;
    this.cdr.detectChanges();
  }
}