import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndulgencesPageComponent } from './indulgences-page.component';

describe('IndulgencesPageComponent', () => {
  let component: IndulgencesPageComponent;
  let fixture: ComponentFixture<IndulgencesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndulgencesPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndulgencesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
