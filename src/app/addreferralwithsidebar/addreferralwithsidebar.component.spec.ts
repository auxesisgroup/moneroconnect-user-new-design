import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddreferralwithsidebarComponent } from './addreferralwithsidebar.component';

describe('AddreferralwithsidebarComponent', () => {
  let component: AddreferralwithsidebarComponent;
  let fixture: ComponentFixture<AddreferralwithsidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddreferralwithsidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddreferralwithsidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
