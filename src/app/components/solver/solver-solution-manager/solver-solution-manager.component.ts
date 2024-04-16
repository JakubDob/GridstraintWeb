import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { Solution, SolvedProblemInstance } from '../../../types/solver-types';

@Component({
  selector: 'app-solver-solution-manager',
  standalone: true,
  imports: [MatExpansionModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './solver-solution-manager.component.html',
  styleUrl: './solver-solution-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverSolutionManagerComponent {
  private solverState = inject(SolverStateService);
  private cdRef = inject(ChangeDetectorRef);

  problems = this.solverState.solvedProblemInstances;
  selectedSolution = new SelectionModel<Solution>();

  constructor() {
    this.solverState.activeSolution.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([_, current]) => {
        if (current === null) {
          this.selectedSolution.clear();
          this.cdRef.markForCheck();
        }
      });
  }

  onProblemClosed() {
    this.solverState.activeSolution.set(null);
  }

  onSolutionSelection(event: MatSelectionListChange) {
    this.selectedSolution.select(event.options[0].value);
    this.solverState.activeSolution.set(event.options[0].value);
  }

  onDeleteProblemClick(event: Event, problem: SolvedProblemInstance) {
    event.stopPropagation();
    this.solverState.deleteSolvedProblemInstance(problem);
  }

  onDeleteSolutionClick(event: Event, solution: Solution) {
    event.stopPropagation();
    this.solverState.deleteSolution(solution);
  }
}
