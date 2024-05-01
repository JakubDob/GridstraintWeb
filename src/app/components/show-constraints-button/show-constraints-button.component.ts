import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SolverStateService } from '../../services/solver/solver-state.service';

@Component({
  selector: 'app-show-constraints-button',
  standalone: true,
  imports: [MatTooltipModule, MatIconModule, MatButtonModule],
  templateUrl: './show-constraints-button.component.html',
  styleUrl: './show-constraints-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowConstraintsButtonComponent {
  icon = 'view_compact';
  tooltipMsg = 'Show constraints';
  private state = inject(SolverStateService);

  onClick() {
    this.state.toggleShowConstraints();
  }
}
