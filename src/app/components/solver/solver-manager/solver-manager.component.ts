import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StateURLHelperService } from '../../../services/state-urlhelper.service';
import { OptionsComponent } from '../../options/options.component';
import { SideNavComponent } from '../../side-nav/side-nav.component';
import { ToolbarComponent } from '../../toolbar/toolbar.component';
import { SolverGridComponent } from '../solver-grid/solver-grid.component';

@Component({
  selector: 'app-solver-manager',
  standalone: true,
  imports: [
    SolverGridComponent,
    ToolbarComponent,
    OptionsComponent,
    SideNavComponent,
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
