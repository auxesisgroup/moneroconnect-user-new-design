import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KycwithsidebarComponent } from './kycwithsidebar.component';

describe('KycwithsidebarComponent', () => {
  let component: KycwithsidebarComponent;
  let fixture: ComponentFixture<KycwithsidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KycwithsidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KycwithsidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
