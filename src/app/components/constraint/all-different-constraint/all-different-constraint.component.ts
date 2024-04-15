import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SolverConstraint } from '../../../types/solver-types';

@Component({
  selector: 'app-all-different-constraint',
  standalone: true,
  imports: [],
  templateUrl: './all-different-constraint.component.html',
  styleUrl: './all-different-constraint.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllDifferentConstraintComponent extends SolverConstraint {
  static toSolverCode(
    indices: ReadonlySet<number>,
    settings?: ReadonlyMap<string, string> | undefined
  ): string {
    SolverConstraint.gridVarName;
    return `constraint alldifferent(${SolverConstraint.wrapSetInBrackets(
      indices
    )});`;
  }

  static hasSettings(): boolean {
    return false;
  }
}
