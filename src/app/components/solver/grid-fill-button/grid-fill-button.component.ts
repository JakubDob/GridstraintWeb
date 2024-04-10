import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SolverStateService } from '../../../services/solver/solver-state.service';

@Component({
  selector: 'app-grid-fill-button',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './grid-fill-button.component.html',
  styleUrl: './grid-fill-button.component.scss',
})
export class GridFillButtonComponent {
  private solverState = inject(SolverStateService);
  tooltipMsg = 'Add ungrouped cells to the current group';
  @Input() icon = 'format_color_fill';

  onClick() {
    if (!this.solverState.activeCellGroup()) {
      return;
    }
    const view = this.solverState.activeView();
    if (!view) return;
    const len = this.solverState.gridCols() * this.solverState.gridRows();
    for (let i = 0; i < len; ++i) {
      if (!view.indexToCellGroup.has(i)) {
        this.solverState.addCellIndexToActiveGroup(i);
      }
    }
  }
}
