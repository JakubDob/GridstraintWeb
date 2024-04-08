import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverRunButtonComponent } from './solver-run-button.component';

describe('SolverRunButtonComponent', () => {
  let component: SolverRunButtonComponent;
  let fixture: ComponentFixture<SolverRunButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverRunButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverRunButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
