import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { OptionsSidenavButtonComponent } from '../options-sidenav-button/options-sidenav-button.component';
import { ShareStateButtonComponent } from '../share-state-button/share-state-button.component';
import { ShowCodeButtonComponent } from '../show-code-button/show-code-button.component';
import { ShowConstraintsButtonComponent } from '../show-constraints-button/show-constraints-button.component';
import { ShowSolutionsButtonComponent } from '../show-solutions-button/show-solutions-button.component';
import { GridEraserButtonComponent } from '../solver/grid-eraser-button/grid-eraser-button.component';
import { GridFillButtonComponent } from '../solver/grid-fill-button/grid-fill-button.component';
import { GridTileButtonComponent } from '../solver/grid-tile-button/grid-tile-button.component';
import { SolverRunButtonComponent } from '../solver/solver-run-button/solver-run-button.component';
import { ThemeButtonComponent } from '../theme-button/theme-button.component';

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
    GridFillButtonComponent,
    ThemeButtonComponent,
    ShowCodeButtonComponent,
    ShareStateButtonComponent,
    OptionsSidenavButtonComponent,
    ShowConstraintsButtonComponent,
    ShowSolutionsButtonComponent,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {}
