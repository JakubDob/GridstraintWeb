import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ShareStateDialogComponent } from '../share-state-dialog/share-state-dialog.component';

@Component({
  selector: 'app-share-state-button',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
  templateUrl: './share-state-button.component.html',
  styleUrl: './share-state-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareStateButtonComponent {
  private dialog = inject(MatDialog);

  tooltipMsg = 'Share';
  icon = 'share';

  onClick() {
    this.dialog.open(ShareStateDialogComponent);
  }
}
