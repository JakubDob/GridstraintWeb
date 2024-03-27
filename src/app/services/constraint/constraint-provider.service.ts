import { Injectable } from '@angular/core';
import { AllDifferentConstraintComponent } from '../../components/constraint/all-different-constraint/all-different-constraint.component';
import { CountConstraintComponent } from '../../components/constraint/count-constraint/count-constraint.component';
import { SolverConstraintDetails } from '../../types/solver-types';

@Injectable({
  providedIn: 'root',
})
export class ConstraintProviderService {
  private constraints: Map<string, SolverConstraintDetails>;

  constructor() {
    this.constraints = new Map([
      [
        'alldifferent',
        {
          constraint: AllDifferentConstraintComponent,
          hasSettings: AllDifferentConstraintComponent.hasSettings(),
          toSolverCode: AllDifferentConstraintComponent.toSolverCode,
        },
      ],
      [
        'count',
        {
          constraint: CountConstraintComponent,
          hasSettings: CountConstraintComponent.hasSettings(),
          toSolverCode: CountConstraintComponent.toSolverCode,
        },
      ],
    ]);
  }

  get(name: string): SolverConstraintDetails | undefined {
    return this.constraints.get(name);
  }

  getAll(): ReadonlyMap<string, SolverConstraintDetails> {
    return this.constraints;
  }
}
