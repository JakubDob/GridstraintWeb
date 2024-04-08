import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GridEraserButtonComponent } from '../solver/grid-eraser-button/grid-eraser-button.component';
import { GridTileButtonComponent } from '../solver/grid-tile-button/grid-tile-button.component';
import { SolverRunButtonComponent } from '../solver/solver-run-button/solver-run-button.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    SolverRunButtonComponent,
    GridEraserButtonComponent,
    GridTileButtonComponent,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {}
