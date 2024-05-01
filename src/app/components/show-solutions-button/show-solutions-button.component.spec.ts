import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSolutionsButtonComponent } from './show-solutions-button.component';

describe('ShowSolutionsButtonComponent', () => {
  let component: ShowSolutionsButtonComponent;
  let fixture: ComponentFixture<ShowSolutionsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowSolutionsButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowSolutionsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
