import { TestBed } from '@angular/core/testing';

import { MinizincService } from './minizinc.service';

describe('MinizincService', () => {
  let service: MinizincService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinizincService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
