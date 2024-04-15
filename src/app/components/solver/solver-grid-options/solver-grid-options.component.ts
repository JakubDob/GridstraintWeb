import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { SolverStateService } from '../../../services/solver/solver-state.service';

@Component({
  selector: 'app-solver-grid-options',
  standalone: true,
  imports: [MatButtonModule, FormsModule, MatSliderModule],
  templateUrl: './solver-grid-options.component.html',
  styleUrl: './solver-grid-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverGridOptionsComponent {
  private solverState = inject(SolverStateService);
  cellWidth = this.solverState.gridCellWidth;
  cellHeight = this.solverState.gridCellHeight;
  rows = this.solverState.gridRows;
  cols = this.solverState.gridCols;
  gapSize = this.solverState.gridGapSize;
  gapColor = this.solverState.gridGapColor;

  onColsChange(value: number) {
    this.solverState.gridCols.set(value);
  }

  onRowsChange(value: number) {
    this.solverState.gridRows.set(value);
  }
}
