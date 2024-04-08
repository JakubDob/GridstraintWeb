import { Component } from '@angular/core';
import { ConstraintSolutionTabComponent } from '../../constraint-solution-tab/constraint-solution-tab.component';
import { OptionsComponent } from '../../options/options.component';
import { ToolbarComponent } from '../../toolbar/toolbar.component';
import { SolverGridComponent } from '../solver-grid/solver-grid.component';

@Component({
  selector: 'app-solver-manager',
  standalone: true,
  imports: [
    SolverGridComponent,
    ToolbarComponent,
    OptionsComponent,
    ConstraintSolutionTabComponent,
  ],
  templateUrl: './solver-manager.component.html',
  styleUrl: './solver-manager.component.scss',
})
export class SolverManagerComponent {}
