import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { NavbarComponent } from '../../components/navbar/navbar';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, CommonModule],
  templateUrl: './main-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  layoutService = inject(LayoutService);
}
