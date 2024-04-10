import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridFillButtonComponent } from './grid-fill-button.component';

describe('GridFillButtonComponent', () => {
  let component: GridFillButtonComponent;
  let fixture: ComponentFixture<GridFillButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridFillButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GridFillButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
