import { effect, Injectable, signal } from '@angular/core';
import {
  CellGroup,
  CellIndex,
  GridConstraint,
  GridSize,
  GridView,
  ValueRange,
} from '../../types/solver-types';

@Injectable({
  providedIn: 'root',
})
export class SolverStateService {
  private readonly _ereaserToggled = signal<boolean>(false);
  private readonly _constraints: GridConstraint[] = [];
  private readonly _values: Map<CellIndex, number> = new Map();
  private readonly _activeView = signal<GridView | null>(null);
  private readonly _activeCellGroup = signal<CellGroup | null>(null);
  private readonly _activeCellIndex = signal<CellIndex | null>(null);
  private readonly _gridSize = signal<GridSize>({ rows: 9, cols: 9 });
  private readonly _valueRange = signal<ValueRange>({ min: 0, max: 10 });

  readonly ereaserToggled = this._ereaserToggled.asReadonly();
  readonly activeView = this._activeView.asReadonly();
  readonly activeCellGroup = this._activeCellGroup.asReadonly();
  readonly activeCellIndex = this._activeCellIndex.asReadonly();
  readonly gridSize = this._gridSize.asReadonly();
  readonly valueRange = this._valueRange.asReadonly();

  get constraints(): readonly GridConstraint[] {
    return this._constraints;
  }

  get values(): ReadonlyMap<CellIndex, number> {
    return this._values;
  }

  toggleEreaser() {
    this._ereaserToggled.update((value) => !value);
  }
}
