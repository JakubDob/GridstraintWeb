import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StateFragmentKey } from '../types/solver-types';
import { SolverStateService } from './solver/solver-state.service';
@Injectable({
  providedIn: 'root',
})
export class StateURLHelperService {
  private solverState = inject(SolverStateService);
  private activatedRoute = inject(ActivatedRoute);
  private document = inject(DOCUMENT);
  private urlBase: string;

  constructor() {
    this.urlBase = this.document.location.hostname;
    if (
      this.document.location.port &&
      this.document.location.port !== '80' &&
      this.document.location.port !== '443'
    ) {
      this.urlBase += `:${this.document.location.port}`;
    }
  }
  generateLink() {
    return `${this.urlBase}/#${StateFragmentKey}=${encodeURIComponent(
      this.solverState.toJSON()
    )}`;
  }

  decode() {
    const fragment = this.activatedRoute.snapshot.fragment;
    if (fragment) {
      try {
        const data = new URLSearchParams(fragment).get(StateFragmentKey);
        if (data) {
          const decoded = decodeURIComponent(data);
          this.solverState.fromJSON(decoded);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
}
