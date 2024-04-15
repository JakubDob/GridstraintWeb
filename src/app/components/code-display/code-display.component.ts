import { ClipboardModule } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SolverStateService } from '../../services/solver/solver-state.service';
@Component({
  selector: 'app-code-display',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogActions,
    ClipboardModule,
  ],
  templateUrl: './code-display.component.html',
  styleUrl: './code-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeDisplayComponent {
  private dialogRef = inject(MatDialogRef);
  private solverState = inject(SolverStateService);
  copyTooltipMsg = 'Copy';
  code: string;
  textRows: number;
  textCols: number;

  constructor() {
    this.code = this.solverState.getSolverCode();
    const lines = this.code.split('\n');
    this.textRows = lines.length;
    this.textCols = Math.max(...lines.map((line) => line.length));
  }
  onCloseClick() {
    this.dialogRef.close();
  }
}
