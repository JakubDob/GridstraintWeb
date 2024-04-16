import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareStateDialogComponent } from './share-state-dialog.component';

describe('ShareStateDialogComponent', () => {
  let component: ShareStateDialogComponent;
  let fixture: ComponentFixture<ShareStateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareStateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShareStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
