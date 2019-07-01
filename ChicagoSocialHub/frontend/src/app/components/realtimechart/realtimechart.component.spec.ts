import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimechartComponent } from './realtimechart.component';

describe('RealtimechartComponent', () => {
  let component: RealtimechartComponent;
  let fixture: ComponentFixture<RealtimechartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealtimechartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtimechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
