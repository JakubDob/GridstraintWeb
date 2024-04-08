import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridEraserButtonComponent } from './grid-eraser-button.component';

describe('GridEraserButtonComponent', () => {
  let component: GridEraserButtonComponent;
  let fixture: ComponentFixture<GridEraserButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridEraserButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GridEraserButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
