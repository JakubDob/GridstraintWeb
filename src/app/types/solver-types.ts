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
  readonly views: GridView[];
};

export type GridView = {
  readonly name: string;
  readonly parent: GridConstraint;
  readonly groups: CellGroup[];
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

export type ValueRange = {
  min: number;
  max: number;
};

export type ValueChange<T> = {
  previous: T | null;
  current: T | null;
};

export type IndexedValueChange<T> = {
  index: number;
  previous: T | null;
  current: T | null;
};

export type Solution = {
  name: string;
  values: string[];
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
