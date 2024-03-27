import { Inject, Injectable, signal } from '@angular/core';
import {
  CanvasGridDefaultOptions,
  CANVAS_GRID_DEFAULT_OPTIONS,
} from '@jakubdob/ngx-canvas-grid';
import { Subject } from 'rxjs';
import {
  CellGroup,
  CellGroupAndIndex,
  CellIndex,
  GridConstraint,
  GridSize,
  GridView,
  IndexedValueChange,
  SolvingMethod,
  ValueChange,
  ValueRange,
} from '../../types/solver-types';
import { getRandomColor } from '../../utils/GridUtils';
import { ConstraintProviderService } from '../constraint/constraint-provider.service';

@Injectable({
  providedIn: 'root',
})
export class SolverStateService {
  private readonly _ereaserToggled = signal<boolean>(false);
  private readonly _constraints: Map<string, GridConstraint> = new Map();
  private readonly _values: Map<CellIndex, string> = new Map();
  private readonly _activeConstraint = signal<GridConstraint | null>(null);
  private readonly _activeView = signal<GridView | null>(null);
  private readonly _activeCellGroup = signal<CellGroup | null>(null);
  private readonly _activeCellIndex = signal<CellIndex | null>(null);
  private readonly _gridSize = signal<GridSize>({
    rows: this.defaults?.rows ?? 9,
    cols: this.defaults?.cols ?? 9,
  });
  private readonly _valueRange = signal<ValueRange>({ min: 0, max: 10 });
  private readonly _solvingMethod = signal<SolvingMethod>(
    SolvingMethod.SATISFY
  );
  private _findAllSolutions = signal<boolean>(false);
  private _timeout = signal<number>(5);
  private _problemName = signal<string>('');

  private readonly activeCellGroupSubject = new Subject<
    ValueChange<CellGroup>
  >();
  private readonly activeViewSubject = new Subject<ValueChange<GridView>>();
  private readonly activeCellIndexSubject = new Subject<ValueChange<number>>();
  private readonly cellGroupDeletedSubject = new Subject<CellGroup>();
  private readonly cellAddedToGroupSubject = new Subject<CellGroupAndIndex>();
  private readonly cellRemovedFromGroupSubject =
    new Subject<CellGroupAndIndex>();
  private readonly cellValueSubject = new Subject<IndexedValueChange<string>>();

  readonly ereaserToggled = this._ereaserToggled.asReadonly();
  readonly activeView = this._activeView.asReadonly();

  readonly activeConstraint = this._activeConstraint.asReadonly();
  readonly activeCellGroup = this._activeCellGroup.asReadonly();
  readonly activeCellIndex = this._activeCellIndex.asReadonly();
  readonly gridSize = this._gridSize.asReadonly();
  readonly valueRange = this._valueRange.asReadonly();
  readonly solvingMethod = this._solvingMethod.asReadonly();
  readonly findAllSolutions = this._findAllSolutions.asReadonly();
  readonly timeout = this._timeout.asReadonly();
  readonly problemName = this._problemName.asReadonly();

  readonly activeCellGroupChanged$ = this.activeCellGroupSubject.asObservable();
  readonly activeViewChanged$ = this.activeViewSubject.asObservable();
  readonly activeCellIndexChanged$ = this.activeCellIndexSubject.asObservable();
  readonly cellGroupDeleted$ = this.cellGroupDeletedSubject.asObservable();
  readonly cellAddedToGroup$ = this.cellAddedToGroupSubject.asObservable();
  readonly cellRemovedFromGroup$ =
    this.cellRemovedFromGroupSubject.asObservable();
  readonly cellValueChanged$ = this.cellValueSubject.asObservable();

  get constraints(): ReadonlyMap<string, GridConstraint> {
    return this._constraints;
  }

  get values(): ReadonlyMap<CellIndex, string> {
    return this._values;
  }

  toggleEreaser() {
    this._ereaserToggled.update((value) => !value);
  }

  setProblemName(value: string) {
    this._problemName.set(value);
  }

  setTimeout(value: number) {
    this._timeout.set(value);
  }

  setFindAllSolutions(value: boolean) {
    this._findAllSolutions.set(value);
  }

  setSolvingMethod(method: SolvingMethod) {
    this._solvingMethod.set(method);
  }

  setValueRangeMin(value: number) {
    this._valueRange.update((currentRange) => {
      return {
        ...currentRange,
        min: value,
      };
    });
  }

  setValueRangeMax(value: number) {
    this._valueRange.update((currentRange) => {
      return {
        ...currentRange,
        max: value,
      };
    });
  }

  setRowCount(rowCount: number) {
    this._gridSize.update((currentSize) => {
      return {
        ...currentSize,
        rows: rowCount,
      };
    });
  }

  setColCount(colCount: number) {
    this._gridSize.update((currentSize) => {
      return {
        ...currentSize,
        cols: colCount,
      };
    });
  }

  setValue(index: number, value: string | null) {
    const prevValue = this._values.get(index) ?? null;
    if (value === null) {
      this._values.delete(index);
    } else {
      this._values.set(index, value);
    }
    this.cellValueSubject.next({
      index: index,
      current: value,
      previous: prevValue,
    });
  }

  setActiveConstraint(name: string) {
    this._activeConstraint.set(this._constraints.get(name) ?? null);
  }

