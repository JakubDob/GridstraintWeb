import { TestBed } from '@angular/core/testing';

import { MiniZincService } from './minizinc.service';

describe('MiniZincService', () => {
  let service: MiniZincService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MiniZincService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
