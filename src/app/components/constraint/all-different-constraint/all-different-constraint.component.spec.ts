import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDifferentConstraintComponent } from './all-different-constraint.component';

describe('AllDifferentConstraintComponent', () => {
  let component: AllDifferentConstraintComponent;
  let fixture: ComponentFixture<AllDifferentConstraintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDifferentConstraintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllDifferentConstraintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
