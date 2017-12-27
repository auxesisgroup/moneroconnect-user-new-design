import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarnewComponent } from './sidebarnew.component';

describe('SidebarnewComponent', () => {
  let component: SidebarnewComponent;
  let fixture: ComponentFixture<SidebarnewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarnewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarnewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
