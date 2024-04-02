import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { MatDialog } from '@angular/material/dialog';
import {
  CellGroup,
  GridConstraint,
  GridView,
} from '../../../types/solver-types';
import { ConstraintProviderService } from '../../../services/constraint/constraint-provider.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private dialog: MatDialog = inject(MatDialog);
  private constraintProvider = inject(ConstraintProviderService);

  constraints: ReadonlyMap<string, GridConstraint> =
    this.solverState.constraints;
  selectedConstraint?: GridConstraint;
  selectedGroup = new SelectionModel<CellGroup>();

  activeConstraint = this.solverState.activeConstraint;
  activeView = this.solverState.activeView;
  activeGroup = this.solverState.activeCellGroup;

  constructor() {
    this.solverState.activeCellGroupChanged$
      .pipe(takeUntilDestroyed())
      .subscribe((change) => {
        if (change.current === null) {
          this.selectedGroup.clear();
        }
      });
  }

  onConstraintSelectionChange() {
    if (this.selectedConstraint) {
      this.solverState.setActiveConstraint(this.selectedConstraint.name);
    }
  }

  onGroupSelection(event: MatSelectionListChange) {
    this.selectedGroup.clear();
    this.selectedGroup.select(event.options[0].value);
    this.solverState.setActiveGroup(event.options[0].value);
  }

  onClearConstraintClick(event: Event, constraint: GridConstraint) {
    event.stopPropagation();
    this.solverState.clearConstraintViews(constraint);
  }

  onDeleteViewClick(event: Event, view: GridView) {
    event.stopPropagation();
    this.solverState.deleteView(view);
  }

  onAddViewToSelectedConstraintClick(event: Event) {
    event.stopPropagation();
    const constraintName = this.solverState.activeConstraint()?.name;
    if (constraintName) {
      const details = this.constraintProvider.get(constraintName);
      if (details) {
        if (details.hasSettings) {
          this.dialog
            .open(details.constraint)
            .afterClosed()
            .subscribe((settings?: ReadonlyMap<string, string>) => {
              if (settings) {
                this.solverState.addNewViewToActiveConstraint(settings);
              }
            });
        } else {
          this.solverState.addNewViewToActiveConstraint();
        }
      }
    }
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
    this.solverState.setActiveView(view);
  }

  onViewClosed() {
    this.solverState.setActiveGroup(null);
  }

  onViewNameChange(newName: string, view: GridView) {
    this.solverState.renameView(view, newName);
  }

  onGroupNameChange(newName: string, group: CellGroup) {
    this.solverState.renameGroup(group, newName);
  }
}
