import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
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

interface PurchaseResponse {
  success: boolean;
  message: string;
  customer_code?: string;
  invoice_number?: string;
  amount?: number;
  points_earned?: number;
  total_points?: number;
  customer?: Customer;
  purchase?: {
    customer_code: string;
    invoice_number: string;
    amount: number;
    points_earned: number;
    created_at: string;
  };
}

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './staff.html',
  styleUrls: ['./staff.css']
})
export class Staff implements OnInit, OnDestroy {
  @ViewChild('qrVideo') qrVideo?: ElementRef<HTMLVideoElement>;

  customerCode = '';
  customerEmail = '';
  invoiceNumber = '';
  purchaseAmount: number | null = null;

  loading = false;
  purchaseLoading = false;
  error = false;
  errorMessage = '';
  purchaseError = '';
  purchaseSuccess = '';

  scanning = false;
  scannerMessage = '';

  customer: Customer | null = null;

  private readonly apiUrl = 'https://shirleys-backend.onrender.com/api/customers';

  private qrReader = new BrowserQRCodeReader();
  private scannerControls?: IScannerControls;
  private qrAlreadyProcessed = false;

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const staffToken = localStorage.getItem('shirleys_staff_token');

    if (!staffToken) {
      this.router.navigate(['/staff/login']);
    }
  }

  logout(): void {
    this.stopQrScanner();
    localStorage.removeItem('shirleys_staff_token');
    this.router.navigate(['/staff/login']);
  }

  searchCustomer(): void {
    const cleanCode = this.customerCode.trim();
    const cleanEmail = this.customerEmail.trim().toLowerCase();

    if (this.loading) {
      return;
    }

    if (!cleanCode && !cleanEmail) {
      this.error = true;
      this.errorMessage = 'Ingresa el código QR o el correo electrónico del cliente.';
      this.customer = null;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    this.purchaseError = '';
    this.purchaseSuccess = '';
    this.customer = null;
    this.cdr.detectChanges();

    const url = cleanCode
      ? `${this.apiUrl}/${encodeURIComponent(cleanCode)}`
      : `${this.apiUrl}/email/${encodeURIComponent(cleanEmail)}`;

    this.http.get<CustomerResponse>(url)
      .pipe(
        finalize(() => {
          this.zone.run(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (response) => {
          this.zone.run(() => {
            this.customer = response.customer;
            this.customerCode = response.customer.code;
            this.customerEmail = response.customer.email;
            this.error = false;
            this.errorMessage = '';
            this.cdr.detectChanges();
          });
        },

        error: (error) => {
          this.zone.run(() => {
            this.error = true;
            this.errorMessage =
              error?.error?.detail || 'No encontramos un cliente con esos datos.';
            this.customer = null;
            this.cdr.detectChanges();
          });
        }
      });
  }

  registerPurchase(): void {
    if (!this.customer) {
      this.purchaseError = 'Primero debes buscar o escanear un cliente.';
      this.cdr.detectChanges();
      return;
    }

    const cleanInvoice = this.invoiceNumber.trim();
    const amount = Number(this.purchaseAmount);

    if (!cleanInvoice) {
      this.purchaseError = 'Ingresa el número de factura.';
      this.cdr.detectChanges();
      return;
    }

    if (!amount || amount <= 0) {
      this.purchaseError = 'Ingresa un monto válido.';
      this.cdr.detectChanges();
      return;
    }

    const staffToken = localStorage.getItem('shirleys_staff_token');

    if (!staffToken) {
      this.purchaseError = 'Sesión vencida. Inicia sesión nuevamente.';
      this.router.navigate(['/staff/login']);
      this.cdr.detectChanges();
      return;
    }

    const headers = new HttpHeaders({
      'x-admin-token': staffToken
    });

    this.purchaseLoading = true;
    this.purchaseError = '';
    this.purchaseSuccess = '';
    this.cdr.detectChanges();

    this.http.post<PurchaseResponse>(
      `${this.apiUrl}/purchase`,
      {
        customer_code: this.customer.code,
        invoice_number: cleanInvoice,
        amount
      },
      { headers }
    )
      .pipe(
        finalize(() => {
          this.zone.run(() => {
            this.purchaseLoading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (response) => {
          this.zone.run(() => {
            const pointsEarned =
              response.points_earned ??
              response.purchase?.points_earned ??
              0;

            const totalPoints =
              response.total_points ??
              response.customer?.points ??
              this.customer!.points + pointsEarned;

            this.customer = {
              ...this.customer!,
              points: totalPoints
            };

            this.customerCode = this.customer.code;
            this.customerEmail = this.customer.email;
            this.purchaseSuccess = `Compra registrada. Se sumaron ${pointsEarned} puntos.`;
            this.invoiceNumber = '';
            this.purchaseAmount = null;

            this.cdr.detectChanges();
          });
        },

        error: (error) => {
          this.zone.run(() => {
            this.purchaseError =
              error?.error?.detail || 'No se pudo registrar la compra.';

            this.cdr.detectChanges();
          });
        }
      });
  }

  async startQrScanner(): Promise<void> {
    this.error = false;
    this.errorMessage = '';
    this.customer = null;
    this.customerEmail = '';
    this.qrAlreadyProcessed = false;
    this.scannerMessage = 'Activando cámara...';
    this.scanning = true;
    this.cdr.detectChanges();

    setTimeout(async () => {
      try {
        if (!this.qrVideo?.nativeElement) {
          this.zone.run(() => {
            this.scannerMessage = 'No se encontró el visor de cámara.';
            this.scanning = false;
            this.cdr.detectChanges();
          });
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
                this.cdr.detectChanges();
              });
              return;
            }

            this.qrAlreadyProcessed = true;

            this.zone.run(() => {
              this.customerCode = extractedCode;
              this.customerEmail = '';
              this.scannerMessage = 'QR leído correctamente.';
              this.stopQrScanner();
              this.searchCustomer();
              this.cdr.detectChanges();
            });
          }
        );

        this.zone.run(() => {
          this.scannerMessage = 'Apunta la cámara al QR del cliente.';
          this.cdr.detectChanges();
        });
      } catch {
        this.zone.run(() => {
          this.scannerMessage = 'No se pudo activar la cámara. Revisa permisos del navegador.';
          this.scanning = false;
          this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  private extractCustomerCode(qrText: string): string | null {
    const match = qrText.match(/SHR-\d+/i);
    return match ? match[0].toUpperCase() : null;
  }

  ngOnDestroy(): void {
    this.stopQrScanner();
  }
}