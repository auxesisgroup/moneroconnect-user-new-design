import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddreferralComponent } from './addreferral.component';

describe('AddreferralComponent', () => {
  let component: AddreferralComponent;
  let fixture: ComponentFixture<AddreferralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddreferralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddreferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
