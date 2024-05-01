import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SolverStateService } from '../../services/solver/solver-state.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-show-solutions-button',
  standalone: true,
  imports: [MatTooltipModule, MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './show-solutions-button.component.html',
  styleUrl: './show-solutions-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowSolutionsButtonComponent {
  icon = 'done_all';
  tooltipMsg = 'Show solutions';
  hasNewSolution = signal<boolean>(false);
  private state = inject(SolverStateService);

  constructor() {
    this.state.problemSolved$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.hasNewSolution.set(true);
    });
  }

  onClick() {
    if (!(this.hasNewSolution() && this.state.showSolutions())) {
      this.state.toggleShowSolutions();
    }
    this.hasNewSolution.set(false);
  }
}
