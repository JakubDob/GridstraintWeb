import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverManagerComponent } from './solver-manager.component';

describe('SolverManagerComponent', () => {
  let component: SolverManagerComponent;
  let fixture: ComponentFixture<SolverManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolverManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolverManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
