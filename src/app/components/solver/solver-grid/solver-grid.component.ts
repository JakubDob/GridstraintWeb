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
  CellGroup,
  CellGroupAndIndex,
  IndexedValueChange,
  ValueChange,
} from '../../../types/solver-types';

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
    this.solverState.activeViewChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.solverState.setActiveCellIndex(null);
        this.canvasGrid.redrawAll();
      });

    this.solverState.activeCellGroupChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((change: ValueChange<CellGroup>) => {
        change.previous?.indices.forEach((index) =>
          this.canvasGrid.deleteCellIndexFromMultiFrameRedraw(index)
        );
        change.current?.indices.forEach((index) =>
          this.canvasGrid.addCellIndexToMultiFrameRedraw(index)
        );
        this.solverState.setActiveCellIndex(null);
        this.canvasGrid.redrawAll();
      });

    this.solverState.cellAddedToGroup$
      .pipe(takeUntilDestroyed())
      .subscribe((data: CellGroupAndIndex) => {
        if (data.group === this.solverState.activeCellGroup()) {
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

    this.solverState.activeCellIndexChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((change: ValueChange<number>) => {
        if (change.current !== null) {
          this.canvasGrid.addCellIndexToSingleFrameRedraw(change.current);
        }
        if (change.previous !== null) {
          this.canvasGrid.addCellIndexToSingleFrameRedraw(change.previous);
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

    this.solverState.activeSolutionChanged$
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
      if (this.solverState.activeCellGroup()) {
        return this.solverState.addCellIndexToActiveGroup.bind(
          this.solverState
        );
      }
    }
    return null;
  });
  private solutionViewEnabled = computed(
    () => this.solverState.activeSolution() !== null
  );

  gapFn: CanvasGridGapFn = (gapNumber: number) => {
    return gapNumber % 3 === 0;
  };

  cellRenderFn: CanvasGridCellRenderFn = (p: CanvasGridCellRenderParams) => {
    const group = this.solverState
      .activeView()
      ?.indexToCellGroup.get(p.cellIndex);
    if (group) {
      if (group === this.solverState.activeCellGroup()) {
        const centerX = p.cellRect.x + p.cellRect.w / 2;
        const centerY = p.cellRect.y + p.cellRect.h / 2;
        const radius = Math.min(p.cellRect.w, p.cellRect.h);
        const gradient = p.context.createRadialGradient(
          centerX,
          centerY,
          radius / 25,
          centerX,
          centerY,
          radius
        );
        const offset = (Math.sin(p.elapsedTime * 2) + 1) / 4;
        gradient.addColorStop(offset, group.backgroundColor);
        gradient.addColorStop(1, 'white');
        p.context.fillStyle = gradient;
      } else {
        p.context.fillStyle = group.backgroundColor;
      }
    } else {
      p.context.fillStyle = this.defaultBackgroundColor;
    }

    p.context.fillRect(p.cellRect.x, p.cellRect.y, p.cellRect.w, p.cellRect.h);

    if (p.cellIndex === this.solverState.activeCellIndex()) {
      p.context.strokeStyle = this.selectBorder.color;
      p.context.lineWidth = this.selectBorder.width;
      p.context.strokeRect(
        p.cellRect.x + this.selectBorder.width / 2,
        p.cellRect.y + this.selectBorder.width / 2,
        p.cellRect.w - this.selectBorder.width,
        p.cellRect.h - this.selectBorder.width
      );
    }

    let value = this.solverState.activeSolution()
      ? this.solverState.activeSolution()?.values.at(p.cellIndex)
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
  };

  onClickCell(event: GridClickEvent) {
    if (event.buttonId === 0) {
      if (this.canvasGrid.draggingButtonId() === null) {
        if (this.solverState.activeCellIndex() === event.cellIndex) {
          this.solverState.setActiveCellIndex(null);
        } else {
          this.solverState.setActiveCellIndex(event.cellIndex);
        }
      }
      this.cellEraserAction()?.(event.cellIndex);
    }
  }

  onDragCell(event: GridDragEvent) {
    if (event.buttonId === 0) {
      this.solverState.setActiveCellIndex(event.to);
      this.cellEraserAction()?.(event.to);
    }
  }

  onKeyDown(key: string) {
    if (this.solutionViewEnabled()) {
      return;
    }
    const i = this.solverState.activeCellIndex();
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
