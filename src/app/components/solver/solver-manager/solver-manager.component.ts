import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { SolverConstraintManagerComponent } from '../solver-constraint-manager/solver-constraint-manager.component';
import { SolverGridActionsComponent } from '../solver-grid-actions/solver-grid-actions.component';
import { SolverGridComponent } from '../solver-grid/solver-grid.component';
import { SolverSolutionManagerComponent } from '../solver-solution-manager/solver-solution-manager.component';
import { SolverSolutionOptionsComponent } from '../solver-solution-options/solver-solution-options.component';
import { SolverValueOptionsComponent } from '../solver-value-options/solver-value-options.component';

@Component({
  selector: 'app-solver-manager',
  standalone: true,
  imports: [
    SolverGridComponent,
    SolverGridActionsComponent,
    SolverValueOptionsComponent,
    SolverSolutionOptionsComponent,
    SolverConstraintManagerComponent,
    SolverSolutionManagerComponent,
    MatCard,
    MatCardHeader,
    MatCardContent,
  ],
  templateUrl: './solver-manager.component.html',
  styleUrl: './solver-manager.component.scss',
})
export class SolverManagerComponent {}
