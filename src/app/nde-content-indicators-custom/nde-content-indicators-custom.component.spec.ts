import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeContentIndicatorsCustomComponent } from './nde-content-indicators-custom.component';

describe('NdeContentIndicatorsCustomComponent', () => {
  let component: NdeContentIndicatorsCustomComponent;
  let fixture: ComponentFixture<NdeContentIndicatorsCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeContentIndicatorsCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeContentIndicatorsCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
