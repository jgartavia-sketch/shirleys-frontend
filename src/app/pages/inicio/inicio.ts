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

  sendMockQr(name: string, email: string, whatsapp: string): void {
    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      this.popupMessage =
        'Por favor complete nombre, correo y WhatsApp para generar su QR.';
      this.showQrPopup = true;
      return;
    }

    this.popupMessage =
      'Registro exitoso. Su QR de Shirley’s Customers fue enviado al correo: ' +
      email;

    this.showQrPopup = true;
  }

  closeQrPopup(): void {
    this.showQrPopup = false;
  }
}