import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { SolvingMethod } from '../../../types/solver-types';

@Component({
  selector: 'app-solver-solution-options',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSliderModule,
    MatInputModule,
  ],
  templateUrl: './solver-solution-options.component.html',
  styleUrl: './solver-solution-options.component.scss',
})
export class SolverSolutionOptionsComponent {
  private solverState = inject(SolverStateService);

  solvingMethodsIter = SolvingMethod;
  selectedSolvingMethod = this.solverState.solvingMethod();
  allSolutions = this.solverState.findAllSolutions();
  timeout = this.solverState.timeout();
  problemName = this.solverState.problemName();

  onChangedSolvingMethod(value: SolvingMethod) {
    this.solverState.setSolvingMethod(value);
  }

  onChangedAllSolutions(value: boolean) {
    this.solverState.setFindAllSolutions(value);
  }

  onChangedTimeout(value: number) {
    this.solverState.setTimeout(value);
  }

  onChangedProblemName(value: string) {
    this.solverState.setProblemName(value);
  }

  formatTimeoutLabel(value: number) {
    if (value >= 60) {
      return `${Math.round(value / 60)}m${value % 60}s`;
    }
    return `${value}s`;
  }
}