  setActiveView(view: GridView | null) {
    if (this._activeView() !== view) {
      this.activeViewSubject.next({
        current: view,
        previous: this._activeView(),
      });
    }
    this._activeView.set(view);
  }

  setActiveGroup(group: CellGroup | null) {
    if (this._activeCellGroup() !== group) {
      this.activeCellGroupSubject.next({
        current: group,
        previous: this._activeCellGroup(),
      });
    }
    this._activeCellGroup.set(group);
  }

  setActiveCellIndex(index: number | null) {
    if (this._activeCellIndex() !== index) {
      this.activeCellIndexSubject.next({
        current: index,
        previous: this._activeCellIndex(),
      });
    }
    this._activeCellIndex.set(index);
  }

  deleteGroup(group: CellGroup) {
    if (this.activeCellGroup() === group) {
      this.setActiveGroup(null);
    }
    const index = group.parent.groups.indexOf(group);
    if (index >= 0) {
      group.indices.forEach((i) => {
        group.parent.indexToCellGroup.delete(i);
      });
      group.parent.groups.splice(index, 1);
      this.cellGroupDeletedSubject.next(group);
    }
  }

  deleteView(view: GridView) {
    const av = this.activeView();
    if (av === view) {
      this.setActiveView(null);
    }
    view.groups.forEach((group) => this.deleteGroup(group));
    view.parent.views.splice(view.parent.views.indexOf(view), 1);
  }

  addNewGroup(view: GridView) {
    view.groups.push({
      backgroundColor: getRandomColor(),
      indices: new Set(),
      name: `${view.name}_group${view.groups.length}`,
      parent: view,
    });
  }

  addNewGroupToActiveView(indices: Set<number>) {
    const view = this._activeView();
    if (view) {
      const group: CellGroup = {
        backgroundColor: getRandomColor(),
        indices: new Set(),
        name: `${view.name}_group${view.groups.length}`,
        parent: view,
      };
      view.groups.push(group);
      indices.forEach((i) => this.addCellIndexToGroup(group, i));
    }
  }

  addNewViewToActiveConstraint(settings?: ReadonlyMap<string, string>) {
    const ac = this.activeConstraint();
    if (ac) {
      const nameLabel = settings?.get('label');
      ac.views.push({
        groups: [],
        indexToCellGroup: new Map(),
        name: nameLabel ? nameLabel : `view_${ac.views.length}`,
        parent: ac,
        settings: settings,
      });
    }
  }

  addCellIndexToGroup(group: CellGroup, index: number) {
    const indexMap = group.parent.indexToCellGroup;
    const otherGroup = indexMap.get(index);
    if (otherGroup) {
      this.removeCellIndexFromGroup(otherGroup, index);
    }
    indexMap.set(index, group);
    group.indices.add(index);
    this.cellAddedToGroupSubject.next({ group: group, index: index });
  }

  addCellIndexToActiveGroup(index: number) {
    const group = this._activeCellGroup();
    if (group) {
      this.addCellIndexToGroup(group, index);
    }
  }

  removeCellIndexFromActiveView(index: number) {
    const group = this._activeView()?.indexToCellGroup.get(index);
    if (group) {
      this.removeCellIndexFromGroup(group, index);
    }
  }

  private removeCellIndexFromGroup(group: CellGroup, index: number) {
    group.indices.delete(index);
    group.parent.indexToCellGroup.delete(index);
    this.cellRemovedFromGroupSubject.next({ group: group, index: index });
  }

  renameView(view: GridView, newName: string) {
    (view.name as string) = newName;
  }

  renameGroup(group: CellGroup, newName: string) {
    (group.name as string) = newName;
  }

  deleteEmptyGroupsFromActiveView() {
    const view = this._activeView();
    if (view) {
      this.deleteEmptyGroups(view);
    }
  }

  deleteEmptyGroups(view: GridView) {
    view.groups
      .filter((group) => group.indices.size === 0)
      .forEach((group) => this.deleteGroup(group));
  }

  clearConstraintViews(constraint: GridConstraint) {
    const views = this._constraints.get(constraint.name)?.views;
    if (views?.find((view) => view === this._activeView())) {
      this.setActiveView(null);
      this.setActiveGroup(null);
    }
    views?.splice(0, views.length);
  }

  createTestCellGroup(name: string, parent: GridView): CellGroup {
    return {
      backgroundColor: getRandomColor(),
      indices: new Set(),
      name: name,
      parent: parent,
    };
  }

  createTestGridView(name: string, parent: GridConstraint): GridView {
    const builtView: GridView = {
      parent: parent,
      groups: [],
      indexToCellGroup: new Map(),
      name: name,
    };
    for (let i = 0; i < 9; ++i) {
      builtView.groups.push(
        this.createTestCellGroup(name + '_group' + i, builtView)
      );
    }
    return builtView;
  }

  constructor(
    private constraintProvider: ConstraintProviderService,
    @Inject(CANVAS_GRID_DEFAULT_OPTIONS)
    private defaults?: CanvasGridDefaultOptions
  ) {
    for (let constraintName of this.constraintProvider.getAll().keys()) {
      this._constraints.set(constraintName, {
        name: constraintName,
        views: [],
      });
    }
  }
}
