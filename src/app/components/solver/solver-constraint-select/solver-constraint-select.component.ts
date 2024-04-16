import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ConstraintProviderService } from '../../../services/constraint/constraint-provider.service';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { GridConstraint } from '../../../types/solver-types';

@Component({
  selector: 'app-solver-constraint-select',
  standalone: true,
  imports: [MatSelectModule, MatIconModule, MatButtonModule],
  templateUrl: './solver-constraint-select.component.html',
  styleUrl: './solver-constraint-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverConstraintSelectComponent {
  private solverState = inject(SolverStateService);
  private constraintProvider = inject(ConstraintProviderService);
  private dialog: MatDialog = inject(MatDialog);

  selectedConstraint: GridConstraint | null = null;
  constraints = this.solverState.constraints;

  constructor() {
    this.solverState.activeConstraint.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([_, curr]) => {
        this.selectedConstraint = curr;
      });
  }
  onConstraintSelectionChange() {
    if (this.selectedConstraint) {
      this.solverState.activeConstraint.set(this.selectedConstraint.name);
    }
  }

  onAddViewToSelectedConstraintClick(event: Event) {
    event.stopPropagation();
    const constraintName = this.solverState.activeConstraint.value()?.name;
    if (constraintName) {
      const details = this.constraintProvider.get(constraintName);
      if (details) {
        if (details.hasSettings) {
          this.dialog
            .open(details.constraint)
            .afterClosed()
            .subscribe((settings?: ReadonlyMap<string, string>) => {
              if (settings) {
                this.solverState.addNewViewToActiveConstraint(settings);
              }
            });
        } else {
          this.solverState.addNewViewToActiveConstraint();
        }
      }
    }
  }

  onClearConstraintClick(event: Event, constraint: GridConstraint) {
    event.stopPropagation();
    this.solverState.clearConstraintViews(constraint);
  }
}
