import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { take } from 'rxjs';
import { MiniZincService } from '../../../services/solver/minizinc.service';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { SolvingMethod, SupportedSolver } from '../../../types/solver-types';

@Component({
  selector: 'app-solver-solution-options',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSliderModule,
    MatInputModule,
  ],
  templateUrl: './solver-solution-options.component.html',
  styleUrl: './solver-solution-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverSolutionOptionsComponent {
  private solverState = inject(SolverStateService);
  private solverService = inject(MiniZincService);

  solvingMethodsIter = SolvingMethod;
  selectedSolvingMethod = this.solverState.solvingMethod();
  allSolutions = this.solverState.findAllSolutions();
  colorSolutions = this.solverState.colorSolutions.value();
  timeout = this.solverState.timeout();
  problemName = this.solverState.problemName();
  selectedSolver?: SupportedSolver;
  supportedSolvers$ = this.solverService.supportedSolvers$;

  constructor() {
    this.solverService.defaultSolver$.pipe(take(1)).subscribe((solver) => {
      if (!this.selectedSolver) {
        this.selectedSolver = solver;
        this.solverState.currentSolver.set(solver);
      }
    });
  }

  onChangedSolver(value: SupportedSolver) {
    this.solverState.currentSolver.set(value);
  }

  onChangedSolvingMethod(value: SolvingMethod) {
    this.solverState.solvingMethod.set(value);
  }

  onChangedAllSolutions(value: boolean) {
    this.solverState.findAllSolutions.set(value);
  }

  onChangedColorSolutions(value: boolean) {
    this.solverState.colorSolutions.set(value);
  }

  onChangedTimeout(value: number) {
    this.solverState.timeout.set(value);
  }

  onChangedProblemName(value: string) {
    this.solverState.problemName.set(value);
  }

  formatTimeoutLabel(value: number) {
    if (value >= 60) {
      return `${Math.round(value / 60)}m${value % 60}s`;
    }
    return `${value}s`;
  }
}
