import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SolverStateService } from '../../../services/solver/solver-state.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-grid-eraser-button',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './grid-eraser-button.component.html',
  styleUrl: './grid-eraser-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridEraserButtonComponent {
  private state = inject(SolverStateService);
  private prevGridCursor = this.state.gridCursor();
  eraserToggled = this.state.eraserToggled;
  tooltipMsg = computed(() =>
    this.eraserToggled()
      ? 'Disable eraser'
      : 'Enable erasing ' +
        (this.state.eraserClearValues() ? 'groups and values' : 'groups')
  );

  @Input() eraserOnIcon: string = 'ink_eraser';
  @Input() eraserOffIcon: string = 'ink_eraser_off';

  onClick() {
    this.state.toggleEraser();
    if (this.eraserToggled()) {
      this.prevGridCursor = this.state.gridCursor();
      this.state.gridCursor.set('not-allowed');
    } else {
      this.state.gridCursor.set(this.prevGridCursor);
    }
  }
}
