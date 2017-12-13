import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsertermsComponent } from './userterms.component';

describe('UsertermsComponent', () => {
  let component: UsertermsComponent;
  let fixture: ComponentFixture<UsertermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsertermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsertermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
