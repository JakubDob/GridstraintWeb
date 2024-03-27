import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Inject,
  inject,
  Optional,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  CanvasGridCellRenderFn,
  CanvasGridCellRenderParams,
  CanvasGridDefaultOptions,
  CANVAS_GRID_DEFAULT_OPTIONS,
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
  constructor(
    @Optional()
    @Inject(CANVAS_GRID_DEFAULT_OPTIONS)
    private _defaults?: CanvasGridDefaultOptions
  ) {
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
  }

  @ViewChild(NgxCanvasGridComponent) canvasGrid!: NgxCanvasGridComponent;

  cellWidth: number = this._defaults?.cellWidth ?? 20;
  cellHeight: number = this._defaults?.cellHeight ?? 20;
  rows: number = this._defaults?.rows ?? 9;
  cols: number = this._defaults?.cols ?? 9;
  spacing = this._defaults?.spacing ?? 1;
  testVar: string = '';
  offscreenCanvas = document.createElement('canvas');

  private defaultBackgroundColor = 'white';
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
  private cellEreaserAction = computed(() => {
    if (this.solverState.ereaserToggled()) {
      return this.solverState.removeCellIndexFromActiveView.bind(
        this.solverState
      );
    } else {
      if (this.solverState.activeCellGroup()) {
        return this.solverState.addCellIndexToActiveGroup.bind(
          this.solverState
        );
      }
    }
    return null;
  });

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

    // let value = this.solutionViewActive
    //   ? this.solverState.activeSolution?.values.at(p.cellIndex)
    //   : this.solverState.values.get(p.cellIndex);

    let value = this.solverState.values.get(p.cellIndex);
    if (value === undefined) {
      value = '';
    }

    if (value) {
      p.renderTextFn({
        cellRect: p.cellRect,
        color: this.valueTextStyle.color,
        font: this.valueTextStyle.font,
        text: value,
      });
    }
  };

  onRowsChange() {
    this.solverState.setRowCount(this.rows);
  }

  onColsChange() {
    this.solverState.setColCount(this.cols);
  }

  onClickCell(event: GridClickEvent) {
    this.canvasGrid.clearIndicesFromMultiFrameRedraw();
    if (event.buttonId === 0) {
      if (this.canvasGrid.draggingButtonId() === null) {
        if (this.solverState.activeCellIndex() === event.cellIndex) {
          this.solverState.setActiveCellIndex(null);
        } else {
          this.solverState.setActiveCellIndex(event.cellIndex);
        }
      }
      this.cellEreaserAction()?.(event.cellIndex);
    }
  }

  onDragCell(event: GridDragEvent) {
    if (event.buttonId === 0) {
      this.solverState.setActiveCellIndex(event.to);
      this.cellEreaserAction()?.(event.to);
    }
  }

  onKeyDown(key: string) {
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