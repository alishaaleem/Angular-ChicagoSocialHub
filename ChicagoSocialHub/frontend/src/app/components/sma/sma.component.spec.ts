import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SMAComponent } from './sma.component';

describe('SMAComponent', () => {
  let component: SMAComponent;
  let fixture: ComponentFixture<SMAComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SMAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SMAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
