import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { SolverGridOptionsComponent } from '../solver/solver-grid-options/solver-grid-options.component';
import { SolverValueOptionsComponent } from '../solver/solver-value-options/solver-value-options.component';
import { SolverSolutionOptionsComponent } from '../solver/solver-solution-options/solver-solution-options.component';

@Component({
  selector: 'app-options',
  standalone: true,
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
  imports: [
    MatExpansionModule,
    SolverGridOptionsComponent,
    SolverValueOptionsComponent,
    SolverSolutionOptionsComponent,
  ],
})
export class OptionsComponent {}
