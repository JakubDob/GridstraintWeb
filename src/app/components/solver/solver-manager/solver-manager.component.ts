import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StateURLHelperService } from '../../../services/state-urlhelper.service';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverManagerComponent {
  private stateUrlHelper = inject(StateURLHelperService);

  constructor() {
    this.stateUrlHelper.decode();
  }
}
