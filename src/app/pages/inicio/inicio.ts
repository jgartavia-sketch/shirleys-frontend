import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

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
      this.popupMessage =
        'Por favor complete nombre, correo y WhatsApp para generar su QR.';
      this.showQrPopup = true;
      this.cdr.detectChanges();
      return;
    }

    this.isSendingQr = true;
    this.showQrPopup = false;
    this.cdr.detectChanges();

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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || 'No se pudo completar el registro.'
        );
      }

      this.popupMessage =
        `${data.message}. Código de cliente: ${data.customer.code}. ` +
        `Confirmación enviada al correo: ${data.customer.email}.`;

      this.showQrPopup = true;
    } catch (error) {
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