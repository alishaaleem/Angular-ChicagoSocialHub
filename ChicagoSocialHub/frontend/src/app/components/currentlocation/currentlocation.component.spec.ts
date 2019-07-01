import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentlocationComponent } from './currentlocation.component';

describe('CurrentlocationComponent', () => {
  let component: CurrentlocationComponent;
  let fixture: ComponentFixture<CurrentlocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentlocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentlocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
