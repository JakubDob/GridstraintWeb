import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverGridComponent } from './solver-grid.component';

describe('SolverGridComponent', () => {
  let component: SolverGridComponent;
  let fixture: ComponentFixture<SolverGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverGridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
