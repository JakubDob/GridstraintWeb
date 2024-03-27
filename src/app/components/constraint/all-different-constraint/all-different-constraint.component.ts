import { Component } from '@angular/core';
import { SolverConstraint } from '../../../types/solver-types';

@Component({
  selector: 'app-all-different-constraint',
  standalone: true,
  imports: [],
  templateUrl: './all-different-constraint.component.html',
  styleUrl: './all-different-constraint.component.scss',
})
export class AllDifferentConstraintComponent implements SolverConstraint {
  static toSolverCode(
    cells: ReadonlySet<number>,
    settings?: ReadonlyMap<string, string> | undefined
  ): string {
    return 'not implemented alldifferent';
  }

  static hasSettings(): boolean {
    return false;
  }
}
