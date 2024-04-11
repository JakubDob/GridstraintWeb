import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { CellGroup, GridView } from '../../../types/solver-types';

@Component({
  selector: 'app-solver-constraint-manager',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './solver-constraint-manager.component.html',
  styleUrl: './solver-constraint-manager.component.scss',
})
export class SolverConstraintManagerComponent {
  private solverState: SolverStateService = inject(SolverStateService);
  activeConstraint = this.solverState.activeConstraint.value;

  selectedGroup = new SelectionModel<CellGroup>();

  constructor() {
    this.solverState.activeCellGroup.changes$
      .pipe(takeUntilDestroyed())
      .subscribe(([_, current]) => {
        if (current === null) {
          this.selectedGroup.clear();
        }
      });
  }

  onGroupSelection(event: MatSelectionListChange) {
    this.selectedGroup.clear();
    this.selectedGroup.select(event.options[0].value);
    this.solverState.activeCellGroup.set(event.options[0].value);
  }

  onDeleteViewClick(event: Event, view: GridView) {
    event.stopPropagation();
    this.solverState.deleteView(view);
  }

  onAddGroupClick(event: Event, view: GridView) {
    event.stopPropagation();
    this.solverState.addNewGroup(view);
  }

  onDeleteGroupClick(event: Event, group: CellGroup) {
    event.stopPropagation();
    this.solverState.deleteGroup(group);
  }

  onViewOpened(view: GridView) {
    this.solverState.activeView.set(view);
  }

  onViewClosed() {
    this.solverState.activeCellGroup.set(null);
  }

  onViewNameChange(newName: string, view: GridView) {
    this.solverState.renameView(view, newName);
  }

  onGroupNameChange(newName: string, group: CellGroup) {
    this.solverState.renameGroup(group, newName);
  }
}
