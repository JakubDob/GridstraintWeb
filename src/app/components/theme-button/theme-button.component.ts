import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-theme-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './theme-button.component.html',
  styleUrl: './theme-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeButtonComponent {
  private doc = inject(DOCUMENT);

  @Input() lightIcon = 'light_mode';
  @Input() darkIcon = 'dark_mode';

  darkMode = signal<boolean>(false);
  tooltipMsg = computed(() =>
    this.darkMode() ? 'Change to light mode' : 'Change to dark mode'
  );

  onClick() {
    this.darkMode()
      ? this.doc.body.classList.remove('dark-theme')
      : this.doc.body.classList.add('dark-theme');
    this.darkMode.update((value) => !value);
  }
}
