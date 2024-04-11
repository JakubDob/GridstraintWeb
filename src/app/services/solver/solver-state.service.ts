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
  SupportedSolver,
} from '../../types/solver-types';
import { StateVarBuilder } from '../../types/state-builder';
import { getRandomColor } from '../../utils/GridUtils';
import { ConstraintProviderService } from '../constraint/constraint-provider.service';

@Injectable({
  providedIn: 'root',
})
export class SolverStateService {
  private readonly _eraserToggled = signal<boolean>(false);
  private readonly _constraints: Map<string, GridConstraint> = new Map();
  private readonly _values: Map<CellIndex, string> = new Map();

  private readonly _solvedProblemInstances: SolvedProblemInstance[] = [];
  private readonly cellGroupDeletedSubject = new Subject<CellGroup>();
  private readonly cellAddedToGroupSubject = new Subject<CellGroupAndIndex>();
  private readonly cellRemovedFromGroupSubject =
    new Subject<CellGroupAndIndex>();
  private readonly cellValueSubject = new Subject<IndexedValueChange<string>>();

  readonly eraserToggled = this._eraserToggled.asReadonly();

  readonly cellGroupDeleted$ = this.cellGroupDeletedSubject.asObservable();
  readonly cellAddedToGroup$ = this.cellAddedToGroupSubject.asObservable();
  readonly cellRemovedFromGroup$ =
    this.cellRemovedFromGroupSubject.asObservable();
  readonly cellValueChanged$ = this.cellValueSubject.asObservable();

  readonly activeConstraint = new StateVarBuilder<GridConstraint | null>(null)
    .withSetterFn<string>((val, constraintName) => {
      const constraint = this._constraints.get(constraintName);
      if (constraint) {
        this.activeView.set(null);
        val.set(constraint);
      }
    })
    .build();
  readonly activeView = new StateVarBuilder<GridView | null>(null)
    .withSideEffectFn((_, curr) => {
      if (curr === null) {
        this.activeCellGroup.set(null);
      } else {
        this.activeSolution.set(null);
      }
    })
    .build();
  readonly activeCellGroup = new StateVarBuilder<CellGroup | null>(null)
    .withSideEffectFn((_, curr) => {
      if (curr) {
        this.activeView.set(curr.parent);
      }
    })
    .build();
  readonly activeSolution = new StateVarBuilder<Solution | null>(null)
    .withSideEffectFn((_, curr) => {
      if (curr) {
        this.activeView.set(null);
      }
    })
    .build();
  readonly activeCellIndex = new StateVarBuilder<CellIndex | null>(
    null
  ).build();

  readonly eraserClearValues = signal<boolean>(false);
  readonly minValue = signal<number>(0);
  readonly maxValue = signal<number>(8);
  readonly gridCellWidth = signal(this.defaults?.cellWidth ?? 20);
  readonly gridCellHeight = signal(this.defaults?.cellHeight ?? 20);
  readonly gridRows = signal(this.defaults?.rows ?? 9);
  readonly gridCols = signal(this.defaults?.cols ?? 9);
  readonly gridGapSize = signal(this.defaults?.gapSize ?? 1);
  readonly gridGapColor = signal(this.defaults?.gapColor ?? 'black');
  readonly gridCursor = signal('pointer');
  readonly currentSolver = signal<SupportedSolver | null>(null);
  readonly findAllSolutions = signal<boolean>(false);
  readonly timeout = signal<number>(5);
  readonly problemName = signal<string>('');
  readonly solvingMethod = signal<SolvingMethod>(SolvingMethod.SATISFY);

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
      if (solution === this.activeSolution.value()) {
        this.activeSolution.set(null);
      }
      parentSolutions.splice(index, 1);
    }
  }

  addSolvedProblemInstance(instance: SolvedProblemInstance) {
    this._solvedProblemInstances.push(instance);
  }

  deleteSolvedProblemInstance(instance: SolvedProblemInstance) {
    const index = this._solvedProblemInstances.indexOf(instance);
    if (index >= 0) {
      if (
        instance.solutions.find(
          (solution) => solution === this.activeSolution.value()
        )
      ) {
        this.activeSolution.set(null);
      }
      this._solvedProblemInstances.splice(index, 1);
    }
  }

  toggleEraser() {
    this._eraserToggled.update((value) => !value);
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

  deleteGroup(group: CellGroup) {
    if (this.activeCellGroup.value() === group) {
      this.activeCellGroup.set(null);
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
    const av = this.activeView.value();
    if (av === view) {
      this.activeView.set(null);
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
    const view = this.activeView.value();
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
    const ac = this.activeConstraint.value();
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
    const group = this.activeCellGroup.value();
    if (group) {
      this.addCellIndexToGroup(group, index);
    }
  }

  removeCellIndexFromActiveView(index: number) {
    const group = this.activeView.value()?.indexToCellGroup.get(index);
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
    const view = this.activeView.value();
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
    const prelude = `include "globals.mzn";\narray [0..${gridLen}] of var ${this.minValue()}..${this.maxValue()}: ${
      SolverConstraint.gridVarName
    };\n`;
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
    if (views?.find((view) => view === this.activeView.value())) {
      this.activeView.set(null);
      this.activeCellGroup.set(null);
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
