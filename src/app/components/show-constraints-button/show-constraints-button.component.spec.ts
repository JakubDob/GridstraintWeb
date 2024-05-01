import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowConstraintsButtonComponent } from './show-constraints-button.component';

describe('ShowConstraintsButtonComponent', () => {
  let component: ShowConstraintsButtonComponent;
  let fixture: ComponentFixture<ShowConstraintsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowConstraintsButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowConstraintsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
