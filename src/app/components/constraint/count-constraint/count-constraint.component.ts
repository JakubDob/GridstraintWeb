import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RelationSymbol, SolverConstraint } from '../../../types/solver-types';

@Component({
  selector: 'app-count-constraint',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './count-constraint.component.html',
  styleUrl: './count-constraint.component.scss',
})
export class CountConstraintComponent extends SolverConstraint {
  private dialogRef = inject(
    MatDialogRef<ReadonlyMap<string, string>, CountConstraintComponent>
  );
  symbolIter = RelationSymbol;
  amount = 0;
  countedValue = 0;
  relation = RelationSymbol.EQUAL;

  onOKClick() {
    const ret = new Map<string, string>([
      ['amount', this.amount.toString()],
      ['countedValue', this.countedValue.toString()],
      ['label', `count(${this.countedValue}) ${this.relation} ${this.amount}`],
      ['relation', this.relation],
    ]);
    this.dialogRef.close(ret);
  }

  @HostListener('keypress', ['$event'])
  handleKeyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onOKClick();
    }
  }

  static toSolverCode(
    indices: ReadonlySet<number>,
    settings?: ReadonlyMap<string, string> | undefined
  ): string {
    return `constraint count(${SolverConstraint.wrapSetInBrackets(
      indices
    )},${settings?.get('countedValue')})${settings?.get(
      'relation'
    )}${settings?.get('amount')};`;
  }

  static hasSettings(): boolean {
    return true;
  }
}
