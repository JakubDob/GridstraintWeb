import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject } from '@angular/core';
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
})
export class SolverSolutionManagerComponent {
  private solverState = inject(SolverStateService);

  problems = this.solverState.getSolvedProblemInstances();
  selectedProblem?: SolvedProblemInstance;
  selectedSolution = new SelectionModel<Solution>();

  constructor() {
    this.solverState.activeSolutionChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((change) => {
        if (change.current === null) {
          this.selectedSolution.clear();
        }
      });
  }

  onProblemClosed() {
    this.solverState.setActiveSolution(null);
  }

  onSolutionSelection(event: MatSelectionListChange) {
    this.selectedSolution.select(event.options[0].value);
    this.solverState.setActiveSolution(event.options[0].value);
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
