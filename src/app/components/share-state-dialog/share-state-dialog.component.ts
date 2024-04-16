import { ClipboardModule } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StateURLHelperService } from '../../services/state-urlhelper.service';

@Component({
  selector: 'app-share-state-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatTooltipModule,
    ClipboardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './share-state-dialog.component.html',
  styleUrl: './share-state-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareStateDialogComponent {
  private stateUrlHelper = inject(StateURLHelperService);
  private dialogRef = inject(MatDialogRef);
  copyTooltipMsg = 'Copy';
  link: string;

  constructor() {
    this.link = this.stateUrlHelper.generateLink();
  }

  onCopyClick() {}

  onCloseClick() {
    this.dialogRef.close();
  }
}
