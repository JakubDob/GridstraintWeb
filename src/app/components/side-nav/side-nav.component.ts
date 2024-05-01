import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SolverStateService } from '../../services/solver/solver-state.service';
import { OptionsComponent } from '../options/options.component';
import { SolverConstraintManagerComponent } from '../solver/solver-constraint-manager/solver-constraint-manager.component';
import { SolverConstraintSelectComponent } from '../solver/solver-constraint-select/solver-constraint-select.component';
import { SolverGridComponent } from '../solver/solver-grid/solver-grid.component';
import { SolverSolutionManagerComponent } from '../solver/solver-solution-manager/solver-solution-manager.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    MatSidenavModule,
    SolverGridComponent,
    OptionsComponent,
    SolverConstraintManagerComponent,
    SolverSolutionManagerComponent,
    SolverConstraintSelectComponent,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
  state = inject(SolverStateService);
  leftOpened = this.state.optionsSidenavOpened;
  rightOpened = computed(
    () => this.state.showConstraints() || this.state.showSolutions()
  );
}
