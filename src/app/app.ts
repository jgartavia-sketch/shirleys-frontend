import {
  AfterViewInit,
  Component,
  OnDestroy,
  signal
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly title = signal('Shirleys');

  private observer?: IntersectionObserver;
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initScrollAnimations();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => {
          this.initScrollAnimations();
        }, 80);
      });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.routerSubscription?.unsubscribe();
  }

  private initScrollAnimations(): void {
    this.observer?.disconnect();

    const animatedElements = document.querySelectorAll(
      `
      section,
      .hero-content,
      .customers-text,
      .customers-card,
      .point-card,
      .mock-phone,
      .info-card,
      .contact-card,
      .catering-text,
      .about-content,
      .premium-footer,
      .footer-column,
      .footer-brand
      `
    );

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -70px 0px'
      }
    );

    animatedElements.forEach(element => {
      element.classList.add('scroll-reveal');
      this.observer?.observe(element);
    });
  }
}