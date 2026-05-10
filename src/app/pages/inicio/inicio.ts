import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  showQrPopup = false;
  popupMessage = '';
  isSendingQr = false;

  async sendMockQr(
    name: string,
    email: string,
    whatsapp: string
  ): Promise<void> {

    // BLOQUEA DOBLE/TRIPLE CLICK
    if (this.isSendingQr) {
      return;
    }

    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      this.popupMessage =
        'Por favor complete nombre, correo y WhatsApp para generar su QR.';
      this.showQrPopup = true;
      return;
    }

    this.isSendingQr = true;

    try {
      const response = await fetch(
        'https://shirleys-backend.onrender.com/api/customers/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            whatsapp,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('No se pudo completar el registro.');
      }

      const data = await response.json();

      this.popupMessage =
        `${data.message}. Código de cliente: ${data.customer.code}. ` +
        `Confirmación enviada al correo: ${data.customer.email}.`;

      this.showQrPopup = true;

    } catch (error) {

      this.popupMessage =
        'No se pudo conectar con el backend. Verifique que Shirley’s Backend esté encendido.';

      this.showQrPopup = true;

    } finally {

      this.isSendingQr = false;

    }
  }

  closeQrPopup(): void {
    this.showQrPopup = false;
  }
}