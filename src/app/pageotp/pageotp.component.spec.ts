import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageotpComponent } from './pageotp.component';

describe('PageotpComponent', () => {
  let component: PageotpComponent;
  let fixture: ComponentFixture<PageotpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageotpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageotpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
