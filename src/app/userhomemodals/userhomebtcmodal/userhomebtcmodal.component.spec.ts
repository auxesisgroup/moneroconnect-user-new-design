import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserhomebtcmodalComponent } from './userhomebtcmodal.component';

describe('UserhomebtcmodalComponent', () => {
  let component: UserhomebtcmodalComponent;
  let fixture: ComponentFixture<UserhomebtcmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserhomebtcmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserhomebtcmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
