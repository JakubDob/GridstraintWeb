import { TestBed } from '@angular/core/testing';

import { SolverStateService } from './solver-state.service';

describe('SolverStateService', () => {
  let service: SolverStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolverStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
