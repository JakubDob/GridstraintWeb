import { TestBed } from '@angular/core/testing';

import { StateURLHelperService } from './state-urlhelper.service';

describe('StateURLHelperService', () => {
  let service: StateURLHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateURLHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
