import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverValueOptionsComponent } from './solver-value-options.component';

describe('SolverValueOptionsComponent', () => {
  let component: SolverValueOptionsComponent;
  let fixture: ComponentFixture<SolverValueOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverValueOptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverValueOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
