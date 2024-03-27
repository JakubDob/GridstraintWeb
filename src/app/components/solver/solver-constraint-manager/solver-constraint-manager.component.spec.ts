import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverConstraintManagerComponent } from './solver-constraint-manager.component';

describe('SolverConstraintManagerComponent', () => {
  let component: SolverConstraintManagerComponent;
  let fixture: ComponentFixture<SolverConstraintManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverConstraintManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverConstraintManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
