import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverSolutionOptionsComponent } from './solver-solution-options.component';

describe('SolverSolutionOptionsComponent', () => {
  let component: SolverSolutionOptionsComponent;
  let fixture: ComponentFixture<SolverSolutionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverSolutionOptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverSolutionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
