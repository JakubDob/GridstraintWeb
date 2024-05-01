import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SolverStateService } from '../../services/solver/solver-state.service';

@Component({
  selector: 'app-options-sidenav-button',
  standalone: true,
  imports: [MatTooltipModule, MatIconModule, MatButtonModule],
  templateUrl: './options-sidenav-button.component.html',
  styleUrl: './options-sidenav-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsSidenavButtonComponent {
  tooltipMsg = 'Options';
  icon = 'menu';
  private state = inject(SolverStateService);
  onClick() {
    this.state.optionsSidenavOpened.update((v) => !v);
  }
}
