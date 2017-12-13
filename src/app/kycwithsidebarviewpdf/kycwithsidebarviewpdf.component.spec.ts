import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KycwithsidebarviewpdfComponent } from './kycwithsidebarviewpdf.component';

describe('KycwithsidebarviewpdfComponent', () => {
  let component: KycwithsidebarviewpdfComponent;
  let fixture: ComponentFixture<KycwithsidebarviewpdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KycwithsidebarviewpdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KycwithsidebarviewpdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
