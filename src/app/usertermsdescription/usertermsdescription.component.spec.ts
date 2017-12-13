import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsertermsdescriptionComponent } from './usertermsdescription.component';

describe('UsertermsdescriptionComponent', () => {
  let component: UsertermsdescriptionComponent;
  let fixture: ComponentFixture<UsertermsdescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsertermsdescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsertermsdescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
