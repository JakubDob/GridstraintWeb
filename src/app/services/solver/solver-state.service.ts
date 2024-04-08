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
  GridView,
  IndexedValueChange,
  Solution,
  SolvedProblemInstance,
  SolverConstraint,
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
  private readonly _eraserToggled = signal<boolean>(false);
  private readonly _eraserClearValues = signal<boolean>(false);
  private readonly _constraints: Map<string, GridConstraint> = new Map();
  private readonly _values: Map<CellIndex, string> = new Map();
  private readonly _activeConstraint = signal<GridConstraint | null>(null);
  private readonly _activeView = signal<GridView | null>(null);
  private readonly _activeCellGroup = signal<CellGroup | null>(null);
  private readonly _activeCellIndex = signal<CellIndex | null>(null);
  private readonly _activeSolution = signal<Solution | null>(null);
  private readonly _valueRange = signal<ValueRange>({ min: 0, max: 8 });
  private readonly _solvingMethod = signal<SolvingMethod>(
    SolvingMethod.SATISFY
  );
  private readonly _findAllSolutions = signal<boolean>(false);
  private readonly _timeout = signal<number>(5);
  private readonly _problemName = signal<string>('');
  private readonly _solvedProblemInstances: SolvedProblemInstance[] = [];

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
  private readonly activeSolutionChangedSubject = new Subject<
    ValueChange<Solution>
  >();

  readonly eraserToggled = this._eraserToggled.asReadonly();
  readonly eraserClearValues = this._eraserClearValues.asReadonly();
  readonly activeView = this._activeView.asReadonly();

  readonly activeConstraint = this._activeConstraint.asReadonly();
  readonly activeCellGroup = this._activeCellGroup.asReadonly();
  readonly activeCellIndex = this._activeCellIndex.asReadonly();
  readonly valueRange = this._valueRange.asReadonly();
  readonly solvingMethod = this._solvingMethod.asReadonly();
  readonly findAllSolutions = this._findAllSolutions.asReadonly();
  readonly timeout = this._timeout.asReadonly();
  readonly problemName = this._problemName.asReadonly();
  readonly activeSolution = this._activeSolution.asReadonly();

  readonly activeCellGroupChanged$ = this.activeCellGroupSubject.asObservable();
  readonly activeViewChanged$ = this.activeViewSubject.asObservable();
  readonly activeCellIndexChanged$ = this.activeCellIndexSubject.asObservable();
  readonly cellGroupDeleted$ = this.cellGroupDeletedSubject.asObservable();
  readonly cellAddedToGroup$ = this.cellAddedToGroupSubject.asObservable();
  readonly cellRemovedFromGroup$ =
    this.cellRemovedFromGroupSubject.asObservable();
  readonly cellValueChanged$ = this.cellValueSubject.asObservable();
  readonly activeSolutionChanged$ =
    this.activeSolutionChangedSubject.asObservable();

  readonly gridCellWidth = signal(this.defaults?.cellWidth ?? 20);
  readonly gridCellHeight = signal(this.defaults?.cellHeight ?? 20);
  readonly gridRows = signal(this.defaults?.rows ?? 9);
  readonly gridCols = signal(this.defaults?.cols ?? 9);
  readonly gridGapSize = signal(this.defaults?.gapSize ?? 1);
  readonly gridGapColor = signal(this.defaults?.gapColor ?? 'black');
  readonly gridCursor = signal('pointer');

  get constraints(): ReadonlyMap<string, GridConstraint> {
    return this._constraints;
  }

  get values(): ReadonlyMap<CellIndex, string> {
    return this._values;
  }

  getSolvedProblemInstances(): ReadonlyArray<SolvedProblemInstance> {
    return this._solvedProblemInstances;
  }

  deleteSolution(solution: Solution) {
    const parentSolutions = solution.parent.solutions;
    const index = parentSolutions.indexOf(solution);
    if (index >= 0) {
      if (solution === this._activeSolution()) {
        this.setActiveSolution(null);
      }
      parentSolutions.splice(index, 1);
    }
  }

  setActiveSolution(solution: Solution | null) {
    this._activeSolution.update((prev) => {
      if (solution !== prev) {
        if (solution !== null) {
          this.setActiveView(null);
        }
        this.activeSolutionChangedSubject.next({
          current: solution,
          previous: prev,
        });
        return solution;
      }
      return prev;
    });
  }

  addSolvedProblemInstance(instance: SolvedProblemInstance) {
    this._solvedProblemInstances.push(instance);
  }

  deleteSolvedProblemInstance(instance: SolvedProblemInstance) {
    const index = this._solvedProblemInstances.indexOf(instance);
    if (index >= 0) {
      if (
        instance.solutions.find(
          (solution) => solution === this._activeSolution()
        )
      ) {
        this.setActiveSolution(null);
      }
      this._solvedProblemInstances.splice(index, 1);
    }
  }

  toggleEraser() {
    this._eraserToggled.update((value) => !value);
  }

  setEreaseValues(value: boolean) {
    this._eraserClearValues.set(value);
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
    this._activeConstraint.update((prev) => {
      const constraint = this._constraints.get(name);
      if (constraint && constraint !== prev) {
        this.setActiveView(null);
        return constraint;
      }
      return prev;
    });
  }

  setActiveView(view: GridView | null) {
    this._activeView.update((prev) => {
      if (view !== prev) {
        if (view === null) {
          this.setActiveGroup(null);
        } else {
          this.setActiveSolution(null);
        }
        this.activeViewSubject.next({
          current: view,
          previous: prev,
        });
        return view;
      }
      return prev;
    });
  }

  setActiveGroup(group: CellGroup | null) {
    this._activeCellGroup.update((prev) => {
      if (group !== prev) {
        if (group !== null) {
          this.setActiveView(group.parent);
        }
        this.activeCellGroupSubject.next({
          current: group,
          previous: prev,
        });
        return group;
      }
      return prev;
    });
  }

  setActiveCellIndex(index: number | null) {
    this._activeCellIndex.update((prev) => {
      if (index !== prev) {
        this.activeCellIndexSubject.next({
          current: index,
          previous: prev,
        });
        return index;
      }
      return prev;
    });
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
    const index = view.parent.views.indexOf(view);
    if (index >= 0) {
      view.groups.forEach((group) => this.deleteGroup(group));
      view.parent.views.splice(index, 1);
    }
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

  getSolverCode(): string {
    const gridLen = this.gridCols() * this.gridRows() - 1;
    const prelude = `include "globals.mzn";\narray [0..${gridLen}] of var ${
      this._valueRange().min
    }..${this._valueRange().max}: ${SolverConstraint.gridVarName};\n`;
    const codes: string[] = [];
    const solverConstraints = this.constraintProvider.getAll();
    for (let [name, solverConstraint] of solverConstraints) {
      const gridConstraint = this._constraints.get(name);
      if (gridConstraint) {
        gridConstraint.views.forEach((view) => {
          this.deleteEmptyGroups(view);
          view.groups.forEach((group) => {
            const code = solverConstraint.toSolverCode(
              group.indices,
              view.settings
            );
            codes.push(code);
          });
        });
      }
    }
    codes.push(SolverConstraint.valueConstraint(this._values));
    let method = 'solve ' + this.solvingMethod();
    if (this.solvingMethod() !== SolvingMethod.SATISFY) {
      method += ` sum(${SolverConstraint.gridVarName})`;
    }
    method += ';\n';
    const result = prelude + codes.join('\n') + '\n' + method;
    return result;
  }

  clearConstraintViews(constraint: GridConstraint) {
    const views = this._constraints.get(constraint.name)?.views;
    if (views?.find((view) => view === this._activeView())) {
      this.setActiveView(null);
      this.setActiveGroup(null);
    }
    views?.splice(0, views.length);
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
