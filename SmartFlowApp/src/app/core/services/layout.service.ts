import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  collapsed = signal(false);
  mobileOpen = signal(false);

  toggleCollapse() { this.collapsed.update(v => !v); }
  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile() { this.mobileOpen.set(false); }
}
