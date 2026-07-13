import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeOverrideOutlinkCustomComponent } from './nde-override-outlink-custom.component';

describe('NdeOverrideOutlinkCustomComponent', () => {
  let component: NdeOverrideOutlinkCustomComponent;
  let fixture: ComponentFixture<NdeOverrideOutlinkCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeOverrideOutlinkCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeOverrideOutlinkCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
