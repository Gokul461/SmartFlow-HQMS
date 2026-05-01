import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(false);

  constructor() {
    this.setDark(localStorage.getItem('theme') === 'dark');
  }

  toggle() {
    this.setDark(!this.isDark());
  }

  setDark(dark: boolean) {
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
}
