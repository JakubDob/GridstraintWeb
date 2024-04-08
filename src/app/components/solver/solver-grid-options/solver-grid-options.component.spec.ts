import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverGridOptionsComponent } from './solver-grid-options.component';

describe('SolverGridOptionsComponent', () => {
  let component: SolverGridOptionsComponent;
  let fixture: ComponentFixture<SolverGridOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverGridOptionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SolverGridOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
