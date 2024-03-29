import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverSolutionManagerComponent } from './solver-solution-manager.component';

describe('SolverSolutionManagerComponent', () => {
  let component: SolverSolutionManagerComponent;
  let fixture: ComponentFixture<SolverSolutionManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverSolutionManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverSolutionManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
