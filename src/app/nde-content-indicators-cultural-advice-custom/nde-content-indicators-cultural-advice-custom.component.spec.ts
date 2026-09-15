import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeContentIndicatorsCulturalAdviceCustomComponent } from './nde-content-indicators-cultural-advice-custom.component';

describe('NdeContentIndicatorsCulturalAdviceCustomComponent', () => {
  let component: NdeContentIndicatorsCulturalAdviceCustomComponent;
  let fixture: ComponentFixture<NdeContentIndicatorsCulturalAdviceCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeContentIndicatorsCulturalAdviceCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeContentIndicatorsCulturalAdviceCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
