import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  NgZone,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { IndexedValueChange } from '../../../types/solver-types';

@Component({
  selector: 'app-solver-value-options',
  standalone: true,
  imports: [MatInputModule, FormsModule, MatDividerModule, MatCheckboxModule],
  templateUrl: './solver-value-options.component.html',
  styleUrl: './solver-value-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverValueOptionsComponent {
  private solverState = inject(SolverStateService);
  private ngZone = inject(NgZone);
  minValue: number = this.solverState.minValue();
  maxValue: number = this.solverState.maxValue();
  selectedCellValue = signal<number | undefined>(undefined);
  disableInput: boolean = true;
  ereaseValues = false;

  private solutionViewEnabled = computed(
    () => this.solverState.activeSolution.value() !== null
  );

  constructor() {
    this.solverState.activeCellIndex.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([_, current]) => {
        this.ngZone.run(() => {
          if (this.solutionViewEnabled()) {
            return;
          }
          if (current !== null) {
            this.disableInput = false;
            const value = this.solverState.values.get(current);
            if (value) {
              this.selectedCellValue.set(parseInt(value));
            } else {
              this.selectedCellValue.set(undefined);
            }
          } else {
            this.disableInput = true;
            this.selectedCellValue.set(undefined);
          }
        });
      });
    this.solverState.cellValueChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((data: IndexedValueChange<string>) => {
        this.ngZone.run(() => {
          if (data.current !== null) {
            this.selectedCellValue.set(parseInt(data.current));
          } else {
            this.selectedCellValue.set(undefined);
          }
        });
      });
  }

  onMinValueChange(value: number) {
    this.solverState.minValue.set(value);
  }

  onMaxValueChange(value: number) {
    this.solverState.maxValue.set(value);
  }

  onSelectedCellValueChange(value: number | null) {
    if (this.solutionViewEnabled()) {
      return;
    }
    const cellIndex = this.solverState.activeCellIndex.value();
    if (cellIndex !== null) {
      this.solverState.setValue(
        cellIndex,
        value === null ? null : value.toString()
      );
    }
  }

  onChangedEreaseValues(value: boolean) {
    this.solverState.eraserClearValues.set(value);
  }
}
