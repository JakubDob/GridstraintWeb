import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridTileButtonComponent } from './grid-tile-button.component';

describe('GridTileButtonComponent', () => {
  let component: GridTileButtonComponent;
  let fixture: ComponentFixture<GridTileButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridTileButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GridTileButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
