import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarreviewComponent } from './barreview.component';

describe('BarreviewComponent', () => {
  let component: BarreviewComponent;
  let fixture: ComponentFixture<BarreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
