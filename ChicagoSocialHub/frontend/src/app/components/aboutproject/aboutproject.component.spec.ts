import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutprojectComponent } from './aboutproject.component';

describe('AboutprojectComponent', () => {
  let component: AboutprojectComponent;
  let fixture: ComponentFixture<AboutprojectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutprojectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
