import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '**',
    loadComponent: () =>
      import(
        './components/solver/solver-manager/solver-manager.component'
      ).then((module) => module.SolverManagerComponent),
  },
];
