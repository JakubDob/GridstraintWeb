import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-solver-grid-options',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    FormsModule,
    MatSliderModule,
    MatDividerModule,
  ],
  templateUrl: './solver-grid-options.component.html',
  styleUrl: './solver-grid-options.component.scss',
})
export class SolverGridOptionsComponent {
  private solverState = inject(SolverStateService);
  ereaseValues = false;
  cellWidth = this.solverState.gridCellWidth;
  cellHeight = this.solverState.gridCellHeight;
  rows = this.solverState.gridRows;
  cols = this.solverState.gridCols;
  gapSize = this.solverState.gridGapSize;
  gapColor = this.solverState.gridGapColor;

  onChangedEreaseValues(value: boolean) {
    this.solverState.setEreaseValues(value);
  }
}
