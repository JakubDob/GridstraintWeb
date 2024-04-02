import { Component, computed, inject, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { IndexedValueChange, ValueChange } from '../../../types/solver-types';

@Component({
  selector: 'app-solver-value-options',
  standalone: true,
  imports: [MatCardModule, MatInputModule, FormsModule],
  templateUrl: './solver-value-options.component.html',
  styleUrl: './solver-value-options.component.scss',
})
export class SolverValueOptionsComponent {
  private solverState = inject(SolverStateService);
  private ngZone = inject(NgZone);
  minValue: number = this.solverState.valueRange().min;
  maxValue: number = this.solverState.valueRange().max;
  selectedCellValue?: number;
  disableInput: boolean = true;

  private solutionViewEnabled = computed(
    () => this.solverState.activeSolution() !== null
  );

  constructor() {
    this.solverState.activeCellIndexChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((data: ValueChange<number>) => {
        this.ngZone.run(() => {
          if (this.solutionViewEnabled()) {
            return;
          }
          if (data.current !== null) {
            this.disableInput = false;
            const value = this.solverState.values.get(data.current);
            if (value) {
              this.selectedCellValue = parseInt(value);
            } else {
              this.selectedCellValue = undefined;
            }
          } else {
            this.disableInput = true;
            this.selectedCellValue = undefined;
          }
        });
      });
    this.solverState.cellValueChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((data: IndexedValueChange<string>) => {
        this.ngZone.run(() => {
          if (data.current !== null) {
            this.selectedCellValue = parseInt(data.current);
          } else {
            this.selectedCellValue = undefined;
          }
        });
      });
  }

  onMinValueChange(value: number) {
    this.solverState.setValueRangeMin(value);
  }

  onMaxValueChange(value: number) {
    this.solverState.setValueRangeMax(value);
  }

  onSelectedCellValueChange(value: number | null) {
    if (this.solutionViewEnabled()) {
      return;
    }
    const cellIndex = this.solverState.activeCellIndex();
    if (cellIndex !== null) {
      this.solverState.setValue(
        cellIndex,
        value === null ? null : value.toString()
      );
    }
  }
}
