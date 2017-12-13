import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserhomeethmodalComponent } from './userhomeethmodal.component';

describe('UserhomeethmodalComponent', () => {
  let component: UserhomeethmodalComponent;
  let fixture: ComponentFixture<UserhomeethmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserhomeethmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserhomeethmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
