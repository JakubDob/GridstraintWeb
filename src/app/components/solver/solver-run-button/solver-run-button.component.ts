import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MiniZincService } from '../../../services/solver/minizinc.service';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import {
  Solution,
  SolvedProblemInstance,
  SolverConstraint,
  SolvingMethod,
} from '../../../types/solver-types';

@Component({
  selector: 'app-solver-run-button',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './solver-run-button.component.html',
  styleUrl: './solver-run-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverRunButtonComponent {
  private currentProblemInstance: SolvedProblemInstance | null = null;
  private currentSolutions: Solution[] = [];
  private optimizationSolutionJson: { [variable: string]: any } | null = null;
  private solver = inject(MiniZincService);
  private snackbar = inject(MatSnackBar);
  private solverState = inject(SolverStateService);
  private solvingMethod = this.solverState.solvingMethod;
  private allSolutions = this.solverState.findAllSolutions;
  private timeout = this.solverState.timeout;
  isRunning = this.solver.isRunning;
  tooltipMsg = computed(() =>
    this.isRunning() ? 'Cancel solving' : 'Solve the current model'
  );

  @Input() runIcon: string = 'play_circle';
  @Input() stopIcon: string = 'cancel_circle';

  onClick() {
    if (this.isRunning()) {
      this.cancel();
    } else {
      this.solve(this.solverState.problemName());
    }
  }

  private handleSolutionJson(
    problemName: string,
    solutionJson: { [variable: string]: any }
  ) {
    if (this.currentProblemInstance === null) {
      this.currentSolutions = [];
      this.currentProblemInstance = {
        name: problemName,
        solutions: this.currentSolutions,
      };
      this.solverState.addSolvedProblemInstance(this.currentProblemInstance);
    }
    const indices = solutionJson[SolverConstraint.gridVarName] as number[];
    this.currentSolutions.push({
      name: `Solution ${this.currentSolutions.length + 1}`,
      parent: this.currentProblemInstance,
      stringValues: indices.map((i) => i.toString()),
      numberValues: indices,
    });
  }

  solve(problemName: string) {
    const code = this.solverState.getSolverCode();
    const started = this.solver.solve(
      code,
      (solution) => {
        if (solution.output.json) {
          if (this.solvingMethod() === SolvingMethod.SATISFY) {
            this.handleSolutionJson(problemName, solution.output.json);
          } else {
            this.optimizationSolutionJson = solution.output.json;
          }
        }
      },
      (result) => {
        if (this.optimizationSolutionJson) {
          this.handleSolutionJson(problemName, this.optimizationSolutionJson);
        }
        this.snackbar.open(`${problemName}: ${result.status}`, undefined, {
          duration: 5000,
        });
      },
      (exit) => {},
      {
        solver: this.solverState.currentSolver()?.internalName,
        'all-solutions': this.allSolutions(),
        'time-limit': this.timeout() * 1000,
      }
    );
    if (started) {
      this.currentProblemInstance = null;
      this.optimizationSolutionJson = null;
    }
  }

  cancel() {
    this.solver.cancel();
  }
}
