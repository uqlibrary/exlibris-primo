import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeContentIndicatorsOnFullCustomComponent } from './nde-content-indicators-on-full-custom.component';

describe('NdeContentIndicatorsOnFullCustomComponent', () => {
  let component: NdeContentIndicatorsOnFullCustomComponent;
  let fixture: ComponentFixture<NdeContentIndicatorsOnFullCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeContentIndicatorsOnFullCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeContentIndicatorsOnFullCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
