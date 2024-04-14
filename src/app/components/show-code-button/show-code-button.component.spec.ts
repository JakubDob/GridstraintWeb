import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCodeButtonComponent } from './show-code-button.component';

describe('ShowCodeButtonComponent', () => {
  let component: ShowCodeButtonComponent;
  let fixture: ComponentFixture<ShowCodeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCodeButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowCodeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
