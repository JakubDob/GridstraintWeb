import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PriorityQueue } from '../../../ds/ProrityQueue';
import { SolverStateService } from '../../../services/solver/solver-state.service';

type GridSize = {
  cols: number;
  rows: number;
};

@Component({
  selector: 'app-solver-grid-actions',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatCheckboxModule, FormsModule],
  templateUrl: './solver-grid-actions.component.html',
  styleUrl: './solver-grid-actions.component.scss',
})
export class SolverGridActionsComponent {
  solverState = inject(SolverStateService);
  ereaseValues = false;

  onClickEreaser() {
    this.solverState.toggleEreaser();
  }

  onChangedEreaseValues(value: boolean) {
    this.solverState.setEreaseValues(value);
  }

  onClickTile() {
    const activeGroup = this.solverState.activeCellGroup();
    if (!activeGroup) {
      return;
    }
    const initialTile = new Set(activeGroup.indices);
    const gridSize = this.solverState.gridSize();
    const taken = new Set<number>();
    const xyLookup: number[][] = [
      ...Array(gridSize.cols * gridSize.rows).keys(),
    ].map((i) => [i % gridSize.cols, i / gridSize.cols]);
    const pq = new PriorityQueue<Set<number>>((a, b) => a.size > b.size);
    pq.push(initialTile);
    while (!pq.empty()) {
      const current = pq.pop();
      current.forEach((i) => {
        if (taken.has(i)) {
          current.delete(i);
        }
      });
      if (current.size === 0) {
        continue;
      }
      this.solverState.addNewGroupToActiveView(current);
      current.forEach((i) => taken.add(i));
      const sets = [
        this.tileRight(current, taken, gridSize, xyLookup),
        this.tileLeft(current, taken, gridSize, xyLookup),
        this.tileUp(current, taken, gridSize, xyLookup),
        this.tileDown(current, taken, gridSize, xyLookup),
      ];
      for (const s of sets) {
        if (s && s.size > 0) {
          pq.push(s);
        }
      }
    }
    this.solverState.deleteEmptyGroupsFromActiveView();
  }

  private tileLeft(
    current: Set<number>,
    taken: Set<number>,
    gridSize: GridSize,
    xyLookup: number[][]
  ): Set<number> | null {
    let c = -1;
    let overlaps = false;
    while (c > -gridSize.cols) {
      for (const i of current) {
        if (xyLookup[i][0] + c >= 0 && taken.has(i + c)) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        break;
      } else {
        overlaps = false;
        --c;
      }
    }
    if (!overlaps) {
      const moved = new Set<number>();
      current.forEach((i) => {
        if (xyLookup[i][0] + c >= 0) {
          moved.add(i + c);
        }
      });
      return moved;
    }
    return null;
  }

  private tileRight(
    current: Set<number>,
    taken: Set<number>,
    gridSize: GridSize,
    xyLookup: number[][]
  ): Set<number> | null {
    let c = 1;
    let overlaps = false;
    while (c < gridSize.cols) {
      for (const i of current) {
        if (xyLookup[i][0] + c < gridSize.cols && taken.has(i + c)) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        break;
      } else {
        overlaps = false;
        ++c;
      }
    }
    if (!overlaps) {
      const moved = new Set<number>();
      current.forEach((i) => {
        if (xyLookup[i][0] + c < gridSize.cols) {
          moved.add(i + c);
        }
      });
      return moved;
    }
    return null;
  }

  private tileDown(
    current: Set<number>,
    taken: Set<number>,
    gridSize: GridSize,
    xyLookup: number[][]
  ): Set<number> | null {
    let c = 1;
    let overlaps = false;
    while (c < gridSize.rows) {
      for (const i of current) {
        if (
          xyLookup[i][1] + c < gridSize.rows &&
          taken.has(i + c * gridSize.cols)
        ) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        break;
      } else {
        overlaps = false;
        ++c;
      }
    }
    if (!overlaps) {
      const moved = new Set<number>();
      current.forEach((i) => {
        if (xyLookup[i][1] + c < gridSize.rows) {
          moved.add(i + c * gridSize.cols);
        }
      });
      return moved;
    }
    return null;
  }

  private tileUp(
    current: Set<number>,
    taken: Set<number>,
    gridSize: GridSize,
    xyLookup: number[][]
  ): Set<number> | null {
    let c = -1;
    let overlaps = false;
    while (c > -gridSize.rows) {
      for (const i of current) {
        if (xyLookup[i][1] + c >= 0 && taken.has(i + c * gridSize.cols)) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        break;
      } else {
        overlaps = false;
        --c;
      }
    }
    if (!overlaps) {
      const moved = new Set<number>();
      current.forEach((i) => {
        if (xyLookup[i][1] + c >= 0) {
          moved.add(i + c * gridSize.cols);
        }
      });
      return moved;
    }
    return null;
  }
}
