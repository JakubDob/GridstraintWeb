import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareStateButtonComponent } from './share-state-button.component';

describe('ShareStateButtonComponent', () => {
  let component: ShareStateButtonComponent;
  let fixture: ComponentFixture<ShareStateButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareStateButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShareStateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
