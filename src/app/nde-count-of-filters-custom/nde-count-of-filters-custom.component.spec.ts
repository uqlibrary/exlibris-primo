import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeCountOfFiltersCustomComponent } from './nde-count-of-filters-custom.component';

describe('NdeCountOfFiltersCustomComponent', () => {
  let component: NdeCountOfFiltersCustomComponent;
  let fixture: ComponentFixture<NdeCountOfFiltersCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeCountOfFiltersCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeCountOfFiltersCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
