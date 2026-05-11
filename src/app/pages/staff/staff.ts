import { Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';

interface Customer {
  code: string;
  name: string;
  email: string;
  whatsapp: string;
  points: number;
}

interface CustomerResponse {
  customer: Customer;
}

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './staff.html',
  styleUrls: ['./staff.css']
})
export class Staff implements OnDestroy {
  @ViewChild('qrVideo') qrVideo?: ElementRef<HTMLVideoElement>;

  customerCode = '';
  loading = false;
  error = false;
  scanning = false;
  scannerMessage = '';

  customer: Customer | null = null;

  private readonly apiUrl = 'http://127.0.0.1:8000/api/customers';

  private qrReader = new BrowserQRCodeReader();
  private scannerControls?: IScannerControls;
  private qrAlreadyProcessed = false;

  constructor(
    private http: HttpClient,
    private zone: NgZone
  ) {}

  searchCustomer(): void {
    const cleanCode = this.customerCode.trim();

    if (!cleanCode || this.loading) {
      return;
    }

    this.loading = true;
    this.error = false;
    this.customer = null;

    const url = `${this.apiUrl}/${cleanCode}`;

    console.log('Buscando cliente:', url);

    this.http.get<CustomerResponse>(url).subscribe({
      next: (response) => {
        this.zone.run(() => {
          console.log('Cliente encontrado:', response);

          this.customer = response.customer;
          this.customerCode = response.customer.code;

          this.loading = false;
          this.error = false;
        });
      },

      error: (error) => {
        this.zone.run(() => {
          console.error('Error buscando cliente:', error);

          this.loading = false;
          this.error = true;
          this.customer = null;
        });
      }
    });
  }

  async startQrScanner(): Promise<void> {
    this.error = false;
    this.customer = null;
    this.qrAlreadyProcessed = false;
    this.scannerMessage = 'Activando cámara...';
    this.scanning = true;

    setTimeout(async () => {
      try {
        if (!this.qrVideo?.nativeElement) {
          this.scannerMessage = 'No se encontró el visor de cámara.';
          this.scanning = false;
          return;
        }

        this.scannerControls = await this.qrReader.decodeFromVideoDevice(
          undefined,
          this.qrVideo.nativeElement,
          (result) => {
            if (!result || this.qrAlreadyProcessed) {
              return;
            }

            const qrText = result.getText();
            const extractedCode = this.extractCustomerCode(qrText);

            if (!extractedCode) {
              this.zone.run(() => {
                this.scannerMessage = 'QR leído, pero no contiene un código válido.';
              });
              return;
            }

            this.qrAlreadyProcessed = true;

            this.zone.run(() => {
              this.customerCode = extractedCode;
              this.scannerMessage = 'QR leído correctamente.';
              this.stopQrScanner();
              this.searchCustomer();
            });
          }
        );

        this.scannerMessage = 'Apunta la cámara al QR del cliente.';
      } catch (error) {
        this.zone.run(() => {
          console.error('Error iniciando lector QR:', error);
          this.scannerMessage = 'No se pudo activar la cámara. Revisa permisos del navegador.';
          this.scanning = false;
        });
      }
    }, 100);
  }

  stopQrScanner(): void {
    if (this.scannerControls) {
      this.scannerControls.stop();
      this.scannerControls = undefined;
    }

    this.scanning = false;
  }

  private extractCustomerCode(qrText: string): string | null {
    const match = qrText.match(/SHR-\d+/i);
    return match ? match[0].toUpperCase() : null;
  }

  ngOnDestroy(): void {
    this.stopQrScanner();
  }
}