import { WritableSignal } from '@angular/core';

export class SolverConstraint {
  static readonly gridVarName = 'a';
  static wrapSetInBrackets(indices: ReadonlySet<number>) {
    let result = '[';
    indices.forEach((i) => {
      result += SolverConstraint.wrapNumberInBrackets(i) + ',';
    });
    result = result.slice(0, -1);
    result += ']';
    return result;
  }
  static wrapNumberInBrackets(index: number) {
    return `${SolverConstraint.gridVarName}[${index}]`;
  }

  static valueConstraint(indices: ReadonlyMap<CellIndex, string>) {
    let result = '';
    for (let [index, value] of indices) {
      result += `constraint ${this.wrapNumberInBrackets(index)}=${value};\n`;
    }
    return result;
  }
}

export type SolverConstraintDetails = {
  constraint: new () => SolverConstraint;
  toSolverCode(
    cells: ReadonlySet<CellIndex>,
    settings?: ReadonlyMap<string, string>
  ): string;
  hasSettings: boolean;
};

export enum RelationSymbol {
  LESS_THAN = '<',
  LESS_OR_EQUAL = '<=',
  EQUAL = '=',
  GREATER_THAN = '>',
  GREATER_OR_EQUAL = '>=',
}

export enum SolvingMethod {
  SATISFY = 'satisfy',
  MINIMIZE = 'minimize',
  MAXIMIZE = 'maximize',
}

export type GridConstraint = {
  readonly name: string;
  readonly views: WritableSignal<GridView[]>;
};

export type GridView = {
  readonly name: string;
  readonly parent: GridConstraint;
  readonly groups: WritableSignal<CellGroup[]>;
  readonly indexToCellGroup: Map<number, CellGroup>;
  readonly settings?: ReadonlyMap<string, string>;
};

export type CellGroup = {
  readonly name: string;
  backgroundColor: string;
  readonly indices: Set<number>;
  readonly parent: GridView;
};

export type CellGroupAndIndex = {
  readonly group: CellGroup;
  readonly index: number;
};

export type CellIndex = number;

export type IndexedValueChange<T> = {
  index: number;
  previous: T | null;
  current: T | null;
};

export type Solution = {
  name: string;
  stringValues: string[];
  numberValues: number[];
  parent: SolvedProblemInstance;
};

export type SolvedProblemInstance = {
  name: string;
  solutions: Solution[];
};

export type MiniZincCmdParams = {
  solver?: string;
  'time-limit'?: number;
  'all-solutions'?: boolean;
};

export type SupportedSolver = {
  internalName: string;
  version: string;
  displayName: string;
};

export type SerializedGroup = {
  name: string;
  indices: number[];
};

export type SerializedView = {
  name: string;
  groups: SerializedGroup[];
  settings?: [string, string][];
};

export type SerializedConstraint = {
  name: string;
  views: SerializedView[];
};

export type SerializedSolverState = {
  constraints: SerializedConstraint[];
  values: [number, string][];
  rows: number;
  cols: number;
  minValue: number;
  maxValue: number;
};

export const StateFragmentKey = 'state';
export type StateFragment = {
  [StateFragmentKey]: string;
};

export function serializeGroup(group: CellGroup): SerializedGroup {
  return {
    name: group.name,
    indices: Array.from(group.indices),
  };
}

export function serializeView(view: GridView): SerializedView {
  return {
    name: view.name,
    settings: view.settings && Array.from(view.settings),
    groups: view.groups().map(serializeGroup),
  };
}

export function serializeConstraint(
  constraint: GridConstraint
): SerializedConstraint {
  return {
    name: constraint.name,
    views: constraint.views().map(serializeView),
  };
}
