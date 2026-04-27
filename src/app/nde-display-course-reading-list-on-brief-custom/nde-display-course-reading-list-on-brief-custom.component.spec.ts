import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeDisplayCourseReadingListOnBriefCustomComponent } from './nde-display-course-reading-list-on-brief-custom.component';

describe('NdeDisplayCourseReadingListOnBriefCustomComponent', () => {
  let component: NdeDisplayCourseReadingListOnBriefCustomComponent;
  let fixture: ComponentFixture<NdeDisplayCourseReadingListOnBriefCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeDisplayCourseReadingListOnBriefCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeDisplayCourseReadingListOnBriefCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
