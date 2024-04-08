import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverConstraintSelectComponent } from './solver-constraint-select.component';

describe('SolverConstraintSelectComponent', () => {
  let component: SolverConstraintSelectComponent;
  let fixture: ComponentFixture<SolverConstraintSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverConstraintSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverConstraintSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
