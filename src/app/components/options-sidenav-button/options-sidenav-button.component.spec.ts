import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsSidenavButtonComponent } from './options-sidenav-button.component';

describe('OptionsSidenavButtonComponent', () => {
  let component: OptionsSidenavButtonComponent;
  let fixture: ComponentFixture<OptionsSidenavButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionsSidenavButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OptionsSidenavButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
