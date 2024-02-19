export type GridConstraint = {
  readonly name: string;
  readonly views: GridView[];
};

export type GridView = {
  name: string;
  readonly groups: CellGroup[];
  readonly indexToCellGroup: Map<number, CellGroup[] | null>;
};

export type CellGroup = {
  name: string;
  backgroundColor: string;
  readonly indices: Set<number>;
  readonly parent: GridView;
};

export type CellIndex = number;

export type GridSize = {
  rows: number;
  cols: number;
};

export type ValueRange = {
  min: number;
  max: number;
};
