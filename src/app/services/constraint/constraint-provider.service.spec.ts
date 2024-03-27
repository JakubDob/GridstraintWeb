import { TestBed } from '@angular/core/testing';

import { ConstraintProviderService } from './constraint-provider.service';

describe('ConstraintProviderService', () => {
  let service: ConstraintProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConstraintProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
