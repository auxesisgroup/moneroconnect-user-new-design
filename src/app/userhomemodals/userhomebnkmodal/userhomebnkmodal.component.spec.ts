import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserhomebnkmodalComponent } from './userhomebnkmodal.component';

describe('UserhomebnkmodalComponent', () => {
  let component: UserhomebnkmodalComponent;
  let fixture: ComponentFixture<UserhomebnkmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserhomebnkmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserhomebnkmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
