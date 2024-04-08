import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstraintSolutionTabComponent } from './constraint-solution-tab.component';

describe('ConstraintSolutionTabComponent', () => {
  let component: ConstraintSolutionTabComponent;
  let fixture: ComponentFixture<ConstraintSolutionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstraintSolutionTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConstraintSolutionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
