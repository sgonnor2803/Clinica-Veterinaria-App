import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdoptionsPage } from './adoptions.page';

describe('AdoptionsPage', () => {
  let component: AdoptionsPage;
  let fixture: ComponentFixture<AdoptionsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdoptionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
