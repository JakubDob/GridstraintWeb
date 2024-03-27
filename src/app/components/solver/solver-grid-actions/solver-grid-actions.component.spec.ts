import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverGridActionsComponent } from './solver-grid-actions.component';

describe('SolverGridActionsComponent', () => {
  let component: SolverGridActionsComponent;
  let fixture: ComponentFixture<SolverGridActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverGridActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverGridActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
