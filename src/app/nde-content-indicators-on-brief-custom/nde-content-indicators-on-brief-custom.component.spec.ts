import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeContentIndicatorsOnBriefCustomComponent } from './nde-content-indicators-on-brief-custom.component';

describe('NdeContentIndicatorsOnBriefCustomComponent', () => {
  let component: NdeContentIndicatorsOnBriefCustomComponent;
  let fixture: ComponentFixture<NdeContentIndicatorsOnBriefCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeContentIndicatorsOnBriefCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeContentIndicatorsOnBriefCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
