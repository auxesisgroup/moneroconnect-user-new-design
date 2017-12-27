import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarnewComponent } from './navbarnew.component';

describe('NavbarnewComponent', () => {
  let component: NavbarnewComponent;
  let fixture: ComponentFixture<NavbarnewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarnewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarnewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
