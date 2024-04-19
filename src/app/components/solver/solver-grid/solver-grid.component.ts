import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  CanvasGridClickEvent,
  CanvasGridDragEvent,
  CanvasGridDrawFn,
  CanvasGridState,
  drawGridLines,
  drawText,
  NgxCanvasGridComponent,
  Rect,
} from '@jakubdob/ngx-canvas-grid';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import {
  CellGroupAndIndex,
  IndexedValueChange,
} from '../../../types/solver-types';
import { getDistinctColor } from '../../../utils/GridUtils';

type Border = {
  style: string;
  color: string;
  width: number;
};

type TextStyle = {
  color: string;
  font: string;
};

enum GridLayer {
  LINES = 0,
  CELLS = 1,
  VALUES = 2,
}

@Component({
  selector: 'app-solver-grid',
  standalone: true,
  imports: [NgxCanvasGridComponent, FormsModule],
  templateUrl: './solver-grid.component.html',
  styleUrl: './solver-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverGridComponent {
  constructor() {
    this.solverState.activeView.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.solverState.activeCellIndex.set(null);
        this.canvasGrid.redrawLayer(GridLayer.CELLS);
      });

    this.solverState.activeCellGroup.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([previous, current]) => {
        previous?.indices.forEach((index) =>
          this.canvasGrid.deleteCellIndexFromMultiFrameRedraw(
            index,
            GridLayer.CELLS
          )
        );
        current?.indices.forEach((index) =>
          this.canvasGrid.addCellIndexToMultiFrameRedraw(index, GridLayer.CELLS)
        );
        this.solverState.activeCellIndex.set(null);
        this.canvasGrid.redrawLayer(GridLayer.CELLS);
      });

    this.solverState.cellAddedToGroup$
      .pipe(takeUntilDestroyed())
      .subscribe((data: CellGroupAndIndex) => {
        if (data.group === this.solverState.activeCellGroup.value()) {
          this.canvasGrid.addCellIndexToMultiFrameRedraw(
            data.index,
            GridLayer.CELLS
          );
        } else {
          this.canvasGrid.addCellIndexToSingleFrameRedraw(
            data.index,
            GridLayer.CELLS
          );
        }
      });

    this.solverState.cellRemovedFromGroup$
      .pipe(takeUntilDestroyed())
      .subscribe((data: CellGroupAndIndex) => {
        this.canvasGrid.deleteCellIndexFromMultiFrameRedraw(
          data.index,
          GridLayer.CELLS
        );
      });

    this.solverState.activeCellIndex.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([previous, current]) => {
        if (current !== null) {
          this.canvasGrid.addCellIndexToSingleFrameRedraw(
            current,
            GridLayer.CELLS
          );
        }
        if (previous !== null) {
          this.canvasGrid.addCellIndexToSingleFrameRedraw(
            previous,
            GridLayer.CELLS
          );
        }
      });

    this.solverState.cellGroupDeleted$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.canvasGrid.redrawLayer(GridLayer.CELLS);
      });

    this.solverState.cellValueChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((data: IndexedValueChange<string>) => {
        this.canvasGrid.addCellIndexToSingleFrameRedraw(
          data.index,
          GridLayer.VALUES
        );
      });

    this.solverState.activeSolution.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.findMinMaxValuesInActiveSolution();
        this.canvasGrid.redrawLayer(GridLayer.CELLS);
        this.canvasGrid.redrawLayer(GridLayer.VALUES);
      });

    this.solverState.colorSolutions.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.solverState.activeSolution.value()) {
          this.canvasGrid.redrawLayer(GridLayer.CELLS);
        }
      });
  }

  @ViewChild(NgxCanvasGridComponent) canvasGrid!: NgxCanvasGridComponent;

  private defaultBackgroundColor = 'lightblue';
  private selectBorder: Border = {
    color: 'magenta',
    style: '',
    width: 4,
  };
  private valueTextStyle: TextStyle = {
    color: 'black',
    font: '2rem monospace',
  };

  private solverState = inject(SolverStateService);
  private activeSolutionMinValue = 0;
  private activeSolutionMaxValue = 0;
  cellWidth = this.solverState.gridCellWidth;
  cellHeight = this.solverState.gridCellHeight;
  rows = this.solverState.gridRows;
  cols = this.solverState.gridCols;
  gapSize = this.solverState.gridGapSize;
  gapColor = this.solverState.gridGapColor;
  gridCursor = this.solverState.gridCursor;
  drawFns: CanvasGridDrawFn[] = [
    {
      type: 'layer',
      drawFn: (state, ctx) => {
        drawGridLines(state, ctx, 'black', 3, 3);
      },
    },
    {
      type: 'cell',
      drawFn: (state, ctx, cellIndex, cellRect) => {
        this.renderBackground(state, ctx, cellIndex, cellRect);
        if (cellIndex === this.solverState.activeCellIndex.value()) {
          this.renderBorder(ctx, cellRect);
        }
      },
    },
    {
      type: 'cell',
      drawFn: (_, ctx, cellIndex, cellRect) => {
        this.renderText(ctx, cellIndex, cellRect);
      },
    },
  ];

  private cellEraserAction = computed(() => {
    if (this.solverState.eraserToggled()) {
      return (cellIndex: number) => {
        this.solverState.removeCellIndexFromActiveView.bind(this.solverState)(
          cellIndex
        );
        if (this.solverState.eraserClearValues()) {
          this.solverState.setValue(cellIndex, null);
        }
      };
    } else {
      if (this.solverState.activeCellGroup.value()) {
        return this.solverState.addCellIndexToActiveGroup.bind(
          this.solverState
        );
      }
    }
    return null;
  });
  private solutionViewEnabled = computed(
    () => this.solverState.activeSolution.value() !== null
  );

  private renderBorder(ctx: CanvasRenderingContext2D, rect: Rect) {
    ctx.strokeStyle = this.selectBorder.color;
    ctx.lineWidth = this.selectBorder.width;
    ctx.strokeRect(
      rect.x + this.selectBorder.width / 2,
      rect.y + this.selectBorder.width / 2,
      rect.w - this.selectBorder.width,
      rect.h - this.selectBorder.width
    );
  }

  private renderBackground(
    state: CanvasGridState,
    ctx: CanvasRenderingContext2D,
    cellIndex: number,
    rect: Rect
  ) {
    const group = this.solverState.activeView
      .value()
      ?.indexToCellGroup.get(cellIndex);
    const solution = this.solverState.activeSolution.value();
    if (group) {
      if (group === this.solverState.activeCellGroup.value()) {
        ctx.fillStyle = getDistinctColor(
          360,
          (state.elapsedTime() * 50 + rect.x + rect.y) % 360
        );
      } else {
        ctx.fillStyle = group.backgroundColor;
      }
    } else if (solution && this.solverState.colorSolutions.value()) {
      const diff =
        this.activeSolutionMaxValue - this.activeSolutionMinValue + 1;
      ctx.fillStyle = getDistinctColor(
        diff,
        solution.numberValues[cellIndex] % diff
      );
    } else {
      ctx.fillStyle = this.defaultBackgroundColor;
    }
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }

  private renderText(
    ctx: CanvasRenderingContext2D,
    cellIndex: number,
    rect: Rect
  ) {
    let value = this.solverState.activeSolution.value()
      ? this.solverState.activeSolution.value()?.stringValues.at(cellIndex)
      : this.solverState.values.get(cellIndex);

    if (value) {
      drawText(
        ctx,
        value,
        `${Math.min(rect.h, rect.w / (value.length * 0.5)) * 0.9}px monospace`,
        this.valueTextStyle.color,
        rect
      );
    }
  }

  onClickCell(event: CanvasGridClickEvent) {
    if (event.buttonId === 0) {
      if (this.canvasGrid.state.draggingButtonId() === null) {
        if (this.solverState.activeCellIndex.value() === event.cellIndex) {
          this.solverState.activeCellIndex.set(null);
        } else {
          this.solverState.activeCellIndex.set(event.cellIndex);
        }
      }
      this.cellEraserAction()?.(event.cellIndex);
    }
  }

  onDragCell(event: CanvasGridDragEvent) {
    if (event.buttonId === 0) {
      this.solverState.activeCellIndex.set(event.to);
      this.cellEraserAction()?.(event.to);
    }
  }

  onKeyDown(key: string) {
    if (this.solutionViewEnabled()) {
      return;
    }
    const i = this.solverState.activeCellIndex.value();
    if (i !== null) {
      const oldValue = this.solverState.values.get(i);
      if (key >= '0' && key <= '9') {
        this.solverState.setValue(i, oldValue ? oldValue + key : key);
      } else if (key === 'Backspace') {
        const newValue = oldValue?.slice(0, -1);
        this.solverState.setValue(i, newValue ? newValue : null);
      }
    }
  }

  private findMinMaxValuesInActiveSolution() {
    const solution = this.solverState.activeSolution.value();
    if (solution) {
      this.activeSolutionMaxValue = -Number.MAX_VALUE;
      this.activeSolutionMinValue = Number.MAX_VALUE;
      solution.numberValues.forEach((value) => {
        if (value > this.activeSolutionMaxValue) {
          this.activeSolutionMaxValue = value;
        } else if (value < this.activeSolutionMinValue) {
          this.activeSolutionMinValue = value;
        }
      });
    }
  }
}
