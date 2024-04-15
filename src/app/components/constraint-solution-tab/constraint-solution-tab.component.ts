import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SolverConstraintManagerComponent } from '../solver/solver-constraint-manager/solver-constraint-manager.component';
import { SolverConstraintSelectComponent } from '../solver/solver-constraint-select/solver-constraint-select.component';
import { SolverSolutionManagerComponent } from '../solver/solver-solution-manager/solver-solution-manager.component';

@Component({
  selector: 'app-constraint-solution-tab',
  standalone: true,
  imports: [
    MatTabsModule,
    SolverConstraintManagerComponent,
    SolverSolutionManagerComponent,
    SolverConstraintSelectComponent,
  ],
  templateUrl: './constraint-solution-tab.component.html',
  styleUrl: './constraint-solution-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstraintSolutionTabComponent {}
