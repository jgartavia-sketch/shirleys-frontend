import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {

  openSections: Record<string, boolean> = {
    fastFood: true,
    hamburguesas: true,
    arroces: true,
    especiales: true,
    tacos: true,
    bebidas: true,
  };

  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];
  }
}