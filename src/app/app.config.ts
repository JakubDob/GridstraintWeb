import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  CanvasGridDefaultOptions,
  CANVAS_GRID_DEFAULT_OPTIONS,
} from '@jakubdob/ngx-canvas-grid';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    {
      provide: CANVAS_GRID_DEFAULT_OPTIONS,
      useValue: <CanvasGridDefaultOptions>{
        cols: 9,
        rows: 9,
        spacing: 1,
        cellWidth: 40,
        cellHeight: 40,
      },
    },
  ],
};
