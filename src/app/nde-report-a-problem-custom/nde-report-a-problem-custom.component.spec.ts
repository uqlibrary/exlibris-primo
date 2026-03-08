import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeReportAProblemCustomComponent } from './nde-report-a-problem-custom.component';

describe('NdeReportAProblemCustomComponent', () => {
  let component: NdeReportAProblemCustomComponent;
  let fixture: ComponentFixture<NdeReportAProblemCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeReportAProblemCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeReportAProblemCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
