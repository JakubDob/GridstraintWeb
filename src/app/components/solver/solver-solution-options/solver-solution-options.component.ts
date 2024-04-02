import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MiniZincService } from '../../../services/solver/minizinc.service';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import {
  Solution,
  SolvedProblemInstance,
  SolverConstraint,
  SolvingMethod,
} from '../../../types/solver-types';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private solver = inject(MiniZincService);
  private snackbar = inject(MatSnackBar);

  private currentProblemInstance: SolvedProblemInstance | null = null;
  private currentSolutions: Solution[] = [];
  private optimizationSolutionJson: { [variable: string]: any } | null = null;

  isRunning = this.solver.isRunning;

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

  onClickSolve() {
    const code = this.solverState.getSolverCode();
    const started = this.solver.solve(
      code,
      (solution) => {
        if (solution.output.json) {
          if (this.selectedSolvingMethod === SolvingMethod.SATISFY) {
            this.handleSolutionJson(solution.output.json);
          } else {
            this.optimizationSolutionJson = solution.output.json;
          }
        }
      },
      (result) => {
        if (this.optimizationSolutionJson) {
          this.handleSolutionJson(this.optimizationSolutionJson);
        }
        this.snackbar.open(`${this.problemName}: ${result.status}`, undefined, {
          duration: 5000,
        });
      },
      (exit) => {},
      { 'all-solutions': this.allSolutions, 'time-limit': this.timeout * 1000 }
    );
    if (started) {
      this.currentProblemInstance = null;
      this.optimizationSolutionJson = null;
    }
  }

  onClickCancel() {
    this.solver.cancel();
  }

  formatTimeoutLabel(value: number) {
    if (value >= 60) {
      return `${Math.round(value / 60)}m${value % 60}s`;
    }
    return `${value}s`;
  }

  private handleSolutionJson(solutionJson: { [variable: string]: any }) {
    if (this.currentProblemInstance === null) {
      this.currentSolutions = [];
      this.currentProblemInstance = {
        name: this.problemName,
        solutions: this.currentSolutions,
      };
      this.solverState.addSolvedProblemInstance(this.currentProblemInstance);
    }
    const indices = solutionJson[SolverConstraint.gridVarName] as number[];
    this.currentSolutions.push({
      name: `Solution ${this.currentSolutions.length + 1}`,
      parent: this.currentProblemInstance,
      values: indices.map((i) => i.toString()),
    });
  }
}
