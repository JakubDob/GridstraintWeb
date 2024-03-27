import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountConstraintComponent } from './count-constraint.component';

describe('CountConstraintComponent', () => {
  let component: CountConstraintComponent;
  let fixture: ComponentFixture<CountConstraintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountConstraintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CountConstraintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
