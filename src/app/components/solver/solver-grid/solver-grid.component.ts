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
  CanvasGridCellRenderFn,
  CanvasGridCellRenderParams,
  CanvasGridGapFn,
  GridClickEvent,
  GridDragEvent,
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
        this.canvasGrid.redrawAll();
      });

    this.solverState.activeCellGroup.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([previous, current]) => {
        previous?.indices.forEach((index) =>
          this.canvasGrid.deleteCellIndexFromMultiFrameRedraw(index)
        );
        current?.indices.forEach((index) =>
          this.canvasGrid.addCellIndexToMultiFrameRedraw(index)
        );
        this.solverState.activeCellIndex.set(null);
        this.canvasGrid.redrawAll();
      });

    this.solverState.cellAddedToGroup$
      .pipe(takeUntilDestroyed())
      .subscribe((data: CellGroupAndIndex) => {
        if (data.group === this.solverState.activeCellGroup.value()) {
          this.canvasGrid.addCellIndexToMultiFrameRedraw(data.index);
        } else {
          this.canvasGrid.addCellIndexToSingleFrameRedraw(data.index);
        }
      });

    this.solverState.cellRemovedFromGroup$
      .pipe(takeUntilDestroyed())
      .subscribe((data: CellGroupAndIndex) => {
        this.canvasGrid.deleteCellIndexFromMultiFrameRedraw(data.index);
      });

    this.solverState.activeCellIndex.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([previous, current]) => {
        if (current !== null) {
          this.canvasGrid.addCellIndexToSingleFrameRedraw(current);
        }
        if (previous !== null) {
          this.canvasGrid.addCellIndexToSingleFrameRedraw(previous);
        }
      });

    this.solverState.cellGroupDeleted$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.canvasGrid.redrawAll();
      });

    this.solverState.cellValueChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((data: IndexedValueChange<string>) => {
        this.canvasGrid.addCellIndexToSingleFrameRedraw(data.index);
      });

    this.solverState.activeSolution.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.canvasGrid.redrawAll();
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
  cellWidth = this.solverState.gridCellWidth;
  cellHeight = this.solverState.gridCellHeight;
  rows = this.solverState.gridRows;
  cols = this.solverState.gridCols;
  gapSize = this.solverState.gridGapSize;
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

  private renderBorder(p: CanvasGridCellRenderParams) {
    p.context.strokeStyle = this.selectBorder.color;
    p.context.lineWidth = this.selectBorder.width;
    p.context.strokeRect(
      p.cellRect.x + this.selectBorder.width / 2,
      p.cellRect.y + this.selectBorder.width / 2,
      p.cellRect.w - this.selectBorder.width,
      p.cellRect.h - this.selectBorder.width
    );
  }

  private renderBackground(p: CanvasGridCellRenderParams) {
    const group = this.solverState.activeView
      .value()
      ?.indexToCellGroup.get(p.cellIndex);
    if (group) {
      if (group === this.solverState.activeCellGroup.value()) {
        p.context.fillStyle = getDistinctColor(
          360,
          (p.elapsedTime * 50 + p.cellRect.x + p.cellRect.y) % 360
        );
      } else {
        p.context.fillStyle = group.backgroundColor;
      }
    } else {
      p.context.fillStyle = this.defaultBackgroundColor;
    }
    p.context.fillRect(p.cellRect.x, p.cellRect.y, p.cellRect.w, p.cellRect.h);
  }

  private renderText(p: CanvasGridCellRenderParams) {
    let value = this.solverState.activeSolution.value()
      ? this.solverState.activeSolution.value()?.values.at(p.cellIndex)
      : this.solverState.values.get(p.cellIndex);

    if (value) {
      p.renderTextFn({
        cellRect: p.cellRect,
        color: this.valueTextStyle.color,
        font: `${
          Math.min(p.cellRect.h, p.cellRect.w / (value.length * 0.5)) * 0.9
        }px monospace`,
        text: value,
      });
    }
  }

  gapFn: CanvasGridGapFn = (gapNumber: number) => {
    return gapNumber % 3 === 0;
  };

  cellRenderFn: CanvasGridCellRenderFn = (p: CanvasGridCellRenderParams) => {
    this.renderBackground(p);
    if (p.cellIndex === this.solverState.activeCellIndex.value()) {
      this.renderBorder(p);
    }
    this.renderText(p);
  };

  onClickCell(event: GridClickEvent) {
    if (event.buttonId === 0) {
      if (this.canvasGrid.draggingButtonId() === null) {
        if (this.solverState.activeCellIndex.value() === event.cellIndex) {
          this.solverState.activeCellIndex.set(null);
        } else {
          this.solverState.activeCellIndex.set(event.cellIndex);
        }
      }
      this.cellEraserAction()?.(event.cellIndex);
    }
  }

  onDragCell(event: GridDragEvent) {
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
}
