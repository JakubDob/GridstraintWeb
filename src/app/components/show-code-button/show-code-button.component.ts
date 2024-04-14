import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CodeDisplayComponent } from '../code-display/code-display.component';

@Component({
  selector: 'app-show-code-button',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
  templateUrl: './show-code-button.component.html',
  styleUrl: './show-code-button.component.scss',
})
export class ShowCodeButtonComponent {
  dialog: MatDialog = inject(MatDialog);
  codeIcon = 'code';
  tooltipMsg = 'Show generated code';

  onClick() {
    const dialogRef = this.dialog.open(CodeDisplayComponent);
  }
}
