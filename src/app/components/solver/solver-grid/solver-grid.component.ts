import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  CanvasGridClickEvent,
  CanvasGridDragEvent,
  CanvasGridDropEvent,
  CanvasGridGapSizeFns,
  CanvasGridState,
  drawText,
  GridCell,
  LayerController,
  layerControllerBuilder,
  NgxCanvasGridComponent,
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
  CELLS = 0,
  VALUES = 1,
}

const LEFT_CLICK_BUTTON_FLAG = 1;

@Component({
  selector: 'app-solver-grid',
  standalone: true,
  imports: [NgxCanvasGridComponent, FormsModule],
  templateUrl: './solver-grid.component.html',
  styleUrl: './solver-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverGridComponent {
  layerController: LayerController = layerControllerBuilder()
    .addLayerDrawnPerCell((ctx, cell, state) => {
      ctx.clearRect(cell.x, cell.y, cell.w, cell.h);
      this.renderBackground(state, ctx, cell);
      if (cell.index === this.solverState.activeCellIndex.value()) {
        this.renderBorder(ctx, cell);
      }
    })
    .addLayerDrawnPerCell((ctx, cell) => {
      ctx.clearRect(cell.x, cell.y, cell.w, cell.h);
      this.renderText(ctx, cell);
    })
    .build();

  constructor() {
    this.solverState.activeView.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.solverState.activeCellIndex.set(null);
        this.layerController.drawOnce(GridLayer.CELLS);
      });

    this.solverState.activeCellGroup.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([previous, current]) => {
        previous?.indices.forEach((index) =>
          this.layerController.deleteCellDrawnPerFrame(index, GridLayer.CELLS)
        );
        current?.indices.forEach((index) =>
          this.layerController.drawPerFrame(index, GridLayer.CELLS)
        );
        this.solverState.activeCellIndex.set(null);
        this.layerController.drawOnce(GridLayer.CELLS);
      });

    this.solverState.cellAddedToGroup$
      .pipe(takeUntilDestroyed())
      .subscribe((data: CellGroupAndIndex) => {
        if (data.group === this.solverState.activeCellGroup.value()) {
          this.layerController.drawPerFrame(data.index, GridLayer.CELLS);
        } else {
          this.layerController.drawOnce(data.index, GridLayer.CELLS);
        }
      });

    this.solverState.cellRemovedFromGroup$
      .pipe(takeUntilDestroyed())
      .subscribe((data: CellGroupAndIndex) => {
        this.layerController.deleteCellDrawnPerFrame(
          data.index,
          GridLayer.CELLS
        );
      });

    this.solverState.activeCellIndex.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([previous, current]) => {
        if (current !== null) {
          this.layerController.drawOnce(current, GridLayer.CELLS);
        }
        if (previous !== null) {
          this.layerController.drawOnce(previous, GridLayer.CELLS);
        }
      });

    this.solverState.cellGroupDeleted$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.layerController.drawOnce(GridLayer.CELLS);
      });

    this.solverState.cellValueChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((data: IndexedValueChange<string>) => {
        this.layerController.drawOnce(data.index, GridLayer.VALUES);
      });

    this.solverState.activeSolution.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.findMinMaxValuesInActiveSolution();
        this.layerController.drawOnce(GridLayer.CELLS);
        this.layerController.drawOnce(GridLayer.VALUES);
      });

    this.solverState.colorSolutions.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.solverState.activeSolution.value()) {
          this.layerController.drawOnce(GridLayer.CELLS);
        }
      });
  }

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
  private draggingButtonId: number | null = null;
  private minorGapSize = 1;
  cellWidth = this.solverState.gridCellWidth;
  cellHeight = this.solverState.gridCellHeight;
  rows = this.solverState.gridRows;
  cols = this.solverState.gridCols;
  gapSizeFns: CanvasGridGapSizeFns = {
    rowFn: (row) => {
      const gap = this.solverState.gridGapSize();
      if (row > 0 && row % 3 === 0 && row < this.rows()) {
        return gap;
      } else {
        return Math.min(gap, this.minorGapSize);
      }
    },
    colFn: (col) => {
      const gap = this.solverState.gridGapSize();
      if (col > 0 && col % 3 === 0 && col < this.cols()) {
        return gap;
      } else {
        return Math.min(gap, this.minorGapSize);
      }
    },
  };
  gapColor = this.solverState.gridGapColor;
  gridCursor = this.solverState.gridCursor;

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

  private renderBorder(ctx: CanvasRenderingContext2D, cell: GridCell) {
    ctx.strokeStyle = this.selectBorder.color;
    ctx.lineWidth = this.selectBorder.width;
    ctx.strokeRect(
      cell.x + this.selectBorder.width / 2,
      cell.y + this.selectBorder.width / 2,
      cell.w - this.selectBorder.width,
      cell.h - this.selectBorder.width
    );
  }

  private renderBackground(
    state: CanvasGridState,
    ctx: CanvasRenderingContext2D,
    cell: GridCell
  ) {
    const group = this.solverState.activeView
      .value()
      ?.indexToCellGroup.get(cell.index);
    const solution = this.solverState.activeSolution.value();
    if (group) {
      if (group === this.solverState.activeCellGroup.value()) {
        ctx.fillStyle = getDistinctColor(
          360,
          (state.elapsedTime() * 50 + cell.x + cell.y) % 360
        );
      } else {
        ctx.fillStyle = group.backgroundColor;
      }
    } else if (solution && this.solverState.colorSolutions.value()) {
      const diff =
        this.activeSolutionMaxValue - this.activeSolutionMinValue + 1;
      ctx.fillStyle = getDistinctColor(
        diff,
        solution.numberValues[cell.index] % diff
      );
    } else {
      ctx.fillStyle = this.defaultBackgroundColor;
    }
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
  }

  private renderText(ctx: CanvasRenderingContext2D, cell: GridCell) {
    let value = this.solverState.activeSolution.value()
      ? this.solverState.activeSolution.value()?.stringValues.at(cell.index)
      : this.solverState.values.get(cell.index);
    if (value) {
      drawText(
        ctx,
        value,
        `${Math.min(cell.h, cell.w / (value.length * 0.5)) * 0.9}px roboto`,
        this.valueTextStyle.color,
        {
          h: cell.h,
          w: cell.w,
          x: cell.x,
          y: cell.y,
        }
      );
    }
  }

  onClickCell(event: CanvasGridClickEvent) {
    if (event.target.type !== 'cell') {
      return;
    }
    if (event.browserEvent.button === 0) {
      if (this.draggingButtonId === null) {
        if (this.solverState.activeCellIndex.value() === event.target.index) {
          this.solverState.activeCellIndex.set(null);
        } else {
          this.solverState.activeCellIndex.set(event.target.index);
        }
      }
      this.cellEraserAction()?.(event.target.index);
    }
  }

  onDragCell(event: CanvasGridDragEvent) {
    if (event.to.type !== 'cell') {
      return;
    }
    this.draggingButtonId = event.browserEvent.buttons;
    if (event.browserEvent.buttons & LEFT_CLICK_BUTTON_FLAG) {
      this.solverState.activeCellIndex.set(event.to.index);
      this.cellEraserAction()?.(event.to.index);
    }
  }

  onDropCell(event: CanvasGridDropEvent) {
    this.draggingButtonId = null;
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
